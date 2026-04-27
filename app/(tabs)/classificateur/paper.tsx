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
// DESIGN SYSTEM — LITERARY EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  paper: "#FDE68A", // Jaune parchemin
  leather: "#78350F", // Brun livre
  ink: "#1E293B", // Bleu encre
  sepia: "#A8A29E",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "bookstore",
    title: "La Librairie",
    koreanTitle: "서점에서 (Seojeom)",
    description: "Acheter des ouvrages reliés dans la célèbre librairie Kyobo.",
    accent: COLORS.paper,
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "이 소설책 두 권이랑 잡지 한 권 주세요.",
        fr: "Donnez-moi ces deux romans et un magazine s'il vous plaît.",
      },
      {
        char: "Vendeur",
        kr: "네, 총 세 권 맞으시죠? 여기 있습니다.",
        fr: "Oui, c'est bien trois volumes (se-gwon) au total ? Voici.",
      },
    ],
    expressions: [
      {
        word: "권 (卷)",
        rom: "Gwon",
        mean: "Compteur de livres",
        context:
          "Utilisé pour tout ce qui est relié : livres, cahiers, dictionnaires.",
      },
      {
        word: "두 권",
        rom: "Du gwon",
        mean: "2 livres",
        context: "Dul devient 'Du' devant le classificateur.",
      },
      {
        word: "잡지 / 소설",
        rom: "Jap-ji / Soseol",
        mean: "Magazine / Roman",
        context: "Les deux types d'ouvrages les plus courants.",
      },
    ],
  },
  {
    id: "cinema",
    title: "Le Guichet",
    koreanTitle: "매표소 (Maepyoso)",
    description: "Récupérer des billets ou des documents fins et plats.",
    accent: COLORS.sepia,
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "영화 티켓 네 장 출력해 주세요.",
        fr: "Veuillez imprimer quatre billets de cinéma s'il vous plaît.",
      },
      {
        char: "Agent",
        kr: "네, 네 장 여기 있습니다. 즐거운 관람 되세요!",
        fr: "Oui, voici les quatre feuilles (ne-jang). Bon film !",
      },
    ],
    expressions: [
      {
        word: "장 (張)",
        rom: "Jang",
        mean: "Compteur d'objets plats",
        context:
          "Pour le papier, les billets, les photos, les t-shirts ou les timbres.",
      },
      {
        word: "네 장",
        rom: "Ne jang",
        mean: "4 feuilles/billets",
        context: "Net devient 'Ne' devant le classificateur.",
      },
      {
        word: "출력하다",
        rom: "Chul-lyeok-hada",
        mean: "Imprimer",
        context: "Verbe indispensable pour les documents papier.",
      },
    ],
  },
  {
    id: "photo",
    title: "Le Studio Photo",
    koreanTitle: "사진관 (Sajingwan)",
    description: "Choisir le nombre de tirages pour ses souvenirs de voyage.",
    accent: COLORS.ink,
    image:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Photographe",
        kr: "사진 몇 장 인화해 드릴까요?",
        fr: "Combien de photos voulez-vous que je développe ?",
      },
      {
        char: "Moi",
        kr: "제일 잘 나온 거 열 장 주세요.",
        fr: "Donnez-moi dix photos (yeol-jang) de la meilleure.",
      },
    ],
    expressions: [
      {
        word: "인화하다",
        rom: "In-hwa-hada",
        mean: "Développer (photo)",
        context: "Terme technique pour le tirage papier.",
      },
      {
        word: "열 장",
        rom: "Yeol jang",
        mean: "10 photos",
        context: "Utilisation du nombre natif standard.",
      },
      {
        word: "기념 사진",
        rom: "Ginyeom sajin",
        mean: "Photo souvenir",
        context: "Le but de tout passage dans un studio photo coréen.",
      },
    ],
  },
];

export default function PaperClassifierImmersion() {
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
          {/* HEADER PAPER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SAVOIR-FAIRE</Text>
            </Pressable>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: activeScene.accent },
              ]}
            >
              <Text style={styles.typeBadgeText}>BOUND & FLAT</Text>
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
                    backgroundColor: "rgba(255,255,255,0.1)",
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
            <BlurView intensity={45} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}20`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardInfo}>
                <Text style={[styles.krBadge, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.sceneTitle}>{activeScene.title}</Text>
                <Text style={styles.sceneDesc}>{activeScene.description}</Text>
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
                      style={[styles.charName, { color: activeScene.accent }]}
                    >
                      {line.char}
                    </Text>
                    <Text style={styles.krText}>{line.kr}</Text>
                    <Text style={styles.frText}>{line.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* TOOLBOX - PAPER COUNTERS */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>LITERARY TOOLBOX</Text>
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
                  <View style={styles.expContent}>
                    <Text style={styles.expKr}>{exp.word}</Text>
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
  scroll: { paddingHorizontal: 22, paddingBottom: 80 },

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
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { color: "#000", fontSize: 9, fontFamily: "Outfit_900Black" },

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
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardInfo: { marginBottom: 30 },
  krBadge: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 5,
  },

  chatSection: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 18, borderRadius: 24 },
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
  charName: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  krText: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 4,
  },
  frText: { color: COLORS.muted, fontSize: 13, fontFamily: "Outfit_500Medium" },

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
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  grid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expContent: { padding: 20 },
  expKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    marginBottom: 10,
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
