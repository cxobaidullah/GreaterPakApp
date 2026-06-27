import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  fetchPost,
  fetchRelatedPosts,
  likePost,
  sharePost,
  fetchPostComments,
  addPostComment,
} from '../services/postService';
import { AuthContext } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import theme from '../config/theme';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const PostDetailScreen = ({ navigation, route }) => {
  const { slug } = route.params || {};
  const { mode } = useContext(AuthContext);
  const { loc } = useLanguage();
  const isGuest = mode !== 'authenticated';

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [flash, setFlash] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPost(slug);
      setPost(data);
      setLikes(data.likes || 0);
      // Secondary data — don't block the main view.
      fetchPostComments(data._id).then(setComments).catch(() => {});
      fetchRelatedPosts(slug).then((r) => setRelated(r.related || [])).catch(() => {});
    } catch (err) {
      setError(err?.toString() || 'Unable to load this post.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const onLike = async () => {
    if (!post) return;
    try {
      const d = await likePost(post._id);
      setLikes(d.likes);
    } catch {
      /* ignore */
    }
  };

  const onShare = async () => {
    if (!post) return;
    try {
      sharePost(post._id).catch(() => {});
      await Share.share({ message: `${loc(post.title)}\n\nRead on Aam Loeg Itehad.` });
    } catch {
      /* dismissed */
    }
  };

  const onAddComment = async () => {
    if (!commentText.trim() || !post) return;
    setPosting(true);
    setFlash('');
    try {
      await addPostComment(post._id, commentText.trim());
      setCommentText('');
      setFlash('Comment submitted for review.');
    } catch (err) {
      setFlash(err?.toString() || 'Unable to post comment.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.page, styles.center]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.page}>
        <Header navigation={navigation} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Post not found.'}</Text>
        </View>
      </View>
    );
  }

  const author = !post.hideAuthor ? post.author?.fullName || post.authorName : '';

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {post.primaryCategory ? (
          <View style={styles.catChip}>
            <Text style={styles.catChipText}>{loc(post.primaryCategory.name)}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{loc(post.title)}</Text>

        <View style={styles.metaRow}>
          {author ? <Text style={styles.metaText}>By {author}</Text> : null}
          {post.publishedAt ? <Text style={styles.metaText}>· {formatDate(post.publishedAt)}</Text> : null}
          <Text style={styles.metaText}>· {post.views || 0} views</Text>
        </View>

        {post.featuredImage ? <Image source={{ uri: post.featuredImage }} style={styles.hero} /> : null}

        {loc(post.summary) ? <Text style={styles.summary}>{loc(post.summary)}</Text> : null}
        <Text style={styles.body}>{loc(post.body)}</Text>

        {post.tags && post.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {post.tags.map((tg) => (
              <View key={tg._id} style={styles.tag}>
                <Text style={styles.tagText}>#{loc(tg.name)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
            <MaterialCommunityIcons name="heart-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionText}>{likes ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
            <MaterialCommunityIcons name="share-variant-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments */}
        {post.allowComments !== false ? (
          <View style={styles.commentsBlock}>
            <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

            {isGuest ? (
              <Text style={styles.signInNote}>Sign in to join the conversation.</Text>
            ) : (
              <View style={styles.commentForm}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment…"
                  placeholderTextColor={theme.colors.textLow}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity style={[styles.postBtn, posting && { opacity: 0.6 }]} onPress={onAddComment} disabled={posting}>
                  <Text style={styles.postBtnText}>{posting ? '…' : 'Post'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {flash ? <Text style={styles.flash}>{flash}</Text> : null}

            {comments.map((c) => (
              <View key={c._id} style={styles.comment}>
                <Text style={styles.commentBody}>{c.body}</Text>
                <Text style={styles.commentMeta}>{c.author?.fullName || c.authorName} · {formatDate(c.createdAt)}</Text>
              </View>
            ))}
            {comments.length === 0 ? <Text style={styles.signInNote}>No comments yet.</Text> : null}
          </View>
        ) : null}

        {/* Related */}
        {related.length > 0 ? (
          <View style={styles.relatedBlock}>
            <Text style={styles.sectionTitle}>Related</Text>
            {related.slice(0, 4).map((r) => (
              <TouchableOpacity
                key={r._id}
                style={styles.relatedItem}
                onPress={() => navigation.push('PostDetail', { slug: r.slug, title: loc(r.title) })}
              >
                {r.featuredImage ? (
                  <Image source={{ uri: r.featuredImage }} style={styles.relatedThumb} />
                ) : (
                  <View style={[styles.relatedThumb, styles.relatedThumbPlaceholder]}>
                    <Text style={styles.placeholderText}>ALI</Text>
                  </View>
                )}
                <Text style={styles.relatedTitle} numberOfLines={3}>{loc(r.title)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Header = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
      <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Article</Text>
    <View style={{ width: 28 }} />
  </View>
);

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: theme.fontSize.subtitle, fontWeight: theme.fontWeight.bold, color: theme.colors.textHigh },
  content: { padding: theme.spacing.lg, paddingTop: theme.spacing.sm },
  catChip: { alignSelf: 'flex-start', backgroundColor: theme.colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 10 },
  catChipText: { color: theme.colors.primary, fontSize: 11, fontWeight: theme.fontWeight.bold },
  title: { fontSize: 26, fontWeight: theme.fontWeight.bold, color: theme.colors.ink, lineHeight: 32 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  metaText: { fontSize: theme.fontSize.small, color: theme.colors.textLow },
  hero: { width: '100%', height: 210, borderRadius: theme.radius.card, marginTop: theme.spacing.md, backgroundColor: theme.colors.primarySoft },
  summary: { fontSize: 17, fontWeight: theme.fontWeight.semi, color: theme.colors.textMedium, marginTop: theme.spacing.md, lineHeight: 25 },
  body: { fontSize: 16, color: theme.colors.textHigh, lineHeight: 27, marginTop: theme.spacing.md, textAlign: 'justify' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.spacing.md },
  tag: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 12, color: theme.colors.textMedium },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border, paddingVertical: theme.spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, paddingVertical: 9, borderRadius: theme.radius.button },
  actionText: { color: theme.colors.primary, fontWeight: theme.fontWeight.semi },
  sectionTitle: { fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.bold, color: theme.colors.ink, marginBottom: theme.spacing.md },
  commentsBlock: { marginTop: theme.spacing.lg },
  signInNote: { color: theme.colors.textLow, fontSize: theme.fontSize.small },
  commentForm: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginBottom: theme.spacing.md },
  commentInput: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.small, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.textHigh },
  postBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.button, paddingHorizontal: 18, paddingVertical: 12 },
  postBtnText: { color: theme.colors.surface, fontWeight: theme.fontWeight.bold },
  flash: { color: theme.colors.success, fontSize: theme.fontSize.small, marginBottom: theme.spacing.sm },
  comment: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.small, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  commentBody: { color: theme.colors.textHigh, fontSize: theme.fontSize.body },
  commentMeta: { color: theme.colors.textLow, fontSize: 12, marginTop: 6 },
  relatedBlock: { marginTop: theme.spacing.xl },
  relatedItem: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center', marginBottom: theme.spacing.md },
  relatedThumb: { width: 78, height: 60, borderRadius: theme.radius.small, backgroundColor: theme.colors.primarySoft },
  relatedThumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 18, fontWeight: theme.fontWeight.bold, color: 'rgba(21,102,61,0.25)' },
  relatedTitle: { flex: 1, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.semi, color: theme.colors.textHigh, lineHeight: 20 },
  errorText: { color: theme.colors.error },
});

export default PostDetailScreen;
