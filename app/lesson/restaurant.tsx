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
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { restaurantDialogueData } from "./data/restaurant/restaurant";

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
  glass: "rgba(255,255,255,0.05)",
};

const RESTAURANT_IMAGE = require("../../assets/images/restaurant.png");

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

const SERVEUR_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "어서 오세요.",
    rom: "Eoseo oseyo.",
    mean: "Bienvenue.",
    context: "Accueil naturel au restaurant.",
  },
  {
    word: "주문",
    rom: "jumun",
    mean: "Commande",
    context: "Mot central pour commander au restaurant.",
  },
  {
    word: "메뉴",
    rom: "menyu",
    mean: "Menu / plat",
    context: "Utile pour parler du choix à commander.",
  },
  {
    word: "추천",
    rom: "chucheon",
    mean: "Recommandation",
    context: "Pour demander ou comprendre un plat recommandé.",
  },
  {
    word: "직원",
    rom: "jigwon",
    mean: "Le personnel",
    context: "Le serveur ou l'employé du restaurant.",
  },
  {
    word: "고기",
    rom: "gogi",
    mean: "Viande",
    context: "Mot essentiel dans un restaurant BBQ.",
  },
  {
    word: "굽다",
    rom: "gupda",
    mean: "Griller la viande",
    context: "Verbe clé pour la cuisson au BBQ.",
  },
  {
    word: "드릴까요?",
    rom: "deurilkkayo?",
    mean: "Voulez-vous que je vous le fasse ?",
    context: "Forme polie utilisée par le serveur.",
  },
  {
    word: "계산",
    rom: "gyesan",
    mean: "Paiement / addition",
    context: "Mot à reconnaître au moment de payer.",
  },
  {
    word: "카드",
    rom: "kadeu",
    mean: "Carte",
    context: "Pour payer par carte.",
  },
  {
    word: "현금",
    rom: "hyeongeum",
    mean: "Espèces",
    context: "Pour payer en liquide.",
  },
  {
    word: "영수증",
    rom: "yeongsujeung",
    mean: "Reçu",
    context: "Question fréquente après le paiement.",
  },
  {
    word: "필요하세요?",
    rom: "piryohaseyo?",
    mean: "Vous en avez besoin ?",
    context: "Forme polie pour demander si c'est nécessaire.",
  },
  {
    word: "좋은 하루",
    rom: "joeun haru",
    mean: "Bonne journée",
    context: "Expression de fin d'échange.",
  },
  {
    word: "보내세요",
    rom: "bonaeseyo",
    mean: "Passez / envoyez",
    context: "Utilisé dans 'passez une bonne journée'.",
  },
  {
    word: "감사합니다.",
    rom: "Gamsahamnida.",
    mean: "Merci.",
    context: "Formule polie de remerciement.",
  },
];

const CLIENT_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "삼겹살 2인분 주세요.",
    rom: "Samgyeopsal i-inbun juseyo.",
    mean: "Deux portions de samgyeopsal, s'il vous plaît.",
    context: "Commande simple dans un BBQ coréen.",
  },
  {
    word: "갈비 2인분 주세요.",
    rom: "Galbi i-inbun juseyo.",
    mean: "Deux portions de galbi, s'il vous plaît.",
    context: "Alternative fréquente au samgyeopsal.",
  },
  {
    word: "추천 메뉴가 있어요?",
    rom: "Chucheon menyuga isseoyo?",
    mean: "Vous avez un menu recommandé ?",
    context: "Question utile quand tu hésites.",
  },
  {
    word: "하고",
    rom: "hago",
    mean: "et / avec",
    context: "Connecteur pratique pour lier deux éléments.",
  },
  {
    word: "이랑 / 랑",
    rom: "irang / rang",
    mean: "et / avec (oral)",
    context: "Version très naturelle à l'oral.",
  },
  {
    word: "그럼",
    rom: "geureom",
    mean: "alors / dans ce cas",
    context: "Pour rebondir après une recommandation.",
  },
  {
    word: "카드로 할게요.",
    rom: "Kadeuro halgeyo.",
    mean: "Je vais payer par carte.",
    context: "Phrase directe au moment du paiement.",
  },
  {
    word: "다시 한번 말씀해 주시겠어요?",
    rom: "Dasi hanbeon malsseumhae jusigesseoyo?",
    mean: "Pouvez-vous répéter, s'il vous plaît ?",
    context: "Phrase de secours si ça va trop vite.",
  },
];

const buildScenes = (): Scene[] => {
  return [
    {
      id: "ai",
      tab: "Serveur",
      title: "Côté Serveur",
      koreanTitle: "식당 안내",
      description: restaurantDialogueData.scenarioDescription,
      accent: COLORS.cyan,
      image: RESTAURANT_IMAGE,
      dialogue: restaurantDialogueData.serverLines.map((line) => ({
        char: line.speaker,
        kr: line.korean,
        fr: line.french,
        side: "server",
      })),
      expressions: SERVEUR_TOOLBOX_EXPRESSIONS,
    },
    {
      id: "user",
      tab: "Client",
      title: "Côté Client",
      koreanTitle: "손님 선택",
      description: restaurantDialogueData.scenarioTitle,
      accent: COLORS.pink,
      image: RESTAURANT_IMAGE,
      dialogue: restaurantDialogueData.clientLines.map((line) => ({
        char: line.speaker,
        kr: line.korean,
        fr: line.french,
        side: "me",
      })),
      expressions: CLIENT_TOOLBOX_EXPRESSIONS,
    },
  ];
};

export default function RestaurantLesson() {
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
          resizeMode="contain"
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
              resizeMode="contain"
            />
          </Animated.View>
        ) : null}
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>RETOUR</Text>
            </Pressable>

            <Text style={styles.headerTitle}>RESTAURANT IMMERSION</Text>
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
                <Text
                  style={[
                    styles.selectorText,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.tab}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>RESTAURANT TOOLBOX</Text>
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
                            <Text style={styles.expWord}>{exp.word}</Text>
                            <Text
                              style={[
                                styles.expRom,
                                { color: activeScene.accent },
                              ]}
                            >
                              {exp.rom}
                            </Text>
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
                            <Text
                              style={[
                                styles.listenIcon,
                                { color: activeScene.accent },
                              ]}
                            >
                              {isActive ? "●" : "▶"}
                            </Text>
                            <Text style={styles.listenText}>ÉCOUTER</Text>
                          </View>
                        </View>

                        <Text style={styles.expMean}>{exp.mean}</Text>
                        <Text style={styles.expContext}>{exp.context}</Text>
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
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  headerTitle: {
    color: COLORS.pink,
    fontFamily: "Outfit_900Black",
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
    fontFamily: "Outfit_700Bold",
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
    fontFamily: "Outfit_700Bold",
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
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
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
    fontFamily: "Outfit_700Bold",
  },
  listenText: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
});
