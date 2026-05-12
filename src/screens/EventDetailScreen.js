import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Alert,
  Share,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../contexts/AuthContext';
import {
  fetchEventItem,
  reserveEvent,
  toggleEventLike,
  fetchEventComments,
  addEventComment,
  recordEventShare,
} from '../services/eventService';
import MemberExclusiveModal from '../components/MemberExclusiveModal';
import theme from '../config/theme';

const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventDetailScreen = ({ navigation, route }) => {
  const { id } = route.params || {};
  const { user, mode } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [liking, setLiking] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [lockedVisible, setLockedVisible] = useState(false);

  const isApprovedMember = user?.role === 'member' && user?.membershipStatus === 'approved';
  const isAdmin = user?.role === 'admin';
  const canInteract = isApprovedMember || isAdmin;

  const alreadyReserved = useMemo(() => {
    if (!event?.rsvpList || !user?._id) return false;
    return event.rsvpList.some((entry) => String(entry.userId) === String(user._id));
  }, [event, user]);

  const load = useCallback(async () => {
    try {
      setError('');
      const [eventData, commentsData] = await Promise.all([
        fetchEventItem(id),
        fetchEventComments(id).catch(() => []),
      ]);
      setEvent(eventData);
      setComments(commentsData);
    } catch (err) {
      setError(err?.toString() || 'Unable to load this event.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const requireMember = () => {
    if (!canInteract) {
      setLockedVisible(true);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireMember()) return;
    if (liking) return;
    setLiking(true);
    try {
      const data = await toggleEventLike(id);
      setEvent((prev) => (prev ? { ...prev, likeCount: data.likeCount, likedByMe: data.likedByMe } : prev));
    } catch (err) {
      Alert.alert('Unable to update like', err?.toString() || 'Please try again.');
    } finally {
      setLiking(false);
    }
  };

  const handleReserve = async () => {
    if (!requireMember()) return;
    if (reserving || alreadyReserved) return;
    setReserving(true);
    try {
      await reserveEvent(id);
      Alert.alert('Reservation confirmed', 'Your spot has been reserved for this event.');
      load();
    } catch (err) {
      const message =
        err?.response?.data?.error?.message || err?.toString() || 'Unable to reserve a spot. Please try again.';
      Alert.alert('Reservation failed', message);
    } finally {
      setReserving(false);
    }
  };

  const handleShare = async () => {
    if (!requireMember()) return;
    try {
      await Share.share({
        message: `${event.title}\n\n${event.description || ''}\n\nJoin us on ${formatDateTime(event.startDate)}.`,
        title: event.title,
      });
      try {
        const data = await recordEventShare(id);
        setEvent((prev) => (prev ? { ...prev, shareCount: data.shareCount } : prev));
      } catch (e) {
        // ignore share counter failure
      }
    } catch (err) {
      // user dismissed share sheet
    }
  };

  const handleAddComment = async () => {
    if (!requireMember()) return;
    if (!commentText.trim() || posting) return;
    setPosting(true);
    try {
      const data = await addEventComment(id, commentText.trim());
      setComments((prev) => [data.comment, ...prev]);
      setEvent((prev) => (prev ? { ...prev, commentCount: data.commentCount } : prev));
      setCommentText('');
    } catch (err) {
      Alert.alert('Unable to post', err?.toString() || 'Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleOpenMap = () => {
    if (event?.mapUrl) {
      Linking.openURL(event.mapUrl).catch(() =>
        Alert.alert('Cannot open map', 'The map URL appears to be invalid.'),
      );
    }
  };

  const handleJoinFromModal = () => {
    setLockedVisible(false);
    if (mode === 'guest' || mode === 'signedOut') {
      navigation.navigate('Signup', { role: 'member' });
    } else {
      navigation.navigate('Profile');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Event</Text>
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
      ) : event ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.hero} />
          ) : null}

          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={16} color={theme.colors.textLow} />
            <Text style={styles.metaText}>
              {formatDateTime(event.startDate)}
              {event.endDate ? `  →  ${formatDateTime(event.endDate)}` : ''}
            </Text>
          </View>

          {event.location ? (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.colors.textLow} />
              <Text style={styles.metaText}>{event.location}</Text>
              {event.mapUrl ? (
                <TouchableOpacity onPress={handleOpenMap} style={styles.mapLink}>
                  <Text style={styles.mapLinkText}>Open map</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.body}>{event.description}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, event.likedByMe && styles.actionBtnActive]}
              onPress={handleLike}
              disabled={liking}
            >
              <MaterialCommunityIcons
                name={event.likedByMe ? 'heart' : 'heart-outline'}
                size={18}
                color={event.likedByMe ? theme.colors.error : theme.colors.textHigh}
              />
              <Text style={styles.actionText}>{event.likeCount || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant-outline" size={18} color={theme.colors.textHigh} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reserveBtn, (alreadyReserved || reserving) && styles.reserveBtnDisabled]}
              onPress={handleReserve}
              disabled={reserving || alreadyReserved}
            >
              <MaterialCommunityIcons
                name={alreadyReserved ? 'check-circle-outline' : 'ticket-confirmation-outline'}
                size={18}
                color="#fff"
              />
              <Text style={styles.reserveText}>
                {alreadyReserved ? 'Reserved' : reserving ? 'Reserving...' : 'Reserve a spot'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <Text style={styles.commentsCount}>{event.commentCount ?? comments.length}</Text>
          </View>

          <View style={styles.commentInputRow}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder={canInteract ? 'Add a comment...' : 'Members can comment on events'}
              placeholderTextColor={theme.colors.textLow}
              style={styles.commentInput}
              editable={canInteract}
              multiline
            />
            <TouchableOpacity
              style={[styles.commentSendBtn, (!commentText.trim() || posting) && styles.commentSendBtnDisabled]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || posting}
            >
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {comments.length === 0 ? (
            <Text style={styles.emptyComments}>No comments yet.</Text>
          ) : (
            comments.map((c) => (
              <View key={c._id} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarLetter}>
                    {(c.name?.[0] || 'M').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentName}>{c.name || 'Member'}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                  <Text style={styles.commentDate}>{formatDateTime(c.createdAt)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : null}

      <MemberExclusiveModal
        visible={lockedVisible}
        onClose={() => setLockedVisible(false)}
        onJoin={handleJoinFromModal}
        ctaLabel={mode === 'guest' || mode === 'signedOut' ? 'Join GP Now' : 'Become a Member'}
        subtitle="Reserving spots, liking, commenting, and sharing events are reserved for approved members."
      />
    </KeyboardAvoidingView>
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.textMedium,
    flexShrink: 1,
  },
  mapLink: {
    marginLeft: 'auto',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  mapLinkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: theme.fontWeight.semi,
  },
  body: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textHigh,
    lineHeight: 24,
    marginVertical: theme.spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 6,
  },
  actionBtnActive: {
    borderColor: theme.colors.error,
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    color: theme.colors.textHigh,
    fontWeight: theme.fontWeight.semi,
    fontSize: theme.fontSize.small,
  },
  reserveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.success,
    gap: 6,
    marginLeft: 'auto',
  },
  reserveBtnDisabled: {
    opacity: 0.6,
  },
  reserveText: {
    color: '#fff',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.small,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  commentsTitle: {
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  commentsCount: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.small,
    color: theme.colors.textHigh,
  },
  commentSendBtn: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
  },
  commentSendBtnDisabled: {
    opacity: 0.5,
  },
  emptyComments: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textLow,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarLetter: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.small,
  },
  commentName: {
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  commentText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textHigh,
    marginTop: 2,
    lineHeight: 18,
  },
  commentDate: {
    fontSize: 11,
    color: theme.colors.textLow,
    marginTop: 4,
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

export default EventDetailScreen;
