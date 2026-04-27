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
// DESIGN SYSTEM — ROMANCE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  romance: "#F472B6", // Rose Drama
  lavender: "#A78BFA",
  heart: "#FB7185",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "sogeting",
    title: "Le Sogeting",
    koreanTitle: "소개팅",
    description: "Le premier rendez-vous arrangé dans un café chic de Gangnam.",
    accent: COLORS.romance,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Jun-su",
        kr: "사진보다 실물이 더 예쁘시네요.",
        fr: "Vous êtes encore plus jolie qu'en photo.",
      },
      {
        char: "So-hee",
        kr: "아니에요. 준수 씨도 인상이 참 좋으세요.",
        fr: "Ce n'est rien. Vous avez une très bonne impression aussi, Jun-su.",
      },
    ],
    expressions: [
      {
        word: "소개팅",
        rom: "Sogeting",
        mean: "Blind Date",
        context: "Rendez-vous arrangé par des amis communs.",
      },
      {
        word: "이상형",
        rom: "Isang-hyeong",
        mean: "Type idéal",
        context: "La question incontournable du premier RDV.",
      },
      {
        word: "첫눈에 반하다",
        rom: "Cheonnune banhada",
        mean: "Coup de foudre",
        context: "Tomber amoureux au premier regard.",
      },
    ],
  },
  {
    id: "sseom",
    title: "Le 'Some'",
    koreanTitle: "썸 타는 중",
    description: "Flirt et tension au bord du fleuve Han à minuit.",
    accent: COLORS.lavender,
    image:
      "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Do-yun",
        kr: "밤공기가 차네요. 제 옷 입을래요?",
        fr: "L'air de la nuit est froid. Vous voulez porter mes vêtements ?",
      },
      {
        char: "Hae-in",
        kr: "우리 지금... 무슨 사이예요?",
        fr: "Nous... c'est quoi notre relation actuellement ?",
      },
    ],
    expressions: [
      {
        word: "썸",
        rom: "Sseom",
        mean: "Le 'Some'",
        context: "La phase d'ambiguïté avant d'être en couple.",
      },
      {
        word: "밀당",
        rom: "Mildang",
        mean: "Suis-moi je te fuis",
        context: "Le jeu de 'pousse-tire' émotionnel.",
      },
      {
        word: "보고 싶어",
        rom: "Bogo sipeo",
        mean: "Tu me manques",
        context: "Expression de manque et d'affection.",
      },
    ],
  },
  {
    id: "couple",
    title: "Le Couple",
    koreanTitle: "연인",
    description: "Promesse d'éternité à la N Seoul Tower.",
    accent: COLORS.heart,
    image:
      "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Tae-yang",
        kr: "나랑 사귈래? 평생 지켜줄게.",
        fr: "Veux-tu sortir avec moi ? Je te protégerai toute ma vie.",
      },
      {
        char: "Eun-ji",
        kr: "응! 우리 절대 헤어지지 말자.",
        fr: "Oui ! Ne nous séparons jamais.",
      },
    ],
    expressions: [
      {
        word: "사귀자",
        rom: "Sagwija",
        mean: "Sortons ensemble",
        context: "La phrase officielle pour devenir un couple.",
      },
      {
        word: "고무신",
        rom: "Gomusin",
        mean: "Attendre son militaire",
        context: "Expression pour une fille dont le copain est à l'armée.",
      },
      {
        word: "영원히",
        rom: "Yeongwonhi",
        mean: "Pour toujours",
        context: "Le serment romantique ultime.",
      },
    ],
  },
];

export default function RomanceDating() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
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
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL NOCTURNE</Text>
            </Pressable>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: activeScene.accent },
              ]}
            >
              <Text style={styles.statusText}>EN SCÈNE</Text>
            </View>
          </View>

          {/* SCENE NAVIGATOR */}
          <View style={styles.sceneTabs}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    borderBottomColor: scene.accent,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.koreanTitle}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* MAIN HERO CARD */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={50} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}30`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />
              <Text
                style={[styles.sceneCategory, { color: activeScene.accent }]}
              >
                {activeScene.koreanTitle}
              </Text>
              <Text style={styles.sceneTitle}>{activeScene.title}</Text>
              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <View style={styles.chatContainer}>
                {activeScene.dialogue.map((chat, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.bubble,
                      idx % 2 === 0 ? styles.bubbleLeft : styles.bubbleRight,
                    ]}
                  >
                    <Text
                      style={[styles.charLabel, { color: activeScene.accent }]}
                    >
                      {chat.char}
                    </Text>
                    <Text style={styles.krText}>{chat.kr}</Text>
                    <Text style={styles.frText}>{chat.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* ROMANCE TOOLBOX */}
          <View style={styles.toolboxSection}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxIcon}>💖</Text>
              <Text style={styles.toolboxTitle}>DATING TOOLBOX</Text>
            </View>

            <View style={styles.expList}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={20}
                  tint="dark"
                  style={styles.expCard}
                >
                  <View
                    style={[
                      styles.expLeftBorder,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.expContent}>
                    <View style={styles.expRow}>
                      <Text style={styles.expKr}>{exp.word}</Text>
                      <Text
                        style={[styles.expRom, { color: activeScene.accent }]}
                      >
                        [{exp.rom}]
                      </Text>
                    </View>
                    <Text style={styles.expMean}>{exp.mean}</Text>
                    <Text style={styles.expContext}>{exp.context}</Text>
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
    backgroundColor: "rgba(2,3,6,0.75)",
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 30, marginRight: 8 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#000", fontFamily: "Outfit_700Bold", fontSize: 9 },

  sceneTabs: {
    flexDirection: "row",
    marginBottom: 25,
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tab: { paddingBottom: 10 },
  tabText: {
    color: COLORS.muted,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
  },

  mainCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sceneCategory: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    marginBottom: 4,
  },
  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 32,
    marginBottom: 10,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 30,
  },

  chatContainer: { gap: 24 },
  bubble: { maxWidth: "88%", padding: 16, borderRadius: 20 },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderTopRightRadius: 4,
  },
  charLabel: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  krText: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 4,
  },
  frText: { color: COLORS.muted, fontSize: 12, fontFamily: "Outfit_500Medium" },

  toolboxSection: { marginTop: 35 },
  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  toolboxIcon: { fontSize: 18 },
  toolboxTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
    letterSpacing: 2,
  },

  expList: { gap: 12 },
  expCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  expLeftBorder: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expContent: { padding: 18 },
  expRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 6,
  },
  expKr: { color: COLORS.txt, fontFamily: "NotoSansKR_700Bold", fontSize: 20 },
  expRom: { fontSize: 11, fontFamily: "Outfit_700Bold" },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    marginBottom: 4,
  },
  expContext: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
});
