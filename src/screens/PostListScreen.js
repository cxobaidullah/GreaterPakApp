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
import { fetchPosts } from '../services/postService';
import { useLanguage } from '../contexts/LanguageContext';
import theme from '../config/theme';

const PAGE_LIMIT = 15;

const PostListScreen = ({ navigation, route }) => {
  const { type, title } = route.params || {};
  const { loc } = useLanguage();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ pageToLoad = 1, append = false } = {}) => {
      try {
        setError('');
        const data = await fetchPosts({ type, page: pageToLoad, limit: PAGE_LIMIT });
        const fetched = data.items || [];
        setItems((current) => (append ? [...current, ...fetched] : fetched));
        setTotal(data.total || 0);
        setPage(pageToLoad);
      } catch (err) {
        setError(err?.toString() || 'Unable to load content.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [type],
  );

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
    const author = !item.hideAuthor ? item.author?.fullName || item.authorName : '';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PostDetail', { slug: item.slug, title: loc(item.title) })}
      >
        {item.featuredImage ? (
          <Image source={{ uri: item.featuredImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>ALI</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          {item.primaryCategory ? (
            <View style={styles.catChip}>
              <Text style={styles.catChipText}>{loc(item.primaryCategory.name)}</Text>
            </View>
          ) : null}
          <Text style={styles.cardTitle} numberOfLines={2}>{loc(item.title)}</Text>
          {loc(item.summary) ? (
            <Text style={styles.cardSummary} numberOfLines={2}>{loc(item.summary)}</Text>
          ) : null}
          <View style={styles.cardMeta}>
            {author ? <Text style={styles.cardMetaText} numberOfLines={1}>By {author}</Text> : null}
            <View style={styles.metaRight}>
              <MaterialCommunityIcons name="eye-outline" size={14} color={theme.colors.textLow} />
              <Text style={styles.cardMetaText}>{item.views || 0}</Text>
              {item.commentCount ? (
                <>
                  <MaterialCommunityIcons name="comment-outline" size={14} color={theme.colors.textLow} style={{ marginLeft: 8 }} />
                  <Text style={styles.cardMetaText}>{item.commentCount}</Text>
                </>
              ) : null}
            </View>
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
        <Text style={styles.headerTitle}>{title || 'Content'}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load({ pageToLoad: 1 })}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="text-box-remove-outline" size={48} color={theme.colors.textLow} />
          <Text style={styles.emptyText}>Nothing here yet.</Text>
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
  headerTitle: { fontSize: theme.fontSize.subtitle, fontWeight: theme.fontWeight.bold, color: theme.colors.textHigh },
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
  image: { width: '100%', height: 180, backgroundColor: theme.colors.primarySoft },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 32, fontWeight: theme.fontWeight.bold, color: 'rgba(21,102,61,0.25)' },
  cardBody: { padding: theme.spacing.md },
  catChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  catChipText: { color: theme.colors.primary, fontSize: 11, fontWeight: theme.fontWeight.bold },
  cardTitle: { fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.bold, color: theme.colors.textHigh, marginBottom: 6, lineHeight: 22 },
  cardSummary: { fontSize: theme.fontSize.small, color: theme.colors.textMedium, lineHeight: 18, marginBottom: theme.spacing.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 12, color: theme.colors.textLow },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing.lg },
  errorText: { color: theme.colors.error, textAlign: 'center', marginBottom: theme.spacing.md },
  retryBtn: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.button, borderWidth: 1, borderColor: theme.colors.primary },
  retryText: { color: theme.colors.primary, fontWeight: theme.fontWeight.semi },
  emptyText: { marginTop: theme.spacing.sm, color: theme.colors.textMedium },
  footerLoader: { paddingVertical: theme.spacing.md, alignItems: 'center' },
  footerEnd: { paddingVertical: theme.spacing.md, textAlign: 'center', color: theme.colors.textLow, fontSize: 12 },
});

export default PostListScreen;
