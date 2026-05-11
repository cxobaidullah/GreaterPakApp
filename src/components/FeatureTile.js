import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../config/theme';

const FeatureTile = ({ title, icon, tint, accent, locked, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.tile, accent && styles.tileAccent, locked && styles.tileLocked]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: tint || theme.colors.background },
          accent && styles.iconWrapAccent,
          locked && styles.iconWrapLocked,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={42}
          color={accent ? theme.colors.surface : theme.colors.primary}
        />
      </View>

      <Text
        style={[styles.title, accent && styles.titleAccent, locked && styles.titleLocked]}
        numberOfLines={2}
      >
        {title}
      </Text>

      {locked ? (
        <View style={styles.lockBadge}>
          <MaterialCommunityIcons name="lock" size={18} color={theme.colors.surface} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 0.95,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    position: 'relative',
  },
  tileAccent: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tileLocked: {
    backgroundColor: '#EEF2F6',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconWrapAccent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  iconWrapLocked: {
    opacity: 0.45,
  },
  title: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textHigh,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  titleAccent: {
    color: theme.colors.surface,
  },
  titleLocked: {
    color: theme.colors.textLow,
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});

export default FeatureTile;
