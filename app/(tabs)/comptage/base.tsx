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
// DESIGN SYSTEM — NATIVE ROOTS EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  nativeCyan: "#22D3EE",
  indigoDeep: "#4F46E5",
  softViolet: "#A78BFA",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "cafe",
    title: "Au Café",
    koreanTitle: "카페에서 (Café-eseo)",
    description: "Compter les articles lors d'une commande de groupe.",
    accent: COLORS.nativeCyan,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "아메리카노 세 잔 주세요.",
        fr: "Donnez-moi trois (set) americanos s'il vous plaît.",
      },
      {
        char: "Barista",
        kr: "네, 세 잔 확인했습니다.",
        fr: "D'accord, trois (set) verres confirmés.",
      },
    ],
    expressions: [
      {
        word: "하나, 둘, 셋",
        rom: "Hana, Dul, Set",
        mean: "1, 2, 3",
        context: "Les bases du système natif pour les petits objets.",
      },
      {
        word: "세 잔",
        rom: "Se-jan",
        mean: "Trois verres",
        context: "Notez comment 'Set' devient 'Se' devant un classificateur.",
      },
      {
        word: "몇 개예요?",
        rom: "Myeot gae-yeyo?",
        mean: "Combien y en a-t-il ?",
        context: "Question essentielle pour demander une quantité.",
      },
    ],
  },
  {
    id: "workout",
    title: "Entraînement",
    koreanTitle: "운동 (Undong)",
    description: "Le rythme du comptage de 1 à 10 dans un parc de Séoul.",
    accent: COLORS.softViolet,
    image:
      "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Coach",
        kr: "여덟, 아홉, 열! 마지막 하나 더!",
        fr: "Huit, neuf, dix ! Un dernier de plus !",
      },
      {
        char: "Moi",
        kr: "하나... 둘... 너무 힘들어요!",
        fr: "Un... deux... c'est trop dur !",
      },
    ],
    expressions: [
      {
        word: "여덟, 아홉, 열",
        rom: "Yeodeol, Ahop, Yeol",
        mean: "8, 9, 10",
        context: "Fin de la série numérique de base.",
      },
      {
        word: "하나 더",
        rom: "Hana deo",
        mean: "Un de plus",
        context: "La phrase redoutée (ou motivante) du coach.",
      },
      {
        word: "다섯, 여섯, 일곱",
        rom: "Daseot, Yeoseot, Ilgob",
        mean: "5, 6, 7",
        context: "Le milieu de la progression numérique.",
      },
    ],
  },
  {
    id: "birthday",
    title: "L'Anniversaire",
    koreanTitle: "생일 (Saeng-il)",
    description: "Exprimer l'âge lors d'une fête entre amis.",
    accent: COLORS.indigoDeep,
    image:
      "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "올해 몇 살이 됐어요?",
        fr: "Quel âge as-tu eu cette année ?",
      },
      {
        char: "Moi",
        kr: "스무 살이 됐어요. 아직 어려요!",
        fr: "J'ai eu vingt (seumu) ans. Je suis encore jeune !",
      },
    ],
    expressions: [
      {
        word: "스무 살",
        rom: "Seumu-sal",
        mean: "20 ans",
        context: "Passage à l'âge adulte. 'Seumeul' devient 'Seumu'.",
      },
      {
        word: "서른, 마흔",
        rom: "Seoreun, Maheun",
        mean: "30, 40",
        context: "Les dizaines en natif (jusqu'à 99).",
      },
      {
        word: "몇 살?",
        rom: "Myeot sal?",
        mean: "Quel âge ?",
        context: "Toujours utiliser le système natif pour l'âge.",
      },
    ],
  },
];

export default function NativeNumbersImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1.2)),
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
          {/* NAV HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SYSTÈME NATIF</Text>
            </Pressable>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PURE KOREAN</Text>
            </View>
          </View>

          {/* SCENE SELECTOR */}
          <View style={styles.tabContainer}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: `${activeScene.accent}20`,
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

          {/* INTERACTIVE CARD */}
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
            <BlurView intensity={45} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardInfo}>
                <Text
                  style={[styles.krCategory, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.mainTitle}>{activeScene.title}</Text>
                <Text style={styles.mainDesc}>{activeScene.description}</Text>
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
                      style={[styles.bubbleName, { color: activeScene.accent }]}
                    >
                      {line.char}
                    </Text>
                    <Text style={styles.bubbleKr}>{line.kr}</Text>
                    <Text style={styles.bubbleFr}>{line.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* NUMERIC TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>NUMERIC TOOLBOX</Text>
              <View
                style={[
                  styles.toolboxLine,
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
                      styles.expAccent,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.expBody}>
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
    backgroundColor: "rgba(2,3,6,0.85)",
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
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: { color: COLORS.muted, fontSize: 9, fontFamily: "Outfit_700Bold" },

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

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardInfo: { marginBottom: 30 },
  krCategory: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 34 },
  mainDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
  },

  chatSection: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 16, borderRadius: 24 },
  bubbleL: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 4,
  },
  bubbleName: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bubbleKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },

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

  expGrid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expBody: { padding: 20 },
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
