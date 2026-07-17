import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

import {
  AppFontWeightByRole,
  AppTextAlignments,
  AppTextLineContracts,
  AppTextTones,
  AppTypography,
  resolveAppFontFamily,
  type AppFontRole,
  type AppTextAlignment,
  type AppTextLineContract,
  type AppTextScript,
  type AppTextTone,
  type AppTextVariant,
} from '@/constants/theme';

/**
 * The default is the system fallback because fonts are not guaranteed to be
 * registered when AppText is rendered outside the application root (tests,
 * previews, isolated components).
 */
const AppFontsAvailableContext = React.createContext(false);

const KOREAN_CHARACTER_PATTERN =
  /[\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff]/u;
const KOREAN_RUN_PATTERN =
  /([\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\uac00-\ud7af\ud7b0-\ud7ff]+)/u;

export type AppTextProviderProps = React.PropsWithChildren<{
  customFontsAvailable: boolean;
}>;

export function AppTextProvider({
  children,
  customFontsAvailable,
}: AppTextProviderProps) {
  return (
    <AppFontsAvailableContext.Provider value={customFontsAvailable}>
      {children}
    </AppFontsAvailableContext.Provider>
  );
}

const PROTECTED_TYPOGRAPHY_STYLE_KEYS = [
  'fontFamily',
  'fontWeight',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'textTransform',
] as const satisfies readonly (keyof TextStyle)[];

/** Typography owned by a semantic token cannot be changed through `style`. */
export type AppTextStyle = Omit<
  TextStyle,
  (typeof PROTECTED_TYPOGRAPHY_STYLE_KEYS)[number]
> &
  Partial<
    Record<(typeof PROTECTED_TYPOGRAPHY_STYLE_KEYS)[number], never>
  >;

export type AppTextProps = Omit<
  TextProps,
  'ellipsizeMode' | 'numberOfLines' | 'style'
> & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
  script?: AppTextScript;
  align?: AppTextAlignment;
  lineContract?: AppTextLineContract;
  style?: StyleProp<TextStyle>;
};

function sanitizeTextStyle(
  style: StyleProp<TextStyle> | undefined,
): TextStyle | undefined {
  const flattenedStyle = StyleSheet.flatten(style);

  if (!flattenedStyle) return undefined;

  const sanitizedStyle: TextStyle = { ...flattenedStyle };

  PROTECTED_TYPOGRAPHY_STYLE_KEYS.forEach((key) => {
    delete sanitizedStyle[key];
  });

  return sanitizedStyle;
}

function resolveFontStyle(
  script: AppTextScript,
  fontRole: AppFontRole,
  customFontsAvailable: boolean,
): TextStyle {
  const fontFamily = resolveAppFontFamily(
    script,
    fontRole,
    customFontsAvailable,
  );

  if (customFontsAvailable) {
    return { fontFamily };
  }

  return {
    fontFamily,
    fontWeight: AppFontWeightByRole[fontRole],
  };
}

/**
 * Dynamic data can contain a French/Korean mix that cannot be identified at
 * the call site. Keep the parent metrics authoritative and switch only Hangul
 * runs to Noto Sans KR, exactly like AppMixedText does for explicit segments.
 */
function renderScriptAwareChildren(
  children: React.ReactNode,
  parentScript: AppTextScript,
  fontRole: AppFontRole,
  customFontsAvailable: boolean,
) {
  if (parentScript === 'korean') return children;

  return React.Children.map(children, (child) => {
    if (typeof child !== 'string' && typeof child !== 'number') return child;

    const value = String(child);
    if (!KOREAN_CHARACTER_PATTERN.test(value)) return child;

    return value.split(KOREAN_RUN_PATTERN).map((run, index) => {
      if (!run || !KOREAN_CHARACTER_PATTERN.test(run)) return run;

      return (
        <Text
          key={`korean-run-${index}`}
          accessibilityLanguage="ko-KR"
          style={resolveFontStyle(
            'korean',
            fontRole,
            customFontsAvailable,
          )}
        >
          {run}
        </Text>
      );
    });
  });
}

export const AppText = React.forwardRef<
  React.ComponentRef<typeof Text>,
  AppTextProps
>(function AppText(
  {
    align = 'start',
    lineContract = 'fluid',
    script,
    style,
    tone = 'default',
    variant = 'body',
    ...rest
  },
  ref,
) {
  const customFontsAvailable = React.useContext(AppFontsAvailableContext);
  const token = AppTypography[variant];
  const resolvedScript = script ?? token.script;
  const lineProps = AppTextLineContracts[lineContract];

  const baseStyle: TextStyle = {
    ...resolveFontStyle(
      resolvedScript,
      token.fontRole,
      customFontsAvailable,
    ),
    color: AppTextTones[tone],
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
    textAlign: AppTextAlignments[align],
    textTransform: token.textTransform,
    // Keep Latin and Noto Sans KR on the same visual baseline on Android.
    // Every semantic token owns an explicit lineHeight, so the platform's
    // extra font padding is neither needed nor allowed to shift compact rows.
    includeFontPadding: false,
  };

  const safeStyle = sanitizeTextStyle(style);
  const renderedChildren = renderScriptAwareChildren(
    rest.children,
    resolvedScript,
    token.fontRole,
    customFontsAvailable,
  );

  return (
    <Text
      ref={ref}
      {...rest}
      {...lineProps}
      style={[baseStyle, safeStyle]}
    >
      {renderedChildren}
    </Text>
  );
});

/** Animated counterpart with the same semantic typography contract. */
export const AnimatedAppText = Animated.createAnimatedComponent(AppText);

export type AppMixedTextSegment = Readonly<{
  key?: React.Key;
  text: string | number;
  script: AppTextScript;
  tone?: AppTextTone;
  style?: StyleProp<TextStyle>;
  accessibilityLanguage?: TextProps['accessibilityLanguage'];
}>;

export type AppMixedTextProps = Omit<AppTextProps, 'children' | 'script'> & {
  segments: readonly AppMixedTextSegment[];
};

/**
 * Renders one accessible text node and explicit script runs. Nested runs only
 * select a font (plus an optional tone/style), so the parent's metrics and line
 * contract remain authoritative for the complete sentence.
 */
export const AppMixedText = React.forwardRef<
  React.ComponentRef<typeof Text>,
  AppMixedTextProps
>(function AppMixedText(
  { segments, variant = 'body', ...rest },
  ref,
) {
  const customFontsAvailable = React.useContext(AppFontsAvailableContext);
  const token = AppTypography[variant];

  return (
    <AppText ref={ref} variant={variant} {...rest}>
      {segments.map((segment, index) => {
        const toneStyle: TextStyle | undefined = segment.tone
          ? { color: AppTextTones[segment.tone] }
          : undefined;
        const safeSegmentStyle = sanitizeTextStyle(segment.style);

        return (
          <Text
            key={segment.key ?? index}
            accessibilityLanguage={segment.accessibilityLanguage}
            style={[
              resolveFontStyle(
                segment.script,
                token.fontRole,
                customFontsAvailable,
              ),
              toneStyle,
              safeSegmentStyle,
            ]}
          >
            {segment.text}
          </Text>
        );
      })}
    </AppText>
  );
});
