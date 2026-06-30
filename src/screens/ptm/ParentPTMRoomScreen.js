/**
 * ParentPTMRoomScreen.js — Parent-side PTM Live Room
 * Features:
 *   - Secure join via join_token: first calls POST /ptm/join/validate to get socket_credential
 *   - Waiting room UX: "Waiting for host to admit you" with animated indicator
 *   - On admit: seamlessly transitions to live chat
 *   - On reject/remove: friendly message + auto navigate back
 *   - Meeting ended: politely dismissed back to list
 *   - Chat history pre-loaded on room join
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import io from 'socket.io-client';
import {
  background, surface, border, card, primary, primaryLight,
  textPrimary, textSecondary, textMuted, radius, spacing, danger, success, warning,
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { useSession } from '../../context/SessionContext';
import { ptmGet, ptmPost, API_BASE } from '../../utils/api';

// Waiting states
const ROOM_STATE = {
  CONNECTING:    'CONNECTING',   // Getting socket credential
  WAITING_ROOM:  'WAITING_ROOM', // In waiting room, waiting for host
  IN_MEETING:    'IN_MEETING',   // Admitted — active chat
  REJECTED:      'REJECTED',     // Rejected by host
  REMOVED:       'REMOVED',      // Removed mid-meeting
  ENDED:         'ENDED',        // Meeting has ended
  ERROR:         'ERROR',        // Fatal error
};

export default function ParentPTMRoomScreen({ route, navigation }) {
  const { ptm } = route.params; // ptm object includes join_token, title, host_teacher_name, group_id
  const { session, parentName } = useSession();

  const [roomState, setRoomState] = useState(ROOM_STATE.CONNECTING);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [meetingStatus, setMeetingStatus] = useState(ptm.status);
  const [hostJoined, setHostJoined] = useState(false);

  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const myUserId = session?.user_id || session?.id;
  const myName = parentName || 'Parent';

  // ── Step 1: Validate join_token → get socket_credential ──────────────────
  const connectToRoom = useCallback(async () => {
    try {
      setRoomState(ROOM_STATE.CONNECTING);

      // Validate join token and get short-lived socket credential
      const validationResult = await ptmPost('/join/validate', {
        group_id: ptm.group_id,
        join_token: ptm.join_token,
      });

      const { socket_credential, ptm_id, ptm_status, waiting_room_enabled } = validationResult;

      // Update status from server
      setMeetingStatus(ptm_status);

      // ── Step 2: Connect to Socket.io with credential ──────────────────────
      const socket = io(API_BASE, {
        auth: {
          credential: socket_credential,
          ptm_id,
          role: 'PARTICIPANT',
          name: myName,
          student_name: ptm.student_name || null,
        },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[ParentPTMRoom] Connected to socket');
      });

      socket.on('connect_error', (err) => {
        console.error('[ParentPTMRoom] Socket error:', err.message);
        setRoomState(ROOM_STATE.ERROR);
        setErrorMsg(err.message?.includes('AUTH') ? 'Your join link has expired. Please go back and try again.' : 'Failed to connect. Check your internet connection.');
      });

      socket.on('disconnect', () => {
        console.log('[ParentPTMRoom] Disconnected');
      });

      // ── Waiting room events ───────────────────────────────────────────────

      socket.on('in_waiting_room', () => {
        setRoomState(ROOM_STATE.WAITING_ROOM);
      });

      socket.on('host_joined', ({ host_name }) => {
        setHostJoined(true);
      });

      socket.on('admitted', () => {
        setRoomState(ROOM_STATE.IN_MEETING);
      });

      socket.on('rejected', ({ reason }) => {
        setRoomState(ROOM_STATE.REJECTED);
        setErrorMsg(reason || 'The host has declined your join request.');
      });

      // ── In-meeting events ─────────────────────────────────────────────────

      socket.on('room_joined', ({ messages: history, participants }) => {
        setRoomState(ROOM_STATE.IN_MEETING);
        if (history?.length) setMessages(history);
      });

      socket.on('new_message', (msg) => {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });

      socket.on('ptm_status_updated', ({ status: newStatus }) => {
        setMeetingStatus(newStatus);
        if (newStatus === 'COMPLETED') {
          setRoomState(ROOM_STATE.ENDED);
        }
      });

      socket.on('meeting_ended', () => {
        setRoomState(ROOM_STATE.ENDED);
      });

      socket.on('muted_by_host', () => {
        Alert.alert('Muted', 'The host has muted you.');
      });

      socket.on('removed_by_host', ({ reason }) => {
        setRoomState(ROOM_STATE.REMOVED);
        setErrorMsg(reason || 'You have been removed from the meeting.');
      });

      socket.on('duplicate_device', ({ message }) => {
        setRoomState(ROOM_STATE.ERROR);
        setErrorMsg(message || 'You joined this PTM from another device. Only one device is allowed.');
      });

      socket.on('host_disconnected', () => {
        // Non-fatal — host will reconnect, show a friendly banner
        setHostJoined(false);
      });

      socket.on('host_changed', ({ new_host_name }) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          message: `${new_host_name} is now the host.`,
          message_type: 'SYSTEM',
          created_at: new Date().toISOString(),
        }]);
      });

      socket.on('error', ({ message }) => {
        Alert.alert('Error', message);
      });

    } catch (err) {
      console.error('[ParentPTMRoomScreen] Connect error:', err.message);
      setRoomState(ROOM_STATE.ERROR);
      setErrorMsg(err.message || 'Could not connect to the meeting. Please try again.');
    }
  }, [ptm, myName, myUserId]);

  useEffect(() => {
    connectToRoom();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [connectToRoom]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { message: text.trim() });
    setText('');
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === myUserId;
    const isSystem = item.message_type === 'SYSTEM';
    const time = new Date(item.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isSystem) {
      return (
        <View style={styles.sysRow}>
          <Text style={styles.sysMsg}>{item.message}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.msgRow, isMe ? styles.myRow : styles.otherRow]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          {!isMe && <Text style={styles.senderName}>{item.sender_name} · {item.sender_role}</Text>}
          <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.otherMsgText]}>{item.message}</Text>
          <Text style={[styles.ts, isMe ? styles.myTs : styles.otherTs]}>{time}</Text>
        </View>
      </View>
    );
  };

  // ── State-based views ─────────────────────────────────────────────────────

  if (roomState === ROOM_STATE.CONNECTING) {
    return (
      <View style={styles.stateScreen}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={styles.stateTitle}>Connecting...</Text>
        <Text style={styles.stateDesc}>Verifying your invitation and joining {ptm.title}</Text>
      </View>
    );
  }

  if (roomState === ROOM_STATE.WAITING_ROOM) {
    return (
      <View style={styles.stateScreen}>
        <View style={styles.waitingIcon}>
          <Text style={{ fontSize: 40 }}>🚪</Text>
        </View>
        <Text style={styles.stateTitle}>Waiting Room</Text>
        <Text style={styles.stateDesc}>
          {hostJoined
            ? 'The host is reviewing your request to join...'
            : 'Waiting for the host to join and admit you...'}
        </Text>
        <Text style={styles.ptmTitleLabel}>{ptm.title}</Text>
        {ptm.host_teacher_name && (
          <Text style={styles.stateDesc}>Host: {ptm.host_teacher_name}</Text>
        )}
        <View style={styles.waitDots}>
          <ActivityIndicator color={primary} size="small" />
          <Text style={styles.waitDotsText}>Please keep this screen open</Text>
        </View>
        <Pressable style={styles.leaveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.leaveBtnTxt}>Leave Waiting Room</Text>
        </Pressable>
      </View>
    );
  }

  if (roomState === ROOM_STATE.REJECTED) {
    return (
      <View style={styles.stateScreen}>
        <Text style={{ fontSize: 40 }}>🚫</Text>
        <Text style={styles.stateTitle}>Not Admitted</Text>
        <Text style={styles.stateDesc}>{errorMsg}</Text>
        <Pressable style={styles.actionBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.actionBtnTxt}>← Back to PTM List</Text>
        </Pressable>
      </View>
    );
  }

  if (roomState === ROOM_STATE.REMOVED) {
    return (
      <View style={styles.stateScreen}>
        <Text style={{ fontSize: 40 }}>🚶</Text>
        <Text style={styles.stateTitle}>Removed from Meeting</Text>
        <Text style={styles.stateDesc}>{errorMsg}</Text>
        <Pressable style={styles.actionBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.actionBtnTxt}>← Back to PTM List</Text>
        </Pressable>
      </View>
    );
  }

  if (roomState === ROOM_STATE.ENDED) {
    return (
      <View style={styles.stateScreen}>
        <Text style={{ fontSize: 40 }}>✅</Text>
        <Text style={styles.stateTitle}>Meeting Ended</Text>
        <Text style={styles.stateDesc}>The PTM session "{ptm.title}" has been completed by the teacher. Thank you for attending!</Text>
        <Pressable style={styles.actionBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.actionBtnTxt}>← Back to PTM List</Text>
        </Pressable>
      </View>
    );
  }

  if (roomState === ROOM_STATE.ERROR) {
    return (
      <View style={styles.stateScreen}>
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={styles.stateTitle}>Connection Error</Text>
        <Text style={styles.stateDesc}>{errorMsg}</Text>
        <Pressable style={styles.actionBtn} onPress={connectToRoom}>
          <Text style={styles.actionBtnTxt}>↺ Retry</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, { backgroundColor: surface, marginTop: 8 }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.actionBtnTxt, { color: textSecondary }]}>← Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // ── IN_MEETING state ──────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Leave</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{ptm.title}</Text>
          <Text style={styles.headerSub}>
            {ptm.host_teacher_name ? `Host: ${ptm.host_teacher_name}` : ''}
            {ptm.subject_name ? ` · ${ptm.subject_name}` : ''}
          </Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, { backgroundColor: meetingStatus === 'LIVE' ? danger : textMuted }]} />
          <Text style={styles.liveBadgeTxt}>{meetingStatus === 'LIVE' ? 'LIVE' : meetingStatus}</Text>
        </View>
      </View>

      {/* ── Chat ── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, idx) => item.id || String(idx)}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<Text style={styles.emptyMsg}>No messages yet. Say hi to the teacher! 👋</Text>}
      />

      {/* ── Input ── */}
      {meetingStatus === 'LIVE' ? (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.inputField}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={textMuted}
            selectionColor={primary}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendTxt}>Send</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.chatDisabled}>
          <Text style={styles.chatDisabledTxt}>
            {meetingStatus === 'COMPLETED' ? '✅ Meeting has ended. Chat is read-only.' : '⏳ Waiting for teacher to start the meeting...'}
          </Text>
        </View>
      )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: background },
  stateScreen:    { flex: 1, backgroundColor: background, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14 },
  stateTitle:     { fontSize: fontSizes.title, fontWeight: fontWeights.bold, color: textPrimary, textAlign: 'center' },
  stateDesc:      { fontSize: fontSizes.body, color: textSecondary, textAlign: 'center', lineHeight: 22 },
  ptmTitleLabel:  { fontSize: fontSizes.body, fontWeight: fontWeights.semibold, color: primary, textAlign: 'center' },
  waitingIcon:    { width: 80, height: 80, borderRadius: 40, backgroundColor: primaryLight, alignItems: 'center', justifyContent: 'center' },
  waitDots:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  waitDotsText:   { fontSize: fontSizes.caption, color: textMuted },
  leaveBtn:       { marginTop: 10, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: border },
  leaveBtnTxt:    { fontSize: fontSizes.body, color: textSecondary },
  actionBtn:      { backgroundColor: primary, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 24, marginTop: 6 },
  actionBtnTxt:   { color: '#fff', fontSize: fontSizes.body, fontWeight: fontWeights.semibold, textAlign: 'center' },
  header:         { backgroundColor: card, paddingTop: Platform.OS === 'ios' ? 44 : 20, paddingBottom: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: border, flexDirection: 'row', alignItems: 'center' },
  backBtn:        { paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: surface, borderWidth: 1, borderColor: border },
  backText:       { fontSize: fontSizes.sub, color: textSecondary, fontWeight: fontWeights.semibold },
  headerTitle:    { fontSize: fontSizes.body, fontWeight: fontWeights.bold, color: textPrimary },
  headerSub:      { fontSize: fontSizes.caption, color: textMuted },
  liveBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.round, borderWidth: 1, borderColor: border },
  liveDot:        { width: 8, height: 8, borderRadius: 4 },
  liveBadgeTxt:   { fontSize: 9, fontWeight: 'bold', color: textSecondary },
  msgList:        { paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  emptyMsg:       { textAlign: 'center', color: textMuted, fontSize: fontSizes.caption, marginTop: 30 },
  sysRow:         { alignItems: 'center', paddingVertical: 4 },
  sysMsg:         { fontSize: fontSizes.caption, color: textMuted, fontStyle: 'italic' },
  msgRow:         { flexDirection: 'row', width: '100%' },
  myRow:          { justifyContent: 'flex-end' },
  otherRow:       { justifyContent: 'flex-start' },
  bubble:         { maxWidth: '80%', borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  myBubble:       { backgroundColor: primary, borderTopRightRadius: 2 },
  otherBubble:    { backgroundColor: card, borderWidth: 1, borderColor: border, borderTopLeftRadius: 2 },
  senderName:     { fontSize: 9, fontWeight: 'bold', color: primary, marginBottom: 3 },
  msgText:        { fontSize: fontSizes.body - 1, lineHeight: 18 },
  myMsgText:      { color: '#fff' },
  otherMsgText:   { color: textPrimary },
  ts:             { fontSize: 8, marginTop: 4, alignSelf: 'flex-end' },
  myTs:           { color: 'rgba(255,255,255,0.6)' },
  otherTs:        { color: textMuted },
  inputBar:       { flexDirection: 'row', gap: 8, backgroundColor: card, borderTopWidth: 1, borderColor: border, padding: 10, paddingBottom: Platform.OS === 'ios' ? 26 : 10 },
  inputField:     { flex: 1, backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: radius.round, paddingHorizontal: 14, paddingVertical: 8, fontSize: fontSizes.body - 1, color: textPrimary },
  sendBtn:        { backgroundColor: primary, borderRadius: radius.round, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' },
  sendTxt:        { color: '#fff', fontSize: fontSizes.sub, fontWeight: fontWeights.bold },
  chatDisabled:   { backgroundColor: surface, padding: 12, alignItems: 'center', borderTopWidth: 1, borderColor: border, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  chatDisabledTxt:{ fontSize: fontSizes.caption, color: textMuted, fontWeight: fontWeights.semibold },
});
