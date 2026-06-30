/**
 * RaiseComplaintScreen.js — Submit support tickets / complaints
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import {
  background, surface, border, card, primary, primaryLight,
  textPrimary, textSecondary, textMuted, radius, spacing, layout, success
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { useSession } from '../../context/SessionContext';
import GlobalHeader from '../../components/navigation/GlobalHeader';
import AnimatedButton from '../../components/primitives/AnimatedButton';
import PremiumCard from '../../components/primitives/PremiumCard';
import { parentPost } from '../../utils/api';

const CATEGORIES = [
  { label: 'Academics', value: 'ACADEMICS' },
  { label: 'Fees', value: 'FEES' },
  { label: 'Transport', value: 'TRANSPORT' },
  { label: 'Attendance', value: 'ATTENDANCE' },
  { label: 'PTM', value: 'PTM' },
  { label: 'General', value: 'GENERAL' },
];

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function RaiseComplaintScreen({ navigation }) {
  const { activeChild, session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ACADEMICS');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and description.');
      return;
    }

    if (!activeChild?.group_id) {
      Alert.alert('Error', 'Could not resolve school organization context.');
      return;
    }

    try {
      setSubmitting(true);
      await parentPost('/support/tickets', {
        group_id: activeChild.group_id,
        branch_id: activeChild.branch_id,
        student_id: activeChild.student_id,
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
      });

      Alert.alert(
        'Complaint Submitted',
        'Your complaint has been successfully registered. The school administration will review it soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.warn('[RaiseComplaintScreen] Submit error:', err.message);
      Alert.alert('Submission Failed', err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <GlobalHeader title="Raise Complaint" showBack />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <PremiumCard style={styles.card}>
            <Text style={styles.subtitle}>
              Submit a support ticket or complaint directly to the school administration.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Associated Student</Text>
              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>
                  {activeChild?.full_name || 'No Student Selected'} 
                  {activeChild?.class_name ? ` (${activeChild.class_name}-${activeChild.section_name || ''})` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Complaint Category</Text>
              <View style={styles.optionsGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    style={[
                      styles.optionBtn,
                      category === cat.value && styles.optionBtnActive
                    ]}
                  >
                    <Text style={[
                      styles.optionText,
                      category === cat.value && styles.optionTextActive
                    ]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Priority Level</Text>
              <View style={styles.optionsGrid}>
                {PRIORITIES.map((prio) => (
                  <Pressable
                    key={prio}
                    onPress={() => setPriority(prio)}
                    style={[
                      styles.optionBtn,
                      priority === prio && styles.optionBtnActive
                    ]}
                  >
                    <Text style={[
                      styles.optionText,
                      priority === prio && styles.optionTextActive
                    ]}>
                      {prio}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Title / Subject *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Bus route delayed, Incorrect fee details"
                placeholderTextColor={textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Detailed Description *</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Provide full context so the school can address it quickly..."
                placeholderTextColor={textMuted}
                multiline
                numberOfLines={6}
                style={[styles.input, styles.textArea]}
              />
            </View>

            <View style={{ marginTop: spacing.md }}>
              <AnimatedButton
                onPress={handleSubmit}
                disabled={submitting}
                variant="primary"
                size="md"
              >
                {submitting ? <ActivityIndicator color="#fff" /> : 'Submit Complaint'}
              </AnimatedButton>
            </View>
          </PremiumCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: background,
  },
  scroll: {
    padding: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  subtitle: {
    fontSize: fontSizes.caption,
    color: textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
    color: textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  readOnlyBox: {
    backgroundColor: background,
    borderWidth: 1,
    borderColor: border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  readOnlyText: {
    fontSize: fontSizes.body,
    color: textPrimary,
    fontWeight: fontWeights.semibold,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  optionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: background,
  },
  optionBtnActive: {
    borderColor: primary,
    backgroundColor: primaryLight,
  },
  optionText: {
    fontSize: fontSizes.caption,
    color: textSecondary,
    fontWeight: fontWeights.semibold,
  },
  optionTextActive: {
    color: primary,
  },
  input: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: radius.md,
    backgroundColor: background,
    color: textPrimary,
    padding: spacing.md,
    fontSize: fontSizes.body,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
