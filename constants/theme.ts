/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, type TextProps, type TextStyle } from 'react-native';

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
    light: 'Outfit_300Light',
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
    black: 'Outfit_900Black',
  },
  korean: {
    regular: 'NotoSansKR_400Regular',
    bold: 'NotoSansKR_700Bold',
  },
  fallback: {
    sans:
      Platform.select({
        ios: 'System',
        android: 'sans-serif',
        web: Fonts.sans,
        default: 'sans-serif',
      }) ?? 'sans-serif',
    korean:
      Platform.select({
        ios: 'Apple SD Gothic Neo',
        android: 'sans-serif',
        web: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
        default: 'sans-serif',
      }) ?? 'sans-serif',
  },
} as const;

export type AppTextScript = 'latin' | 'korean';
export type AppFontRole = keyof typeof AppFontFamily.outfit;

/**
 * Each role points to a font file that is actually loaded by the root layout.
 * Korean has two files, so light/regular/medium resolve to 400 and the heavier
 * roles resolve to 700 instead of asking the platform to synthesize a weight.
 */
export const AppFontFamilyByScript = {
  latin: AppFontFamily.outfit,
  korean: {
    light: AppFontFamily.korean.regular,
    regular: AppFontFamily.korean.regular,
    medium: AppFontFamily.korean.regular,
    semibold: AppFontFamily.korean.bold,
    bold: AppFontFamily.korean.bold,
    black: AppFontFamily.korean.bold,
  },
} as const satisfies Record<
  AppTextScript,
  Readonly<Record<AppFontRole, string>>
>;

/** Numeric weights are used only with the system-font fallback. */
export const AppFontWeightByRole = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const satisfies Record<
  AppFontRole,
  NonNullable<TextStyle['fontWeight']>
>;

export function resolveAppFontFamily(
  script: AppTextScript,
  role: AppFontRole,
  customFontsAvailable: boolean,
) {
  if (customFontsAvailable) {
    return AppFontFamilyByScript[script][role];
  }

  return script === 'korean'
    ? AppFontFamily.fallback.korean
    : AppFontFamily.fallback.sans;
}

export type AppTypographyToken = Readonly<{
  fontRole: AppFontRole;
  script: AppTextScript;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: NonNullable<TextStyle['textTransform']>;
}>;

/** The reduced, semantic type scale used by AppText. */
export const AppTypography = {
  koreanHero: {
    fontRole: 'bold',
    script: 'korean',
    fontSize: 74,
    lineHeight: 86,
    letterSpacing: 0,
    textTransform: 'none',
  },
  koreanHeroCompact: {
    fontRole: 'bold',
    script: 'korean',
    fontSize: 62,
    lineHeight: 74,
    letterSpacing: 0,
    textTransform: 'none',
  },
  koreanPhraseHero: {
    fontRole: 'bold',
    script: 'korean',
    fontSize: 56,
    lineHeight: 68,
    letterSpacing: 0,
    textTransform: 'none',
  },
  display: {
    fontRole: 'black',
    script: 'latin',
    fontSize: 48,
    lineHeight: 58,
    letterSpacing: -1,
    textTransform: 'none',
  },
  screenTitle: {
    fontRole: 'medium',
    script: 'latin',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.7,
    textTransform: 'none',
  },
  sceneTitle: {
    fontRole: 'black',
    script: 'latin',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    textTransform: 'none',
  },
  featureTitle: {
    fontRole: 'bold',
    script: 'latin',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.35,
    textTransform: 'none',
  },
  sectionTitle: {
    fontRole: 'bold',
    script: 'latin',
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    textTransform: 'none',
  },
  sectionLabel: {
    fontRole: 'semibold',
    script: 'latin',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontRole: 'medium',
    script: 'latin',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    textTransform: 'none',
  },
  subtitle: {
    fontRole: 'medium',
    script: 'latin',
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0,
    textTransform: 'none',
  },
  body: {
    fontRole: 'regular',
    script: 'latin',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    textTransform: 'none',
  },
  bodyStrong: {
    fontRole: 'semibold',
    script: 'latin',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
    textTransform: 'none',
  },
  bodySecondary: {
    fontRole: 'regular',
    script: 'latin',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    textTransform: 'none',
  },
  label: {
    fontRole: 'semibold',
    script: 'latin',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'none',
  },
  button: {
    fontRole: 'semibold',
    script: 'latin',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.4,
    textTransform: 'none',
  },
  link: {
    fontRole: 'medium',
    script: 'latin',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
    textTransform: 'none',
  },
  caption: {
    fontRole: 'medium',
    script: 'latin',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    textTransform: 'none',
  },
  numericValue: {
    fontRole: 'bold',
    script: 'latin',
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1,
    textTransform: 'none',
  },
  priceValue: {
    fontRole: 'bold',
    script: 'latin',
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.9,
    textTransform: 'none',
  },
  priceCompact: {
    fontRole: 'bold',
    script: 'latin',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.8,
    textTransform: 'none',
  },
  symbol: {
    fontRole: 'medium',
    script: 'latin',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0,
    textTransform: 'none',
  },
  koreanPrimary: {
    fontRole: 'bold',
    script: 'korean',
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: 0,
    textTransform: 'none',
  },
  koreanSecondary: {
    fontRole: 'regular',
    script: 'korean',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
    textTransform: 'none',
  },
} as const satisfies Record<string, AppTypographyToken>;

export type AppTextVariant = keyof typeof AppTypography;

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
    card: 32,
    missionCard: 30,
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

export const AppTextTones = {
  default: SeoulMidnightGlass.colors.text,
  strong: SeoulMidnightGlass.colors.textStrong,
  muted: SeoulMidnightGlass.colors.muted,
  soft: SeoulMidnightGlass.colors.soft,
  disabled: SeoulMidnightGlass.colors.disabledText,
  brand: SeoulMidnightGlass.colors.pink,
  accent: SeoulMidnightGlass.colors.cyan,
  premium: SeoulMidnightGlass.colors.premiumGold,
  inverse: SeoulMidnightGlass.colors.premiumInk,
} as const satisfies Record<string, NonNullable<TextStyle['color']>>;

export type AppTextTone = keyof typeof AppTextTones;

/** start/end are physical alignments because the current French/Korean UI is LTR. */
export const AppTextAlignments = {
  start: 'left',
  center: 'center',
  end: 'right',
  justify: 'justify',
} as const satisfies Record<
  string,
  NonNullable<TextStyle['textAlign']>
>;

export type AppTextAlignment = keyof typeof AppTextAlignments;

export type AppTextLineProps = Pick<
  TextProps,
  'numberOfLines' | 'ellipsizeMode'
>;

/**
 * Fluid text is the default. Truncation is opt-in and none of these contracts
 * disables accessible font scaling or shrinks text to fit a fixed surface.
 */
export const AppTextLineContracts = {
  fluid: {},
  singleLine: {
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  twoLines: {
    numberOfLines: 2,
    ellipsizeMode: 'tail',
  },
  threeLines: {
    numberOfLines: 3,
    ellipsizeMode: 'tail',
  },
} as const satisfies Record<string, AppTextLineProps>;

export type AppTextLineContract = keyof typeof AppTextLineContracts;
