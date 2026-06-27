import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchPolls, votePoll } from '../services/pollService';
import { useLanguage } from '../contexts/LanguageContext';
import theme from '../config/theme';

const pct = (count, total) => (total > 0 ? Math.round((count / total) * 100) : 0);

const PollCard = ({ poll }) => {
  const { loc } = useLanguage();
  const [state, setState] = useState(poll);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');
  const closed = state.status !== 'open';
  const showResults = voted || closed;

  const vote = async (optionId) => {
    setError('');
    try {
      const d = await votePoll(poll._id, optionId);
      setState(d.poll);
      setVoted(true);
    } catch (err) {
      if (String(err).toLowerCase().includes('already')) setVoted(true);
      setError(err?.toString() || 'Unable to vote.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={[styles.statusChip, closed ? styles.statusClosed : styles.statusOpen]}>
          <Text style={[styles.statusText, closed ? styles.statusTextClosed : styles.statusTextOpen]}>
            {closed ? 'RESULTS' : 'VOTE'}
          </Text>
        </View>
        <Text style={styles.votes}>{state.totalVotes || 0} votes</Text>
      </View>
      <Text style={styles.question}>{loc(state.question)}</Text>
      {loc(state.description) ? <Text style={styles.desc}>{loc(state.description)}</Text> : null}

      <View style={styles.options}>
        {state.options.map((o) =>
          showResults ? (
            <View key={o._id} style={styles.resultRow}>
              <View style={styles.resultLabelRow}>
                <Text style={styles.optionLabel}>{loc(o.label)}</Text>
                <Text style={styles.optionPct}>{pct(o.voteCount, state.totalVotes)}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct(o.voteCount, state.totalVotes)}%` }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity key={o._id} style={styles.optionBtn} activeOpacity={0.8} onPress={() => vote(o._id)}>
              <Text style={styles.optionBtnText}>{loc(o.label)}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>
      {error ? <Text style={styles.errorSmall}>{error}</Text> : null}
    </View>
  );
};

const PollListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await fetchPolls();
      setItems(data);
    } catch (err) {
      setError(err?.toString() || 'Unable to load polls.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Votes & Surveys</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="poll" size={48} color={theme.colors.textLow} />
          <Text style={styles.emptyText}>No active polls right now.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.colors.primary} />
          }
        >
          {items.map((p) => (
            <PollCard key={p._id} poll={p} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: theme.fontSize.subtitle, fontWeight: theme.fontWeight.bold, color: theme.colors.textHigh },
  list: { padding: theme.spacing.lg, paddingTop: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  statusOpen: { backgroundColor: theme.colors.primarySoft },
  statusClosed: { backgroundColor: theme.colors.background },
  statusText: { fontSize: 10, fontWeight: theme.fontWeight.bold, letterSpacing: 1 },
  statusTextOpen: { color: theme.colors.primary },
  statusTextClosed: { color: theme.colors.textLow },
  votes: { fontSize: 12, color: theme.colors.textLow },
  question: { fontSize: theme.fontSize.subtitle, fontWeight: theme.fontWeight.bold, color: theme.colors.ink, lineHeight: 24 },
  desc: { fontSize: theme.fontSize.small, color: theme.colors.textMedium, marginTop: 4 },
  options: { marginTop: theme.spacing.md, gap: 10 },
  optionBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.small,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  optionBtnText: { color: theme.colors.textHigh, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  resultRow: { marginBottom: 4 },
  resultLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  optionLabel: { color: theme.colors.textMedium, fontSize: theme.fontSize.small },
  optionPct: { color: theme.colors.textHigh, fontSize: theme.fontSize.small, fontWeight: theme.fontWeight.bold },
  track: { height: 9, borderRadius: 999, backgroundColor: theme.colors.background, overflow: 'hidden' },
  fill: { height: 9, borderRadius: 999, backgroundColor: theme.colors.primary },
  errorSmall: { color: theme.colors.notification, fontSize: 12, marginTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg },
  errorText: { color: theme.colors.error, textAlign: 'center' },
  emptyText: { marginTop: theme.spacing.sm, color: theme.colors.textMedium },
});

export default PollListScreen;
