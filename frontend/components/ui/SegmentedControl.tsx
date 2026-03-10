import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segment,
              isActive && styles.segmentActive,
              index === 0 && styles.segmentFirst,
              index === options.length - 1 && styles.segmentLast,
            ]}
            activeOpacity={0.9}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.muted,
    borderRadius: radius.pill,
    padding: 2,
  },
  segment: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.accentBlue,
  },
  segmentFirst: {
    marginRight: 2,
  },
  segmentLast: {
    marginLeft: 2,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  labelActive: {
    color: '#FFF',
    fontWeight: '600',
  },
});

