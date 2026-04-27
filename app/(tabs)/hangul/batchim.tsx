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

// --- DATA ---
const BATCHIM_DATA = [
  { char: "ㄱ", ex: "책", roma: "k", desc: "Son final 'K' net", tone: VIOLET },
  { char: "ㄴ", ex: "안", roma: "n", desc: "Son final 'N' nasal", tone: CYAN },
  {
    char: "ㄹ",
    ex: "달",
    roma: "l",
    desc: "Son final 'L' liquide",
    tone: PINK,
  },
  {
    char: "ㅁ",
    ex: "엄",
    roma: "m",
    desc: "Son final 'M' fermé",
    tone: VIOLET,
  },
  { char: "ㅂ", ex: "입", roma: "p", desc: "Son final 'P' labial", tone: CYAN },
  {
    char: "ㅇ",
    ex: "강",
    roma: "ng",
    desc: "Son final 'NG' guttural",
    tone: PINK,
  },
];

const CONTRASTS = [
  {
    id: "gan-gang",
    left: { word: "간", final: "ㄴ", roma: "gan", tone: CYAN },
    right: { word: "강", final: "ㅇ", roma: "gang", tone: PINK },
    accent: CYAN,
  },
  {
    id: "san-sang",
    left: { word: "산", final: "ㄴ", roma: "san", tone: CYAN },
    right: { word: "상", final: "ㅇ", roma: "sang", tone: PINK },
    accent: PINK,
  },
  {
    id: "hyeon-hyeong",
    left: { word: "현", final: "ㄴ", roma: "hyeon", tone: VIOLET },
    right: { word: "형", final: "ㅇ", roma: "hyeong", tone: CYAN },
    accent: VIOLET,
  },
  {
    id: "ban-bang",
    left: { word: "반", final: "ㄴ", roma: "ban", tone: PINK },
    right: { word: "방", final: "ㅇ", roma: "bang", tone: CYAN },
    accent: CYAN,
  },
  {
    id: "mun-mung",
    left: { word: "문", final: "ㄴ", roma: "mun", tone: VIOLET },
    right: { word: "뭉", final: "ㅇ", roma: "mung", tone: PINK },
    accent: PINK,
  },
];

const CONTRAST_SPEECH_TEXTS = [
  { left: "간", right: "강" },
  { left: "산", right: "상" },
  { left: "현", right: "형" },
  { left: "반", right: "방" },
  { left: "문", right: "뭉" },
];

// --- MINI COMPONENTS (SIGNATURES) ---

const NeonHeaderLine = ({ color = CYAN }) => (
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

export default function BatchimScreen() {
  const [index, setIndex] = useState(0);
  const [contrastIdx, setContrastIdx] = useState(0);
  const [showRoman, setShowRoman] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const current = BATCHIM_DATA[index];
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
  }, []);

  const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Medium) =>
    Haptics.impactAsync(style);

  const speak = (text: string) => {
    Speech.stop();
    setIsPlaying(true);
    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.85,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
    });
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
      setIndex((prev) =>
        direction === 1
          ? (prev + 1) % BATCHIM_DATA.length
          : (prev - 1 + BATCHIM_DATA.length) % BATCHIM_DATA.length,
      );
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

  const navigateContrast = (direction: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setContrastIdx((prev) =>
      direction === 1
        ? (prev + 1) % CONTRASTS.length
        : (prev - 1 + CONTRASTS.length) % CONTRASTS.length,
    );
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
              <Text style={styles.navTitle}>Consonnes Finales</Text>
            </View>
            <PremiumSettingsBtn />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Batchim</Text>
              <NeonHeaderLine color={CYAN} />
            </View>

            <Text style={styles.sectionLabel}>STRUCTURE SYLLABIQUE</Text>

            {/* Main Interactive Card */}
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
                          backgroundColor: PINK,
                          shadowOpacity: 1,
                        },
                      ]}
                    />
                    <Text style={styles.liveText}>FINAL SOUND</Text>
                  </View>
                  <Text style={styles.counterText}>
                    {index + 1} / {BATCHIM_DATA.length}
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
                      {current.ex}
                    </Animated.Text>
                    {showRoman && (
                      <Text style={[styles.romanBig, { color: current.tone }]}>
                        Fin : {current.char} [{current.roma.toUpperCase()}]
                      </Text>
                    )}
                    <View style={styles.descBadge}>
                      <Text style={styles.descText}>{current.desc}</Text>
                    </View>
                  </Animated.View>
                </View>

                {/* Action Controls */}
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
                    onPress={() => {
                      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
                      speak(current.ex);
                    }}
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
            <Text style={styles.sectionLabel}>COMPARATIF DES FINALES</Text>
            <View style={styles.contrastContainer}>
              <View style={styles.contrastRow}>
                <Pressable
                  style={[styles.sideContrastArrow, styles.sideContrastArrowLeft]}
                  onPress={() => navigateContrast(-1)}
                  hitSlop={12}
                >
                  <Text style={styles.sideContrastArrowText}>‹</Text>
                </Pressable>

                {[contrast.left, contrast.right].map((item, i) => (
                  <Pressable
                    key={item.roma}
                    style={styles.halfCard}
                    onPress={() => {
                      triggerHaptic();
                      speak(i === 0 ? contrastSpeech.left : contrastSpeech.right);
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
                      <Text style={styles.contrastKr}>{item.word}</Text>
                      <Text style={[styles.contrastRo, { color: item.tone }]}>
                        {item.roma}
                      </Text>
                      <Text style={styles.contrastFinal}>finale {item.final}</Text>
                    </BlurView>
                  </Pressable>
                ))}

                <Pressable
                  style={[styles.sideContrastArrow, styles.sideContrastArrowRight]}
                  onPress={() => navigateContrast(1)}
                  hitSlop={12}
                >
                  <Text style={styles.sideContrastArrowText}>›</Text>
                </Pressable>

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
                  speak(contrastSpeech.left);
                  setTimeout(() => speak(contrastSpeech.right), 1000);
                }}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.05)"]}
                  style={styles.diffGradient}
                >
                  <Text style={styles.diffText}>ÉCOUTER LA DIFFÉRENCE</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Toggle Romanisation */}
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
    elevation: 10,
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
    fontSize: 100,
    fontWeight: "800",
    textShadowRadius: 30,
  },
  romanBig: { fontSize: 18, fontWeight: "900", marginTop: 5, letterSpacing: 2 },
  descBadge: {
    marginTop: 20,
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
    fontSize: 13,
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
  sideContrastArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  sideContrastArrowLeft: { left: -18 },
  sideContrastArrowRight: { right: -18 },
  sideContrastArrowText: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 36,
    fontWeight: "200",
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
  contrastFinal: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
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
