import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — aligned with speak.tsx
// ──────────────────────────────────────────────
const { width } = Dimensions.get("window");

const BG_DEEP = "#050508";
const BG_NAVY = "#0A0D1A";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.68)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const GREEN = "#10B981";

const CARD_WIDTH = Math.min(width - 40, 340);

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────
interface WordItem {
  id: string;
  kr: string;
  roman: string;
  fr: string;
  say: string;
}

interface PhraseItem {
  id: string;
  kr: string;
  fr: string;
  say: string;
  icon: string;
  accent: string;
  gradient: [string, string, string];
}

const WORDS: WordItem[] = [
  { id: "1", kr: "날씨", roman: "nalssi", fr: "météo", say: "날씨" },
  { id: "2", kr: "하늘", roman: "haneul", fr: "ciel", say: "하늘" },
  { id: "3", kr: "구름", roman: "gureum", fr: "nuage", say: "구름" },
  { id: "4", kr: "비", roman: "bi", fr: "pluie", say: "비" },
  { id: "5", kr: "눈", roman: "nun", fr: "neige", say: "눈" },
  { id: "6", kr: "바람", roman: "baram", fr: "vent", say: "바람" },
  { id: "7", kr: "우산", roman: "usan", fr: "parapluie", say: "우산" },
  { id: "8", kr: "해", roman: "hae", fr: "soleil", say: "해" },
  { id: "9", kr: "기온", roman: "gion", fr: "température", say: "기온" },
  { id: "10", kr: "여름", roman: "yeoreum", fr: "été", say: "여름" },
  { id: "11", kr: "겨울", roman: "gyeoul", fr: "hiver", say: "겨울" },
  { id: "12", kr: "봄", roman: "bom", fr: "printemps", say: "봄" },
];

const PHRASES: PhraseItem[] = [
  {
    id: "p1",
    kr: "오늘 날씨 어때요?",
    fr: "Quel temps fait-il aujourd’hui ?",
    say: "오늘 날씨 어때요?",
    icon: "❓",
    accent: PINK,
    gradient: [
      "rgba(244, 114, 182, 0.16)",
      "rgba(244, 114, 182, 0.06)",
      "transparent",
    ],
  },
  {
    id: "p2",
    kr: "오늘은 맑아요.",
    fr: "Aujourd’hui il fait beau.",
    say: "오늘은 맑아요.",
    icon: "☀️",
    accent: CYAN,
    gradient: [
      "rgba(34, 211, 238, 0.20)",
      "rgba(16, 185, 129, 0.08)",
      "transparent",
    ],
  },
  {
    id: "p3",
    kr: "오늘은 흐려요.",
    fr: "Aujourd’hui c’est nuageux.",
    say: "오늘은 흐려요.",
    icon: "☁️",
    accent: "#94A3B8",
    gradient: [
      "rgba(148, 163, 184, 0.18)",
      "rgba(100, 116, 139, 0.08)",
      "transparent",
    ],
  },
  {
    id: "p4",
    kr: "비가 와요.",
    fr: "Il pleut.",
    say: "비가 와요.",
    icon: "🌧️",
    accent: "#3B82F6",
    gradient: [
      "rgba(59, 130, 246, 0.20)",
      "rgba(34, 211, 238, 0.08)",
      "transparent",
    ],
  },
  {
    id: "p5",
    kr: "눈이 와요.",
    fr: "Il neige.",
    say: "눈이 와요.",
    icon: "❄️",
    accent: "#CBD5E1",
    gradient: [
      "rgba(226, 232, 240, 0.16)",
      "rgba(148, 163, 184, 0.07)",
      "transparent",
    ],
  },
  {
    id: "p6",
    kr: "바람이 불어요.",
    fr: "Il y a du vent.",
    say: "바람이 불어요.",
    icon: "💨",
    accent: "#38BDF8",
    gradient: [
      "rgba(56, 189, 248, 0.16)",
      "rgba(125, 211, 252, 0.07)",
      "transparent",
    ],
  },
  {
    id: "p7",
    kr: "오늘은 더워요.",
    fr: "Aujourd’hui il fait chaud.",
    say: "오늘은 더워요.",
    icon: "🔥",
    accent: "#FB923C",
    gradient: [
      "rgba(251, 146, 60, 0.22)",
      "rgba(245, 158, 11, 0.08)",
      "transparent",
    ],
  },
  {
    id: "p8",
    kr: "오늘은 추워요.",
    fr: "Aujourd’hui il fait froid.",
    say: "오늘은 추워요.",
    icon: "🧊",
    accent: "#60A5FA",
    gradient: [
      "rgba(96, 165, 250, 0.18)",
      "rgba(34, 211, 238, 0.06)",
      "transparent",
    ],
  },
  {
    id: "p9",
    kr: "우산 있어요?",
    fr: "Tu as un parapluie ?",
    say: "우산 있어요?",
    icon: "☂️",
    accent: "#A855F7",
    gradient: [
      "rgba(168, 85, 247, 0.18)",
      "rgba(244, 114, 182, 0.06)",
      "transparent",
    ],
  },
  {
    id: "p10",
    kr: "비 올 것 같아요.",
    fr: "Je crois qu’il va pleuvoir.",
    say: "비 올 것 같아요.",
    icon: "🌦️",
    accent: "#475569",
    gradient: [
      "rgba(71, 85, 105, 0.22)",
      "rgba(59, 130, 246, 0.08)",
      "transparent",
    ],
  },
];

// ──────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────
const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
  Haptics.impactAsync(style).catch(() => {});
};

const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1,
  });
};

function getWordSizing(text: string) {
  const len = text.length;

  if (len <= 1) {
    return {
      fontSize: width > 420 ? 40 : 36,
      lineHeight: width > 420 ? 46 : 42,
      letterSpacing: -0.8,
    };
  }

  if (len <= 2) {
    return {
      fontSize: width > 420 ? 39 : 35,
      lineHeight: width > 420 ? 45 : 41,
      letterSpacing: -0.9,
    };
  }

  if (len <= 3) {
    return {
      fontSize: width > 420 ? 37 : 33,
      lineHeight: width > 420 ? 43 : 39,
      letterSpacing: -1,
    };
  }

  return {
    fontSize: width > 420 ? 34 : 30,
    lineHeight: width > 420 ? 40 : 36,
    letterSpacing: -0.9,
  };
}

// ──────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────
function WeatherWordCard({ items }: { items: WordItem[] }) {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const current = items[index];
  const wordSizing = getWordSizing(current.kr);

  const animateChange = useCallback(
    (cb: () => void) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        cb();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const handleNext = () => {
    triggerHaptic();
    animateChange(() => setIndex((prev) => (prev + 1) % items.length));
  };

  const handlePrev = () => {
    triggerHaptic();
    animateChange(() =>
      setIndex((prev) => (prev - 1 + items.length) % items.length),
    );
  };

  const playCurrent = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 180,
        easing: Easing.out(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.sin),
        useNativeDriver: true,
      }),
    ]).start();

    speakKo(current.say);
  }, [current, pulseAnim]);

  return (
    <BlurView intensity={88} tint="dark" style={styles.glassCard}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.09)",
          "transparent",
          "rgba(34,211,238,0.06)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.statusDot} />
          <Text style={styles.cardHeaderText}>LIVE VOICE</Text>
        </View>

        <Pressable
          onPress={playCurrent}
          style={({ pressed }) => [
            styles.playMiniTag,
            { opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <Text style={styles.playMiniTagText}>PLAY</Text>
        </Pressable>
      </View>

      <View style={styles.weatherCardMain}>
        <Pressable
          onPress={handlePrev}
          style={({ pressed }) => [
            styles.navCircle,
            { opacity: pressed ? 0.78 : 1 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>

        <Animated.View style={[styles.wordContent, { opacity: fadeAnim }]}>
          <Animated.Text
            style={[
              styles.krBig,
              wordSizing,
              {
                transform: [{ scale: pulseAnim }],
                textShadowColor: "rgba(34, 211, 238, 0.58)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {current.kr}
          </Animated.Text>

          <Text style={styles.wordRoman}>{current.roman}</Text>
          <Text style={styles.wordFrench}>{current.fr}</Text>
        </Animated.View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.navCircle,
            { opacity: pressed ? 0.78 : 1 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.cardFooter}>
        <Pressable
          onPress={playCurrent}
          style={({ pressed }) => [
            styles.listenCapsule,
            { opacity: pressed ? 0.86 : 1 },
          ]}
        >
          <Text style={styles.listenCapsuleText}>Écoute et répète</Text>
        </Pressable>
      </View>
    </BlurView>
  );
}

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function MeteoScreen() {
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG_DEEP }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient colors={[BG_DEEP, BG_NAVY]} style={{ flex: 1 }}>
        <View
          style={[
            styles.pageGlow,
            { top: -140, left: -100, backgroundColor: "rgba(168,85,247,0.07)" },
          ]}
        />
        <View
          style={[
            styles.pageGlow,
            {
              bottom: 100,
              right: -90,
              backgroundColor: "rgba(34,211,238,0.05)",
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.topButton,
                { opacity: pressed ? 0.84 : 1 },
              ]}
            >
              <Text style={styles.topButtonText}>‹</Text>
            </Pressable>
          </View>

          <View style={styles.heroContainer}>
            <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
            <Text style={styles.heroTitle}>Météo</Text>
          </View>

          <View style={styles.wordCardWrap}>
            <WeatherWordCard items={WORDS} />
          </View>

          <View style={{ height: 46 }} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phrases météo</Text>

            {PHRASES.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  triggerHaptic();
                  speakKo(item.say);
                }}
                style={({ pressed }) => [
                  styles.themeCard,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <BlurView
                  intensity={80}
                  tint="dark"
                  style={styles.themeCardBlur}
                >
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0.0, y: 0.5 }}
                    end={{ x: 1.0, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View
                    style={[
                      styles.cardAccentLine,
                      { backgroundColor: item.accent },
                    ]}
                  />

                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: `${item.accent}22`,
                        borderColor: `${item.accent}50`,
                      },
                    ]}
                  >
                    <Text style={styles.icon}>{item.icon}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.themeTitle}>{item.kr}</Text>
                    <Text style={styles.themeSub}>{item.fr}</Text>
                  </View>

                  <Text style={styles.arrow}>›</Text>
                </BlurView>
              </Pressable>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },

  pageGlow: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
  },

  topBar: {
    marginBottom: 14,
  },

  topButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  topButtonText: {
    color: TXT,
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
  },

  heroContainer: {
    alignItems: "flex-start",
  },

  heroEyebrow: {
    color: PINK,
    fontSize: 13.5,
    letterSpacing: 3.2,
    fontWeight: "700",
    marginBottom: 8,
  },

  heroTitle: {
    color: TXT,
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: -1.4,
    marginTop: 15,
    marginBottom: 28,
  },

  wordCardWrap: {
    alignItems: "center",
  },

  glassCard: {
    width: CARD_WIDTH,
    minHeight: 242,
    borderRadius: 34,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
    padding: 24,
    justifyContent: "space-between",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },

  cardHeaderText: {
    color: MUTED,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  playMiniTag: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },

  playMiniTagText: {
    color: TXT,
    fontSize: 11.5,
    fontWeight: "500",
  },

  weatherCardMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },

  navCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  navArrow: {
    color: TXT,
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 34,
    marginTop: -2,
  },

  wordContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  krBig: {
    color: TXT,
    fontWeight: "500",
    marginBottom: 12,
    maxWidth: CARD_WIDTH - 150,
    textAlign: "center",
  },

  wordRoman: {
    color: TXT,
    fontSize: 15.5,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },

  wordFrench: {
    color: MUTED,
    fontSize: 14,
    textAlign: "center",
  },

  cardFooter: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  listenCapsule: {
    width: "auto",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  listenCapsuleText: {
    color: TXT,
    fontSize: 15,
    fontWeight: "700",
  },

  section: {
    width: "100%",
  },

  sectionTitle: {
    color: TXT,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 20,
  },

  themeCard: {
    marginBottom: 14,
    borderRadius: 26,
    overflow: "hidden",
  },

  themeCardBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    position: "relative",
  },

  cardAccentLine: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.9,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  icon: {
    fontSize: 28,
  },

  themeTitle: {
    color: TXT,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  themeSub: {
    color: MUTED,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },

  arrow: {
    color: MUTED,
    fontSize: 26,
    fontWeight: "300",
  },
});
