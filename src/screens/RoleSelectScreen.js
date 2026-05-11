import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../config/theme';

const RoleCard = ({ icon, title, subtitle, bullets, onPress, primary }) => (
  <TouchableOpacity
    style={[styles.card, primary && styles.cardPrimary]}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <View style={[styles.iconWrap, primary && styles.iconWrapPrimary]}>
      <MaterialCommunityIcons
        name={icon}
        size={28}
        color={primary ? theme.colors.surface : theme.colors.primary}
      />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
    {bullets.map((line) => (
      <View key={line} style={styles.bulletRow}>
        <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
        <Text style={styles.bulletText}>{line}</Text>
      </View>
    ))}
    <View style={[styles.cta, primary && styles.ctaPrimary]}>
      <Text style={[styles.ctaText, primary && styles.ctaTextPrimary]}>
        Continue as {title}
      </Text>
      <MaterialCommunityIcons
        name="arrow-right"
        size={18}
        color={primary ? theme.colors.surface : theme.colors.primary}
      />
    </View>
  </TouchableOpacity>
);

const RoleSelectScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>JOIN THE STRUGGLE</Text>
        <Text style={styles.subtitle}>
          Choose how you want to be part of Greater Pakistan. You can switch later by applying for membership.
        </Text>
      </View>

      <RoleCard
        icon="account-star"
        title="Member"
        subtitle="Apply to become a registered party member. Admin will review your application."
        bullets={[
          'Access member-only features',
          'Get a personal referral code',
          'Bring in 1000 members to become Future Leader',
        ]}
        primary
        onPress={() => navigation.navigate('Signup', { role: 'member' })}
      />

      <RoleCard
        icon="account-heart"
        title="Supporter"
        subtitle="Browse news, press conferences, events, and the party manifesto without applying."
        bullets={[
          'Read news and press updates',
          'Explore events near you',
          'Review the manifesto',
        ]}
        onPress={() => navigation.navigate('Signup', { role: 'supporter' })}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.title,
    color: theme.colors.textHigh,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardPrimary: {
    borderColor: theme.colors.primary,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconWrapPrimary: {
    backgroundColor: theme.colors.primary,
  },
  cardTitle: {
    fontSize: theme.fontSize.subtitle,
    color: theme.colors.textHigh,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  bulletText: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textHigh,
    marginLeft: 8,
    flex: 1,
  },
  cta: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ctaPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ctaText: {
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.semi,
    color: theme.colors.primary,
    marginRight: 6,
  },
  ctaTextPrimary: {
    color: theme.colors.surface,
  },
  backButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semi,
  },
});

export default RoleSelectScreen;
