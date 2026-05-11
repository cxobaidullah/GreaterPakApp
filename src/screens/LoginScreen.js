import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../contexts/AuthContext';
import theme from '../config/theme';

const LoginScreen = ({ navigation }) => {
  const { signIn, continueAsGuest } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await signIn({ email, password });
    } catch (err) {
      setError(err?.toString() || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setError('');
    try {
      await continueAsGuest();
    } catch (err) {
      setError('Unable to enter guest mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>GREATER PAKISTAN</Text>
          <Text style={styles.subtitle}>The digital voice of the common people</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.socialButton}>
            <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
            <Text style={styles.socialButtonText}>Login with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>Login with Google</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>OR SECURE CREDENTIALS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Official Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="citizen@pk.com"
              placeholderTextColor={theme.colors.textLow}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textLow}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Signing in...' : 'LOGIN'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGuest} disabled={loading}>
            <Text style={styles.secondaryButtonText}>GUEST MODE</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RoleSelect')}>
              <Text style={styles.bottomLink}>Join the Struggle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  socialButtonText: {
    marginLeft: 8,
    color: theme.colors.textHigh,
    fontWeight: theme.fontWeight.semi,
  },
  separator: {
    marginVertical: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.textLow,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semi,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.label,
    color: theme.colors.textHigh,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  input: {
    height: 52,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.textHigh,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSize.small,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.semi,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomText: {
    color: theme.colors.textMedium,
    fontSize: theme.fontSize.small,
  },
  bottomLink: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semi,
  },
});

export default LoginScreen;
