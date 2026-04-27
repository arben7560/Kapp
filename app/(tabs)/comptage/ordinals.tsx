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
// DESIGN SYSTEM — ARCHITECTURAL SAPPHIRE
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  sapphire: "#1D4ED8",
  indigo: "#6366F1",
  platinum: "#E2E8F0",
  neonBlue: "#0EA5E9",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "ranking",
    title: "Le Classement",
    koreanTitle: "순위 (Sun-wi)",
    description: "Annoncer les résultats d'une compétition ou d'un examen.",
    accent: COLORS.neonBlue,
    image:
      "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Juge",
        kr: "첫 번째 우승자는 누구입니까?",
        fr: "Qui est le premier vainqueur ?",
      },
      {
        char: "Moi",
        kr: "제가 첫 번째예요! 정말 기뻐요.",
        fr: "Je suis le premier (cheot-beon-jjae) ! Je suis vraiment heureux.",
      },
    ],
    expressions: [
      {
        word: "첫 번째",
        rom: "Cheot-beon-jjae",
        mean: "Le premier",
        context: "Le suffixe '-beon-jjae' transforme un nombre en ordinal.",
      },
      {
        word: "두 번째",
        rom: "Du-beon-jjae",
        mean: "Le deuxième",
        context: "Utilise le système natif (Hana -> Cheot, Dul -> Du).",
      },
      {
        word: "마지막",
        rom: "Ma-ji-mak",
        mean: "Le dernier",
        context: "Indispensable pour clore une liste ou un rang.",
      },
    ],
  },
  {
    id: "family",
    title: "La Fratrie",
    koreanTitle: "형제 순서 (Hyeongje)",
    description: "Expliquer son ordre de naissance dans la famille.",
    accent: COLORS.indigo,
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "형제가 어떻게 되세요?",
        fr: "Comment est composée votre fratrie ?",
      },
      {
        char: "Moi",
        kr: "저는 첫째 아들이고, 둘째는 여동생이에요.",
        fr: "Je suis le premier fils (cheot-jjae), et la deuxième est ma sœur cadette.",
      },
    ],
    expressions: [
      {
        word: "첫째 / 둘째",
        rom: "Cheot-jjae / Dul-jjae",
        mean: "1er / 2ème (enfant)",
        context:
          "Suffixe '-jjae' utilisé spécifiquement pour l'ordre des personnes/enfants.",
      },
      {
        word: "막내",
        rom: "Mang-nae",
        mean: "Le petit dernier",
        context:
          "Terme affectueux pour le benjamin de la famille ou du groupe.",
      },
      {
        word: "셋째 / 넷째",
        rom: "Set-jjae / Net-jjae",
        mean: "3ème / 4ème",
        context: "L'ordre continue en suivant les nombres natifs.",
      },
    ],
  },
  {
    id: "experience",
    title: "La Première Fois",
    koreanTitle: "처음 (Cheo-eum)",
    description: "Parler d'une expérience inédite ou répétée.",
    accent: COLORS.sapphire,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "한국 방문은 이번이 처음이에요.",
        fr: "C'est la première fois (cheo-eum) que je visite la Corée.",
      },
      {
        char: "Guide",
        kr: "두 번째 방문 때는 경주에 꼭 가보세요.",
        fr: "Lors de votre deuxième (du-beon-jjae) visite, allez absolument à Gyeongju.",
      },
    ],
    expressions: [
      {
        word: "처음",
        rom: "Cheo-eum",
        mean: "La première fois / Début",
        context: "Nom utilisé pour désigner l'origine d'une action.",
      },
      {
        word: "이번",
        rom: "I-beon",
        mean: "Cette fois-ci",
        context: "Désigne l'occurrence actuelle.",
      },
      {
        word: "다음",
        rom: "Da-eum",
        mean: "La prochaine fois",
        context: "Désigne l'occurrence suivante.",
      },
    ],
  },
];

export default function OrdinalsImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
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
          {/* HEADER ORDER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>HIÉRARCHIE & RANG</Text>
            </Pressable>
            <View
              style={[styles.rankBadge, { borderColor: activeScene.accent }]}
            >
              <Text style={[styles.rankText, { color: activeScene.accent }]}>
                TOP RANK
              </Text>
            </View>
          </View>

          {/* ORDER SELECTOR */}
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

          {/* IMMERSIVE LOGIC CARD */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={40} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}20`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardHeader}>
                <Text style={[styles.krOrder, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.mainTitle}>{activeScene.title}</Text>
                <Text style={styles.mainSub}>{activeScene.description}</Text>
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
                      style={[styles.bubbleChar, { color: activeScene.accent }]}
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

          {/* ORDINAL TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>ORDINAL TOOLBOX</Text>
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
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  rankText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

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
  cardHeader: { marginBottom: 30 },
  krOrder: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 34 },
  mainSub: {
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomRightRadius: 4,
  },
  bubbleChar: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bubbleKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
    fontSize: 12,
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
