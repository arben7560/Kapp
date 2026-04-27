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
// DESIGN SYSTEM — NATURAL OASIS EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  forest: "#10B981", // Vert nature
  earth: "#B45309", // Terre cuite
  amber: "#F59E0B", // Ambre animal
  sky: "#38BDF8",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "pet-cafe",
    title: "Le Cat Café",
    koreanTitle: "고양이 카페 (Goyangi)",
    description: "Compter les résidents poilus d'un café thématique.",
    accent: COLORS.forest,
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "와! 고양이가 진짜 많아요. 몇 마리예요?",
        fr: "Waouh ! Il y a vraiment beaucoup de chats. Combien sont-ils ?",
      },
      {
        char: "Moi",
        kr: "음... 하나, 둘, 셋... 열 마리나 있어요!",
        fr: "Mmh... 1, 2, 3... il y en a carrément dix (yeol-mari) !",
      },
    ],
    expressions: [
      {
        word: "마리",
        rom: "Mari",
        mean: "Compteur animal",
        context: "Utilisé pour tous les animaux, des insectes aux éléphants.",
      },
      {
        word: "키우다",
        rom: "Ki-u-da",
        mean: "Élever / Avoir (animal)",
        context: "Le verbe pour dire qu'on possède un animal de compagnie.",
      },
      {
        word: "강아지 / 고양이",
        rom: "Gang-aji / Goyangi",
        mean: "Chien / Chat",
        context: "Les deux animaux domestiques les plus populaires en Corée.",
      },
    ],
  },
  {
    id: "national-symbol",
    title: "Le Tigre",
    koreanTitle: "호랑이 (Horangi)",
    description: "Rencontre avec le protecteur spirituel de la Corée.",
    accent: COLORS.amber,
    image:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Guide",
        kr: "저기 호랑이 두 마리가 자고 있어요.",
        fr: "Là-bas, deux tigres (du-mari) sont en train de dormir.",
      },
      {
        char: "Moi",
        kr: "정말 용맹해 보여요. 한국의 상징이죠?",
        fr: "Ils ont l'air vraiment vaillants. C'est le symbole de la Corée, non ?",
      },
    ],
    expressions: [
      {
        word: "두 마리",
        rom: "Du mari",
        mean: "Deux animaux",
        context: "Dul devient 'Du' devant le classificateur.",
      },
      {
        word: "용맹하다",
        rom: "Yong-maeng-hada",
        mean: "Être vaillant",
        context: "Adjectif souvent associé au tigre coréen.",
      },
      {
        word: "상징",
        rom: "Sang-jing",
        mean: "Symbole",
        context: "Pour parler de l'importance culturelle d'un animal.",
      },
    ],
  },
  {
    id: "rural",
    title: "La Ferme",
    koreanTitle: "시골 농장 (Nongjang)",
    description: "Compter le bétail dans un village traditionnel.",
    accent: COLORS.earth,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Grand-père",
        kr: "우리 집에 소 세 마리가 있단다.",
        fr: "Dans notre maison, il y a trois vaches (se-mari).",
      },
      {
        char: "Moi",
        kr: "와, 닭도 여러 마리 있네요!",
        fr: "Waouh, il y a aussi plusieurs poulets (yeoreo-mari) !",
      },
    ],
    expressions: [
      {
        word: "소 / 닭 / 돼지",
        rom: "So / Dak / Dwaeji",
        mean: "Vache / Poulet / Porc",
        context: "Les animaux de ferme essentiels.",
      },
      {
        word: "세 마리",
        rom: "Se mari",
        mean: "Trois animaux",
        context: "Set devient 'Se' devant le compteur.",
      },
      {
        word: "여러 마리",
        rom: "Yeoreo mari",
        mean: "Plusieurs animaux",
        context: "Utile quand on ne veut pas compter précisément.",
      },
    ],
  },
];

export default function AnimalClassifierImmersion() {
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
          {/* HEADER ANIMALS */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>VIE SAUVAGE</Text>
            </Pressable>
            <View
              style={[styles.typeBadge, { borderColor: activeScene.accent }]}
            >
              <Text
                style={[styles.typeBadgeText, { color: activeScene.accent }]}
              >
                LIVING BEINGS
              </Text>
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

          {/* TOOLBOX - ANIMAL COUNTERS */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>ANIMAL TOOLBOX</Text>
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
    backgroundColor: "rgba(2,3,6,0.82)",
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
