/**
 * ParentPTMListScreen.js — List of PTM meetings for the Parent
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import {
  background, surface, border, card, primary, primaryLight,
  textPrimary, textSecondary, textMuted, radius, spacing, layout, warning, danger, success
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { ptmGet } from '../../utils/api';
import { useSession } from '../../context/SessionContext';
import GlobalHeader from '../../components/navigation/GlobalHeader';
import SectionHeader from '../../components/primitives/SectionHeader';

export default function ParentPTMListScreen({ navigation }) {
  const { activeChild } = useSession();
  const [ptms, setPtms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPTMs = useCallback(async (isRefresh = false) => {
    if (!activeChild?.group_id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await ptmGet(`/list/parent?group_id=${activeChild.group_id}&branch_id=${activeChild.branch_id}&student_id=${activeChild.student_id}`);
      setPtms(res.ptms || []);
    } catch (err) {
      console.warn('[ParentPTMListScreen] Failed to load PTM list:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeChild]);

  useEffect(() => {
    fetchPTMs();
  }, [fetchPTMs]);

  const onRefresh = useCallback(() => {
    fetchPTMs(true);
  }, [fetchPTMs]);

  const getStatusColor = (status) => {
    if (status === 'LIVE') return danger;
    if (status === 'COMPLETED') return success;
    if (status === 'CANCELLED') return danger;
    if (status === 'SCHEDULED') return warning;
    return primary;
  };

  const getStatusLabel = (status) => {
    if (status === 'LIVE') return '🔴 LIVE';
    if (status === 'COMPLETED') return '✅ COMPLETED';
    if (status === 'CANCELLED') return '❌ CANCELLED';
    if (status === 'SCHEDULED') return '⏰ SCHEDULED';
    if (status === 'PUBLISHED') return '📢 UPCOMING';
    return status;
  };

  const canJoin = (item) =>
    item.join_token && ['LIVE', 'SCHEDULED', 'PUBLISHED'].includes(item.status);

  return (
    <View style={styles.container}>
      <GlobalHeader title="Parent ERP" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} colors={[primary]} />
        }
      >
        <SectionHeader
          title="Parent-Teacher Meetings"
          subtitle="Real-time scheduled sessions with teachers"
        />

        {loading ? (
          <ActivityIndicator color={primary} size="large" style={{ marginTop: spacing.xxxxl }} />
        ) : ptms.length > 0 ? (
          ptms.map((item, i) => {
            const formattedDate = new Date(item.meeting_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            const isLive = item.status === 'LIVE';
            const isCompleted = item.status === 'COMPLETED';

            return (
              <View key={item.id || i} style={styles.ptmCard}>
                <View style={styles.ptmHeader}>
                  <View style={styles.classBadge}>
                    <Text style={styles.classBadgeText}>
                      {item.class_name}{item.section_name ? `-${item.section_name}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.ptmBody}>
                  <Text style={styles.ptmTitle}>{item.title}</Text>
                  {item.student_name && (
                    <View style={styles.studentBadge}>
                      <Text style={styles.studentBadgeTxt}>👤 For: {item.student_name}</Text>
                    </View>
                  )}
                  {item.description ? (
                    <Text style={styles.ptmDesc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  {item.agenda ? (
                    <Text style={styles.agendaText} numberOfLines={2}>📋 {item.agenda}</Text>
                  ) : null}
                  {item.host_teacher_name && (
                    <Text style={styles.subjectText}>
                      Host: <Text style={styles.highlightText}>{item.host_teacher_name}</Text>
                    </Text>
                  )}
                  {item.subject_name && (
                    <Text style={styles.subjectText}>
                      Subject: <Text style={styles.highlightText}>{item.subject_name}</Text>
                    </Text>
                  )}
                </View>

                <View style={styles.ptmFooter}>
                  <Text style={styles.scheduleText}>
                    📅 {formattedDate} at <Text style={styles.timeText}>{item.start_time?.slice(0,5)}</Text> ({item.duration_minutes}m)
                  </Text>

                  {canJoin(item) && (
                    <Pressable
                      style={[styles.joinBtn, { backgroundColor: isLive ? danger : primary }]}
                      onPress={() => navigation.navigate('ParentPTMRoom', { ptm: item })}
                    >
                      <Text style={styles.joinBtnText}>
                        {isLive ? 'Join LIVE 🔴' : '🚪 Join Room'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📣</Text>
            <Text style={styles.emptyText}>No Parent-Teacher Meetings scheduled for your child.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  scroll: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  ptmCard: {
    backgroundColor: card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ptmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classBadge: {
    backgroundColor: primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  classBadgeText: {
    color: primary,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  ptmBody: {
    gap: 4,
  },
  ptmTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    color: textPrimary,
  },
  studentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginBottom: 2,
  },
  studentBadgeTxt: {
    fontSize: fontSizes.caption,
    color: primary,
    fontWeight: fontWeights.semibold,
  },
  ptmDesc: {
    fontSize: fontSizes.sub,
    color: textSecondary,
    lineHeight: 18,
  },
  agendaText: {
    fontSize: fontSizes.caption,
    color: textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  subjectText: {
    fontSize: fontSizes.caption,
    color: textMuted,
    marginTop: 2,
  },
  highlightText: {
    color: textPrimary,
    fontWeight: fontWeights.semibold,
  },
  ptmFooter: {
    borderTopWidth: 1,
    borderColor: border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  scheduleText: {
    fontSize: fontSizes.caption,
    color: textMuted,
    flex: 1,
    minWidth: 150,
  },
  timeText: {
    color: textPrimary,
    fontWeight: fontWeights.bold,
  },
  joinBtn: {
    backgroundColor: danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: fontSizes.sub,
    fontWeight: fontWeights.bold,
  },
  emptyContainer: {
    padding: spacing.xxxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: fontSizes.body,
    color: textMuted,
    textAlign: 'center',
  },
});
