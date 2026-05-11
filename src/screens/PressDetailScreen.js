import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { fetchPressItem } from '../services/pressService';
import { extractYouTubeId } from '../utils/youtube';
import theme from '../config/theme';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const PressDetailScreen = ({ navigation, route }) => {
  const { id } = route.params || {};
  const { width } = useWindowDimensions();
  const [press, setPress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchPressItem(id);
        if (!cancelled) setPress(data);
      } catch (err) {
        if (!cancelled) setError(err?.toString() || 'Unable to load this press conference.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const videoId = useMemo(() => extractYouTubeId(press?.videoUrl), [press]);
  const playerHeight = Math.round((width - theme.spacing.lg * 2) * (9 / 16));

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Press Conference</Text>
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
      ) : press ? (
        <ScrollView contentContainerStyle={styles.content}>
          {videoId ? (
            <View style={[styles.playerWrap, { height: playerHeight }]}>
              <YoutubePlayer height={playerHeight} videoId={videoId} />
            </View>
          ) : press.videoUrl ? (
            <View style={[styles.playerWrap, styles.unsupported, { height: playerHeight }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={32} color={theme.colors.textLow} />
              <Text style={styles.unsupportedText}>Video URL is not a recognized YouTube link.</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{press.title}</Text>

          <View style={styles.meta}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={14} color={theme.colors.textLow} />
            <Text style={styles.metaText}>{formatDate(press.eventDate)}</Text>
            {press.location ? (
              <>
                <View style={styles.dot} />
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.textLow} />
                <Text style={styles.metaText}>{press.location}</Text>
              </>
            ) : null}
          </View>

          {press.summary ? (
            <Text style={styles.summary}>{press.summary}</Text>
          ) : null}

          <Text style={styles.body}>{press.details}</Text>
        </ScrollView>
      ) : null}
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
  headerTitle: {
    fontSize: theme.fontSize.subtitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  playerWrap: {
    width: '100%',
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    backgroundColor: '#000',
  },
  unsupported: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unsupportedText: {
    marginTop: 8,
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
    lineHeight: 30,
    marginBottom: theme.spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  metaText: { fontSize: 12, color: theme.colors.textLow, marginLeft: 4 },
  dot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: theme.colors.textLow, marginHorizontal: 8,
  },
  summary: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textMedium,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  body: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textHigh,
    lineHeight: 24,
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg,
  },
  errorText: { color: theme.colors.error, textAlign: 'center' },
});

export default PressDetailScreen;
