export const colors = {
  primary: '#1a365d', // Royal Navy
  primaryLight: '#2b4c7e',
  primaryDark: '#10223d',
  accent: '#e5c158', // Champagne Gold
  accentLight: '#f4d67a',
  accentDark: '#c7a342',

  background: '#fdfcf8', // Warm Soft Cream
  surface: '#ffffff',
  surfaceHighlight: '#f7f6f2',

  text: '#171717',
  textSecondary: '#525252',
  textMuted: '#a3a3a3',
  textInverse: '#ffffff',

  border: '#e5e5e5',
  borderLight: '#f0f0f0',

  success: '#166534', // Deep Emerald
  error: '#991b1b', // Deep Crimson
  warning: '#ca8a04',
  info: '#1d4ed8',

  shadow: '#09090b',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
}

export const typography = {
  heading1: { fontSize: 34, fontWeight: '700' as const, lineHeight: 42, letterSpacing: -0.8 },
  heading2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.6 },
  heading3: { fontSize: 22, fontWeight: '600' as const, lineHeight: 30, letterSpacing: -0.4 },
  heading4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.2 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
}

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
}
