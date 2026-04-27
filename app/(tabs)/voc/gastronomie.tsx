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
// DESIGN SYSTEM — SEOUL TASTE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  chiliRed: "#EF4444", // Rouge Gochujang
  sunsetOrange: "#FB923C", // Orange Street Food
  matchaGreen: "#10B981", // Vert Thé/Nature
  woodWarm: "#A16207",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "bbq",
    title: "Le K-BBQ",
    koreanTitle: "고기집 (Gogi-jib)",
    description:
      "L'art de griller la viande et de partager les accompagnements.",
    accent: COLORS.chiliRed,
    image:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Client",
        kr: "삼겹살 2인분 주세요. 그리고 상추 좀 더 주실 수 있나요?",
        fr: "Deux portions de Samgyeopsal s'il vous plaît. Et pouvez-vous me donner plus de laitue ?",
      },
      {
        char: "Serveur",
        kr: "네, 알겠습니다. 맛있게 드세요!",
        fr: "Oui, je comprends. Bon appétit !",
      },
    ],
    expressions: [
      {
        word: "맛있게 드세요",
        rom: "Masitge deuseyo",
        mean: "Bon appétit",
        context: "Utilisé par les serveurs ou l'hôte.",
      },
      {
        word: "1인분",
        rom: "Il-inbun",
        mean: "Une portion",
        context:
          "Indispensable pour commander la viande (généralement min. 2).",
      },
      {
        word: "쌈",
        rom: "Ssam",
        mean: "Wrap de laitue",
        context: "L'action de faire une bouchée avec la viande et les légumes.",
      },
    ],
  },
  {
    id: "street",
    title: "Street Food",
    koreanTitle: "길거리 음식",
    description: "Explorer les saveurs rapides et épicées de Myeongdong.",
    accent: COLORS.sunsetOrange,
    image:
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Acheteur",
        kr: "이거 많이 매워요? 하나 주세요.",
        fr: "Est-ce que c'est très épicé ? Donnez-m'en un s'il vous plaît.",
      },
      {
        char: "Vendeur",
        kr: "조금 매워요. 물 여기 있어요.",
        fr: "C'est un peu épicé. Voici de l'eau.",
      },
    ],
    expressions: [
      {
        word: "매워요",
        rom: "Maewoyo",
        mean: "C'est épicé",
        context: "Le mot clé à connaître avant de croquer dans un plat orange.",
      },
      {
        word: "얼마예요?",
        rom: "Eolmayeyo?",
        mean: "C'est combien ?",
        context: "Pour demander le prix sur les stands de rue.",
      },
      {
        word: "포장해 주세요",
        rom: "Pojang-hae juseyo",
        mean: "À emporter s'il vous plaît",
        context: "Pour prendre votre snack avec vous.",
      },
    ],
  },
  {
    id: "cafe",
    title: "Culture Café",
    koreanTitle: "카페 투어 (Cafe Tour)",
    description: "Détente dans un café esthétique de Yeonnam-dong.",
    accent: COLORS.matchaGreen,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Client",
        kr: "아이스 아메리카노 한 잔이랑 치즈케이크 주세요.",
        fr: "Un Americano glacé et un cheesecake s'il vous plaît.",
      },
      {
        char: "Barista",
        kr: "드시고 가세요? 진동벨 울리면 오세요.",
        fr: "C'est pour consommer ici ? Venez quand le bipeur sonne.",
      },
    ],
    expressions: [
      {
        word: "아아",
        rom: "Ah-Ah",
        mean: "Ice Americano",
        context: "L'abréviation ultra-populaire utilisée par tous les Coréens.",
      },
      {
        word: "분위기 좋다",
        rom: "Bunwigi jota",
        mean: "L'ambiance est superbe",
        context: "Compliment typique pour un café bien décoré.",
      },
      {
        word: "진동벨",
        rom: "Jindong-bel",
        mean: "Bipeur / Vibreur",
        context:
          "L'objet qu'on vous remet pour vous prévenir que la commande est prête.",
      },
    ],
  },
];

export default function GastronomyImmersion() {
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
          {/* HEADER GOURMET */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL GOURMAND</Text>
            </Pressable>
            <View style={styles.badgeChef}>
              <Text style={styles.badgeText}>CRITIQUE FOOD</Text>
            </View>
          </View>

          {/* CUISINE SELECTOR */}
          <View style={styles.tabContainer}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: `${activeScene.accent}25`,
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
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

          {/* DINING STAGE */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
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
                <Text style={[styles.krLabel, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.sceneMainTitle}>{activeScene.title}</Text>
              </View>

              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <View style={styles.dialogueList}>
                {activeScene.dialogue.map((chat, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.bubble,
                      idx % 2 === 0 ? styles.bubbleLeft : styles.bubbleRight,
                    ]}
                  >
                    <Text
                      style={[styles.bubbleChar, { color: activeScene.accent }]}
                    >
                      {chat.char}
                    </Text>
                    <Text style={styles.bubbleKr}>{chat.kr}</Text>
                    <Text style={styles.bubbleFr}>{chat.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* GOURMET TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxTitleRow}>
              <Text style={styles.toolboxTitle}>GOURMET TOOLBOX</Text>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.vocabGrid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={25}
                  tint="dark"
                  style={styles.vocabCard}
                >
                  <View
                    style={[
                      styles.vocabAccent,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.vocabContent}>
                    <Text style={styles.vocabKr}>{exp.word}</Text>
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
  badgeChef: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: {
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1,
  },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabText: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardHeader: { marginBottom: 15 },
  krLabel: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sceneMainTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 30,
  },

  dialogueList: { gap: 25 },
  bubble: { maxWidth: "88%", padding: 18, borderRadius: 24 },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 4,
  },
  bubbleChar: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bubbleKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },

  toolbox: { marginTop: 40 },
  toolboxTitleRow: {
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

  vocabGrid: { gap: 14 },
  vocabCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  vocabAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  vocabContent: { padding: 20 },
  vocabKr: {
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
