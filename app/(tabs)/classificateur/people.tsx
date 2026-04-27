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
// DESIGN SYSTEM — ROYAL AMETHYST EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  royalViolet: "#8B5CF6",
  softLavender: "#C084FC",
  roseGold: "#F472B6",
  honorGold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "restaurant",
    title: "Au Restaurant",
    koreanTitle: "식당에서 (Sikdang)",
    description: "Annoncer le nombre de convives à l'arrivée.",
    accent: COLORS.royalViolet,
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Serveur",
        kr: "몇 분이세요?",
        fr: "Combien de personnes êtes-vous ? (Honorifique)",
      },
      {
        char: "Moi",
        kr: "세 명이에요. 창가 자리 있을까요?",
        fr: "Nous sommes trois (se-myeong). Y a-t-il une place près de la fenêtre ?",
      },
    ],
    expressions: [
      {
        word: "명 (名)",
        rom: "Myeong",
        mean: "Personne (Standard)",
        context:
          "Le compteur le plus courant pour les amis, collègues ou soi-même.",
      },
      {
        word: "몇 명?",
        rom: "Myeot myeong?",
        mean: "Combien de personnes ?",
        context: "Question standard utilisée entre pairs.",
      },
      {
        word: "세 명",
        rom: "Se myeong",
        mean: "3 personnes",
        context: "Set devient 'Se' devant le compteur.",
      },
    ],
  },
  {
    id: "service",
    title: "Le Service",
    koreanTitle: "손님 맞이 (Sonnim)",
    description:
      "L'utilisation de la forme honorifique pour les clients ou aînés.",
    accent: COLORS.honorGold,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Réception",
        kr: "예약하신 분은 두 분이신가요?",
        fr: "Les personnes ayant réservé sont-elles au nombre de deux ?",
      },
      {
        char: "Client",
        kr: "네, 저랑 친구 한 분 더 오실 거예요.",
        fr: "Oui, moi et un ami (honorable) de plus allons venir.",
      },
    ],
    expressions: [
      {
        word: "분",
        rom: "Bun",
        mean: "Personne (Honorifique)",
        context:
          "À utiliser pour compter les clients, les professeurs ou les aînés.",
      },
      {
        word: "두 분",
        rom: "Du bun",
        mean: "Deux personnes (poli)",
        context: "Dul devient 'Du'. Très utilisé par le personnel de service.",
      },
      {
        word: "몇 분?",
        rom: "Myeot bun?",
        mean: "Combien de personnes ? (poli)",
        context: "La question polie posée par les hôtes.",
      },
    ],
  },
  {
    id: "solo",
    title: "Sortie Solo",
    koreanTitle: "혼자 (Honja)",
    description: "Savoir dire que l'on est seul sans utiliser de compteur.",
    accent: COLORS.roseGold,
    image:
      "https://images.unsplash.com/photo-1499591934245-40b55745b905?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      { char: "Hôte", kr: "일행 있으세요?", fr: "Êtes-vous accompagné ?" },
      {
        char: "Moi",
        kr: "아니요, 혼자 왔어요. 한 명이에요.",
        fr: "Non, je suis venu seul (honja). Je suis une seule personne.",
      },
    ],
    expressions: [
      {
        word: "혼자",
        rom: "Honja",
        mean: "Seul",
        context: "Adverbe pour dire que l'on fait une action en solo.",
      },
      {
        word: "한 명",
        rom: "Han myeong",
        mean: "Une personne",
        context: "Hana devient 'Han'. Précise l'unité humaine.",
      },
      {
        word: "일행",
        rom: "Il-haeng",
        mean: "Groupe / Compagnie",
        context: "Désigne les personnes qui vous accompagnent.",
      },
    ],
  },
];

export default function PeopleClassifierImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1)),
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
          {/* HEADER PEOPLE */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>ÉTICKETTES SOCIALES</Text>
            </Pressable>
            <View
              style={[styles.typeBadge, { borderColor: activeScene.accent }]}
            >
              <Text
                style={[styles.typeBadgeText, { color: activeScene.accent }]}
              >
                HUMAN COUNT
              </Text>
            </View>
          </View>

          {/* SCENE NAVIGATOR */}
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

          {/* TOOLBOX - HUMAN COUNTERS */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>HUMAN TOOLBOX</Text>
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
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1,
  },

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
