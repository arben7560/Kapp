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
// DESIGN SYSTEM — NEON SOCIAL EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  sojuGreen: "#10B981", // Vert bouteille
  beerAmber: "#F59E0B", // Ambre bière/café
  waterBlue: "#3B82F6", // Bleu eau
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "pocha",
    title: "Au Pocha",
    koreanTitle: "포장마차 (Pocha)",
    description: "Commander des bouteilles de Soju pour la table.",
    accent: COLORS.sojuGreen,
    image:
      "https://images.unsplash.com/photo-1570191599214-469b29442006?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "여기 소주 두 병이랑 맥주 한 병 주세요.",
        fr: "Ici, donnez-moi deux bouteilles de Soju et une bouteille de bière.",
      },
      {
        char: "Serveur",
        kr: "네, 소주 두 병, 맥주 한 병 나왔습니다!",
        fr: "Oui, voici les deux bouteilles de Soju et la bouteille de bière !",
      },
    ],
    expressions: [
      {
        word: "병 (甁)",
        rom: "Byeong",
        mean: "Bouteille",
        context:
          "Utilisé pour toutes les boissons en bouteille (alcool, eau, soda).",
      },
      {
        word: "두 병",
        rom: "Du byeong",
        mean: "2 bouteilles",
        context: "Dul devient 'Du' devant le compteur.",
      },
      {
        word: "한 병 더",
        rom: "Han byeong deo",
        mean: "Une bouteille de plus",
        context: "La phrase culte des soirées coréennes.",
      },
    ],
  },
  {
    id: "cafe",
    title: "Au Café",
    koreanTitle: "카페 (Café)",
    description: "Compter les tasses lors d'une sortie entre amis.",
    accent: COLORS.beerAmber,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Barista",
        kr: "주문하시겠어요?",
        fr: "Souhaitez-vous commander ?",
      },
      {
        char: "Moi",
        kr: "따뜻한 아메리카노 세 잔 주세요.",
        fr: "Trois tasses (se-jan) d'Americano chaud s'il vous plaît.",
      },
    ],
    expressions: [
      {
        word: "잔 (盞)",
        rom: "Jan",
        mean: "Verre / Tasse",
        context: "Pour tout ce qui se boit dans un récipient ouvert.",
      },
      {
        word: "세 잔",
        rom: "Se jan",
        mean: "3 verres/tasses",
        context: "Set devient 'Se' devant le compteur.",
      },
      {
        word: "한 잔 해요",
        rom: "Han jan haeyo",
        mean: "Allons boire un verre",
        context: "Invitation sociale commune en Corée.",
      },
    ],
  },
  {
    id: "dinner",
    title: "Dîner de Groupe",
    koreanTitle: "회식 (Hwaesik)",
    description:
      "L'étiquette de service au verre pendant un dîner d'entreprise.",
    accent: COLORS.waterBlue,
    image:
      "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Directeur",
        kr: "물 한 잔만 주시겠어요?",
        fr: "Pourriez-vous me donner juste un verre d'eau ?",
      },
      {
        char: "Moi",
        kr: "네, 여기 있습니다. 한 잔 더 드릴까요?",
        fr: "Oui, voici. Voulez-vous un autre verre ?",
      },
    ],
    expressions: [
      {
        word: "물 한 잔",
        rom: "Mul han jan",
        mean: "Un verre d'eau",
        context: "Hana devient 'Han'. Toujours poli de servir les autres.",
      },
      {
        word: "따라주다",
        rom: "Ttarajuda",
        mean: "Verser (boisson)",
        context: "Verbe clé pour l'étiquette de la table coréenne.",
      },
      {
        word: "빈 잔",
        rom: "Bin jan",
        mean: "Verre vide",
        context: "Un signe qu'il est temps de resservir votre interlocuteur.",
      },
    ],
  },
];

export default function DrinksClassifierImmersion() {
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
          {/* HEADER BEVERAGE */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>CONVIVIALITÉ</Text>
            </Pressable>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: activeScene.accent },
              ]}
            >
              <Text style={styles.typeBadgeText}>DRINKS</Text>
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

          {/* TOOLBOX - DRINK COUNTERS */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>BEVERAGE TOOLBOX</Text>
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
