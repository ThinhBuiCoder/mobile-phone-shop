import { Platform } from 'react-native';

export const colors = {
  background: '#F5F5F7',
  card: '#FFFFFF',
  textPrimary: '#1D1D1F',
  textSecondary: '#6E6E73',
  accentBlue: '#0071E3',
  success: '#16A34A',
  error: '#EF4444',
  border: '#E5E7EB',
  muted: '#E5E7EB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const shadow = {
  card:
    Platform.OS === 'web'
      ? { boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.06)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 4,
        },
  subtle:
    Platform.OS === 'web'
      ? { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.04)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        },
};

export const typography = {
  screenTitle: { fontSize: 24, fontWeight: '700' as const },
  sectionTitle: { fontSize: 20, fontWeight: '600' as const },
  productName: { fontSize: 18, fontWeight: '700' as const },
  price: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '300' as const },
};

