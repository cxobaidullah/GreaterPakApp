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
import { fetchContentPage } from '../services/contentService';
import theme from '../config/theme';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const ContentPageScreen = ({ navigation, route }) => {
  const { slug, fallbackTitle } = route.params || {};

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await fetchContentPage(slug);
      setPage(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError(`This page hasn't been published yet. Please check back soon.`);
      } else {
        setError(err?.toString() || 'Unable to load this page.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const headerTitle = page?.title || fallbackTitle || 'Content';

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color={theme.colors.textLow} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : page ? (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        >
          <Text style={styles.title}>{page.title}</Text>
          {page.updatedAt ? (
            <View style={styles.meta}>
              <MaterialCommunityIcons name="update" size={14} color={theme.colors.textLow} />
              <Text style={styles.metaText}>Updated {formatDate(page.updatedAt)}</Text>
            </View>
          ) : null}
          <Text style={styles.body}>{page.body}</Text>
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
    flex: 1,
    textAlign: 'center',
    fontSize: theme.fontSize.subtitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
    marginHorizontal: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
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
  metaText: {
    fontSize: 12,
    color: theme.colors.textLow,
    marginLeft: 4,
  },
  body: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textHigh,
    lineHeight: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.textMedium,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  retryText: { color: theme.colors.primary, fontWeight: theme.fontWeight.semi },
});

export default ContentPageScreen;
