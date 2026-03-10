import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type ToastType = 'error' | 'info';

interface AppToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

export const AppToast: React.FC<AppToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 2500,
  onHide,
}) => {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onHide]);

  if (!visible || !message) return null;

  return (
    <View style={[styles.toast, type === 'error' && styles.errorToast]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadow.card,
    zIndex: 100,
  },
  errorToast: {
    backgroundColor: colors.error,
  },
  message: {
    ...typography.body,
    color: '#FFF',
    textAlign: 'center',
  },
});
