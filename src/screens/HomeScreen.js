import React, { useCallback, useContext, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, RefreshControl, Share } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import FeatureTile from '../components/FeatureTile';
import MemberExclusiveModal from '../components/MemberExclusiveModal';
import theme from '../config/theme';

const FEATURES = [
  { id: 'manifesto', title: 'Review Manifesto', icon: 'file-document-outline', tint: '#FEF3C7', memberOnly: false },
  { id: 'vision', title: 'Vision & Mission', icon: 'eye-outline', tint: '#CFFAFE', memberOnly: false },
  { id: 'news', title: 'Read News', icon: 'newspaper-variant-outline', tint: '#E0F2FE', memberOnly: false },
  { id: 'press', title: 'Press Conferences', icon: 'microphone', tint: '#FEE2E2', memberOnly: false, accent: true },
  { id: 'events', title: 'Explore Events', icon: 'calendar-month-outline', tint: '#DCFCE7', memberOnly: false },
  { id: 'party-structure', title: 'Party Structure', icon: 'sitemap-outline', tint: '#F1F5F9', memberOnly: true },
];

const HomeScreen = ({ navigation }) => {
  const { user, mode, signOut, refreshProfile } = useContext(AuthContext);
  const [lockedVisible, setLockedVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isGuest = mode === 'guest';

  useFocusEffect(
    useCallback(() => {
      if (mode === 'authenticated') {
        refreshProfile();
      }
    }, [mode, refreshProfile]),
  );

  const onRefresh = useCallback(async () => {
    if (mode !== 'authenticated') return;
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }, [mode, refreshProfile]);

  const handleShareReferral = useCallback(async () => {
    if (!user?.referralCode) return;
    try {
      await Share.share({
        message: `Join Greater Pakistan with my referral code: ${user.referralCode}\n\nDownload the GP app and use this code when registering as a member.`,
      });
    } catch (err) {
      // User dismissed the sheet or sharing isn't available — no-op.
    }
  }, [user?.referralCode]);

  const goToProfile = useCallback(() => {
    if (mode !== 'authenticated') return;
    navigation.navigate('Profile');
  }, [mode, navigation]);
  const isApprovedMember = user?.role === 'member' && user?.membershipStatus === 'approved';
  const isPending = user?.membershipStatus === 'pending';
  const isRejected = user?.membershipStatus === 'rejected';

  const badge = useMemo(() => {
    if (isGuest) return { label: 'GUEST MODE', tone: 'muted' };
    if (isApprovedMember) return { label: 'MEMBER', tone: 'success' };
    if (isPending) return { label: 'MEMBER · PENDING', tone: 'warn' };
    if (isRejected) return { label: 'SUPPORTER', tone: 'muted' };
    return { label: 'SUPPORTER', tone: 'muted' };
  }, [isGuest, isApprovedMember, isPending, isRejected]);

  const avatarLetter = isGuest ? 'G' : (user?.fullName?.[0] || 'S').toUpperCase();

  const handleTilePress = (feature) => {
    if (feature.memberOnly && !isApprovedMember) {
      setLockedVisible(true);
      return;
    }
    if (feature.id === 'news') {
      navigation.navigate('NewsList');
      return;
    }
    if (feature.id === 'press') {
      navigation.navigate('PressList');
      return;
    }
    Alert.alert(feature.title, 'Coming soon');
  };

  const handleJoinGP = () => {
    setLockedVisible(false);
    if (isGuest) {
      navigation.navigate('Signup', { role: 'member' });
    } else {
      navigation.navigate('Profile');
    }
  };

  const handleExit = () => {
    Alert.alert(
      isGuest ? 'Exit Guest Mode' : 'Log Out',
      isGuest ? 'Leave guest mode and return to login?' : 'Sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => signOut() },
      ],
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.avatar, isGuest && styles.avatarGuest]}
          onPress={goToProfile}
          disabled={isGuest}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarLetter}>{avatarLetter}</Text>
        </TouchableOpacity>

        <View style={[styles.badge, styles[`badge_${badge.tone}`]]}>
          <Text style={[styles.badgeText, styles[`badgeText_${badge.tone}`]]}>{badge.label}</Text>
        </View>

        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitText}>{isGuest ? 'Exit Guest' : 'Log Out'}</Text>
        </TouchableOpacity>
      </View>

      {isPending ? (
        <View style={styles.pendingBanner}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.notification} />
          <Text style={styles.pendingText}>
            Your member application is under review. An admin will approve it shortly.
          </Text>
        </View>
      ) : null}

      {isApprovedMember && user?.referralCode ? (
        <View style={styles.referralBanner}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={theme.colors.success} />
          <Text style={styles.referralText}>
            Your referral code: <Text style={styles.referralCode}>{user.referralCode}</Text>
            {'  '}·{'  '}
            <Text style={styles.referralCount}>{user.referralCount || 0}</Text> referrals
          </Text>
          <TouchableOpacity onPress={handleShareReferral} style={styles.shareButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="share-variant" size={18} color={theme.colors.success} />
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.grid}
        refreshControl={
          mode === 'authenticated' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          ) : undefined
        }
      >
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>
            {isGuest ? 'Welcome, Guest' : `Welcome, ${user?.fullName?.split(' ')[0] || 'friend'}`}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {isApprovedMember
              ? 'Full member access. Explore all features below.'
              : 'Explore public content. Member-only features are locked.'}
          </Text>
        </View>

        <View style={styles.gridRows}>
          {FEATURES.reduce((rows, feature, i) => {
            if (i % 2 === 0) rows.push([feature]);
            else rows[rows.length - 1].push(feature);
            return rows;
          }, []).map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map((feature) => (
                <FeatureTile
                  key={feature.id}
                  title={feature.title}
                  icon={feature.icon}
                  tint={feature.tint}
                  accent={feature.accent}
                  locked={feature.memberOnly && !isApprovedMember}
                  onPress={() => handleTilePress(feature)}
                />
              ))}
              {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <MemberExclusiveModal
        visible={lockedVisible}
        onClose={() => setLockedVisible(false)}
        onJoin={handleJoinGP}
        ctaLabel={
          isGuest ? 'Join GP Now' : isPending ? 'View My Application' : 'Become a Member'
        }
        subtitle={
          isPending
            ? 'Your member application is under review. You will gain access once an admin approves it.'
            : isGuest
              ? undefined
              : 'This feature is reserved for approved members. Submit your member application from your profile to unlock.'
        }
      />
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGuest: {
    backgroundColor: theme.colors.success,
  },
  avatarLetter: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.label,
  },
  badge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  badge_muted: { backgroundColor: '#E2E8F0' },
  badge_success: { backgroundColor: '#DCFCE7' },
  badge_warn: { backgroundColor: '#FEF3C7' },
  badgeText: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
  },
  badgeText_muted: { color: theme.colors.textMedium },
  badgeText_success: { color: theme.colors.success },
  badgeText_warn: { color: '#92400E' },
  exitButton: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exitText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textHigh,
    fontWeight: theme.fontWeight.semi,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.small,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    color: '#92400E',
    fontSize: theme.fontSize.small,
    lineHeight: 18,
  },
  referralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.small,
    gap: 8,
  },
  referralText: {
    flex: 1,
    color: '#166534',
    fontSize: theme.fontSize.small,
  },
  shareButton: {
    marginLeft: 6,
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(22,101,52,0.08)',
  },
  referralCode: {
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
  },
  referralCount: {
    fontWeight: theme.fontWeight.bold,
  },
  grid: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  welcome: {
    marginBottom: theme.spacing.md,
  },
  welcomeTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  welcomeSubtitle: {
    marginTop: 4,
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
  },
  gridRows: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});

export default HomeScreen;
