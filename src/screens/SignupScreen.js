import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../contexts/AuthContext';
import theme from '../config/theme';

const SignupScreen = ({ navigation, route }) => {
  const role = route?.params?.role === 'member' ? 'member' : 'supporter';
  const isMember = role === 'member';

  const { signUp } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!fullName || !email || !phone || !city || !province || !password) {
      setError('Please complete all registration fields.');
      return;
    }
    if (isMember && !district) {
      setError('District is required for member registration.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = { fullName, email, phone, city, province, password, role };
      if (isMember) {
        payload.district = district;
        if (referralCode.trim()) {
          payload.referralCode = referralCode.trim().toUpperCase();
        }
      }
      await signUp(payload);
    } catch (err) {
      setError(err?.toString() || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{isMember ? 'JOIN AS MEMBER' : 'JOIN AS SUPPORTER'}</Text>
          <Text style={styles.subtitle}>
            {isMember
              ? 'Submit your member application. An admin will review it before unlocking member-only features.'
              : 'Browse news, press conferences, events, and the party manifesto as a supporter.'}
          </Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.socialButton}>
            <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
            <Text style={styles.socialButtonText}>Register with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>Register with Google</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>OR SECURE CREDENTIALS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full Name" placeholderTextColor={theme.colors.textLow} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Official Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="citizen@pk.com" placeholderTextColor={theme.colors.textLow} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="03xx-xxxxxxx" placeholderTextColor={theme.colors.textLow} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={theme.colors.textLow} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Province</Text>
            <TextInput style={styles.input} value={province} onChangeText={setProvince} placeholder="Province" placeholderTextColor={theme.colors.textLow} />
          </View>

          {isMember ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>District</Text>
                <TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholder="District" placeholderTextColor={theme.colors.textLow} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Referral Code (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                  placeholder="If you were invited by a member"
                  placeholderTextColor={theme.colors.textLow}
                />
              </View>
            </>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Create a password" placeholderTextColor={theme.colors.textLow} />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSignup} disabled={loading}>
            <Text style={styles.primaryButtonText}>
              {loading ? 'Submitting...' : isMember ? 'SUBMIT APPLICATION' : 'SIGN UP'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.bottomLink}>Login instead</Text>
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
    marginBottom: theme.spacing.lg,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
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

export default SignupScreen;
