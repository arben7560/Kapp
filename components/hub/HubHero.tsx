import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  View,
} from "react-native";

import { AppText } from "@/components/app-text";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeoulMidnightGlass } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

export type HubHeroProps = {
  korean: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  accentColor?: string;
  eyebrow?: string;
  layeredGlow?: boolean;
  animateGlow?: boolean;
  badgeBlurIntensity?: number;
  accentBadge?: boolean;
  badgeBorderColor?: string;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  koreanStyle?: StyleProp<TextStyle>;
};

export function HubHero({
  korean,
  title,
  subtitle,
  badgeLabel,
  accentColor = SeoulMidnightGlass.colors.cyan,
  eyebrow = "SÉOUL IMMERSION",
  layeredGlow = true,
  animateGlow = false,
  badgeBlurIntensity = 28,
  accentBadge = false,
  badgeBorderColor,
  badgeBackgroundColor,
  badgeTextColor,
  style,
  contentStyle,
  koreanStyle,
}: HubHeroProps) {
  const pulse = useMemo(() => new Animated.Value(0), []);
  const responsive = useResponsiveLayout();
  const koreanVariant = responsive.isCompact
    ? "koreanHeroCompact"
    : "koreanHero";

  useEffect(() => {
    if (!animateGlow) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => {
      animation.stop();
      pulse.stopAnimation();
    };
  }, [animateGlow, pulse]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  return (
    <View style={[styles.root, style]}>
      <AppText
        variant="sectionLabel"
        tone="brand"
        align="center"
        style={styles.eyebrow}
      >
        {eyebrow}
      </AppText>

      <View style={[styles.content, contentStyle]}>
        <Animated.View
          style={[
            styles.koreanWrap,
            animateGlow && {
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          {layeredGlow ? (
            <>
              <AppText
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                variant={koreanVariant}
                script="korean"
                align="center"
                style={[
                  styles.korean,
                  styles.outerGlow,
                  {
                    color: `${accentColor}2E`,
                    textShadowColor: accentColor,
                  },
                  koreanStyle,
                ]}
              >
                {korean}
              </AppText>
              <AppText
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                variant={koreanVariant}
                script="korean"
                align="center"
                style={[
                  styles.korean,
                  styles.innerGlow,
                  {
                    color: `${accentColor}5C`,
                    textShadowColor: `${accentColor}F2`,
                  },
                  koreanStyle,
                ]}
              >
                {korean}
              </AppText>
            </>
          ) : null}

          <AppText
            accessibilityLanguage="ko-KR"
            variant={koreanVariant}
            script="korean"
            align="center"
            style={[
              styles.korean,
              { textShadowColor: accentColor },
              koreanStyle,
            ]}
          >
            {korean}
          </AppText>
        </Animated.View>

        <AppText
          accessibilityRole="header"
          variant="screenTitle"
          align="center"
          style={styles.title}
        >
          {title}
        </AppText>

        <StatusBadge
          label={badgeLabel}
          tone={accentBadge ? "accent" : "neutral"}
          accentColor={accentColor}
          appearance="glass"
          blurIntensity={badgeBlurIntensity}
          borderColor={badgeBorderColor}
          backgroundColor={badgeBackgroundColor}
          textColor={badgeTextColor}
          style={styles.badge}
        />

        <AppText
          variant="subtitle"
          tone="muted"
          align="center"
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 24,
    alignItems: "center",
  },
  eyebrow: {
    marginBottom: 20,
    opacity: 0.9,
  },
  content: {
    width: "100%",
    paddingBottom: 52,
    alignItems: "center",
    position: "relative",
  },
  koreanWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  korean: {
    color: "rgba(245,252,255,0.98)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    marginBottom: 2,
  },
  outerGlow: {
    position: "absolute",
    textShadowRadius: 42,
  },
  innerGlow: {
    position: "absolute",
    textShadowRadius: 18,
  },
  title: {
    marginTop: 0,
  },
  badge: {
    alignSelf: "center",
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  subtitle: {
    maxWidth: "82%",
    marginTop: 30,
    color: "rgba(255,255,255,0.72)",
    fontStyle: "italic",
  },
});
