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
// DESIGN SYSTEM — TECH & PRECISION EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  techBlue: "#0EA5E9",
  titanium: "#94A3B8",
  neonCyan: "#22D3EE",
  chrome: "#E2E8F0",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "electronics",
    title: "Tech Store",
    koreanTitle: "전자제품 매장 (Jeon-ja)",
    description: "Acheter du matériel informatique de pointe.",
    accent: COLORS.techBlue,
    image:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Client",
        kr: "노트북 두 대랑 모니터 한 대 살게요.",
        fr: "Je vais acheter deux ordinateurs portables et un moniteur.",
      },
      {
        char: "Vendeur",
        kr: "네, 노트북 두 대 맞으시죠? 이쪽으로 오세요.",
        fr: "Oui, deux ordinateurs (du-dae), c'est bien ça ? Venez par ici.",
      },
    ],
    expressions: [
      {
        word: "대 (臺)",
        rom: "Dae",
        mean: "Compteur de machines",
        context:
          "Utilisé pour les ordinateurs, téléphones, voitures et gros appareils.",
      },
      {
        word: "노트북",
        rom: "No-teu-buk",
        mean: "Ordinateur portable",
        context: "Le terme standard en coréen pour 'Laptop'.",
      },
      {
        word: "두 대",
        rom: "Du dae",
        mean: "2 machines",
        context: "Dul devient 'Du' devant le classificateur.",
      },
    ],
  },
  {
    id: "street",
    title: "Le Parking",
    koreanTitle: "주차장 (Ju-cha-jang)",
    description: "Identifier et compter les véhicules dans la ville.",
    accent: COLORS.neonCyan,
    image:
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "여기에 차가 몇 대 있어요?",
        fr: "Combien de voitures y a-t-il ici ?",
      },
      {
        char: "Ami",
        kr: "세 대밖에 없어요. 주차 자리가 많네요.",
        fr: "Il n'y en a que trois (se-dae). Il y a beaucoup de places.",
      },
    ],
    expressions: [
      {
        word: "차 / 자동차",
        rom: "Cha / Ja-dong-cha",
        mean: "Voiture",
        context: "L'objet le plus courant compté avec 'Dae'.",
      },
      {
        word: "몇 대?",
        rom: "Myeot dae?",
        mean: "Combien de machines ?",
        context: "Question essentielle pour les stocks ou les véhicules.",
      },
      {
        word: "세 대",
        rom: "Se dae",
        mean: "3 voitures/machines",
        context: "Set devient 'Se' devant le compteur.",
      },
    ],
  },
  {
    id: "appliances",
    title: "Équipement",
    koreanTitle: "가전제품 (Ga-jeon)",
    description: "Aménager son appartement avec de l'électroménager.",
    accent: COLORS.titanium,
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "에어컨 한 대 더 설치해 주세요.",
        fr: "Veuillez installer un climatiseur de plus s'il vous plaît.",
      },
      {
        char: "Technicien",
        kr: "네, 거실에 한 대 설치하겠습니다.",
        fr: "D'accord, je vais en installer un (han-dae) dans le salon.",
      },
    ],
    expressions: [
      {
        word: "에어컨",
        rom: "E-eo-keon",
        mean: "Climatiseur",
        context: "Appareil vital en été, toujours compté avec 'Dae'.",
      },
      {
        word: "한 대",
        rom: "Han dae",
        mean: "1 machine",
        context: "Hana devient 'Han' devant le classificateur.",
      },
      {
        word: "설치하다",
        rom: "Seol-chi-hada",
        mean: "Installer",
        context: "Verbe souvent associé aux machines lourdes.",
      },
    ],
  },
];

export default function MachinesClassifierImmersion() {
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
          {/* HEADER TECH */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL MODERNE</Text>
            </Pressable>
            <View
              style={[styles.typeBadge, { borderColor: activeScene.accent }]}
            >
              <Text
                style={[styles.typeBadgeText, { color: activeScene.accent }]}
              >
                TECH COUNTER
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
            <BlurView intensity={40} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
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

          {/* TOOLBOX - TECH COUNTERS */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>TECH TOOLBOX</Text>
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
    backgroundColor: "rgba(2,3,6,0.88)",
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
