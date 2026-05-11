import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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

import metroLesson from "./data/metro/myeongdongToItaewon";

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
  glass: "rgba(255,255,255,0.05)",
};

const METRO_IMAGE = require("../../assets/images/bg-metro-station.png");

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

const uniqueByWord = (items: Expression[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.word)) return false;
    seen.add(item.word);
    return true;
  });
};

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

  const aiExpressions = uniqueByWord(
    aiSteps.map((step) => ({
      word: step.korean ?? "",
      rom: step.romanization ?? "",
      mean: step.french ?? step.text,
      context: step.phase
        ? `Réplique IA du script métro - ${step.phase}.`
        : "Réplique IA du script métro.",
    })),
  );

  const userExpressions = uniqueByWord(
    userChoices.map((choice) => ({
      word: choice.korean ?? "",
      rom: choice.romanization ?? "",
      mean: choice.label,
      context: choice.phase
        ? `Choix utilisateur du script métro - ${choice.phase}.`
        : "Choix utilisateur du script métro.",
    })),
  );

  return [
    {
      id: "ai",
      tab: "IA",
      title: "Script IA",
      koreanTitle: "길 안내",
      description: metroLesson.situation,
      accent: COLORS.cyan,
      image: METRO_IMAGE,
      dialogue: aiSteps.map((step) => ({
        char: step.phase ?? "IA",
        kr: step.korean ?? "",
        fr: step.french ?? step.text,
        side: "server",
      })),
      expressions: aiExpressions,
    },
    {
      id: "user",
      tab: "User",
      title: "Réponses User",
      koreanTitle: "사용자 선택",
      description: metroLesson.objective,
      accent: COLORS.pink,
      image: METRO_IMAGE,
      dialogue: userChoices.map((choice) => ({
        char: "User",
        kr: choice.korean ?? "",
        fr: choice.label,
        side: "me",
      })),
      expressions: userExpressions,
    },
  ];
};

export default function MetroLesson() {
  const scenes = useMemo(() => buildScenes(), []);
  const [activeScene, setActiveScene] = useState<Scene>(scenes[0]);
  const [previousBackground, setPreviousBackground] =
    useState<ImageSourcePropType | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bgFadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisibleMessages(1);
    setIsTyping(false);
    setSelectedWord(null);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    Speech.stop();
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }).start();
  }, [activeScene, fadeAnim]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(tapHintPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tapHintPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();

      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }

      Speech.stop();
    };
  }, [tapHintPulse]);

  const shouldHighlightHint =
    !isTyping && visibleMessages < activeScene.dialogue.length;

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

  const advanceDialogue = () => {
    if (isTyping) return;

    if (visibleMessages >= activeScene.dialogue.length) {
      Vibration.vibrate(8);
      setVisibleMessages(1);
      setIsTyping(false);
      return;
    }

    const nextMessage = activeScene.dialogue[visibleMessages];

    Vibration.vibrate(8);

    if (nextMessage.side === "server") {
      setIsTyping(true);

      const delay = 600 + Math.floor(Math.random() * 301);

      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) =>
          Math.min(prev + 1, activeScene.dialogue.length),
        );
      }, delay);

      return;
    }

    setVisibleMessages((prev) =>
      Math.min(prev + 1, activeScene.dialogue.length),
    );
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

            <Text style={styles.headerTitle}>METRO IMMERSION</Text>
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

          <Animated.View
            style={[
              styles.stage,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <BlurView intensity={40} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}20`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.sceneMetaRow}>
                <Text style={[styles.sceneSub, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
              </View>

              <Text style={styles.sceneTitle}>{activeScene.title}</Text>
              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <Pressable onPress={advanceDialogue} style={styles.dialogueBox}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((d, index) => {
                    const isMe = d.side === "me";

                    return (
                      <View
                        key={`${activeScene.id}-dialogue-${index}`}
                        style={[
                          styles.bubble,
                          isMe ? styles.bubbleRight : styles.bubbleLeft,
                        ]}
                      >
                        <Text
                          style={[
                            styles.charName,
                            { color: activeScene.accent },
                          ]}
                        >
                          {d.char}
                        </Text>
                        <Text style={styles.krText}>{d.kr}</Text>
                        <Text style={styles.frText}>{d.fr}</Text>
                      </View>
                    );
                  })}

                {isTyping && (
                  <View
                    style={[
                      styles.bubble,
                      styles.bubbleLeft,
                      styles.typingBubble,
                    ]}
                  >
                    <Text
                      style={[styles.charName, { color: activeScene.accent }]}
                    >
                      {activeScene.dialogue[visibleMessages]?.char}
                    </Text>

                    <View style={styles.typingDots}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: activeScene.accent },
                        ]}
                      />
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: activeScene.accent },
                        ]}
                      />
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: activeScene.accent },
                        ]}
                      />
                    </View>
                  </View>
                )}

                <Animated.Text
                  style={[
                    styles.tapHint,
                    shouldHighlightHint && {
                      color: activeScene.accent,
                      opacity: tapHintPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.45, 1],
                      }),
                      transform: [
                        {
                          scale: tapHintPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.03],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {visibleMessages >= activeScene.dialogue.length
                    ? "Toucher pour recommencer"
                    : isTyping
                      ? "Réponse en cours..."
                      : "Toucher pour continuer"}
                </Animated.Text>
              </Pressable>
            </BlurView>
          </Animated.View>

          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>METRO TOOLBOX</Text>
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

  stage: { marginBottom: 18 },
  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  sceneMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sceneSub: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },

  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
    marginBottom: 8,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 30,
    lineHeight: 20,
  },

  dialogueBox: { gap: 16 },
  bubble: {
    maxWidth: "88%",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 4,
  },
  charName: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  krText: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 4,
  },
  frText: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },
  typingBubble: {
    minWidth: 92,
    paddingVertical: 15,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingTop: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    opacity: 0.85,
  },
  tapHint: {
    alignSelf: "center",
    color: "rgba(255,255,255,0.42)",
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 4,
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
