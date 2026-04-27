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
// DESIGN SYSTEM — HANGUL FOUNDATION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  hangulCyan: "#22D3EE",
  pureWhite: "#F8FAFC",
  inkBlack: "#0F172A",
  glowBlue: "rgba(34, 211, 238, 0.15)",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "origin",
    title: "L'Origine Zen",
    koreanTitle: "천지인 (Cheon-Ji-In)",
    description:
      "Comprendre les 3 éléments : le Ciel (·), la Terre (ㅡ) et l'Homme (ㅣ).",
    accent: COLORS.hangulCyan,
    image:
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Maître",
        kr: "이 선은 땅이고, 이 선은 사람입니다.",
        fr: "Cette ligne est la Terre, et celle-ci est l'Homme.",
      },
      {
        char: "Élève",
        kr: "아! 그래서 'ㅣ'와 'ㅡ'가 기본이군요.",
        fr: "Ah ! C'est pour ça que 'ㅣ' et 'ㅡ' sont les bases.",
      },
    ],
    expressions: [
      {
        word: "ㅣ (i)",
        rom: "i",
        mean: "L'Homme",
        context: "Une ligne verticale représentant l'être humain debout.",
      },
      {
        word: "ㅡ (eu)",
        rom: "eu",
        mean: "La Terre",
        context: "Une ligne horizontale représentant le sol plat.",
      },
      {
        word: "ㅏ (a)",
        rom: "a",
        mean: "L'Homme + Ciel",
        context: "Le soleil (point) se lève à l'est de l'homme.",
      },
    ],
  },
  {
    id: "direction",
    title: "Le Flux d'Air",
    koreanTitle: "소리의 방향",
    description: "Comment la position du trait change radicalement le son.",
    accent: "#60A5FA",
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Guide",
        kr: "입을 크게 벌리고 'ㅏ'라고 하세요.",
        fr: "Ouvrez grand la bouche et dites 'a'.",
      },
      {
        char: "Moi",
        kr: "ㅏ... ㅓ... 입 모양이 정말 중요하네요!",
        fr: "A... eo... la forme de la bouche est vraiment importante !",
      },
    ],
    expressions: [
      {
        word: "ㅓ (eo)",
        rom: "eo",
        mean: "Son ouvert",
        context: "Proche du 'o' dans 'pomme', mais plus profond.",
      },
      {
        word: "ㅗ (o)",
        rom: "o",
        mean: "Son fermé",
        context: "Comme le 'o' de 'vélo', les lèvres bien rondes.",
      },
      {
        word: "ㅜ (u)",
        rom: "u",
        mean: "Son 'ou'",
        context: "Comme le 'ou' de 'loup', les lèvres projetées.",
      },
    ],
  },
  {
    id: "practice",
    title: "Premiers Mots",
    koreanTitle: "첫 단어 (Cheot Daneo)",
    description:
      "Lire vos premiers mots réels en utilisant uniquement les voyelles.",
    accent: "#F472B6",
    image:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Enfant",
        kr: "아이! 우유 주세요!",
        fr: "Bébé ! Donne-moi du lait !",
      },
      {
        char: "Maman",
        kr: "오이도 먹을래? 여기 있어.",
        fr: "Tu veux aussi du concombre ? Tiens.",
      },
    ],
    expressions: [
      {
        word: "아이",
        rom: "A-i",
        mean: "Enfant / Bébé",
        context: "Composé de ㅏ (a) et ㅣ (i).",
      },
      {
        word: "우유",
        rom: "U-yu",
        mean: "Lait",
        context: "Composé de ㅜ (u) et ㅠ (yu).",
      },
      {
        word: "오이",
        rom: "O-i",
        mean: "Concombre",
        context: "Composé de ㅗ (o) et ㅣ (i).",
      },
    ],
  },
];

export default function BasicVowelsImmersion() {
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
          {/* HEADER ALPHABET */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>MORPHOLOGIE</Text>
            </Pressable>
            <View style={[styles.badge, { borderColor: activeScene.accent }]}>
              <Text style={[styles.badgeText, { color: activeScene.accent }]}>
                VOWELS 01
              </Text>
            </View>
          </View>

          {/* PROGRESS SELECTOR */}
          <View style={styles.tabContainer}>
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

          {/* INTERACTIVE LEARNING CARD */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
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

              <View style={styles.cardHeader}>
                <Text style={[styles.krTitle, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.sceneTitle}>{activeScene.title}</Text>
                <Text style={styles.sceneDesc}>{activeScene.description}</Text>
              </View>

              <View style={styles.scriptSection}>
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

          {/* HANGUL TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>ALPHABET TOOLBOX</Text>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.grid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={25}
                  tint="dark"
                  style={styles.expCard}
                >
                  <View
                    style={[
                      styles.expAccent,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.expBody}>
                    <View style={styles.expHeaderRow}>
                      <View style={styles.expLeftInfo}>
                        <Text style={styles.expWord}>{exp.word}</Text>
                        <View
                          style={[
                            styles.pronounceBox,
                            { backgroundColor: `${activeScene.accent}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.expRom,
                              { color: activeScene.accent },
                            ]}
                          >
                            {exp.rom}
                          </Text>
                        </View>
                      </View>

                      {/* APPLE-LEVEL LISTEN BUTTON */}
                      <Pressable
                        style={({ pressed }) => [
                          styles.appleListenBtn,
                          {
                            transform: [{ scale: pressed ? 0.94 : 1 }],
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <BlurView
                          intensity={30}
                          tint="light"
                          style={styles.appleListenBlur}
                        >
                          <Text
                            style={[
                              styles.appleListenIcon,
                              { color: activeScene.accent },
                            ]}
                          >
                            ▶
                          </Text>
                          <Text style={styles.appleListenText}>ÉCOUTER</Text>
                        </BlurView>
                      </Pressable>
                    </View>

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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
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
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardHeader: { marginBottom: 30 },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 30,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 18,
  },

  scriptSection: { gap: 28 },
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
    fontSize: 12,
    letterSpacing: 3,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  grid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expBody: { padding: 20 },
  expHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expLeftInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 28,
  },
  pronounceBox: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  expRom: { fontSize: 12, fontFamily: "Outfit_700Bold" },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  expCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },

  // APPLE LISTEN BUTTON STYLES
  appleListenBtn: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  appleListenBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  appleListenIcon: {
    fontSize: 10,
    marginLeft: 2,
  },
  appleListenText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
});
