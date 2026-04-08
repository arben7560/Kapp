import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {}

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN TOKENS
// ──────────────────────────────────────────────
const BG_DEEP = "#050508";
const BG_TOP = "#0A0D1A";

const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.68)";
const TXT_SOFT = "rgba(255,255,255,0.72)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const VIOLET = "#7B51D8";
const GREEN = "#10B981";

const HAIR = "rgba(255,255,255,0.10)";
const HAIR_STRONG = "rgba(255,255,255,0.16)";

const RADIUS_XL = 34;
const RADIUS_M = 22;
const RADIUS_PILL = 999;

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────
type VowelTone = "cyan" | "pink" | "violet" | "neutral";

type VowelItem = {
  id: string;
  hangul: string;
  romanization: string;
  description: string;
  tone: VowelTone;
};

type ContrastPair = {
  id: string;
  left: VowelItem;
  right: VowelItem;
};

const VOWELS: VowelItem[] = [
  {
    id: "a",
    hangul: "아",
    romanization: "a",
    description: "son ouvert, clair",
    tone: "pink",
  },
  {
    id: "ya",
    hangul: "야",
    romanization: "ya",
    description: "même base avec y",
    tone: "cyan",
  },
  {
    id: "eo",
    hangul: "어",
    romanization: "eo",
    description: "plus profond, plus rond",
    tone: "violet",
  },
  {
    id: "yeo",
    hangul: "여",
    romanization: "yeo",
    description: "même base avec y",
    tone: "cyan",
  },
  {
    id: "o",
    hangul: "오",
    romanization: "o",
    description: "son vertical et net",
    tone: "pink",
  },
  {
    id: "yo",
    hangul: "요",
    romanization: "yo",
    description: "même base avec y",
    tone: "cyan",
  },
  {
    id: "u",
    hangul: "우",
    romanization: "u",
    description: "son fermé, profond",
    tone: "violet",
  },
  {
    id: "yu",
    hangul: "유",
    romanization: "yu",
    description: "même base avec y",
    tone: "cyan",
  },
];

const CONTRASTS: ContrastPair[] = [
  {
    id: "a-ya",
    left: {
      id: "a",
      hangul: "아",
      romanization: "a",
      description: "base ouverte",
      tone: "pink",
    },
    right: {
      id: "ya",
      hangul: "야",
      romanization: "ya",
      description: "ajout de y",
      tone: "cyan",
    },
  },
  {
    id: "eo-yeo",
    left: {
      id: "eo",
      hangul: "어",
      romanization: "eo",
      description: "plus rond",
      tone: "violet",
    },
    right: {
      id: "yeo",
      hangul: "여",
      romanization: "yeo",
      description: "ajout de y",
      tone: "cyan",
    },
  },
  {
    id: "o-yo",
    left: {
      id: "o",
      hangul: "오",
      romanization: "o",
      description: "vertical et net",
      tone: "pink",
    },
    right: {
      id: "yo",
      hangul: "요",
      romanization: "yo",
      description: "ajout de y",
      tone: "cyan",
    },
  },
  {
    id: "u-yu",
    left: {
      id: "u",
      hangul: "우",
      romanization: "u",
      description: "fermé, profond",
      tone: "violet",
    },
    right: {
      id: "yu",
      hangul: "유",
      romanization: "yu",
      description: "ajout de y",
      tone: "cyan",
    },
  },
];

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function toneGlow(tone: VowelTone) {
  switch (tone) {
    case "cyan":
      return "rgba(34,211,238,0.18)";
    case "pink":
      return "rgba(244,114,182,0.15)";
    case "violet":
      return "rgba(123,81,216,0.16)";
    default:
      return "rgba(255,255,255,0.08)";
  }
}

function toneGradient(tone: VowelTone) {
  switch (tone) {
    case "cyan":
      return [
        "rgba(34,211,238,0.12)",
        "rgba(255,255,255,0.03)",
        "rgba(34,211,238,0.02)",
      ];
    case "pink":
      return [
        "rgba(244,114,182,0.12)",
        "rgba(255,255,255,0.03)",
        "rgba(244,114,182,0.02)",
      ];
    case "violet":
      return [
        "rgba(123,81,216,0.12)",
        "rgba(255,255,255,0.03)",
        "rgba(123,81,216,0.02)",
      ];
    default:
      return [
        "rgba(255,255,255,0.07)",
        "rgba(255,255,255,0.03)",
        "rgba(255,255,255,0.02)",
      ];
  }
}

function stopSpeech() {
  try {
    Speech.stop();
  } catch {}
}

function speakKorean(text: string, rate = 0.9) {
  return new Promise<void>((resolve) => {
    stopSpeech();
    Speech.speak(text, {
      language: "ko-KR",
      rate,
      pitch: 1,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ──────────────────────────────────────────────
// GLASS
// ──────────────────────────────────────────────
function SpecularEdge() {
  return (
    <View pointerEvents="none" style={styles.specularWrap}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.16)",
          "rgba(255,255,255,0.05)",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.specularLine}
      />
    </View>
  );
}

function GlassChrome({
  radius,
  tone = "neutral",
}: {
  radius: number;
  tone?: VowelTone;
}) {
  return (
    <>
      <LinearGradient
        colors={toneGradient(tone)}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.diffusedOrb,
          {
            top: -38,
            left: -30,
            width: 180,
            height: 140,
            borderRadius: 100,
            backgroundColor: toneGlow(tone),
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.diffusedOrb,
          {
            right: -28,
            bottom: -24,
            width: 150,
            height: 120,
            borderRadius: 80,
            backgroundColor: "rgba(255,255,255,0.04)",
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: radius,
            borderWidth: 0.5,
            borderColor: "rgba(255,255,255,0.05)",
          },
        ]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.04)", "transparent", "rgba(0,0,0,0.22)"]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.10)", "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.14, y: 0.5 }}
        style={[
          styles.leftSheen,
          { borderTopLeftRadius: radius, borderBottomLeftRadius: radius },
        ]}
      />

      <SpecularEdge />
    </>
  );
}

function Capsule({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={styles.capsuleShell}>
        <BlurView intensity={20} tint="dark" style={styles.capsuleBlur}>
          <LinearGradient
            colors={
              active
                ? ["rgba(34,211,238,0.11)", "rgba(255,255,255,0.03)"]
                : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              styles.capsuleInnerBorder,
              active && { borderColor: "rgba(34,211,238,0.24)" },
            ]}
          />
          <Text
            style={[styles.capsuleText, active && styles.capsuleTextActive]}
          >
            {label}
          </Text>
        </BlurView>
      </View>
    </Pressable>
  );
}

function DialogueStyleBubble({ text }: { text: string }) {
  return (
    <View style={styles.speechBubble}>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
}

function ContrastMiniCard({
  item,
  showRomanization,
}: {
  item: VowelItem;
  showRomanization: boolean;
}) {
  return (
    <View style={styles.soundPanel}>
      <BlurView intensity={22} tint="dark" style={styles.soundPanelBlur}>
        <GlassChrome radius={RADIUS_M} tone={item.tone} />
        <Text style={styles.soundPanelChar}>{item.hangul}</Text>
        {showRomanization && (
          <Text style={styles.soundPanelRoman}>{item.romanization}</Text>
        )}
        <Text style={styles.soundPanelDescription}>{item.description}</Text>
      </BlurView>
    </View>
  );
}

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function VowelsBasicScreen() {
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [contrastIndex, setContrastIndex] = useState(0);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [contrastPlaying, setContrastPlaying] = useState(false);
  const [showRomanization, setShowRomanization] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentVoice = useMemo(() => VOWELS[voiceIndex], [voiceIndex]);
  const currentContrast = useMemo(
    () => CONTRASTS[contrastIndex],
    [contrastIndex],
  );

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => stopSpeech();
  }, [fadeAnim, floatAnim, pulseAnim]);

  const playVoice = async (item?: VowelItem) => {
    const target = item ?? currentVoice;
    setVoicePlaying(true);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    await speakKorean(target.hangul, 0.92);
    setVoicePlaying(false);
  };

  const goVoicePrev = async () => {
    const next = voiceIndex === 0 ? VOWELS.length - 1 : voiceIndex - 1;
    setVoiceIndex(next);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    await wait(90);
    await playVoice(VOWELS[next]);
  };

  const goVoiceNext = async () => {
    const next = voiceIndex === VOWELS.length - 1 ? 0 : voiceIndex + 1;
    setVoiceIndex(next);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    await wait(90);
    await playVoice(VOWELS[next]);
  };

  const playContrast = async () => {
    setContrastPlaying(true);
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    await speakKorean(currentContrast.left.hangul, 0.92);
    await wait(150);
    await speakKorean(currentContrast.right.hangul, 0.92);
    setContrastPlaying(false);
  };

  const goContrastPrev = () => {
    setContrastIndex((prev) => (prev === 0 ? CONTRASTS.length - 1 : prev - 1));
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
  };

  const goContrastNext = () => {
    setContrastIndex((prev) => (prev === CONTRASTS.length - 1 ? 0 : prev + 1));
    Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
  };

  const voicePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 18 && Math.abs(gesture.dy) < 20,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -40) {
          goVoiceNext();
        } else if (gesture.dx > 40) {
          goVoicePrev();
        }
      },
    }),
  ).current;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG_DEEP }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[BG_DEEP, BG_TOP]} style={{ flex: 1 }}>
        <View
          style={[
            styles.pageGlow,
            {
              top: -140,
              left: -100,
              backgroundColor: "rgba(168,85,247,0.07)",
            },
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
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY }],
            }}
          >
            <View style={styles.heroContainer}>
              <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
              <Text style={styles.heroTitle}>Voyelles</Text>
            </View>
          </Animated.View>

          <View style={styles.sectionGuideWrap}>
            <Text style={styles.sectionGuideText}>Voyelles de base</Text>
          </View>

          <View {...voicePanResponder.panHandlers}>
            <BlurView intensity={42} tint="dark" style={styles.heroCard}>
              <GlassChrome radius={RADIUS_XL} tone={currentVoice.tone} />

              <View style={styles.cardTopRow}>
                <View style={styles.liveRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveLabel}>LIVE VOICE</Text>
                </View>

                <Pressable
                  style={styles.roundPlayShell}
                  onPress={() => playVoice()}
                >
                  <BlurView
                    intensity={18}
                    tint="dark"
                    style={styles.roundPlayButton}
                  >
                    <Text
                      style={[
                        styles.roundPlayText,
                        voicePlaying && { color: CYAN },
                      ]}
                    >
                      PLAY
                    </Text>
                  </BlurView>
                </Pressable>
              </View>

              <View style={styles.heroMiddleRow}>
                <Pressable onPress={goVoicePrev} style={styles.navShell}>
                  <BlurView intensity={18} tint="dark" style={styles.navCircle}>
                    <Text style={styles.navArrow}>‹</Text>
                  </BlurView>
                </Pressable>

                <View style={styles.heroCenter}>
                  <Animated.Text
                    style={[
                      styles.heroChar,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    {currentVoice.hangul}
                  </Animated.Text>

                  {showRomanization && (
                    <Text style={styles.heroRomanization}>
                      {currentVoice.romanization}
                    </Text>
                  )}

                  <Text style={styles.heroDescription}>
                    {currentVoice.description}
                  </Text>
                </View>

                <Pressable onPress={goVoiceNext} style={styles.navShell}>
                  <BlurView intensity={18} tint="dark" style={styles.navCircle}>
                    <Text style={styles.navArrow}>›</Text>
                  </BlurView>
                </Pressable>
              </View>

              <View style={styles.voiceBubbleWrap}>
                <DialogueStyleBubble text="Écoute et répète" />
              </View>
            </BlurView>
          </View>

          <View style={styles.sectionGuideWrap}>
            <Text style={styles.sectionGuideText}>Contrastes de voyelles</Text>
          </View>

          <BlurView intensity={40} tint="dark" style={styles.contrastCard}>
            <GlassChrome radius={RADIUS_XL} tone={currentContrast.left.tone} />

            <View style={styles.contrastHeaderRow}>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveLabel}>LIVE CONTRAST</Text>
              </View>

              <Text style={styles.counterText}>
                {contrastIndex + 1}/{CONTRASTS.length}
              </Text>
            </View>

            <View style={styles.contrastStage}>
              <Pressable
                onPress={goContrastPrev}
                style={styles.stageArrowShell}
              >
                <Text style={styles.stageArrowText}>‹</Text>
              </Pressable>

              <View style={styles.contrastCore}>
                <ContrastMiniCard
                  item={currentContrast.left}
                  showRomanization={showRomanization}
                />

                <View style={styles.transitionWrap}>
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(255,255,255,0.10)",
                      "rgba(255,255,255,0.18)",
                      "rgba(255,255,255,0.10)",
                      "transparent",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.transitionLine}
                  />
                  <Text style={styles.transitionArrow}>→</Text>
                </View>

                <ContrastMiniCard
                  item={currentContrast.right}
                  showRomanization={showRomanization}
                />
              </View>

              <Pressable
                onPress={goContrastNext}
                style={styles.stageArrowShell}
              >
                <Text style={styles.stageArrowText}>›</Text>
              </Pressable>
            </View>

            <Pressable onPress={playContrast} style={styles.compactPlayShell}>
              <BlurView
                intensity={20}
                tint="dark"
                style={styles.compactPlayButton}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text
                  style={[
                    styles.compactPlayText,
                    contrastPlaying && { color: CYAN },
                  ]}
                >
                  Écoute la différence
                </Text>
                <Text style={styles.compactPlayArrow}>›</Text>
              </BlurView>
            </Pressable>

            <View style={styles.romanizationRow}>
              <Capsule
                label="Romanisation"
                active={showRomanization}
                onPress={() => setShowRomanization((v) => !v)}
              />
            </View>
          </BlurView>
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

  heroContainer: {
    alignItems: "center",
  },

  heroEyebrow: {
    color: PINK,
    fontFamily: fonts.bold,
    fontSize: 13.5,
    letterSpacing: 3.2,
    marginBottom: 8,
  },

  heroTitle: {
    color: TXT,
    fontSize: 46,
    fontFamily: fonts.black,
    letterSpacing: -1.4,
    marginTop: 15,
    marginBottom: 35,
  },

  sectionGuideWrap: {
    marginTop: 30,
    paddingHorizontal: 6,
    marginBottom: 10,
  },

  sectionGuideText: {
    color: "white",
    fontSize: 22.5,
    letterSpacing: 0.4,
    fontFamily: fonts.medium,
  },

  heroCard: {
    borderRadius: RADIUS_XL,
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 20,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },

  contrastCard: {
    borderRadius: RADIUS_XL,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    marginTop: 6,
  },

  specularWrap: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
  },

  specularLine: {
    width: "100%",
    height: 1,
    opacity: 0.55,
  },

  diffusedOrb: {
    position: "absolute",
  },

  leftSheen: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 18,
    opacity: 0.18,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  contrastHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },

  liveLabel: {
    color: MUTED,
    fontSize: 11.5,
    fontFamily: fonts.bold,
    letterSpacing: 1.6,
  },

  counterText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },

  roundPlayShell: {
    borderRadius: RADIUS_PILL,
    overflow: "hidden",
  },

  roundPlayButton: {
    width: 82,
    height: 40,
    borderRadius: RADIUS_PILL,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: HAIR_STRONG,
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },

  roundPlayText: {
    color: TXT,
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 1.8,
  },

  heroMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  navShell: {
    borderRadius: RADIUS_PILL,
    overflow: "hidden",
  },

  navCircle: {
    width: 74,
    height: 74,
    borderRadius: RADIUS_PILL,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HAIR,
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },

  navArrow: {
    color: TXT_SOFT,
    fontSize: 36,
    lineHeight: 36,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    fontWeight: "300",
  },

  heroCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  heroChar: {
    color: TXT,
    fontSize: 118,
    lineHeight: 122,
    fontFamily: fonts.kr,
    letterSpacing: -4.2,
  },

  heroRomanization: {
    color: TXT,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: fonts.medium,
    marginTop: -4,
  },

  heroDescription: {
    color: TXT_SOFT,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: fonts.medium,
    marginTop: 10,
    textAlign: "center",
  },

  voiceBubbleWrap: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 4,
  },

  speechBubble: {
    backgroundColor: "rgba(0,0,0,0.48)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    minWidth: width * 0.64,
    alignItems: "center",
    justifyContent: "center",
  },

  bubbleText: {
    color: MUTED,
    fontSize: 14.5,
    lineHeight: 21,
    fontStyle: "italic",
    fontFamily: fonts.medium,
    textAlign: "center",
  },

  contrastStage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  stageArrowShell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    minWidth: 32,
  },

  stageArrowText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 52,
    lineHeight: 52,
    textAlign: "center",
    includeFontPadding: false,
    fontWeight: "300",
  },

  contrastCore: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  soundPanel: {
    width: 102,
    borderRadius: RADIUS_M,
    overflow: "hidden",
  },

  soundPanelBlur: {
    height: 196,
    borderRadius: RADIUS_M,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    overflow: "hidden",
  },

  soundPanelChar: {
    color: TXT,
    fontSize: 58,
    lineHeight: 62,
    fontFamily: fonts.kr,
    letterSpacing: -2.2,
    textAlign: "center",
  },

  soundPanelRoman: {
    color: TXT,
    fontSize: 18,
    lineHeight: 22,
    fontFamily: fonts.medium,
    marginTop: 14,
    textAlign: "center",
  },

  soundPanelDescription: {
    color: TXT_SOFT,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: fonts.medium,
    marginTop: 8,
    textAlign: "center",
  },

  transitionWrap: {
    width: 32,
    height: 196,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  transitionLine: {
    position: "absolute",
    width: 26,
    height: 1,
    opacity: 0.55,
  },

  transitionArrow: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 34,
    lineHeight: 34,
    textAlign: "center",
    includeFontPadding: false,
    fontWeight: "300",
  },

  compactPlayShell: {
    borderRadius: RADIUS_PILL,
    overflow: "hidden",
    marginBottom: 10,
  },

  compactPlayButton: {
    height: 58,
    borderRadius: RADIUS_PILL,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.025)",
    overflow: "hidden",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  compactPlayText: {
    color: TXT,
    fontSize: 17,
    lineHeight: 20,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
  },

  compactPlayArrow: {
    color: TXT_SOFT,
    fontSize: 24,
    lineHeight: 24,
    textAlign: "center",
    includeFontPadding: false,
    fontWeight: "300",
  },

  romanizationRow: {
    alignItems: "center",
  },

  capsuleShell: {
    width: 172,
    borderRadius: RADIUS_PILL,
    overflow: "hidden",
  },

  capsuleBlur: {
    minHeight: 46,
    borderRadius: RADIUS_PILL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: HAIR,
    overflow: "hidden",
  },

  capsuleInnerBorder: {
    borderRadius: RADIUS_PILL,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },

  capsuleText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 16,
    fontFamily: fonts.bold,
    textAlign: "center",
  },

  capsuleTextActive: {
    color: TXT,
  },
});
