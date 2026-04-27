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
// DESIGN SYSTEM — UNIVERSAL UTILITY EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  universalCyan: "#22D3EE",
  deepTeal: "#0891B2",
  softIce: "#E0F2FE",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "market",
    title: "Au Marché",
    koreanTitle: "시장 쇼핑 (Sijang)",
    description: "Acheter des fruits frais en utilisant le compteur universel.",
    accent: COLORS.universalCyan,
    image:
      "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "사과 다섯 개 주세요. 얼마예요?",
        fr: "Donnez-moi cinq (daseot) pommes s'il vous plaît. C'est combien ?",
      },
      {
        char: "Vendeuse",
        kr: "사과 다섯 개에 오천 원이에요.",
        fr: "Pour cinq pommes, c'est 5000 won.",
      },
    ],
    expressions: [
      {
        word: "개 (個)",
        rom: "Gae",
        mean: "Unité / Objet",
        context:
          "Le classificateur universel pour les choses sans catégorie spécifique.",
      },
      {
        word: "다섯 개",
        rom: "Daseot gae",
        mean: "5 objets",
        context: "Utilise toujours les nombres natifs (Hana, Dul, Set...).",
      },
      {
        word: "한 개 더",
        rom: "Han gae deo",
        mean: "Un de plus",
        context: "Pratique pour ajouter un article à la dernière minute.",
      },
    ],
  },
  {
    id: "office",
    title: "Au Bureau",
    koreanTitle: "사무실 (Samusil)",
    description: "Demander et compter des fournitures de travail.",
    accent: COLORS.deepTeal,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Collègue",
        kr: "책상 위에 볼펜 몇 개 있어요?",
        fr: "Combien de stylos y a-t-il sur le bureau ?",
      },
      {
        char: "Moi",
        kr: "두 개밖에 없어요. 더 필요하세요?",
        fr: "Il n'y en a que deux (du). En avez-vous besoin de plus ?",
      },
    ],
    expressions: [
      {
        word: "몇 개?",
        rom: "Myeot gae?",
        mean: "Combien (d'objets) ?",
        context: "La question standard pour demander une quantité d'objets.",
      },
      {
        word: "두 개",
        rom: "Du gae",
        mean: "2 objets",
        context: "Dul devient 'Du' devant le classificateur.",
      },
      {
        word: "여러 개",
        rom: "Yeoreo gae",
        mean: "Plusieurs objets",
        context: "Pour désigner une quantité indéfinie mais nombreuse.",
      },
    ],
  },
  {
    id: "daily",
    title: "Quotidien",
    koreanTitle: "일상 생활 (Ilsang)",
    description: "Gérer les petits objets de la vie de tous les jours.",
    accent: COLORS.softIce,
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "여기 지우개 네 개 있어요.",
        fr: "Ici, il y a quatre (ne) gommes.",
      },
      {
        char: "Ami",
        kr: "와, 많네요! 한 개만 빌려줘요.",
        fr: "Waouh, c'est beaucoup ! Prête-m'en juste une.",
      },
    ],
    expressions: [
      {
        word: "네 개",
        rom: "Ne gae",
        mean: "4 objets",
        context: "Net devient 'Ne' devant le classificateur.",
      },
      {
        word: "한 개만",
        rom: "Han gae-man",
        mean: "Seulement un",
        context: "Le suffixe '-man' signifie 'seulement'.",
      },
      {
        word: "전부 몇 개",
        rom: "Jeonbu myeot gae",
        mean: "Combien au total",
        context: "Pour demander le compte final de tous les objets.",
      },
    ],
  },
];

export default function ObjectsClassifierImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
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
          {/* HEADER CLASSIFIER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>CLASSIFICATEURS</Text>
            </Pressable>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: activeScene.accent },
              ]}
            >
              <Text style={styles.typeBadgeText}>GENERAL</Text>
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
                    backgroundColor: "rgba(255,255,255,0.15)",
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

          {/* INTERACTIVE LOGIC CARD */}
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

          {/* TOOLBOX - COUNTERS */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>"GAE" TOOLBOX</Text>
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
