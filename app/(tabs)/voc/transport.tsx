import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — URBAN TRANSIT EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  metroGreen: "#22C55E",
  metroBlue: "#3B82F6",
  taxiYellow: "#F59E0B",
  mapPink: "#EC4899",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const METRO_BG = require("../../../assets/images/bg-metro-station.png");
const TAXI_BG = require("../../../assets/images/bg-taxi-night.png");
const BUKCHON_BG = require("../../../assets/images/bg-bukchon-alley.png");

const SCENES = [
  {
    id: "subway",
    title: "Le Métro",
    koreanTitle: "지하철 (Ji-ha-cheol)",
    description: "Naviguer dans le métro de Séoul et changer de ligne.",
    accent: COLORS.metroGreen,
    // MÉTRO — intérieur station / quai / couloirs
    image: METRO_BG,
    dialogue: [
      {
        char: "Voyageur",
        kr: "홍대입구역으로 가려면 어디서 갈아타요?",
        fr: "Où dois-je changer pour aller à Hongdae ?",
      },
      {
        char: "Agent",
        kr: "다음 역에서 2호선으로 환승하세요.",
        fr: "Changez pour la ligne 2 à la prochaine station.",
      },
    ],
    expressions: [
      {
        word: "환승",
        rom: "Hwan-seung",
        mean: "Correspondance",
        context: "Mot vital pour changer de ligne de métro ou de bus.",
      },
      {
        word: "교통카드",
        rom: "Gyo-tong-ka-deu",
        mean: "Carte de transport",
        context: "La fameuse carte T-Money.",
      },
      {
        word: "이번 역",
        rom: "I-beon yeok",
        mean: "Cette station",
        context: "Entendu dans les annonces du métro.",
      },
    ],
  },
  {
    id: "taxi",
    title: "Le Taxi",
    koreanTitle: "택시 (Taek-si)",
    description:
      "Donner des instructions précises au chauffeur à la tombée de la nuit.",
    accent: COLORS.taxiYellow,
    // TAXI — taxi de nuit / ville / route nocturne
    image: TAXI_BG,
    dialogue: [
      {
        char: "Passager",
        kr: "강남역으로 가주세요. 좀 서둘러 주실 수 있나요?",
        fr: "Allez à la station Gangnam, s'il vous plaît. Pouvez-vous aller un peu plus vite ?",
      },
      {
        char: "Chauffeur",
        kr: "네, 알겠습니다. 여기서 세워드릴까요?",
        fr: "D'accord. Je vous dépose ici ?",
      },
    ],
    expressions: [
      {
        word: "~로 가주세요",
        rom: "~ro ga-ju-se-yo",
        mean: "Allez à...",
        context: "La structure de base pour donner une destination.",
      },
      {
        word: "세워주세요",
        rom: "Se-wo-ju-se-yo",
        mean: "Arrêtez-vous s'il vous plaît",
        context: "Pour demander au chauffeur de s'arrêter.",
      },
      {
        word: "영수증",
        rom: "Yeong-su-jeung",
        mean: "Reçu",
        context: "Indispensable si vous avez besoin d'un justificatif.",
      },
    ],
  },
  {
    id: "street",
    title: "Dans la Rue",
    koreanTitle: "길 찾기 (Gil Chat-gi)",
    description:
      "S'orienter et demander son chemin dans les ruelles de Bukchon.",
    accent: COLORS.mapPink,
    // RUE — ruelles traditionnelles type Bukchon / hanok
    image: BUKCHON_BG,
    dialogue: [
      {
        char: "Touriste",
        kr: "실례합니다, 경복궁이 어디에 있어요?",
        fr: "Excusez-moi, où se trouve le palais Gyeongbokgung ?",
      },
      {
        char: "Passant",
        kr: "쭉 가서 오른쪽으로 돌면 바로 보여요.",
        fr: "Allez tout droit, puis tournez à droite. Vous le verrez tout de suite.",
      },
    ],
    expressions: [
      {
        word: "길을 잃었어요",
        rom: "Gil-eul il-eoss-eo-yo",
        mean: "Je suis perdu",
        context: "À utiliser pour demander de l'aide poliment.",
      },
      {
        word: "쭉 가세요",
        rom: "Jjuk ga-se-yo",
        mean: "Allez tout droit",
        context: "Indication de direction très courante.",
      },
      {
        word: "오른쪽 / 왼쪽",
        rom: "O-reun-jjok / Oen-jjok",
        mean: "Droite / Gauche",
        context: "Les bases de l'orientation.",
      },
    ],
  },
];

export default function TransportCity() {
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
  }, [activeScene, fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={activeScene.image} style={styles.bg}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* HEADER TRANSIT */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL DYNAMIQUE</Text>
            </Pressable>

            <View style={styles.gpsIcon}>
              <View
                style={[styles.gpsDot, { backgroundColor: activeScene.accent }]}
              />
              <Text style={styles.gpsText}>GPS ACTIVE</Text>
            </View>
          </View>

          {/* TRANSIT MODES SELECTOR */}
          <View style={styles.tabBar}>
            {SCENES.map((scene) => {
              const isActive = activeScene.id === scene.id;

              return (
                <Pressable
                  key={scene.id}
                  onPress={() => setActiveScene(scene)}
                  style={[
                    styles.tab,
                    isActive && {
                      backgroundColor: "rgba(255,255,255,0.12)",
                      borderColor: scene.accent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive && {
                        color: scene.accent,
                      },
                    ]}
                  >
                    {scene.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* URBAN INTERACTION CARD */}
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
            <BlurView intensity={40} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}20`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardInfo}>
                <Text style={[styles.krBadge, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>

                <Text style={styles.sceneMainTitle}>{activeScene.title}</Text>
                <Text style={styles.sceneSub}>{activeScene.description}</Text>
              </View>

              <View style={styles.dialogueContainer}>
                {activeScene.dialogue.map((line, idx) => (
                  <View key={`${line.char}-${idx}`} style={styles.dialogueRow}>
                    <View
                      style={[
                        styles.indicator,
                        { backgroundColor: activeScene.accent },
                      ]}
                    />

                    <View style={styles.textWrapper}>
                      <Text
                        style={[styles.charName, { color: activeScene.accent }]}
                      >
                        {line.char}
                      </Text>

                      <Text style={styles.krDialogue}>{line.kr}</Text>
                      <Text style={styles.frDialogue}>{line.fr}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* URBAN TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>URBAN TOOLBOX</Text>

              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.vocabularyGrid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={`${exp.word}-${i}`}
                  intensity={25}
                  tint="dark"
                  style={styles.vocabCard}
                >
                  <View
                    style={[
                      styles.vocabGlow,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />

                  <Text style={styles.vocabKr}>{exp.word}</Text>

                  <Text
                    style={[styles.vocabRom, { color: activeScene.accent }]}
                  >
                    {exp.rom}
                  </Text>

                  <Text style={styles.vocabMean}>{exp.mean}</Text>
                  <Text style={styles.vocabCtx}>{exp.context}</Text>
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

  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  backArrow: {
    color: COLORS.txt,
    fontSize: 32,
    marginRight: 5,
  },

  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },

  gpsIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  gpsText: {
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
  },

  tabBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },

  tabLabel: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
  },

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  cardInfo: {
    marginBottom: 30,
  },

  krBadge: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },

  sceneMainTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
  },

  sceneSub: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
  },

  dialogueContainer: {
    gap: 35,
  },

  dialogueRow: {
    flexDirection: "row",
    gap: 18,
  },

  indicator: {
    width: 3,
    borderRadius: 2,
    opacity: 0.7,
  },

  textWrapper: {
    flex: 1,
  },

  charName: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },

  krDialogue: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 5,
  },

  frDialogue: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },

  toolbox: {
    marginTop: 40,
  },

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

  toolboxLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },

  vocabularyGrid: {
    gap: 14,
  },

  vocabCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  vocabGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  vocabKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },

  vocabRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  vocabMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },

  vocabCtx: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
