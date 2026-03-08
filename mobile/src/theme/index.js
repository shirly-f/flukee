/**
 * Spiritual Coaching Dashboard - Design System
 * Digital healing space aesthetic
 */

import { colors } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: colors.shadowOpacity,
      shadowRadius: 16,
      elevation: 4,
    },
    card: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
    },
  },
  typography: {
    // Serif - headings (Playfair Display)
    headingXL: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 32, lineHeight: 40 },
    headingL: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 26, lineHeight: 34 },
    headingM: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 22, lineHeight: 30 },
    headingS: { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 18, lineHeight: 26 },
    // Sans - body (DM Sans)
    bodyL: { fontFamily: 'DMSans_400Regular', fontSize: 17, lineHeight: 26 },
    bodyM: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 24 },
    bodyS: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20 },
    label: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 18 },
    caption: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16 },
  },
  transitions: {
    fast: 150,
    normal: 300,
    slow: 450,
  },
};
