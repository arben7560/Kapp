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
// DESIGN SYSTEM — MORNING CALM EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  calmBlue: "#7DD3FC", // Bleu ciel matinal
  softTeal: "#2DD4BF", // Menthe douce
  pureWhite: "#F8FAFC",
  accentOrange: "#FB923C",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "greeting",
    title: "La Rencontre",
    koreanTitle: "첫 만남 (Cheot Mannam)",
    description: "Saluer poliment et se présenter pour la première fois.",
    accent: COLORS.calmBlue,
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ji-won",
        kr: "안녕하세요! 처음 뵙겠습니다.",
        fr: "Bonjour ! Enchanté de vous rencontrer (formel).",
      },
      {
        char: "Marc",
        kr: "네, 안녕하세요. 만나서 반가워요.",
        fr: "Oui, bonjour. Ravi de vous rencontrer.",
      },
    ],
    expressions: [
      {
        word: "안녕하세요",
        rom: "Annyeong-haseyo",
        mean: "Bonjour",
        context: "La salutation universelle et polie.",
      },
      {
        word: "반갑습니다",
        rom: "Bangapseumnida",
        mean: "Ravi de vous rencontrer",
        context: "Essentiel pour marquer le respect lors du premier contact.",
      },
      {
        word: "제 이름은 ~입니다",
        rom: "Je ireumeun ~imnida",
        mean: "Mon nom est...",
        context: "La structure de base pour se présenter.",
      },
    ],
  },
  {
    id: "politeness",
    title: "Politesse",
    koreanTitle: "예의 (Yei)",
    description: "Interagir avec respect dans les lieux publics.",
    accent: COLORS.softTeal,
    image:
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Passant",
        kr: "실례합니다. 잠시만요.",
        fr: "Excusez-moi. Un instant s'il vous plaît.",
      },
      {
        char: "Vendeur",
        kr: "네, 여기 있습니다. 감사합니다.",
        fr: "Oui, voici. Merci.",
      },
    ],
    expressions: [
      {
        word: "감사합니다",
        rom: "Gamsahamnida",
        mean: "Merci",
        context: "Le mot le plus important pour témoigner sa gratitude.",
      },
      {
        word: "실례합니다",
        rom: "Sillye-hamnida",
        mean: "Excusez-moi",
        context: "Pour interpeller quelqu'un ou passer dans la foule.",
      },
      {
        word: "저기요",
        rom: "Jeogiyo",
        mean: "S'il vous plaît (appel)",
        context: "Utilisé pour appeler un serveur ou attirer l'attention.",
      },
    ],
  },
  {
    id: "apology",
    title: "S'excuser",
    koreanTitle: "사과 (Sagwa)",
    description: "Exprimer des regrets de manière appropriée.",
    accent: COLORS.accentOrange,
    image:
      "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "늦어서 정말 죄송합니다.",
        fr: "Je suis vraiment désolé d'être en retard.",
      },
      {
        char: "Ji-ho",
        kr: "아니에요, 괜찮아요.",
        fr: "Ce n'est rien, c'est bon / pas de problème.",
      },
    ],
    expressions: [
      {
        word: "죄송합니다",
        rom: "Joesong-hamnida",
        mean: "Je suis désolé (poli)",
        context: "La forme standard pour présenter des excuses.",
      },
      {
        word: "미안해",
        rom: "Mian-hae",
        mean: "Désolé (familier)",
        context: "À utiliser uniquement avec des amis proches.",
      },
      {
        word: "괜찮아요",
        rom: "Gwaenchannayo",
        mean: "Ça va / C'est bon",
        context: "Pour rassurer quelqu'un qui s'excuse.",
      },
    ],
  },
];

export default function FirstStepsImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
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
          {/* HEADER NAV */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>FONDATIONS</Text>
            </Pressable>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>STEP 01</Text>
            </View>
          </View>

          {/* SCENE SELECTOR TABS */}
          <View style={styles.tabBar}>
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

          {/* INTERACTION CARD */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={30} tint="dark" style={styles.mainCard}>
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
                <Text style={styles.sceneTitle}>{activeScene.title}</Text>
                <Text style={styles.sceneSubtitle}>
                  {activeScene.description}
                </Text>
              </View>

              <View style={styles.chatArea}>
                {activeScene.dialogue.map((line, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.msgBox,
                      idx % 2 === 0 ? styles.msgLeft : styles.msgRight,
                    ]}
                  >
                    <Text
                      style={[styles.msgChar, { color: activeScene.accent }]}
                    >
                      {line.char}
                    </Text>
                    <Text style={styles.msgKr}>{line.kr}</Text>
                    <Text style={styles.msgFr}>{line.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* FOUNDATION TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>FOUNDATION TOOLBOX</Text>
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
                  intensity={15}
                  tint="dark"
                  style={styles.expCard}
                >
                  <View
                    style={[
                      styles.expGlow,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.expHeader}>
                    <Text style={styles.expWord}>{exp.word}</Text>
                    <Text
                      style={[styles.expRom, { color: activeScene.accent }]}
                    >
                      {exp.rom}
                    </Text>
                  </View>
                  <Text style={styles.expMean}>{exp.mean}</Text>
                  <Text style={styles.expCtx}>{exp.context}</Text>
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
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderSize: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  levelText: { color: COLORS.muted, fontSize: 9, fontFamily: "Outfit_700Bold" },

  tabBar: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 12 },

  mainCard: {
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
  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
  },
  sceneSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
  },

  chatArea: { gap: 28 },
  msgBox: { maxWidth: "85%", padding: 16, borderRadius: 20 },
  msgLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 2,
  },
  msgRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 2,
  },
  msgChar: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  msgKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 5,
  },
  msgFr: { color: COLORS.muted, fontSize: 12, fontFamily: "Outfit_500Medium" },

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

  expGrid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.8,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 22,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
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
