import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../contexts/AuthContext';
import {
  fetchMyMessages,
  sendMyMessage,
  markMyConversationRead,
  fetchConversationMessages,
  sendAdminMessage,
  markAdminConversationRead,
} from '../services/chatService';
import { connectSocket } from '../services/socket';
import theme from '../config/theme';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const ChatScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const conversationId = route.params?.conversationId || null;
  const partnerName = route.params?.partnerName || (isAdmin ? 'User' : 'Admin Support');
  const partnerSubtitle = route.params?.partnerSubtitle || '';

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversation?._id || conversationId || null;
  }, [conversation, conversationId]);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = isAdmin
        ? await fetchConversationMessages(conversationId, { limit: 50 })
        : await fetchMyMessages({ limit: 50 });
      setMessages(data.messages || []);
      setConversation(data.conversation || null);
      if (isAdmin && conversationId) {
        markAdminConversationRead(conversationId).catch(() => {});
      } else if (!isAdmin) {
        markMyConversationRead().catch(() => {});
      }
    } catch (err) {
      setError(err?.toString() || 'Unable to load chat.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    let socketInstance = null;

    (async () => {
      const s = await connectSocket();
      if (!active || !s) return;
      socketInstance = s;

      const onNew = ({ message, conversation: conv }) => {
        const myConvId = String(conversationIdRef.current || '');
        const incomingConvId = String(conv?._id || '');
        if (!isAdmin) {
          if (incomingConvId !== myConvId && conv?.userId && user?._id && String(conv.userId) !== String(user._id)) return;
        } else if (myConvId !== incomingConvId) {
          return;
        }
        setConversation(conv || null);
        setMessages((curr) => {
          if (curr.some((m) => String(m._id) === String(message._id))) return curr;
          return [...curr, message];
        });
        if (isAdmin) {
          markAdminConversationRead(incomingConvId).catch(() => {});
        } else {
          markMyConversationRead().catch(() => {});
        }
      };

      s.on('message:new', onNew);

      socketInstance.cleanup = () => {
        s.off('message:new', onNew);
      };
    })();

    return () => {
      active = false;
      if (socketInstance?.cleanup) socketInstance.cleanup();
    };
  }, [isAdmin, user?._id]);

  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      setTimeout(() => {
        try {
          listRef.current.scrollToEnd({ animated: true });
        } catch (e) {}
      }, 50);
    }
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      if (isAdmin) {
        await sendAdminMessage(conversationId, text);
      } else {
        await sendMyMessage(text);
      }
    } catch (err) {
      setError(err?.toString() || 'Unable to send.');
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const mine = String(item.senderId) === String(user?._id);
    return (
      <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>{item.text}</Text>
          <Text style={[styles.bubbleTime, mine ? styles.bubbleTimeMine : styles.bubbleTimeTheirs]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{(partnerName?.[0] || '?').toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{partnerName}</Text>
          {partnerSubtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>{partnerSubtitle}</Text>
          ) : (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {isAdmin ? 'Reply as admin' : "We're here to help"}
            </Text>
          )}
        </View>
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
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => {
            try { listRef.current?.scrollToEnd({ animated: false }); } catch (e) {}
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="chat-outline" size={48} color={theme.colors.textLow} />
              <Text style={styles.emptyText}>
                {isAdmin ? 'No messages from this user yet.' : 'Say hello to start the conversation.'}
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textLow}
          style={styles.input}
          multiline
          maxLength={4000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!draft.trim() || sending}
        >
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: { padding: 4 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.label,
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMedium,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleText: {
    fontSize: theme.fontSize.small,
    lineHeight: 20,
  },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: theme.colors.textHigh },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },
  bubbleTimeTheirs: { color: theme.colors.textLow },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.small,
    color: theme.colors.textHigh,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: theme.spacing.sm,
  },
  emptyText: { color: theme.colors.textMedium, fontSize: theme.fontSize.small },
  errorText: { color: theme.colors.error, textAlign: 'center', marginBottom: theme.spacing.md },
  retryBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  retryText: { color: theme.colors.primary, fontWeight: theme.fontWeight.semi },
});

export default ChatScreen;
