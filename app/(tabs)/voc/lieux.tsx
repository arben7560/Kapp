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

// --- DESIGN SYSTEM ---
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const AMBER = "#FFB347";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.60)";

// --- DATA ---
const ESSENTIALS = [
  { id: "1", kr: "건물", roman: "geonmul", fr: "bâtiment" },
  { id: "2", kr: "가게", roman: "gage", fr: "magasin" },
  { id: "3", kr: "카페", roman: "kape", fr: "café" },
  { id: "4", kr: "식당", roman: "sikdang", fr: "restaurant" },
  { id: "5", kr: "편의점", roman: "pyeonuijeom", fr: "supérette" },
  { id: "6", kr: "병원", roman: "byeongwon", fr: "hôpital" },
  { id: "7", kr: "약국", roman: "yakguk", fr: "pharmacie" },
  { id: "8", kr: "호텔", roman: "hotel", fr: "hôtel" },
];

const PHRASES = [
  { id: "p1", kr: "여기 어디예요?", fr: "On est où, ici ?", accent: PINK },
  {
    id: "p2",
    kr: "화장실이 어디예요?",
    fr: "Où sont les toilettes ?",
    accent: CYAN,
  },
  { id: "p3", kr: "이 건물 1층에 있어요.", fr: "C’est au RDC.", accent: AMBER },
];

const QUIZ_ITEMS = [
  {
    id: "q1",
    prompt: "Quel mot veut dire “sous-sol” ?",
    say: "지하",
    choices: ["지하", "2층"],
    correctIndex: 0,
  },
];

// --- UTILS ---
const triggerHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: "ko-KR", rate: 0.9 });
};

export default function BuildingsCyber() {
  const [wordIndex, setWordIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  const currentWord = ESSENTIALS[wordIndex];

  // Animation du scanner
  useEffect(() => {
    const startScan = () => {
      scanAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    startScan();
  }, []);

  const translateYScan = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 120],
  });

  const animateChange = (direction: number) => {
    triggerHaptic();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction * 25,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 1)
        setWordIndex((prev) => (prev + 1) % ESSENTIALS.length);
      else
        setWordIndex(
          (prev) => (prev - 1 + ESSENTIALS.length) % ESSENTIALS.length,
        );

      slideAnim.setValue(direction * -25);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={StyleSheet.absoluteFill}
        blurRadius={15} // Un peu plus de flou pour la profondeur
      >
        {/* Overlay plus léger pour voir la ville */}
        <LinearGradient
          colors={["rgba(2,3,6,0.7)", "rgba(10,13,26,0.92)"]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Navigation Header */}
            <View style={styles.topNav}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backCircle}
              >
                <Text style={styles.backArrow}>‹</Text>
              </Pressable>
              <View>
                <Text style={styles.navEyebrow}>SÉOUL IMMERSION</Text>
                <Text style={styles.navTitle}>Exploration</Text>
              </View>
            </View>

            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Lieux</Text>
              <View style={styles.neonBar} />
            </View>

            {/* --- MAIN INTERACTIVE WORD CARD --- */}
            <View style={styles.mainCardContainer}>
              <BlurView intensity={50} tint="dark" style={styles.glassCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.12)", "transparent"]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardHeader}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>URBAN SCANNER</Text>
                  </View>
                  <Text style={styles.counterText}>
                    {wordIndex + 1} / {ESSENTIALS.length}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Pressable
                    style={styles.navBtn}
                    onPress={() => animateChange(-1)}
                  >
                    <BlurView intensity={20} style={styles.navBtnBlur}>
                      <Text style={styles.navBtnText}>‹</Text>
                    </BlurView>
                  </Pressable>

                  {/* Word Area with Scanner Effect */}
                  <View style={styles.wordArea}>
                    {/* Scanner Visual Brackets */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />

                    {/* Animated Scan Line */}
                    <Animated.View
                      style={[
                        styles.scanLine,
                        { transform: [{ translateY: translateYScan }] },
                      ]}
                    />

                    <Animated.View
                      style={[
                        styles.wordContent,
                        {
                          opacity: fadeAnim,
                          transform: [{ translateX: slideAnim }],
                        },
                      ]}
                    >
                      <Text style={styles.krBig}>{currentWord.kr}</Text>
                      <Text style={styles.romanBig}>{currentWord.roman}</Text>
                      <Text style={styles.frBig}>{currentWord.fr}</Text>
                    </Animated.View>
                  </View>

                  <Pressable
                    style={styles.navBtn}
                    onPress={() => animateChange(1)}
                  >
                    <BlurView intensity={20} style={styles.navBtnBlur}>
                      <Text style={styles.navBtnText}>›</Text>
                    </BlurView>
                  </Pressable>
                </View>

                {/* Harmonized Premium CTA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.bigPlayBtn,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    speakKo(currentWord.kr);
                  }}
                >
                  <LinearGradient
                    colors={["rgba(244,114,182,0.9)", "rgba(147,51,234,0.9)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.playGradient}
                  >
                    <Text style={styles.playBtnText}>DÉCODER LE LIEU</Text>
                    <View style={styles.btnGlow} />
                  </LinearGradient>
                </Pressable>
              </BlurView>
            </View>

            {/* --- INSIGHT CARD --- */}
            <BlurView intensity={20} tint="dark" style={styles.insightCard}>
              <View
                style={[styles.insightAccent, { backgroundColor: AMBER }]}
              />
              <Text style={styles.insightTitle}>Astuce Urbaine</Text>
              <Text style={styles.insightText}>
                À Séoul, les numéros d'étages sont cruciaux. "1층" est souvent
                le niveau de la rue, mais attention aux "지하" (sous-sols) très
                animés.
              </Text>
            </BlurView>

            {/* --- PHRASES SECTION --- */}
            <Text style={styles.sectionLabel}>CONTEXTE RÉEL</Text>
            {PHRASES.map((item) => (
              <Pressable
                key={item.id}
                style={styles.phraseItem}
                onPress={() => {
                  triggerHaptic();
                  speakKo(item.kr);
                }}
              >
                <BlurView intensity={20} tint="dark" style={styles.phraseBlur}>
                  <View
                    style={[
                      styles.phraseAccentLine,
                      { backgroundColor: item.accent },
                    ]}
                  />
                  <View style={styles.phraseTextContainer}>
                    <Text style={styles.phraseKr}>{item.kr}</Text>
                    <Text style={styles.phraseFr}>{item.fr}</Text>
                  </View>
                  <View
                    style={[styles.miniPlayIcon, { borderColor: item.accent }]}
                  >
                    <Text style={{ color: item.accent, fontSize: 10 }}>▶</Text>
                  </View>
                </BlurView>
              </Pressable>
            ))}

            <View style={{ height: 80 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020306" },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10 },

  // Header
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  backArrow: { color: "#fff", fontSize: 24, marginTop: -2 },
  navEyebrow: {
    color: PINK,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  navTitle: { color: "#fff", fontSize: 14, fontWeight: "600", opacity: 0.8 },

  // Hero
  heroSection: { marginBottom: 35 },
  heroTitle: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "900",
    letterSpacing: -2,
  },
  neonBar: {
    width: 50,
    height: 4,
    backgroundColor: CYAN,
    borderRadius: 2,
    shadowColor: CYAN,
    shadowRadius: 12,
    shadowOpacity: 0.8,
  },

  // Main Card
  mainCardContainer: { marginBottom: 30 },
  glassCard: {
    borderRadius: 40, // Plus arrondi pour le premium
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.3)",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CYAN },
  liveText: { color: CYAN, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  counterText: { color: MUTED, fontSize: 11, fontWeight: "700" },

  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  wordArea: {
    flex: 1,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    position: "relative",
  },

  // SCANNER EFFECT
  scanLine: {
    position: "absolute",
    left: "10%",
    right: "10%",
    height: 2,
    backgroundColor: CYAN,
    shadowColor: CYAN,
    shadowRadius: 10,
    shadowOpacity: 1,
    zIndex: 10,
  },
  corner: {
    position: "absolute",
    width: 15,
    height: 15,
    borderColor: "rgba(34,211,238,0.4)",
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  navBtnBlur: { flex: 1, alignItems: "center", justifyContent: "center" },
  navBtnText: { color: "#fff", fontSize: 24, fontWeight: "300" },

  wordContent: { alignItems: "center" },
  krBig: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "800",
    textShadowColor: "rgba(34,211,238,0.5)",
    textShadowRadius: 20,
  },
  romanBig: {
    color: CYAN,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 2,
  },
  frBig: { color: MUTED, fontSize: 15, marginTop: 4, fontStyle: "italic" },

  // HARMONIZED CTA
  bigPlayBtn: {
    height: 62,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 30,
    // Ombre de bouton
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  playBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    zIndex: 2,
  },
  btnGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  // Insight Card
  insightCard: {
    padding: 22,
    borderRadius: 30,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  insightAccent: {
    position: "absolute",
    left: 0,
    top: 25,
    bottom: 25,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  insightTitle: {
    color: AMBER,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  insightText: { color: MUTED, fontSize: 14, lineHeight: 22 },

  // Phrases
  sectionLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 15,
  },
  phraseItem: {
    marginBottom: 12,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  phraseBlur: { flexDirection: "row", alignItems: "center", padding: 18 },
  phraseAccentLine: {
    width: 4,
    height: "60%",
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  phraseTextContainer: { flex: 1, marginLeft: 12 },
  phraseKr: { color: "#fff", fontSize: 17, fontWeight: "700" },
  phraseFr: { color: MUTED, fontSize: 13, marginTop: 3 },
  miniPlayIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
});
