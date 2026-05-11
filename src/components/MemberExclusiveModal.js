import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../config/theme';

const MemberExclusiveModal = ({ visible, onClose, onJoin, ctaLabel = 'Join GP Now', subtitle }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="account-plus"
              size={32}
              color={theme.colors.success}
            />
          </View>

          <Text style={styles.title}>Member Exclusive</Text>
          <Text style={styles.body}>
            {subtitle ||
              'This feature is reserved for registered members of GREATER PAKISTAN. Help us build a stronger Pakistan by joining today.'}
          </Text>

          <TouchableOpacity style={styles.cta} onPress={onJoin} activeOpacity={0.85}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismiss} onPress={onClose}>
            <Text style={styles.dismissText}>Maybe Later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.subtitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textHigh,
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  cta: {
    width: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ctaText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.label,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.4,
  },
  dismiss: {
    paddingVertical: theme.spacing.sm,
  },
  dismissText: {
    color: theme.colors.textMedium,
    fontSize: theme.fontSize.small,
    fontWeight: theme.fontWeight.semi,
  },
});

export default MemberExclusiveModal;
