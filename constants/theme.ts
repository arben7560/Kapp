/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const AppFontFamily = {
  outfit: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    bold: 'Outfit_700Bold',
    black: 'Outfit_900Black',
  },
  korean: {
    regular: 'NotoSansKR_400Regular',
    bold: 'NotoSansKR_700Bold',
  },
  fallback: {
    sans: Fonts.sans,
    korean:
      Platform.OS === 'web'
        ? "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
        : Fonts.sans,
  },
} as const;

export const SeoulMidnightGlass = {
  colors: {
    bgDeep: '#020306',
    text: 'rgba(255,255,255,0.96)',
    textStrong: 'rgba(255,255,255,0.98)',
    muted: 'rgba(255,255,255,0.66)',
    soft: 'rgba(255,255,255,0.46)',
    line: 'rgba(255,255,255,0.10)',
    lineSoft: 'rgba(255,255,255,0.07)',
    surface: 'rgba(255,255,255,0.05)',
    glassSurface: 'rgba(2,3,6,0.26)',
    pink: '#F472B6',
    cyan: '#22D3EE',
    premiumGold: '#FDE047',
    premiumInk: '#050508',
    premiumSurface: 'rgba(253,224,71,0.10)',
    premiumSurfaceStrong: 'rgba(253,224,71,0.18)',
    premiumBorder: 'rgba(253,224,71,0.34)',
    disabledText: 'rgba(255,255,255,0.42)',
    selectedBorder: 'rgba(34,211,238,0.44)',
    lockedBorder: 'rgba(253,224,71,0.34)',
  },
  radii: {
    card: 22,
    missionCard: 24,
    pill: 999,
    icon: 22,
  },
  spacing: {
    cardGap: 12,
    cardPaddingX: 14,
    cardPaddingY: 10,
    badgePaddingX: 10,
    badgePaddingY: 5,
  },
  badge: {
    fontSize: 11,
    letterSpacing: 1.1,
    minHeight: 24,
  },
  cta: {
    fontSize: 12,
    letterSpacing: 0.4,
  },
} as const;
