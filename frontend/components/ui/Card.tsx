import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme';

interface CardProps extends ViewProps {
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, padded = true, ...props }) => {
  return (
    <View
      style={[styles.card, padded && styles.padded, style]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  padded: {
    padding: spacing.lg,
  },
});

