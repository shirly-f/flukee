import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const { colors, spacing, typography } = theme;

export function EmptyState({ title, message, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Text style={styles.iconSymbol}>◯</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.creamDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconSymbol: {
    fontSize: 36,
    color: colors.sageMuted,
  },
  title: {
    ...typography.headingS,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodyM,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
