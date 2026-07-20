import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../components/app-text";

import { ABSOLUTE_FILL } from "../../constants/layout";

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const AIRPORT_IMAGE = require("../../assets/images/airport.png");

type Expression = {
  word: string;
  rom: string;
  mean: string;
  context: string;
};

type Scene = {
  id: "agent" | "traveler";
  tab: string;
  title: string;
  koreanTitle: string;
  description: string;
  accent: string;
  image: ImageSourcePropType;
  expressions: Expression[];
};

const AGENT_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "공항철도",
    rom: "Gonghangcheoldo",
    mean: "AREX / train de l’aéroport",
    context: "Mot central pour rejoindre Seoul Station depuis Incheon.",
  },
  {
    word: "교통센터",
    rom: "Gyotong senteo",
    mean: "Centre de transport",
    context: "Zone à suivre dans l’aéroport pour trouver les trains.",
  },
  {
    word: "지하 1층",
    rom: "Jiha ilcheung",
    mean: "Sous-sol 1",
    context: "Niveau où se trouve souvent l’accès au train.",
  },
  {
    word: "표지판을 따라가세요",
    rom: "Pyojipaneul ttaragaseyo",
    mean: "Suivez les panneaux",
    context: "Instruction essentielle dans un grand aéroport.",
  },
  {
    word: "일반열차",
    rom: "Ilban yeolcha",
    mean: "Train standard",
    context: "Train AREX avec arrêts, utile avec une carte T-money.",
  },
  {
    word: "직통열차",
    rom: "Jiktong yeolcha",
    mean: "Train express direct",
    context: "Option plus directe, souvent avec un billet séparé.",
  },
  {
    word: "승강장",
    rom: "Seunggangjang",
    mean: "Quai",
    context: "Mot a reconnaitre pour trouver ou monter.",
  },
  {
    word: "전광판",
    rom: "Jeongwangpan",
    mean: "Ecran d'affichage",
    context: "Pour vérifier la destination, la voie et l’heure de départ.",
  },
  {
    word: "서울역 방향",
    rom: "Seoul-yeok banghyang",
    mean: "Direction Seoul Station",
    context: "Indication a chercher avant de monter dans le train.",
  },
  {
    word: "약 한 시간 걸려요",
    rom: "Yak han sigan geollyeoyo",
    mean: "Cela prend environ une heure",
    context: "Information utile sur la durée du trajet.",
  },
];

const TRAVELER_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "서울역까지 어떻게 가요?",
    rom: "Seoul-yeokkkaji eotteoke gayo?",
    mean: "Comment aller jusqu’à Seoul Station ?",
    context: "Question principale apres l'arrivee a Incheon.",
  },
  {
    word: "공항철도는 어디예요?",
    rom: "Gonghangcheoldo-neun eodiyeyo?",
    mean: "Où est l’AREX ?",
    context: "Question courte pour trouver le train.",
  },
  {
    word: "티머니 카드를 사고 싶어요",
    rom: "T-money kadeureul sago sipeoyo",
    mean: "Je voudrais acheter une carte T-money",
    context: "Phrase utile avant de prendre les transports.",
  },
  {
    word: "어디에서 충전할 수 있어요?",
    rom: "Eodieseo chungjeonhal su isseoyo?",
    mean: "Où puis-je la recharger ?",
    context: "Pour demander ou charger la T-money.",
  },
  {
    word: "티머니로 탈 수 있어요?",
    rom: "T-money-ro tal su isseoyo?",
    mean: "Puis-je le prendre avec une T-money ?",
    context: "Pour vérifier si la carte fonctionne sur ce trajet.",
  },
  {
    word: "승강장은 어디예요?",
    rom: "Seunggangjang-eun eodiyeyo?",
    mean: "Où est le quai ?",
    context: "Question a poser apres avoir trouve la zone train.",
  },
  {
    word: "얼마나 걸려요?",
    rom: "Eolmana geollyeoyo?",
    mean: "Combien de temps ca prend ?",
    context: "Question simple pour la durée du trajet.",
  },
  {
    word: "다시 말씀해 주세요",
    rom: "Dasi malsseumhae juseyo",
    mean: "Répétez, s’il vous plaît",
    context: "Phrase de secours si l'explication est trop rapide.",
  },
  {
    word: "길을 잃었어요",
    rom: "Gireul ileosseoyo",
    mean: "Je suis perdu(e)",
    context: "Phrase importante dans un aéroport.",
  },
  {
    word: "감사합니다",
    rom: "Gamsahamnida",
    mean: "Merci",
    context: "Fin naturelle et polie de l’échange.",
  },
];

const SCENES: Scene[] = [
  {
    id: "agent",
    tab: "Agent",
    title: "Côté agent",
    koreanTitle: "공항 안내",
    description:
      "Les mots utiles que l'agent peut employer pour guider vers Seoul Station.",
    accent: COLORS.cyan,
    image: AIRPORT_IMAGE,
    expressions: AGENT_TOOLBOX_EXPRESSIONS,
  },
  {
    id: "traveler",
    tab: "Voyageur",
    title: "Côté voyageur",
    koreanTitle: "여행자 질문",
    description:
      "Les phrases essentielles pour demander son chemin, acheter une T-money et prendre l'AREX.",
    accent: COLORS.pink,
    image: AIRPORT_IMAGE,
    expressions: TRAVELER_TOOLBOX_EXPRESSIONS,
  },
];

export default function AirportLessonScreen() {
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);
  const [previousBackground, setPreviousBackground] =
    useState<ImageSourcePropType | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [bgFadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = (text: string, id: string) => {
    Speech.stop();
    setSelectedWord(id);
    Vibration.vibrate(8);

    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.78,
      pitch: 1,
      onDone: () => setSelectedWord(null),
      onStopped: () => setSelectedWord(null),
      onError: () => setSelectedWord(null),
    });
  };

  const handleSceneChange = (scene: Scene) => {
    if (scene.id === activeScene.id) return;

    setSelectedWord(null);
    Speech.stop();
    setPreviousBackground(activeScene.image);
    bgFadeAnim.setValue(1);
    setActiveScene(scene);

    Animated.timing(bgFadeAnim, {
      toValue: 0,
      duration: 420,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setPreviousBackground(null);
      bgFadeAnim.setValue(0);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bg}>
        <ImageBackground
          source={activeScene.image}
          style={styles.bgLayer}
          fadeDuration={0}
          resizeMode="cover"
        />
        {previousBackground ? (
          <Animated.View
            pointerEvents="none"
            style={[ABSOLUTE_FILL, { opacity: bgFadeAnim }]}
          >
            <ImageBackground
              source={previousBackground}
              style={styles.bgLayer}
              fadeDuration={0}
              resizeMode="cover"
            />
          </Animated.View>
        ) : null}
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
              <AppText variant="sectionLabel" lineContract="singleLine" style={styles.backText}>RETOUR</AppText>
            </Pressable>

            <AppText variant="sectionLabel" lineContract="singleLine" style={styles.headerTitle}>AÉROPORT</AppText>
          </View>

          <View style={styles.selectorRow}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.selectorItem,
                  activeScene.id === scene.id && {
                    borderColor: scene.accent,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                ]}
              >
                <AppText variant="label" lineContract="singleLine"
                  style={[
                    styles.selectorText,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.tab}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <AppText variant="sectionLabel" style={styles.toolboxTitle}>Expressions clés</AppText>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.expressionGrid}>
              {activeScene.expressions.map((exp, i) => {
                const cardId = `${activeScene.id}-${i}`;
                const isActive = selectedWord === cardId;

                return (
                  <Pressable
                    key={cardId}
                    onPress={() => speak(exp.word, cardId)}
                    style={({ pressed }) => [
                      styles.expPressable,
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <BlurView
                      intensity={25}
                      tint="dark"
                      style={[
                        styles.expCard,
                        isActive && {
                          borderColor: activeScene.accent,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.expAccent,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.75,
                          },
                        ]}
                      />
                      <View style={styles.expContent}>
                        <View style={styles.expTopRow}>
                          <View style={{ flex: 1 }}>
                            <AppText variant="koreanPrimary" script="korean" style={styles.expWord}>{exp.word}</AppText>
                            <AppText variant="caption"
                              style={[
                                styles.expRom,
                                { color: activeScene.accent },
                              ]}
                            >
                              {exp.rom}
                            </AppText>
                          </View>

                          <View
                            style={[
                              styles.listenPill,
                              {
                                backgroundColor: `${activeScene.accent}20`,
                                borderColor: `${activeScene.accent}55`,
                              },
                            ]}
                          >
                            <AppText variant="caption" lineContract="singleLine"
                              style={[
                                styles.listenIcon,
                                { color: activeScene.accent },
                              ]}
                            >
                              {isActive ? "●" : "▶"}
                            </AppText>
                            <AppText variant="label" lineContract="singleLine" style={styles.listenText}>ÉCOUTER</AppText>
                          </View>
                        </View>

                        <AppText variant="bodyStrong" style={styles.expMean}>{exp.mean}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.expContext}>{exp.context}</AppText>
                      </View>
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1, position: "relative" },
  bgLayer: {
    ...ABSOLUTE_FILL,
  },
  overlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.85)",
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 50 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 25,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, marginRight: 5 },
  backText: {
    color: COLORS.muted,
  },
  headerTitle: {
    color: COLORS.pink,
  },

  selectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  selectorItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  selectorText: {
    color: COLORS.muted,
  },

  toolbox: { marginTop: 40 },

  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  toolboxTitle: {
    color: COLORS.muted,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expressionGrid: { gap: 14 },
  expPressable: { width: "100%" },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  expContent: { padding: 20 },
  expTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  expWord: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  expRom: {
  },
  expMean: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  expContext: {
    color: COLORS.muted,
  },
  listenPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  listenIcon: {
  },
  listenText: {
    color: "rgba(255,255,255,0.78)",
  },
});
