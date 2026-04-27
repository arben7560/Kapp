import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../../assets/images/seoul-hub-bg.jpg");

// --- DESIGN SYSTEM HARMONISÉ ---
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const VIOLET = "#A78BFA";
const TXT_PRIMARY = "#FFFFFF";
const TXT_SECONDARY = "rgba(255,255,255,0.80)";
const MUTED = "rgba(255,255,255,0.45)";
const GLASS_BORDER = "rgba(255,255,255,0.18)";

// --- DATA & ASSETS ---
const TENSE_DATA = [
  {
    char: "ㄲ",
    ex: "까",
    roma: "kk",
    desc: "Son sec et contracté",
    tone: CYAN,
  },
  {
    char: "ㄸ",
    ex: "따",
    roma: "tt",
    desc: "Attaque forte, sans souffle",
    tone: PINK,
  },
  {
    char: "ㅃ",
    ex: "빠",
    roma: "pp",
    desc: "Explosion labiale tendue",
    tone: VIOLET,
  },
  { char: "ㅆ", ex: "싸", roma: "ss", desc: "Sifflante intense", tone: CYAN },
  {
    char: "ㅉ",
    ex: "짜",
    roma: "jj",
    desc: "Son 'dj' très marqué",
    tone: PINK,
  },
];

const CONTRASTS = [
  {
    id: "g-kk",
    left: { char: "ㄱ", roma: "g", tone: VIOLET },
    right: { char: "ㄲ", roma: "kk", tone: CYAN },
    accent: CYAN,
  },
  {
    id: "d-tt",
    left: { char: "ㄷ", roma: "d", tone: CYAN },
    right: { char: "ㄸ", roma: "tt", tone: PINK },
    accent: PINK,
  },
];

const CONTRAST_SPEECH_TEXTS = [
  { left: "가", right: "까" },
  { left: "다", right: "따" },
];

const TENSE_SPEECH_TEXTS = ["까", "따", "빠", "싸", "짜"];

// --- MINI COMPONENTS (SIGNATURES) ---

const NeonHeaderLine = ({ color = PINK }) => (
  <View
    style={[styles.neonBar, { backgroundColor: color, shadowColor: color }]}
  />
);

const AudioVisualizer = ({ active }: { active: boolean }) => (
  <View style={styles.waveContainer}>
    {[1, 2, 3, 4].map((i) => (
      <View
        key={i}
        style={[
          styles.waveBar,
          { height: active ? 8 + Math.random() * 12 : 4 },
        ]}
      />
    ))}
  </View>
);

const PremiumSettingsBtn = () => (
  <Pressable
    style={styles.settingsCircle}
    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
  >
    <Text style={styles.settingsIconText}>⚙</Text>
  </Pressable>
);

export default function ConsonantsDoubleScreen() {
  const [index, setIndex] = useState(0);
  const [contrastIdx, setContrastIdx] = useState(0);
  const [showRoman, setShowRoman] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const current = TENSE_DATA[index];
  const contrast = CONTRASTS[contrastIdx];
  const contrastSpeech = CONTRAST_SPEECH_TEXTS[contrastIdx];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => stopSpeech();
  }, []);

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Medium) =>
    Haptics.impactAsync(style);

  const handlePlay = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPlaying(true);
    await speakKorean(TENSE_SPEECH_TEXTS[index]);
    setIsPlaying(false);
  };

  const animateSwitch = (direction: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction * 30,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const nextIdx =
        direction === 1
          ? (index + 1) % TENSE_DATA.length
          : (index - 1 + TENSE_DATA.length) % TENSE_DATA.length;
      setIndex(nextIdx);

      slideAnim.setValue(direction * -30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={StyleSheet.absoluteFill}
        blurRadius={12}
      >
        <LinearGradient
          colors={["rgba(5,5,15,0.9)", "rgba(10,13,30,0.98)"]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={{ flex: 1 }}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.navEyebrow}>SÉOUL IMMERSION</Text>
              <Text style={styles.navTitle}>Consonnes Tendues</Text>
            </View>
            <PremiumSettingsBtn />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Signature Titre */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Doubles</Text>
              <NeonHeaderLine color={PINK} />
            </View>

            <Text style={styles.sectionLabel}>FORCE ET TENSION</Text>

            {/* Main Study Card */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={80} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.15)", "transparent"]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View
                      style={[
                        styles.liveDot,
                        isPlaying && {
                          backgroundColor: CYAN,
                          shadowOpacity: 1,
                        },
                      ]}
                    />
                    <Text style={styles.liveText}>TENSE VOICE</Text>
                  </View>
                  <Text style={styles.counterText}>
                    {index + 1} / {TENSE_DATA.length}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Animated.View
                    style={[
                      styles.wordContent,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[
                        styles.krBig,
                        {
                          transform: [{ scale: pulseAnim }],
                          textShadowColor: current.tone,
                        },
                      ]}
                    >
                      {current.char}
                    </Animated.Text>
                    {showRoman && (
                      <Text style={[styles.romanBig, { color: current.tone }]}>
                        {current.roma.toUpperCase()}
                      </Text>
                    )}
                    <View style={styles.descBadge}>
                      <Text style={styles.descText}>{current.desc}</Text>
                    </View>
                  </Animated.View>
                </View>

                {/* Commandes d'action */}
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.navBtnSmall}
                    onPress={() => animateSwitch(-1)}
                  >
                    <Text style={styles.navBtnIcon}>‹</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.mainPlayBtn,
                      pressed && { transform: [{ scale: 0.96 }] },
                    ]}
                    onPress={handlePlay}
                  >
                    <LinearGradient
                      colors={[current.tone, "#4F46E5"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.playGradient}
                    >
                      <AudioVisualizer active={isPlaying} />
                      <Text style={styles.playBtnText}>ÉCOUTER</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable
                    style={styles.navBtnSmall}
                    onPress={() => animateSwitch(1)}
                  >
                    <Text style={styles.navBtnIcon}>›</Text>
                  </Pressable>
                </View>
              </BlurView>
            </View>

            {/* Section Contrastes */}
            <Text style={styles.sectionLabel}>DISTINCTION VISUELLE</Text>
            <View style={styles.contrastContainer}>
              <View style={styles.contrastRow}>
                {[contrast.left, contrast.right].map((item, i) => (
                  <Pressable
                    key={i}
                    style={styles.halfCard}
                    onPress={() => {
                      triggerHaptic();
                      speakKorean(i === 0 ? contrastSpeech.left : contrastSpeech.right);
                    }}
                  >
                    <BlurView
                      intensity={50}
                      tint="dark"
                      style={styles.halfGlass}
                    >
                      <View
                        style={[
                          styles.cardGlow,
                          { backgroundColor: item.tone },
                        ]}
                      />
                      <Text style={styles.contrastKr}>{item.char}</Text>
                      <Text style={[styles.contrastRo, { color: item.tone }]}>
                        {item.roma}
                      </Text>
                    </BlurView>
                  </Pressable>
                ))}
                <View style={styles.absoluteArrow}>
                  <Text
                    style={[
                      styles.neonArrow,
                      {
                        color: contrast.accent,
                        textShadowColor: contrast.accent,
                      },
                    ]}
                  >
                    →
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.diffButton}
                onPress={() => {
                  triggerHaptic();
                  speakKorean(contrastSpeech.left);
                  setTimeout(() => speakKorean(contrastSpeech.right), 1000);
                }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.05)"]}
                  style={styles.diffGradient}
                >
                  <Text style={styles.diffText}>COMPARER LES SONS</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Footer de contrôle */}
            <View style={styles.footer}>
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  setShowRoman(!showRoman);
                }}
                style={styles.toggleBtn}
              >
                <Text style={[styles.toggleText, showRoman && { color: CYAN }]}>
                  ROMANISATION : {showRoman ? "ON" : "OFF"}
                </Text>
                {showRoman && <View style={styles.activeDot} />}
              </Pressable>
            </View>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050508" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  scrollContent: { paddingHorizontal: 24 },

  settingsCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIconText: { color: MUTED, fontSize: 18 },
  backBtn: { marginRight: 16 },
  backIcon: { color: "#fff", fontSize: 32 },
  navEyebrow: {
    color: PINK,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  navTitle: { color: TXT_SECONDARY, fontSize: 13 },

  heroSection: { marginVertical: 20 },
  heroTitle: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  neonBar: {
    width: 45,
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    shadowRadius: 15,
    shadowOpacity: 0.8,
  },

  sectionLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.5,
    marginBottom: 15,
  },
  mainCardContainer: { marginBottom: 35 },
  glassCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1.2,
    borderColor: GLASS_BORDER,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    shadowRadius: 4,
  },
  liveText: { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  counterText: { color: MUTED, fontSize: 12, fontWeight: "800" },

  cardBody: { alignItems: "center", justifyContent: "center", minHeight: 220 },
  wordContent: { alignItems: "center" },
  krBig: {
    color: "#fff",
    fontSize: 125,
    fontWeight: "800",
    textShadowRadius: 30,
  },
  romanBig: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: -5,
    letterSpacing: 6,
  },
  descBadge: {
    marginTop: 25,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  descText: { color: TXT_SECONDARY, fontSize: 14, fontStyle: "italic" },

  actionRow: { flexDirection: "row", alignItems: "center", marginTop: 30 },
  navBtnSmall: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  navBtnIcon: { color: "#fff", fontSize: 28, fontWeight: "300" },
  mainPlayBtn: {
    flex: 1,
    height: 60,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  playGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  playBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  waveContainer: { flexDirection: "row", gap: 4, alignItems: "center" },
  waveBar: { width: 3, backgroundColor: "#fff", borderRadius: 2, opacity: 0.9 },

  contrastContainer: { marginBottom: 35 },
  contrastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  halfCard: {
    width: "45%",
    height: 170,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  halfGlass: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.15,
    filter: "blur(25px)",
  },
  contrastKr: { color: "#fff", fontSize: 58, fontWeight: "700" },
  contrastRo: { fontSize: 18, fontWeight: "900", marginTop: 6 },
  absoluteArrow: {
    position: "absolute",
    left: "45%",
    right: "45%",
    alignItems: "center",
  },
  neonArrow: {
    fontSize: 28,
    fontWeight: "bold",
    shadowRadius: 12,
    shadowOpacity: 1,
  },

  diffButton: {
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  diffGradient: { paddingVertical: 20, alignItems: "center" },
  diffText: {
    color: TXT_SECONDARY,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  footer: { alignItems: "center", marginTop: 15 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  toggleText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CYAN,
    shadowColor: CYAN,
    shadowRadius: 8,
    shadowOpacity: 1,
  },
  bottomSpace: { height: 120 },
});

async function speakKorean(text: string) {
  return new Promise<void>((resolve) => {
    stopSpeech();
    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.85,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

function stopSpeech() {
  try {
    Speech.stop();
  } catch {}
}
