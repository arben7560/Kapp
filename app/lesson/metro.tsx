import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

import { metroLessons } from "../../data/lesson/metroLessons";

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
  glass: "rgba(255,255,255,0.05)",
};

const METRO_IMAGE = require("../../assets/images/metrobg.png");
const metroLesson =
  metroLessons.find((lesson) => lesson.id === "myeongdong_to_itaewon") ??
  metroLessons[0];

type DialogueLine = {
  char: string;
  kr: string;
  fr: string;
  side: "server" | "me";
};

type Expression = {
  word: string;
  rom: string;
  mean: string;
  context: string;
};

type Scene = {
  id: "ai" | "user";
  tab: string;
  title: string;
  koreanTitle: string;
  description: string;
  accent: string;
  image: ImageSourcePropType;
  dialogue: DialogueLine[];
  expressions: Expression[];
};

const AGENT_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "환승",
    rom: "Hwanseung",
    mean: "Correspondance",
    context: "Mot essentiel pour changer de ligne.",
  },
  {
    word: "명동역에서 타세요",
    rom: "Myeongdong-yeogeseo taseyo",
    mean: "Prenez le métro à Myeongdong",
    context: "Point de départ du trajet.",
  },
  {
    word: "삼각지역에서 내리세요",
    rom: "Samgakji-yeogeseo naeriseyo",
    mean: "Descendez à Samgakji",
    context: "Arrêt où faire la correspondance.",
  },
  {
    word: "6호선을 타세요",
    rom: "Yukhoseoneul taseyo",
    mean: "Prenez la ligne 6",
    context: "Ligne à prendre après la correspondance.",
  },
  {
    word: "이태원역까지 가세요",
    rom: "Itaewon-yeokkkaji gaseyo",
    mean: "Allez jusqu'à Itaewon",
    context: "Destination finale.",
  },
  {
    word: "약 네 정거장 후에",
    rom: "Yak ne jeonggeojang hue",
    mean: "Après environ 4 arrêts",
    context: "Indication de distance dans le métro.",
  },
  {
    word: "그다음 6호선으로 환승하세요",
    rom: "Geudaeum yukhoseoneuro hwanseunghaseyo",
    mean: "Ensuite, changez pour la ligne 6",
    context: "Formulation de guidage côté agent.",
  },
  {
    word: "표지판을 따라가세요",
    rom: "Pyojipaneul ttaragaseyo",
    mean: "Suivez les panneaux",
    context: "Utile pour trouver une ligne ou une sortie.",
  },
  {
    word: "1번 출구",
    rom: "Ilbeon chulgu",
    mean: "Sortie 1",
    context: "Expression essentielle pour les sorties.",
  },
];

const VOYAGEUR_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "이태원역 어떻게 가요?",
    rom: "Itaewon-yeok eotteoke gayo?",
    mean: "Comment aller à Itaewon ?",
    context: "Question courte pour demander son chemin.",
  },
  {
    word: "어디에서 환승해요?",
    rom: "Eodieseo hwanseunghaeyo?",
    mean: "Où est-ce que je change ?",
    context: "Pour demander le lieu de correspondance.",
  },
  {
    word: "어디에서 내려요?",
    rom: "Eodieseo naeryeoyo?",
    mean: "Où dois-je descendre ?",
    context: "Question essentielle dans le métro.",
  },
  {
    word: "몇 정거장이에요?",
    rom: "Myeot jeonggeojang-ieyo?",
    mean: "C'est à combien d'arrêts ?",
    context: "Pour vérifier la distance.",
  },
  {
    word: "한 정거장",
    rom: "Han jeonggeojang",
    mean: "1 arrêt",
    context: "Réponse ou repère très fréquent.",
  },
  {
    word: "두 정거장",
    rom: "Du jeonggeojang",
    mean: "2 arrêts",
    context: "Réponse ou repère très fréquent.",
  },
  {
    word: "몇 번 출구예요?",
    rom: "Myeot beon chulgu-yeyo?",
    mean: "Quelle sortie ?",
    context: "Pour demander le numéro de sortie.",
  },
  {
    word: "다시 말해 주세요",
    rom: "Dasi malhae juseyo",
    mean: "Répétez, s'il vous plaît",
    context: "Phrase de secours si l'information va trop vite.",
  },
  {
    word: "감사합니다",
    rom: "Gamsahamnida",
    mean: "Merci",
    context: "Fin naturelle de l'échange.",
  },
];

const buildScenes = (): Scene[] => {
  const aiSteps = metroLesson.steps.filter(
    (step) => step.speaker === "ai" && step.korean,
  );

  const userChoices = metroLesson.steps.flatMap((step) =>
    (step.choices ?? [])
      .filter((choice) => choice.korean)
      .map((choice) => ({
        ...choice,
        phase: step.phase,
      })),
  );

  return [
    {
      id: "ai",
      tab: "Agent",
      title: "Côté Agent",
      koreanTitle: "길 안내",
      description: metroLesson.situation,
      accent: COLORS.cyan,
      image: METRO_IMAGE,
      dialogue: aiSteps.map((step) => ({
        char: step.phase ?? "Agent",
        kr: step.korean ?? "",
        fr: step.french ?? step.text,
        side: "server",
      })),
      expressions: AGENT_TOOLBOX_EXPRESSIONS,
    },
    {
      id: "user",
      tab: "Voyageur",
      title: "Côté Voyageur",
      koreanTitle: "사용자 선택",
      description: metroLesson.objective,
      accent: COLORS.pink,
      image: METRO_IMAGE,
      dialogue: userChoices.map((choice) => ({
        char: "Voyageur",
        kr: choice.korean ?? "",
        fr: choice.label,
        side: "me",
      })),
      expressions: VOYAGEUR_TOOLBOX_EXPRESSIONS,
    },
  ];
};

export default function MetroLesson() {
  const scenes = useMemo(() => buildScenes(), []);
  const [activeScene, setActiveScene] = useState<Scene>(scenes[0]);
  const [previousBackground, setPreviousBackground] =
    useState<ImageSourcePropType | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const bgFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedWord(null);
    Speech.stop();
  }, [activeScene]);

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
            style={[StyleSheet.absoluteFillObject, { opacity: bgFadeAnim }]}
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

            <AppText variant="sectionLabel" lineContract="singleLine" style={styles.headerTitle}>METRO IMMERSION</AppText>
          </View>

          <View style={styles.selectorRow}>
            {scenes.map((scene) => (
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
              <AppText variant="sectionLabel" style={styles.toolboxTitle}>METRO TOOLBOX</AppText>
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
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
  backArrow: { color: COLORS.txt, fontSize: 32, marginRight: 5 },
  backText: {
    color: COLORS.muted,
    fontSize: 12,
    letterSpacing: 1,
  },
  headerTitle: {
    color: COLORS.pink,
    fontSize: 14,
    letterSpacing: 2,
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
    fontSize: 13,
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
    fontSize: 12,
    letterSpacing: 3,
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
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontSize: 12,
  },
  expMean: {
    color: COLORS.txt,
    fontSize: 16,
    marginBottom: 4,
  },
  expContext: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
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
    fontSize: 9,
  },
  listenText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 9,
    letterSpacing: 1,
  },
});
