import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../contexts/AuthContext';
import theme from '../config/theme';

const ROLE_LABEL = {
  supporter: 'SUPPORTER',
  member: 'MEMBER',
  admin: 'ADMIN',
};

const ProfileScreen = ({ navigation }) => {
  const { user, updateProfile, applyForMembership, refreshProfile } = useContext(AuthContext);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [province, setProvince] = useState(user?.province || '');
  const [district, setDistrict] = useState(user?.district || '');

  const [referralCode, setReferralCode] = useState('');
  const [applyDistrict, setApplyDistrict] = useState(user?.district || '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
    setCity(user?.city || '');
    setProvince(user?.province || '');
    setDistrict(user?.district || '');
    setApplyDistrict(user?.district || '');
  }, [user]);

  const isApprovedMember = user?.role === 'member' && user?.membershipStatus === 'approved';
  const isPending = user?.membershipStatus === 'pending';
  const canApplyForMembership = !isApprovedMember && !isPending && user?.role !== 'admin';

  const roleLabel = useMemo(() => {
    if (isPending) return 'MEMBER · PENDING';
    if (isApprovedMember) return 'MEMBER';
    return ROLE_LABEL[user?.role] || 'SUPPORTER';
  }, [isPending, isApprovedMember, user]);

  const handleSaveProfile = async () => {
    if (!fullName.trim() || !phone.trim() || !city.trim() || !province.trim()) {
      setError('Name, phone, city, and province are required.');
      return;
    }
    setError('');
    setFlash('');
    setSavingProfile(true);
    try {
      const updates = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        province: province.trim(),
      };
      if (isApprovedMember || isPending) {
        updates.district = district.trim();
      }
      await updateProfile(updates);
      setFlash('Profile updated.');
    } catch (err) {
      setError(err?.toString() || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleApplyMembership = async () => {
    if (!applyDistrict.trim()) {
      setError('District is required to apply for membership.');
      return;
    }
    if (!referralCode.trim()) {
      setError('Referral code is required.');
      return;
    }
    setError('');
    setFlash('');
    setApplying(true);
    try {
      await applyForMembership({
        district: applyDistrict.trim(),
        referralCode: referralCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        province: province.trim(),
      });
      setReferralCode('');
      Alert.alert(
        'Application Submitted',
        'Your member application is under review. An admin will approve it shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      setError(err?.toString() || 'Unable to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.textHigh} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={refreshProfile} style={styles.backBtn}>
          <MaterialCommunityIcons name="refresh" size={22} color={theme.colors.textHigh} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.identityCard}>
          <View style={[styles.avatar, isApprovedMember && styles.avatarMember]}>
            <Text style={styles.avatarLetter}>
              {(user?.fullName?.[0] || '?').toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.identityName}>{user?.fullName || 'Unknown user'}</Text>
            <Text style={styles.identityEmail}>{user?.email}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, isApprovedMember ? styles.badgeMember : isPending ? styles.badgePending : styles.badgeMuted]}>
                <Text style={styles.badgeText}>{roleLabel}</Text>
              </View>
              {isApprovedMember && user?.referralCode ? (
                <View style={[styles.badge, styles.badgeReferral]}>
                  <Text style={styles.badgeText}>CODE · {user.referralCode}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {flash ? <View style={styles.flash}><Text style={styles.flashText}>{flash}</Text></View> : null}
        {error ? <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <Field label="Full Name" value={fullName} onChangeText={setFullName} />
          <Field label="Email (read-only)" value={user?.email || ''} editable={false} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="City" value={city} onChangeText={setCity} />
          <Field label="Province" value={province} onChangeText={setProvince} />
          {(isApprovedMember || isPending) ? (
            <Field label="District" value={district} onChangeText={setDistrict} />
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, savingProfile && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
          >
            <Text style={styles.primaryButtonText}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>

        {isPending ? (
          <View style={[styles.card, styles.cardPending]}>
            <MaterialCommunityIcons name="clock-outline" size={22} color={theme.colors.notification} />
            <Text style={styles.pendingTitle}>Membership Under Review</Text>
            <Text style={styles.pendingBody}>
              An admin is reviewing your member application. You'll get full access once it is approved.
            </Text>
          </View>
        ) : null}

        {canApplyForMembership ? (
          <View style={[styles.card, styles.cardUpgrade]}>
            <Text style={styles.sectionTitle}>Become a Member</Text>
            <Text style={styles.cardSubtitle}>
              You need a referral code from an existing member to apply. Admin will review and approve.
            </Text>

            <Field label="District" value={applyDistrict} onChangeText={setApplyDistrict} />
            <Field
              label="Referral Code"
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              placeholder="e.g. AB12CDEF"
            />

            <TouchableOpacity
              style={[styles.successButton, applying && styles.buttonDisabled]}
              onPress={handleApplyMembership}
              disabled={applying}
            >
              <Text style={styles.primaryButtonText}>
                {applying ? 'Submitting…' : 'Submit Application'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isApprovedMember ? (
          <View style={[styles.card, styles.cardSuccess]}>
            <MaterialCommunityIcons name="check-decagram" size={22} color={theme.colors.success} />
            <Text style={styles.memberTitle}>You are a member</Text>
            <Text style={styles.memberBody}>
              Share your referral code on Home to invite more members. At 1000 approved referrals
              you become a Future Leader.
            </Text>
            {typeof user?.referralCount === 'number' ? (
              <Text style={styles.memberStat}>{user.referralCount} approved referrals so far</Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Field = ({ label, value, onChangeText, editable = true, ...rest }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.inputDisabled]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      placeholderTextColor={theme.colors.textLow}
      {...rest}
    />
  </View>
);

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
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMember: { backgroundColor: theme.colors.success },
  avatarLetter: {
    color: theme.colors.surface,
    fontSize: 22,
    fontWeight: theme.fontWeight.bold,
  },
  identityName: {
    fontSize: theme.fontSize.subtitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
  },
  identityEmail: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
    marginTop: 2,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeMuted: { backgroundColor: '#E2E8F0' },
  badgeMember: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeReferral: { backgroundColor: '#DBEAFE' },
  badgeText: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 1,
    color: theme.colors.textHigh,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  cardUpgrade: { borderColor: theme.colors.success },
  cardSuccess: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  cardPending: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  sectionTitle: {
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
    marginBottom: theme.spacing.sm,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  pendingTitle: {
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    color: '#92400E',
    marginTop: 6,
  },
  pendingBody: {
    fontSize: theme.fontSize.small,
    color: '#92400E',
    lineHeight: 18,
    marginTop: 4,
  },
  memberTitle: {
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    color: '#166534',
    marginTop: 6,
  },
  memberBody: {
    fontSize: theme.fontSize.small,
    color: '#166534',
    lineHeight: 18,
    marginTop: 4,
  },
  memberStat: {
    fontSize: theme.fontSize.small,
    color: '#166534',
    marginTop: 8,
    fontWeight: theme.fontWeight.semi,
  },
  inputGroup: { marginBottom: theme.spacing.md },
  inputLabel: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
    marginBottom: 6,
    fontWeight: theme.fontWeight.medium,
  },
  input: {
    height: 48,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.textHigh,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: theme.colors.textLow,
  },
  primaryButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  successButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.4,
  },
  flash: {
    padding: theme.spacing.sm,
    backgroundColor: '#DCFCE7',
    borderRadius: theme.radius.small,
    marginBottom: theme.spacing.md,
  },
  flashText: { color: '#166534', fontSize: theme.fontSize.small },
  errorBanner: {
    padding: theme.spacing.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: theme.radius.small,
    marginBottom: theme.spacing.md,
  },
  errorText: { color: '#B91C1C', fontSize: theme.fontSize.small },
});

export default ProfileScreen;
