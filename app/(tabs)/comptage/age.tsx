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
// DESIGN SYSTEM — SUNSET HERITAGE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  amber: "#F59E0B", // Ambre hiérarchie
  bronze: "#D97706", // Bronze tradition
  coral: "#FB7185", // Corail vitalité
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "introduction",
    title: "La Hiérarchie",
    koreanTitle: "나이가 어떻게 되세요? (Nai-ga...)",
    description: "Déterminer l'âge pour ajuster son niveau de politesse.",
    accent: COLORS.amber,
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "In-ho",
        kr: "나이가 어떻게 되세요?",
        fr: "Quel âge avez-vous ? (Formel)",
      },
      {
        char: "Moi",
        kr: "저는 서른 살이에요. 오빠라고 불러도 돼요?",
        fr: "J'ai 30 ans (Seoreun-sal). Puis-je vous appeler Oppa ?",
      },
    ],
    expressions: [
      {
        word: "살",
        rom: "Sal",
        mean: "An(s) [Natif]",
        context: "Utilisé avec Hana, Dul, Set pour l'âge parlé.",
      },
      {
        word: "서른",
        rom: "Seoreun",
        mean: "30 ans",
        context: "Nombres natifs obligatoires pour l'âge (Seoreun, Maheun...).",
      },
      {
        word: "동갑",
        rom: "Dong-gap",
        mean: "Même âge",
        context: "Mot magique pour briser la glace et parler plus librement.",
      },
    ],
  },
  {
    id: "system",
    title: "Âge Coréen vs Mondial",
    koreanTitle: "만 나이 (Man Nai)",
    description: "Comprendre le nouveau système officiel adopté en 2023.",
    accent: COLORS.bronze,
    image:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "이제 한국도 '만 나이'를 쓰죠?",
        fr: "Maintenant, la Corée utilise l'âge international, n'est-ce pas ?",
      },
      {
        char: "Min-ji",
        kr: "네, 하지만 생일이 지나야 한 살 줄어들어요.",
        fr: "Oui, mais il faut attendre son anniversaire pour 'perdre' un an.",
      },
    ],
    expressions: [
      {
        word: "만 나이",
        rom: "Man Nai",
        mean: "Âge international",
        context: "Le système légal actuel basé sur la date de naissance.",
      },
      {
        word: "띠",
        rom: "Ddi",
        mean: "Signe zodiacal",
        context:
          "Souvent utilisé pour deviner l'âge (Année du Dragon, Rat...).",
      },
      {
        word: "연도",
        rom: "Yeon-do",
        mean: "Année de naissance",
        context: "C'est le chiffre le plus important pour la hiérarchie.",
      },
    ],
  },
  {
    id: "majority",
    title: "La Majorité",
    koreanTitle: "성인 (Seong-in)",
    description: "Célébrer le passage à l'âge adulte (20 ans).",
    accent: COLORS.coral,
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "드디어 스무 살이네! 성인 축하해!",
        fr: "Enfin 20 ans (Seumu-sal) ! Félicitations pour ta majorité !",
      },
      {
        char: "Moi",
        kr: "고마워! 이제 술 마실 수 있어!",
        fr: "Merci ! Maintenant je peux boire de l'alcool !",
      },
    ],
    expressions: [
      {
        word: "스무 살",
        rom: "Seumu-sal",
        mean: "20 ans",
        context: "Seumeul devient Seumu lorsqu'il est suivi de 'Sal'.",
      },
      {
        word: "성년의 날",
        rom: "Seongnyeon-ui nal",
        mean: "Jour de la majorité",
        context: "Fête célébrée le 3ème lundi de mai.",
      },
      {
        word: "미성년자",
        rom: "Mi-seong-nyeon-ja",
        mean: "Mineur",
        context: "Interdit de tabac et d'alcool.",
      },
    ],
  },
];

export default function AgeLifeImmersion() {
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
          {/* HEADER AGE */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>CYCLE DE VIE</Text>
            </Pressable>
            <View
              style={[styles.ageBadge, { borderColor: activeScene.accent }]}
            >
              <Text
                style={[styles.ageBadgeText, { color: activeScene.accent }]}
              >
                SOCIO-KOREAN
              </Text>
            </View>
          </View>

          {/* SCENE SELECTOR */}
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

          {/* INTERACTIVE STAGE */}
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
            <BlurView intensity={45} tint="dark" style={styles.stageCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.stageInfo}>
                <Text style={[styles.krTitle, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.mainTitle}>{activeScene.title}</Text>
                <Text style={styles.mainSub}>{activeScene.description}</Text>
              </View>

              <View style={styles.scriptBox}>
                {activeScene.dialogue.map((script, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bubble,
                      i % 2 === 0 ? styles.bubbleL : styles.bubbleR,
                    ]}
                  >
                    <Text
                      style={[styles.charTag, { color: activeScene.accent }]}
                    >
                      {script.char}
                    </Text>
                    <Text style={styles.krScript}>{script.kr}</Text>
                    <Text style={styles.frScript}>{script.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* LIFE TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxLabel}>LIFE TOOLBOX</Text>
              <View
                style={[styles.line, { backgroundColor: activeScene.accent }]}
              />
            </View>

            <View style={styles.grid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={20}
                  tint="dark"
                  style={styles.vocabCard}
                >
                  <View
                    style={[
                      styles.vocabAccent,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.vocabInner}>
                    <Text style={styles.vocabWord}>{exp.word}</Text>
                    <Text
                      style={[styles.vocabRom, { color: activeScene.accent }]}
                    >
                      {exp.rom}
                    </Text>
                    <Text style={styles.vocabMean}>{exp.mean}</Text>
                    <Text style={styles.vocabCtx}>{exp.context}</Text>
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
  ageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  ageBadgeText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

  tabRow: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  stageCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stageInfo: { marginBottom: 30 },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 34 },
  mainSub: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
  },

  scriptBox: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 18, borderRadius: 24 },
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
  krScript: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 4,
  },
  frScript: {
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
  toolboxLabel: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 3,
  },
  line: { flex: 1, height: 1, opacity: 0.2 },

  grid: { gap: 14 },
  vocabCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  vocabAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  vocabInner: { padding: 20 },
  vocabWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  vocabRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  vocabMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  vocabCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
