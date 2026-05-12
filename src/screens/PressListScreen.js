import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchPressList } from '../services/pressService';
import { extractYouTubeId, thumbnailUrlFromId } from '../utils/youtube';
import theme from '../config/theme';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const PAGE_LIMIT = 15;

const PressListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async ({ pageToLoad = 1, append = false } = {}) => {
    try {
      setError('');
      const data = await fetchPressList({ page: pageToLoad, limit: PAGE_LIMIT });
      const fetched = data.items || [];
      setItems((current) => (append ? [...current, ...fetched] : fetched));
      setTotal(data.total || 0);
      setPage(pageToLoad);
    } catch (err) {
      setError(err?.toString() || 'Unable to load press conferences.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load({ pageToLoad: 1, append: false });
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load({ pageToLoad: 1, append: false });
  };

  const onEndReached = () => {
    if (loading || loadingMore || refreshing) return;
    if (items.length >= total) return;
    setLoadingMore(true);
    load({ pageToLoad: page + 1, append: true });
  };

  const renderItem = ({ item }) => {
    const videoId = extractYouTubeId(item.videoUrl);
    const thumb = thumbnailUrlFromId(videoId);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PressDetail', { id: item._id })}
      >
        <View style={styles.thumbWrap}>
          {thumb ? (
            <Image source={{ uri: thumb }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <MaterialCommunityIcons name="microphone" size={36} color={theme.colors.textLow} />
            </View>
          )}
          {videoId ? (
            <View style={styles.playOverlay}>
              <MaterialCommunityIcons name="play-circle" size={56} color="#fff" />
            </View>
          ) : null}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          {item.summary ? (
            <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
          ) : null}
          <View style={styles.cardMeta}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={14} color={theme.colors.textLow} />
            <Text style={styles.cardMetaText}>{formatDate(item.eventDate)}</Text>
            {item.location ? (
              <>
                <View style={styles.dot} />
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.textLow} />
                <Text style={styles.cardMetaText} numberOfLines={1}>{item.location}</Text>
              </>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Press Conferences</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="microphone-off" size={48} color={theme.colors.textLow} />
          <Text style={styles.emptyText}>No press conferences yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : items.length >= total && items.length > 0 ? (
              <Text style={styles.footerEnd}>You've reached the end.</Text>
            ) : null
          }
        />
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
  headerTitle: {
    fontSize: theme.fontSize.subtitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  list: { padding: theme.spacing.lg, paddingTop: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  thumbWrap: { position: 'relative' },
  thumb: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.background,
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cardBody: { padding: theme.spacing.md },
  cardTitle: {
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
    marginBottom: 6,
  },
  cardSummary: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMetaText: { fontSize: 12, color: theme.colors.textLow, marginLeft: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.textLow, marginHorizontal: 6 },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg,
  },
  errorText: { color: theme.colors.error, textAlign: 'center', marginBottom: theme.spacing.md },
  retryBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  retryText: { color: theme.colors.primary, fontWeight: theme.fontWeight.semi },
  emptyText: { marginTop: theme.spacing.sm, color: theme.colors.textMedium },
  footerLoader: { paddingVertical: theme.spacing.md, alignItems: 'center' },
  footerEnd: {
    paddingVertical: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.textLow,
    fontSize: 12,
  },
});

export default PressListScreen;
