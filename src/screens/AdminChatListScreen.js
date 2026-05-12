import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAdminConversations } from '../services/chatService';
import { connectSocket } from '../services/socket';
import theme from '../config/theme';

const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return d.toLocaleDateString();
};

const AdminChatListScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await fetchAdminConversations({ limit: 50 });
      setItems(data.items || []);
    } catch (err) {
      setError(err?.toString() || 'Unable to load conversations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    let active = true;
    let socketInstance = null;

    (async () => {
      const s = await connectSocket();
      if (!active || !s) return;
      socketInstance = s;

      const onChange = () => {
        load();
      };
      s.on('message:new', onChange);
      s.on('conversation:read', onChange);

      socketInstance.cleanup = () => {
        s.off('message:new', onChange);
        s.off('conversation:read', onChange);
      };
    })();

    return () => {
      active = false;
      if (socketInstance?.cleanup) socketInstance.cleanup();
    };
  }, [load]);

  const renderItem = ({ item }) => {
    const name = item.user?.fullName || 'Unknown user';
    const initials = (name[0] || '?').toUpperCase();
    const unread = item.adminUnreadCount || 0;
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item._id,
            partnerName: name,
            partnerSubtitle: item.user?.email || '',
          })
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.rowTop}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.time}>{formatRelative(item.lastMessageAt)}</Text>
          </View>
          <View style={styles.rowBottom}>
            <Text style={styles.preview} numberOfLines={1}>
              {item.lastSenderRole === 'admin' ? 'You: ' : ''}
              {item.lastMessage || 'No messages yet'}
            </Text>
            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread}</Text>
              </View>
            )}
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
        <Text style={styles.headerTitle}>Conversations</Text>
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
          <MaterialCommunityIcons name="chat-outline" size={48} color={theme.colors.textLow} />
          <Text style={styles.emptyText}>No conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={theme.colors.primary}
            />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.label,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  time: { fontSize: 11, color: theme.colors.textLow, marginLeft: 8 },
  preview: { flex: 1, fontSize: 12, color: theme.colors.textMedium },
  unreadBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 76,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
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
  emptyText: { color: theme.colors.textMedium },
});

export default AdminChatListScreen;
