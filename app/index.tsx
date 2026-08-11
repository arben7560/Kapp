import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

const BACKGROUND = "#000000";
const CYAN = "#39DDF2";
const BLUE = "#3994F6";
const VIOLET = "#745BFF";

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

export default function SplashScreenPage() {
  const { width, height } = useWindowDimensions();
  const hasNavigated = useRef(false);

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

    const goToOnboarding = () => {
      if (!mounted || hasNavigated.current) return;
      hasNavigated.current = true;
      router.replace("/onboarding");
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

        reducedMotionTimer = setTimeout(goToOnboarding, 900);
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
        // Keep the black canvas visible for a few frames before navigation.
        // The onboarding screen takes over on the same black background,
        // preventing the route switch from exposing a bright intermediate frame.
        Animated.delay(80),
      ]);

      animation.start(({ finished }) => {
        if (finished) goToOnboarding();
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
});
