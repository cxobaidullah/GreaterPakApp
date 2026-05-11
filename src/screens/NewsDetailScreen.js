import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchNewsItem } from '../services/newsService';
import theme from '../config/theme';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const NewsDetailScreen = ({ navigation, route }) => {
  const { id } = route.params || {};
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchNewsItem(id);
        if (!cancelled) setNews(data);
      } catch (err) {
        if (!cancelled) setError(err?.toString() || 'Unable to load this article.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>News</Text>
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
      ) : news ? (
        <ScrollView contentContainerStyle={styles.content}>
          {news.imageUrl ? (
            <Image source={{ uri: news.imageUrl }} style={styles.hero} />
          ) : null}

          <Text style={styles.title}>{news.title}</Text>

          <View style={styles.meta}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={14} color={theme.colors.textLow} />
            <Text style={styles.metaText}>{formatDate(news.publishedAt)}</Text>
            {news.author ? (
              <>
                <View style={styles.dot} />
                <MaterialCommunityIcons name="account-outline" size={14} color={theme.colors.textLow} />
                <Text style={styles.metaText}>{news.author}</Text>
              </>
            ) : null}
          </View>

          {news.summary ? (
            <Text style={styles.summary}>{news.summary}</Text>
          ) : null}

          <Text style={styles.body}>{news.body}</Text>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
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
  hero: {
    width: '100%',
    height: 220,
    borderRadius: theme.radius.card,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
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
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textLow,
    marginHorizontal: 8,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default NewsDetailScreen;
