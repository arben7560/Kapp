import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { AppText } from "../components/app-text";

const HERO_IMAGE = require("../assets/images/hero.jpg");

const BACKGROUND = "#000000";
const CYAN = "#39DDF2";
const BLUE = "#3994F6";
const VIOLET = "#745BFF";
const HERO_BG = "#050508";
const HERO_TEXT = "rgba(255,255,255,0.98)";
const HERO_TEXT_SOFT = "rgba(255,255,255,0.76)";
const HERO_CYAN = "#22D3EE";

const AnimatedView = Animated.View;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function LogoGradientDefs() {
  return (
    <Defs>
      <LinearGradient id="kGradient" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={CYAN} />
        <Stop offset="0.5" stopColor={BLUE} />
        <Stop offset="1" stopColor={VIOLET} />
      </LinearGradient>
    </Defs>
  );
}

function GlowLayer() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 132">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="72%" r="50%">
          <Stop offset="0" stopColor="#377EFF" stopOpacity={0.34} />
          <Stop offset="0.42" stopColor="#315DEB" stopOpacity={0.15} />
          <Stop offset="1" stopColor="#315DEB" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx="55" cy="99" rx="48" ry="31" fill="url(#glow)" />
    </Svg>
  );
}

function VerticalBarLayer() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 132">
      <LogoGradientDefs />
      <Path d="M16 8 H34 V124 H16 Z" fill="url(#kGradient)" />
    </Svg>
  );
}

function UpperBranchLayer() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 132">
      <LogoGradientDefs />
      <Path
        d="M45 58 L78 9 H102 L63 58 L50 69 L45 68 Z"
        fill="url(#kGradient)"
      />
    </Svg>
  );
}

function LowerBranchLayer() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 132">
      <LogoGradientDefs />
      <Path
        d="M45 60
           C61 61 77 67 88 77
           C100 88 106 104 107 124
           H84
           C83 106 78 93 69 84
           C62 77 54 74 45 73
           Z"
        fill="url(#kGradient)"
      />
    </Svg>
  );
}

function DotLayer() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 132">
      <LogoGradientDefs />
      <Circle cx="47" cy="91" r="9.5" fill="url(#kGradient)" />
    </Svg>
  );
}

type KSymbolProps = {
  size: number;
  glowOpacity: Animated.Value;
  barOpacity: Animated.Value;
  barTranslate: Animated.Value;
  upperOpacity: Animated.Value;
  upperTranslate: Animated.Value;
  lowerOpacity: Animated.Value;
  lowerTranslate: Animated.Value;
  dotOpacity: Animated.Value;
  dotScale: Animated.Value;
};

function KSymbol({
  size,
  glowOpacity,
  barOpacity,
  barTranslate,
  upperOpacity,
  upperTranslate,
  lowerOpacity,
  lowerTranslate,
  dotOpacity,
  dotScale,
}: KSymbolProps) {
  const symbolHeight = size * 1.1;

  return (
    <View
      collapsable={false}
      style={[
        styles.symbolContainer,
        {
          width: size,
          height: symbolHeight,
        },
      ]}
    >
      <AnimatedView
        pointerEvents="none"
        style={[styles.symbolLayer, { opacity: glowOpacity }]}
      >
        <GlowLayer />
      </AnimatedView>

      <AnimatedView
        pointerEvents="none"
        style={[
          styles.symbolLayer,
          {
            opacity: barOpacity,
            transform: [{ translateY: barTranslate }],
          },
        ]}
      >
        <VerticalBarLayer />
      </AnimatedView>

      <AnimatedView
        pointerEvents="none"
        style={[
          styles.symbolLayer,
          {
            opacity: upperOpacity,
            transform: [{ translateX: upperTranslate }],
          },
        ]}
      >
        <UpperBranchLayer />
      </AnimatedView>

      <AnimatedView
        pointerEvents="none"
        style={[
          styles.symbolLayer,
          {
            opacity: lowerOpacity,
            transform: [{ translateX: lowerTranslate }],
          },
        ]}
      >
        <LowerBranchLayer />
      </AnimatedView>

      <AnimatedView
        pointerEvents="none"
        style={[
          styles.symbolLayer,
          {
            opacity: dotOpacity,
            transform: [{ scale: dotScale }],
          },
        ]}
      >
        <DotLayer />
      </AnimatedView>
    </View>
  );
}

function HeroBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={HERO_IMAGE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <ExpoLinearGradient
        colors={["rgba(5,5,8,0.25)", "rgba(5,5,8,0.65)", HERO_BG]}
        locations={[0, 0.45, 0.95]}
        style={StyleSheet.absoluteFill}
      />

      <ExpoLinearGradient
        colors={[
          "rgba(244,114,182,0.12)",
          "rgba(34,211,238,0.08)",
          "transparent",
        ]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />

      <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

function HeroEntryScreen() {
  const { fontScale, height, width } = useWindowDimensions();
  const isCompactScreen = height <= 700 || width <= 380;
  const isLargeText = fontScale > 1.15;

  const fade = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(20), []);
  const pulse = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    entrance.start();
    floatLoop.start();

    return () => {
      entrance.stop();
      floatLoop.stop();
    };
  }, [fade, pulse, translateY]);

  const cardFloat = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const openOnboarding = () => {
    router.replace("/onboarding");
  };

  return (
    <View style={styles.heroScreen}>
      <StatusBar
        hidden={false}
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <HeroBackground />

      <SafeAreaView
        style={[
          styles.heroSafe,
          isCompactScreen && styles.heroSafeCompact,
        ]}
        edges={["top", "bottom"]}
      >
        <AnimatedView
          style={[
            styles.heroPage,
            {
              opacity: fade,
              transform: [{ translateY }],
            },
          ]}
        >
          <ScrollView
            style={styles.heroScroll}
            contentContainerStyle={[
              styles.heroScrollContent,
              (isCompactScreen || isLargeText) &&
                styles.heroScrollContentCompact,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <AppText
                  variant="label"
                  lineContract="singleLine"
                  style={styles.heroBadgeText}
                >
                  SÉOUL IMMERSION
                </AppText>
              </View>
            </View>

            <View style={styles.heroCenter}>
              <AppText
                variant="koreanPrimary"
                script="korean"
                style={styles.heroKoreanLine}
              >
                어서 오세요
              </AppText>
              <AppText
                accessibilityRole="header"
                variant="display"
                style={styles.heroBigTitle}
              >
                Bienvenue à Séoul
              </AppText>
              <AppText variant="subtitle" style={styles.heroSubtitle}>
                Tu n’apprends pas le coréen. Tu entres dans des scènes réelles.
              </AppText>

              <AnimatedView
                style={[
                  styles.heroCardWrap,
                  { transform: [{ translateY: cardFloat }] },
                ]}
              >
                <BlurView intensity={35} tint="dark" style={styles.heroCard}>
                  <ExpoLinearGradient
                    colors={[
                      "rgba(255,255,255,0.08)",
                      "rgba(255,255,255,0.03)",
                      "rgba(255,255,255,0.01)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <ExpoLinearGradient
                    colors={[
                      "rgba(244,114,182,0.08)",
                      "rgba(34,211,238,0.04)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <AppText
                    variant="sectionLabel"
                    style={styles.heroEyebrow}
                  >
                    IMMERSION
                  </AppText>
                  <AppText variant="sceneTitle" style={styles.heroTitle}>
                    La ville s’ouvre devant toi
                  </AppText>
                  <AppText variant="body" style={styles.heroText}>
                    Choisis une scène recommandée pour commencer, ou prépare-toi
                    d’abord avec les bases essentielles.
                  </AppText>
                </BlurView>
              </AnimatedView>
            </View>

            <View style={styles.heroBottomCtaArea}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choisir une scène"
                accessibilityHint="Ouvre le choix de la scène de départ"
                hitSlop={6}
                style={({ pressed }) => [
                  styles.heroPrimaryWrap,
                  pressed && styles.heroPressed,
                ]}
                onPress={openOnboarding}
              >
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={styles.heroPrimaryButton}
                >
                  <ExpoLinearGradient
                    colors={[
                      "rgba(244,114,182,0.45)",
                      "rgba(34,211,238,0.30)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <AppText variant="button" style={styles.heroPrimaryText}>
                    Choisir une scène
                  </AppText>
                </BlurView>
              </Pressable>
            </View>
          </ScrollView>
        </AnimatedView>
      </SafeAreaView>
    </View>
  );
}

export default function SplashScreenPage() {
  const { width, height } = useWindowDimensions();
  const hasShownHero = useRef(false);
  const [showHero, setShowHero] = useState(false);

  const contentOpacity = useMemo(() => new Animated.Value(1), []);
  const glowOpacity = useMemo(() => new Animated.Value(0), []);
  const barOpacity = useMemo(() => new Animated.Value(0), []);
  const barTranslate = useMemo(() => new Animated.Value(12), []);
  const upperOpacity = useMemo(() => new Animated.Value(0), []);
  const upperTranslate = useMemo(() => new Animated.Value(16), []);
  const lowerOpacity = useMemo(() => new Animated.Value(0), []);
  const lowerTranslate = useMemo(() => new Animated.Value(18), []);
  const dotOpacity = useMemo(() => new Animated.Value(0), []);
  const dotScale = useMemo(() => new Animated.Value(0.45), []);
  const wordmarkOpacity = useMemo(() => new Animated.Value(0), []);
  const wordmarkTranslate = useMemo(() => new Animated.Value(12), []);
  const taglineOpacity = useMemo(() => new Animated.Value(0), []);
  const taglineTranslate = useMemo(() => new Animated.Value(7), []);

  const isTablet = width >= 768;
  const contentWidth = isTablet
    ? clamp(width * 0.46, 390, 520)
    : clamp(width * 0.78, 290, 430);

  const symbolSize = clamp(contentWidth * 0.214, 70, 103);
  const wordmarkSize = clamp(contentWidth * 0.132, 38, 56);
  const taglineSize = clamp(contentWidth * 0.0263, 8.0, 11.4);
  const isShortScreen = height < 650;

  useEffect(() => {
    let mounted = true;
    let animation: Animated.CompositeAnimation | null = null;
    let reducedMotionTimer: ReturnType<typeof setTimeout> | null = null;

    const revealHero = () => {
      if (!mounted || hasShownHero.current) return;
      hasShownHero.current = true;
      setShowHero(true);
    };

    const run = async () => {
      const reduceMotion =
        await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);

      if (!mounted) return;

      if (reduceMotion) {
        glowOpacity.setValue(0.65);
        barOpacity.setValue(1);
        barTranslate.setValue(0);
        upperOpacity.setValue(1);
        upperTranslate.setValue(0);
        lowerOpacity.setValue(1);
        lowerTranslate.setValue(0);
        dotOpacity.setValue(1);
        dotScale.setValue(1);
        wordmarkOpacity.setValue(1);
        wordmarkTranslate.setValue(0);
        taglineOpacity.setValue(1);
        taglineTranslate.setValue(0);

        reducedMotionTimer = setTimeout(revealHero, 900);
        return;
      }

      animation = Animated.sequence([
        Animated.delay(140),

        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.82,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(barOpacity, {
            toValue: 1,
            duration: 390,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(barTranslate, {
            toValue: 0,
            duration: 430,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(upperOpacity, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(upperTranslate, {
            toValue: 0,
            duration: 460,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(55),
            Animated.parallel([
              Animated.timing(lowerOpacity, {
                toValue: 1,
                duration: 430,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(lowerTranslate, {
                toValue: 0,
                duration: 470,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),

        Animated.parallel([
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(dotScale, {
            toValue: 1,
            damping: 13,
            stiffness: 180,
            mass: 0.72,
            useNativeDriver: true,
          }),
          Animated.timing(wordmarkOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(wordmarkTranslate, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(taglineTranslate, {
            toValue: 0,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.48,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(560),

        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        // Keep the black canvas visible for a few frames before the hero screen
        // takes over, preventing a bright intermediate frame.
        Animated.delay(80),
      ]);

      animation.start(({ finished }) => {
        if (finished) revealHero();
      });
    };

    void run();

    return () => {
      mounted = false;
      animation?.stop();
      if (reducedMotionTimer) clearTimeout(reducedMotionTimer);
    };
  }, [
    barOpacity,
    barTranslate,
    dotOpacity,
    dotScale,
    glowOpacity,
    lowerOpacity,
    lowerTranslate,
    contentOpacity,
    taglineOpacity,
    taglineTranslate,
    upperOpacity,
    upperTranslate,
    wordmarkOpacity,
    wordmarkTranslate,
  ]);

  if (showHero) {
    return <HeroEntryScreen />;
  }

  return (
    <View style={styles.screen}>
      <StatusBar hidden />

      <AnimatedView
        pointerEvents="none"
        accessible
        accessibilityRole="image"
        accessibilityLabel="K-App. Learn Korean. Experience Korea."
        style={[
          styles.brandBlock,
          { opacity: contentOpacity },
          {
            width: contentWidth,
            transform: [{ translateY: isShortScreen ? -8 : -16 }],
          },
        ]}
      >
        <View style={styles.brandRow}>
          <KSymbol
            size={symbolSize}
            glowOpacity={glowOpacity}
            barOpacity={barOpacity}
            barTranslate={barTranslate}
            upperOpacity={upperOpacity}
            upperTranslate={upperTranslate}
            lowerOpacity={lowerOpacity}
            lowerTranslate={lowerTranslate}
            dotOpacity={dotOpacity}
            dotScale={dotScale}
          />

          <AnimatedView
            style={[
              styles.wordmarkWrap,
              {
                opacity: wordmarkOpacity,
                transform: [{ translateX: wordmarkTranslate }],
              },
            ]}
          >
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[
                styles.wordmark,
                {
                  fontSize: wordmarkSize,
                  lineHeight: wordmarkSize * 1.08,
                },
              ]}
            >
              K-App
            </Text>
          </AnimatedView>
        </View>

        <AnimatedView
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslate }],
            },
          ]}
        >
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[
              styles.taglineText,
              styles.taglineCyan,
              { fontSize: taglineSize },
            ]}
          >
            LEARN KOREAN.
          </Text>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[
              styles.taglineText,
              styles.taglineViolet,
              { fontSize: taglineSize },
            ]}
          >
            EXPERIENCE KOREA.
          </Text>
        </AnimatedView>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },
  brandBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  symbolContainer: {
    position: "relative",
    flexShrink: 0,
    overflow: "visible",
  },
  symbolLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  wordmarkWrap: {
    marginLeft: 12,
    flexShrink: 1,
    justifyContent: "center",
    alignSelf: "center",
  },
  wordmark: {
    color: "#FFFFFF",
    fontFamily: "Outfit_300Light",
    fontWeight: "300",
    letterSpacing: -1.15,
  },
  tagline: {
    marginTop: 7,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  taglineText: {
    fontFamily: "Outfit_500Medium",
    letterSpacing: 2.15,
    lineHeight: 16,
  },
  taglineCyan: {
    color: "#43D7E9",
  },
  taglineViolet: {
    color: "#977BFF",
  },

  heroScreen: {
    flex: 1,
    backgroundColor: HERO_BG,
  },
  heroSafe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSafeCompact: {
    paddingHorizontal: 16,
  },
  heroPage: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  heroScroll: {
    flex: 1,
  },
  heroScrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingBottom: 14,
  },
  heroScrollContentCompact: {
    paddingBottom: 10,
  },
  heroTopRow: {
    paddingTop: 16,
    alignItems: "flex-start",
  },
  heroBadge: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: HERO_CYAN,
  },
  heroBadgeText: {
    color: HERO_TEXT_SOFT,
  },
  heroCenter: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 24,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  heroKoreanLine: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 12,
  },
  heroBigTitle: {
    color: HERO_TEXT,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.68)",
    textAlign: "center",
    marginTop: 14,
    maxWidth: 290,
    alignSelf: "center",
  },
  heroCardWrap: {
    marginTop: 38,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  heroEyebrow: {
    color: HERO_TEXT_SOFT,
    marginBottom: 10,
  },
  heroTitle: {
    color: HERO_TEXT,
  },
  heroText: {
    color: "rgba(255,255,255,0.60)",
    marginTop: 12,
  },
  heroBottomCtaArea: {
    paddingBottom: 24,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  heroPrimaryWrap: {
    borderRadius: 999,
    overflow: "hidden",
  },
  heroPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.994 }],
  },
  heroPrimaryButton: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderTopWidth: 1.2,
    borderColor: "rgba(255,255,255,0.18)",
    borderTopColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPrimaryText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
});