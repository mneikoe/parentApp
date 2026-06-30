/**
 * ComplaintsListScreen.js — View raised tickets & complaints
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import {
  background, surface, border, card, primary, primaryLight,
  textPrimary, textSecondary, textMuted, radius, spacing, layout, warning, success, danger
} from '../../theme/colors';
import { fontSizes, fontWeights } from '../../theme/typography';
import { parentGet } from '../../utils/api';
import { useSession } from '../../context/SessionContext';
import GlobalHeader from '../../components/navigation/GlobalHeader';
import AnimatedButton from '../../components/primitives/AnimatedButton';
import PremiumCard from '../../components/primitives/PremiumCard';

export default function ComplaintsListScreen({ navigation }) {
  const { activeChild } = useSession();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (!activeChild?.group_id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await parentGet(`/support/tickets?group_id=${activeChild.group_id}`);
      setTickets(res.tickets || []);
    } catch (err) {
      console.warn('[ComplaintsListScreen] Failed to load tickets:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeChild]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTickets();
    });
    return unsubscribe;
  }, [navigation, fetchTickets]);

  const onRefresh = useCallback(() => {
    fetchTickets(true);
  }, [fetchTickets]);

  const getStatusColor = (status) => {
    if (status === 'Open') return primary;
    if (status === 'In Progress') return warning;
    if (status === 'Resolved') return success;
    return textMuted;
  };

  return (
    <View style={styles.screen}>
      <GlobalHeader title="My Complaints & Tickets" showBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.subtitle}>Track your raised complaints and tickets status.</Text>
          <AnimatedButton
            variant="primary"
            size="sm"
            fullWidth={false}
            onPress={() => navigation.navigate('RaiseComplaint')}
          >
            + New Ticket
          </AnimatedButton>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.list}>
            {tickets.map((ticket) => (
              <PremiumCard key={ticket.id} style={styles.card} padding={false}>
                <View style={styles.cardInner}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.ticketTitle}>{ticket.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '15' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.description}>{ticket.description}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Category: {ticket.category}</Text>
                    <Text style={styles.metaText}>Priority: {ticket.priority}</Text>
                    <Text style={styles.metaText}>{new Date(ticket.created_at).toLocaleDateString()}</Text>
                  </View>

                  {ticket.resolution_remarks ? (
                    <View style={styles.remarksBox}>
                      <Text style={styles.remarksLabel}>Admin Resolution Remarks:</Text>
                      <Text style={styles.remarksText}>{ticket.resolution_remarks}</Text>
                    </View>
                  ) : null}
                </View>
              </PremiumCard>
            ))}

            {tickets.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>You haven't raised any complaints or tickets yet.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
    backgroundColor: card,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: border,
  },
  subtitle: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: textSecondary,
    lineHeight: 18,
    fontWeight: fontWeights.medium,
  },
  list: {
    gap: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInner: {
    padding: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ticketTitle: {
    flex: 1,
    fontSize: fontSizes.body + 1,
    fontWeight: fontWeights.bold,
    color: textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.round,
    borderWidth: 1,
  },
  statusText: {
    fontSize: fontSizes.caption - 1,
    fontWeight: fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: fontSizes.caption + 1,
    color: textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: border,
    paddingTop: spacing.md,
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: fontSizes.caption,
    color: textMuted,
    fontWeight: fontWeights.medium,
  },
  remarksBox: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: primaryLight + '30',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: primary + '20',
  },
  remarksLabel: {
    fontSize: fontSizes.caption - 1,
    fontWeight: fontWeights.bold,
    color: primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  remarksText: {
    fontSize: fontSizes.caption + 1,
    color: textPrimary,
    lineHeight: 18,
    fontWeight: fontWeights.medium,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSizes.body,
    color: textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
