import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type VowelItem = {
  id: string;
  hangul: string;
  romanization: string;
  description: string;
};

const VOWELS: VowelItem[] = [
  {
    id: "a",
    hangul: "아",
    romanization: "a",
    description: "son ouvert, clair",
  },
  {
    id: "ya",
    hangul: "야",
    romanization: "ya",
    description: "même base avec y",
  },
  {
    id: "eo",
    hangul: "어",
    romanization: "eo",
    description: "plus profond, plus rond",
  },
  {
    id: "yeo",
    hangul: "여",
    romanization: "yeo",
    description: "même base avec y",
  },
  {
    id: "o",
    hangul: "오",
    romanization: "o",
    description: "son vertical et net",
  },
  {
    id: "yo",
    hangul: "요",
    romanization: "yo",
    description: "même base avec y",
  },
  {
    id: "u",
    hangul: "우",
    romanization: "u",
    description: "son fermé, profond",
  },
  {
    id: "yu",
    hangul: "유",
    romanization: "yu",
    description: "même base avec y",
  },
];

const CYAN = "#22D3EE";
const PINK = "#F472B6";
const BG = "#03040A";
const CARD_BG = "rgba(255,255,255,0.05)";
const CARD_BORDER = "rgba(255,255,255,0.10)";
const CARD_BORDER_ACTIVE = "rgba(34,211,238,0.65)";
const TEXT_PRIMARY = "rgba(255,255,255,0.96)";
const TEXT_SECONDARY = "rgba(255,255,255,0.72)";
const TEXT_FAINT = "rgba(255,255,255,0.42)";
const TRACK = "rgba(255,255,255,0.12)";

function speakKorean(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1,
  });
}

function VowelCard({
  item,
  isActive,
  isDone,
  onPress,
}: {
  item: VowelItem;
  isActive: boolean;
  isDone: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(glow, {
      toValue: isActive ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [glow, isActive]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.985,
        duration: 70,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const animatedBorderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [CARD_BORDER, CARD_BORDER_ACTIVE],
  });

  const animatedOverlayOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable onPress={handlePress} style={styles.cardPressable}>
        <Animated.View
          style={[
            styles.cardBorder,
            {
              borderColor: animatedBorderColor,
            },
          ]}
        >
          <BlurView intensity={18} tint="dark" style={styles.cardBlur}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.05)",
                "rgba(255,255,255,0.02)",
                "rgba(0,0,0,0.04)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <Animated.View
              pointerEvents="none"
              style={[
                styles.activeGlow,
                {
                  opacity: animatedOverlayOpacity,
                },
              ]}
            />

            <View
              style={[
                styles.statusDot,
                isActive
                  ? styles.statusDotActive
                  : isDone
                    ? styles.statusDotDone
                    : styles.statusDotIdle,
              ]}
            />

            <Text style={styles.statusLabel}>
              {isActive ? "LIVE" : isDone ? "DONE" : ""}
            </Text>

            <View style={styles.cardContent}>
              <Text style={styles.cardHangul}>{item.hangul}</Text>

              <Text style={styles.cardRomanization}>
                {item.hangul} • {item.romanization}
              </Text>

              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function VowelsBasicScreen() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<string[]>(["a", "ya", "eo", "o"]);

  const pulse = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [pulse]);

  const ctaInnerGlowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.18],
  });

  const onCtaPressIn = () => {
    Animated.spring(ctaScale, {
      toValue: 0.985,
      speed: 22,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const onCtaPressOut = () => {
    Animated.spring(ctaScale, {
      toValue: 1,
      speed: 20,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const masteredCount = doneIds.length;
  const progress = masteredCount / VOWELS.length;

  const playVowel = useCallback((item: VowelItem) => {
    setActiveId(item.id);

    setDoneIds((prev) => {
      if (prev.includes(item.id)) return prev;
      return [...prev, item.id];
    });

    speakKorean(item.hangul);

    setTimeout(() => {
      setActiveId((current) => (current === item.id ? null : current));
    }, 1100);
  }, []);

  const playCycle = useCallback(async () => {
    Speech.stop();

    for (let i = 0; i < VOWELS.length; i++) {
      const item = VOWELS[i];
      setActiveId(item.id);

      setDoneIds((prev) => {
        if (prev.includes(item.id)) return prev;
        return [...prev, item.id];
      });

      Speech.speak(item.hangul, {
        language: "ko-KR",
        rate: 0.92,
        pitch: 1,
      });

      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    setActiveId(null);
  }, []);

  const vowels = useMemo(() => VOWELS, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.screen}>
        <View style={styles.orbPink} pointerEvents="none" />
        <View style={styles.orbCyanA} pointerEvents="none" />
        <View style={styles.orbCyanB} pointerEvents="none" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topRow}>
            <Text style={styles.backText}>← Retour</Text>

            <View style={styles.settingsButton}>
              <BlurView intensity={22} tint="dark" style={styles.settingsBlur}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </BlurView>
            </View>
          </View>

          <Text style={styles.eyebrow}>HANGUL FOUNDATION</Text>
          <Text style={styles.heroTitle}>Voyelles{"\n"}de base</Text>

          <View style={styles.infoCardOuter}>
            <BlurView intensity={20} tint="dark" style={styles.infoCard}>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.04)",
                  "rgba(255,255,255,0.02)",
                  "rgba(0,0,0,0.03)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.infoHeader}>
                <View style={styles.infoDot} />
                <Text style={styles.infoEyebrow}>SOUND TRAINING</Text>
              </View>

              <Text style={styles.infoTitle}>
                Avance voyelle par voyelle pour stabiliser les sons.
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>

              <View style={styles.infoBottomRow}>
                <Text style={styles.infoMeta}>🎧 Casque conseillé</Text>
                <Text style={styles.infoMeta}>
                  {masteredCount}/{VOWELS.length} maîtrisées
                </Text>
              </View>
            </BlurView>
          </View>

          <View style={styles.methodCardOuter}>
            <BlurView intensity={20} tint="dark" style={styles.methodCard}>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.04)",
                  "rgba(255,255,255,0.02)",
                  "rgba(0,0,0,0.03)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              <Text style={styles.methodTitle}>Méthode recommandée</Text>

              <Text style={styles.methodStep}>1. Écoute un son isolé.</Text>
              <Text style={styles.methodStep}>
                2. Répète à voix haute, sans te presser.
              </Text>
              <Text style={styles.methodStep}>
                3. Compare les paires{" "}
                <Text style={styles.methodAccent}>ㅏ / ㅑ</Text> et{" "}
                <Text style={styles.methodAccent}>ㅓ / ㅕ</Text>.
              </Text>
            </BlurView>
          </View>

          <View style={styles.quickHeaderRow}>
            <Text style={styles.quickTitle}>Écoute rapide</Text>
            <Text style={styles.quickHint}>tap pour entendre</Text>
          </View>

          <View style={styles.grid}>
            {vowels.map((item) => (
              <VowelCard
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                isDone={doneIds.includes(item.id)}
                onPress={() => playVowel(item)}
              />
            ))}
          </View>

          <Pressable
            onPress={playCycle}
            onPressIn={onCtaPressIn}
            onPressOut={onCtaPressOut}
            style={styles.ctaWrap}
          >
            <Animated.View
              style={[
                styles.ctaOuter,
                {
                  transform: [{ scale: ctaScale }],
                },
              ]}
            >
              <BlurView intensity={26} tint="dark" style={styles.ctaBlur}>
                <LinearGradient
                  colors={[
                    "rgba(255,255,255,0.06)",
                    "rgba(255,255,255,0.02)",
                    "rgba(0,0,0,0.06)",
                  ]}
                  style={StyleSheet.absoluteFillObject}
                />

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.ctaGlowLayer,
                    { opacity: ctaInnerGlowOpacity },
                  ]}
                />

                <View style={styles.ctaContentSimple}>
                  <Text style={styles.ctaIcon}>🔊</Text>
                  <Text style={styles.ctaTextSimple}>Écouter le cycle</Text>
                </View>
              </BlurView>
            </Animated.View>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 34,
  },

  orbPink: {
    position: "absolute",
    top: -120,
    right: -70,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(244,114,182,0.09)",
  },

  orbCyanA: {
    position: "absolute",
    top: 250,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(34,211,238,0.06)",
  },

  orbCyanB: {
    position: "absolute",
    bottom: 40,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(34,211,238,0.05)",
  },

  topRow: {
    marginBottom: 12,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backText: {
    color: TEXT_FAINT,
    fontSize: 16,
    fontWeight: "500",
    includeFontPadding: false,
  },

  settingsButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  settingsBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  settingsIcon: {
    fontSize: 28,
  },

  eyebrow: {
    color: PINK,
    fontSize: 15,
    letterSpacing: 5,
    fontWeight: "600",
    marginBottom: 8,
    includeFontPadding: false,
  },

  heroTitle: {
    color: TEXT_PRIMARY,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "300",
    letterSpacing: -0.5,
    marginBottom: 22,
    includeFontPadding: false,
  },

  infoCardOuter: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 18,
  },

  infoCard: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  infoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CYAN,
    marginRight: 12,
  },

  infoEyebrow: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "700",
    includeFontPadding: false,
  },

  infoTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 20,
    includeFontPadding: false,
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: TRACK,
    overflow: "hidden",
    marginBottom: 16,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: CYAN,
  },

  infoBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  infoMeta: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 13,
    fontWeight: "600",
    includeFontPadding: false,
  },

  methodCardOuter: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },

  methodCard: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  methodTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    includeFontPadding: false,
  },

  methodStep: {
    color: TEXT_SECONDARY,
    fontSize: 14.5,
    lineHeight: 20,
    marginBottom: 10,
    includeFontPadding: false,
  },

  methodAccent: {
    color: CYAN,
    fontWeight: "700",
  },

  quickHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  quickTitle: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: "700",
    includeFontPadding: false,
  },

  quickHint: {
    color: TEXT_FAINT,
    fontSize: 12,
    fontWeight: "600",
    includeFontPadding: false,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  cardWrap: {
    width: "48%",
  },

  cardPressable: {
    width: "100%",
  },

  cardBorder: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: "hidden",
    minHeight: 222,
    backgroundColor: CARD_BG,
  },

  cardBlur: {
    minHeight: 222,
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: "relative",
  },

  activeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: "rgba(34,211,238,0.08)",
  },

  statusDot: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 5,
  },

  statusDotActive: {
    backgroundColor: "#37E0AE",
  },

  statusDotDone: {
    backgroundColor: "#37E0AE",
  },

  statusDotIdle: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  statusLabel: {
    position: "absolute",
    top: 12,
    right: 14,
    color: "rgba(255,255,255,0.46)",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
    zIndex: 5,
    includeFontPadding: false,
  },

  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },

  cardHangul: {
    color: TEXT_PRIMARY,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    marginBottom: 18,
    includeFontPadding: false,
    textAlign: "center",
  },

  cardRomanization: {
    color: CYAN,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    marginBottom: 12,
    includeFontPadding: false,
    textAlign: "center",
  },

  cardDescription: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  ctaWrap: {
    marginTop: 24,
    marginBottom: 4,
  },

  ctaOuter: {
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    shadowColor: CYAN,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  ctaBlur: {
    minHeight: 92,
    justifyContent: "center",
    position: "relative",
  },

  ctaGlowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.10)",
  },

  ctaContentSimple: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  ctaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginRight: 14,
  },

  ctaIcon: {
    fontSize: 16,
  },

  ctaTextWrap: {
    flex: 1,
    justifyContent: "center",
  },

  ctaTextSimple: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
    includeFontPadding: false,
  },

  ctaEyebrow: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    letterSpacing: 2.2,
    fontWeight: "700",
    marginBottom: 4,
    includeFontPadding: false,
  },

  ctaText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
    includeFontPadding: false,
  },

  ctaArrowWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginLeft: 12,
  },

  ctaArrow: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 18,
    fontWeight: "600",
    includeFontPadding: false,
  },
});
