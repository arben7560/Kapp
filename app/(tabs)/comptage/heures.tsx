import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — NEON TWILIGHT EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  electricPurple: "#A855F7",
  nightBlue: "#3B82F6",
  twilightPink: "#E879F9",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "appointment",
    title: "Le Rendez-vous",
    koreanTitle: "약속 시간 (Yaksok Sigan)",
    description: "Fixer l'heure exacte d'une rencontre à la station Gangnam.",
    accent: COLORS.electricPurple,
    image:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "우리 몇 시에 만날까요?",
        fr: "À quelle heure nous voyons-nous ?",
      },
      {
        char: "Moi",
        kr: "일곱 시 삼십분에 봐요.",
        fr: "Voyons-nous à 7h30 (Ilgop-si Sam-sip-bun).",
      },
    ],
    expressions: [
      {
        word: "시 / 분",
        rom: "Si / Bun",
        mean: "Heure / Minute",
        context: "Si (Natif) pour l'heure, Bun (Sino) pour la minute.",
      },
      {
        word: "일곱 시",
        rom: "Ilgop-si",
        mean: "7 heures",
        context: "Utilise le système natif (Hana, Dul, Set...).",
      },
      {
        word: "삼십분 / 반",
        rom: "Sam-sip-bun / Ban",
        mean: "30 minutes / Demi",
        context: "Utilise le système sino (Il, I, Sam...).",
      },
    ],
  },
  {
    id: "last-train",
    title: "Le Dernier Métro",
    koreanTitle: "막차 시간 (Mak-cha)",
    description: "Vérifier l'heure du dernier train pour ne pas rester bloqué.",
    accent: COLORS.nightBlue,
    image:
      "https://images.unsplash.com/photo-1494883441020-00d72bd1f3b3?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "막차가 몇 시예요?",
        fr: "C'est à quelle heure le dernier train ?",
      },
      {
        char: "Agent",
        kr: "밤 열두 시 십오 분에 끊겨요.",
        fr: "Il s'arrête à minuit 15 (Yeol-du-si Sip-oh-bun).",
      },
    ],
    expressions: [
      {
        word: "열두 시",
        rom: "Yeol-du-si",
        mean: "12 heures (Minuit/Midi)",
        context: "Yeol-dul devient Yeol-du devant 'Si'.",
      },
      {
        word: "십오 분",
        rom: "Sip-oh-bun",
        mean: "15 minutes",
        context: "Comptage sino-coréen classique.",
      },
      {
        word: "오전 / 오후",
        rom: "Ojeon / Ohu",
        mean: "AM / PM",
        context: "Placé avant l'heure pour préciser le moment de la journée.",
      },
    ],
  },
  {
    id: "early-bird",
    title: "L'Aube à Séoul",
    koreanTitle: "새벽 (Saebyeok)",
    description: "Se lever tôt pour voir le lever du soleil sur le fleuve Han.",
    accent: COLORS.twilightPink,
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8bef99c17?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "지금 몇 시예요?",
        fr: "Il est quelle heure maintenant ?",
      },
      {
        char: "Ji-soo",
        kr: "새벽 다섯 시 사십오 분이에요.",
        fr: "Il est 5h45 (Daseot-si Sa-sip-oh-bun) du matin.",
      },
    ],
    expressions: [
      {
        word: "다섯 시",
        rom: "Daseot-si",
        mean: "5 heures",
        context: "Natif : Hana, Dul, Set, Net, Daseot.",
      },
      {
        word: "사십오 분",
        rom: "Sa-sip-oh-bun",
        mean: "45 minutes",
        context: "Sino : Sam-sip (30), Sa-sip (40), Oh (5).",
      },
      {
        word: "새벽",
        rom: "Saebyeok",
        mean: "Aube / Petit matin",
        context: "Désigne la période entre minuit et le lever du soleil.",
      },
    ],
  },
];

export default function TimeImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  }, [activeScene]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={{ uri: activeScene.image }} style={styles.bg}>
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* HEADER TIME */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SYSTÈME MIXTE</Text>
            </Pressable>
            <View
              style={[styles.timeBadge, { borderColor: activeScene.accent }]}
            >
              <Text
                style={[styles.timeBadgeText, { color: activeScene.accent }]}
              >
                REAL-TIME
              </Text>
            </View>
          </View>

          {/* CLOCK SELECTOR */}
          <View style={styles.tabRow}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeScene.id === scene.id && {
                      color: activeScene.accent,
                    },
                  ]}
                >
                  {scene.title}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* IMMERSIVE DIALOGUE CARD */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={40} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardInfo}>
                <Text style={[styles.krTitle, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.enTitle}>{activeScene.title}</Text>
                <Text style={styles.desc}>{activeScene.description}</Text>
              </View>

              <View style={styles.chatSection}>
                {activeScene.dialogue.map((line, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.bubble,
                      idx % 2 === 0 ? styles.bubbleL : styles.bubbleR,
                    ]}
                  >
                    <Text
                      style={[styles.charTag, { color: activeScene.accent }]}
                    >
                      {line.char}
                    </Text>
                    <Text style={styles.krLine}>{line.kr}</Text>
                    <Text style={styles.frLine}>{line.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* TIME TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>TIME TOOLBOX</Text>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.expGrid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={20}
                  tint="dark"
                  style={styles.expCard}
                >
                  <View
                    style={[
                      styles.expGlow,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.expContent}>
                    <Text style={styles.expWord}>{exp.word}</Text>
                    <Text
                      style={[styles.expRom, { color: activeScene.accent }]}
                    >
                      {exp.rom}
                    </Text>
                    <Text style={styles.expMean}>{exp.mean}</Text>
                    <Text style={styles.expCtx}>{exp.context}</Text>
                  </View>
                </BlurView>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.88)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 32, marginRight: 5 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  timeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1,
  },

  tabRow: { flexDirection: "row", gap: 8, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  mainCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardInfo: { marginBottom: 30 },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  enTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 32 },
  desc: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 18,
  },

  chatSection: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 16, borderRadius: 24 },
  bubbleL: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 4,
  },
  charTag: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  krLine: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 4,
  },
  frLine: { color: COLORS.muted, fontSize: 12, fontFamily: "Outfit_500Medium" },

  toolbox: { marginTop: 40 },
  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  toolboxTitle: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 3,
  },
  divider: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expGlow: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expContent: { padding: 20 },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  expCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
