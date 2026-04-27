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
// DESIGN SYSTEM — VOWEL COMBINATIONS
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  nebulaViolet: "#A855F7",
  deepMagenta: "#D946EF",
  glowViolet: "rgba(168, 85, 247, 0.15)",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "fusion",
    title: "La Fusion",
    koreanTitle: "모음의 결합 (Gyeolhap)",
    description:
      "Quand deux voyelles de base s'unissent pour créer un nouveau son.",
    accent: COLORS.nebulaViolet,
    image:
      "https://images.unsplash.com/photo-1464802686167-b939a67e06a1?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Maître",
        kr: "ㅏ와 ㅣ가 만나면 ㅐ가 됩니다.",
        fr: "Quand ㅏ (a) et ㅣ (i) se rencontrent, cela devient ㅐ (ae).",
      },
      {
        char: "Élève",
        kr: "ㅐ와 ㅔ는 소리가 비슷하네요!",
        fr: "Les sons ㅐ (ae) et ㅔ (e) se ressemblent beaucoup !",
      },
    ],
    expressions: [
      {
        word: "ㅐ (ae)",
        rom: "ae",
        mean: "ㅏ + ㅣ",
        context: "Proche du 'é' français. Bouche assez ouverte.",
      },
      {
        word: "ㅔ (e)",
        rom: "e",
        mean: "ㅓ + ㅣ",
        context:
          "Très proche de ㅐ, mais la bouche est légèrement moins ouverte.",
      },
      {
        word: "ㅢ (ui)",
        rom: "ui",
        mean: "ㅡ + ㅣ",
        context: "Un son unique : on commence par 'eu' et on finit par 'i'.",
      },
    ],
  },
  {
    id: "wind-sounds",
    title: "Le Souffle (W)",
    koreanTitle: "이중모음 (W-sounds)",
    description: "Les voyelles 'glissées' qui commencent par un son 'W'.",
    accent: COLORS.deepMagenta,
    image:
      "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Guide",
        kr: "입술을 둥글게 해서 'ㅘ'라고 해보세요.",
        fr: "Arrondissez les lèvres et essayez de dire 'ㅘ' (wa).",
      },
      {
        char: "Moi",
        kr: "ㅘ... ㅝ... 입이 바쁘게 움직여요!",
        fr: "Wa... wo... la bouche bouge activement !",
      },
    ],
    expressions: [
      {
        word: "ㅘ (wa)",
        rom: "wa",
        mean: "ㅗ + ㅏ",
        context: "Comme le 'oi' de 'roi' mais commençant par 'o'.",
      },
      {
        word: "ㅝ (wo)",
        rom: "wo",
        mean: "ㅜ + ㅓ",
        context: "Comme le début de 'work' en anglais.",
      },
      {
        word: "ㅟ (wi)",
        rom: "wi",
        mean: "ㅜ + ㅣ",
        context: "Comme le 'oui' français, rapide et fluide.",
      },
    ],
  },
  {
    id: "vocabulary",
    title: "Mots Complexes",
    koreanTitle: "복잡한 단어 (Daneu)",
    description:
      "Reconnaître les voyelles composées dans des mots du quotidien.",
    accent: "#FACC15",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "사과가 정말 맛있어요!",
        fr: "La pomme (sa-gwa) est vraiment délicieuse !",
      },
      {
        char: "Moi",
        kr: "의사 선생님께 물어봐요.",
        fr: "Demande au docteur (ui-sa).",
      },
    ],
    expressions: [
      {
        word: "사과",
        rom: "sa-gwa",
        mean: "Pomme",
        context: "Utilise la voyelle ㅘ (wa).",
      },
      {
        word: "의사",
        rom: "ui-sa",
        mean: "Docteur",
        context: "Utilise la voyelle ㅢ (ui).",
      },
      {
        word: "세계",
        rom: "se-gye",
        mean: "Monde",
        context: "Utilise la voyelle ㅖ (ye).",
      },
    ],
  },
];

export default function CompoundVowelsImmersion() {
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
              <Text style={styles.backText}>COMPLEXITÉ</Text>
            </Pressable>
            <View style={[styles.badge, { borderColor: activeScene.accent }]}>
              <Text style={[styles.badgeText, { color: activeScene.accent }]}>
                VOWELS 02
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
              <Text style={styles.toolboxTitle}>COMPOUND TOOLBOX</Text>
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
