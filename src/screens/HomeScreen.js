import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import theme from '../config/theme';

const HomeScreen = () => {
  const { user, mode, signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome to Greater Pakistan</Text>
        <Text style={styles.description}>
          {mode === 'guest'
            ? 'You are in guest mode. Browse public news and press updates with limited access.'
            : `Signed in as ${user?.fullName ?? 'member'}. Access your feed, updates, and premium content.`}
        </Text>
        {user?.role ? (
          <Text style={styles.meta}>Role: {user.role}</Text>
        ) : null}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  welcome: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textMedium,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  meta: {
    fontSize: theme.fontSize.label,
    color: theme.colors.textLow,
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
  },
});

export default HomeScreen;
