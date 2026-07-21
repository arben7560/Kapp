import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";
import {
  trackAudioPlayed,
  trackSceneCompleted,
  trackSubModuleVisited,
  trackToolboxOpened,
} from "../../lib/immersionStreak";
import { buildProgressId } from "../../lib/progressIds";
import { AnimatedAppText, AppText } from "../app-text";

type DialogueLine = {
  char: string;
  kr: string;
  fr: string;
};

type ExpressionItem = {
  word: string;
  rom: string;
  mean: string;
  context: string;
  speak?: string;
};

type Scene = {
  id: string;
  title: string;
  koreanTitle: string;
  description: string;
  accent: string;
  image: string;
  dialogue: DialogueLine[];
  expressions: ExpressionItem[];
};

type Props = {
  scenes: Scene[];
  backLabel: string;
  badgeLabel: string;
  toolboxTitle: string;
  badgeVariant?: "solid" | "outline";
  completionPrefix?: string;
};

const COLORS = {
  bg: "#020306",
};

export default function ClassifierImmersionScreen({
  scenes,
  backLabel,
  badgeLabel,
  toolboxTitle,
  badgeVariant = "outline",
  completionPrefix = "classifier",
}: Props) {
  const { complete } = useStore();
  const [activeScene, setActiveScene] = useState(scenes[0]);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedSceneIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fadeAnim.setValue(0);
    setVisibleMessages(1);
    setIsTyping(false);
    setSelectedWord(null);
    Speech.stop();

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeScene, fadeAnim]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(tapHintPulse, {
          toValue: 1,
          duration: 820,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tapHintPulse, {
          toValue: 0,
          duration: 820,
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

  const speak = (text: string, id: string) => {
    Speech.stop();
    setSelectedWord(id);
    Vibration.vibrate(8);
    void trackAudioPlayed();

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
      if (!completedSceneIdsRef.current.has(activeScene.id)) {
        completedSceneIdsRef.current.add(activeScene.id);
        complete(buildProgressId(completionPrefix, activeScene.id));
        void trackSceneCompleted(activeScene.id);
      }

      Vibration.vibrate(8);
      setVisibleMessages(1);
      setIsTyping(false);
      return;
    }

    const nextIndex = visibleMessages;
    const shouldType = activeScene.dialogue[nextIndex]?.char !== "Moi";

    Vibration.vibrate(8);

    if (shouldType) {
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

  const shouldHighlightHint =
    !isTyping && visibleMessages < activeScene.dialogue.length;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={{ uri: activeScene.image }} style={styles.bg}>
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <AppText
                variant="screenTitle"
                lineContract="singleLine"
                style={styles.backArrow}
              >
                ‹
              </AppText>
              <AppText
                variant="sectionLabel"
                tone="muted"
                lineContract="twoLines"
              >
                {backLabel}
              </AppText>
            </Pressable>

            <View
              style={[
                styles.typeBadge,
                badgeVariant === "solid"
                  ? { backgroundColor: activeScene.accent }
                  : { borderColor: activeScene.accent },
              ]}
            >
              <AppText
                variant="label"
                tone={badgeVariant === "solid" ? "inverse" : "default"}
                align="center"
                lineContract="twoLines"
                style={
                  badgeVariant === "solid"
                    ? undefined
                    : { color: activeScene.accent }
                }
              >
                {badgeLabel}
              </AppText>
            </View>
          </View>

          <View style={styles.tabContainer}>
            {scenes.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => {
                  setActiveScene(scene);
                  void trackSubModuleVisited(scene.id);
                }}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <AppText
                  variant="label"
                  tone="muted"
                  align="center"
                  lineContract="twoLines"
                  style={
                    activeScene.id === scene.id
                      ? { color: activeScene.accent }
                      : undefined
                  }
                >
                  {scene.title}
                </AppText>
              </Pressable>
            ))}
          </View>

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
                <AppText
                  variant="label"
                  script="korean"
                  lineContract="twoLines"
                  style={[styles.krBadge, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </AppText>
                <AppText variant="sceneTitle" lineContract="fluid">
                  {activeScene.title}
                </AppText>
                <AppText
                  variant="bodySecondary"
                  tone="muted"
                  lineContract="fluid"
                  style={styles.sceneDesc}
                >
                  {activeScene.description}
                </AppText>
              </View>

              <Pressable onPress={advanceDialogue} style={styles.chatSection}>
                {activeScene.dialogue.slice(0, visibleMessages).map((line, idx) => {
                  const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                  const isActive = selectedWord === dialogueId;

                  return (
                    <Pressable
                      key={dialogueId}
                      onPress={() => speak(line.kr, dialogueId)}
                      style={[
                        styles.bubble,
                        idx % 2 === 0 ? styles.bubbleL : styles.bubbleR,
                        isActive && { borderColor: activeScene.accent },
                      ]}
                    >
                      <AppText
                        variant="sectionLabel"
                        lineContract="singleLine"
                        style={[styles.charName, { color: activeScene.accent }]}
                      >
                        {line.char}
                      </AppText>
                      <AppText
                        variant="koreanSecondary"
                        script="korean"
                        lineContract="fluid"
                        style={styles.krText}
                      >
                        {line.kr}
                      </AppText>
                      <AppText
                        variant="caption"
                        tone="muted"
                        lineContract="fluid"
                      >
                        {line.fr}
                      </AppText>
                    </Pressable>
                  );
                })}

                {isTyping && (
                  <View style={[styles.bubble, styles.bubbleL, styles.typingBubble]}>
                    <AppText
                      variant="sectionLabel"
                      lineContract="singleLine"
                      style={[styles.charName, { color: activeScene.accent }]}
                    >
                      {activeScene.dialogue[visibleMessages]?.char}
                    </AppText>
                    <View style={styles.typingDots}>
                      <View style={[styles.dot, { backgroundColor: activeScene.accent }]} />
                      <View style={[styles.dot, { backgroundColor: activeScene.accent }]} />
                      <View style={[styles.dot, { backgroundColor: activeScene.accent }]} />
                    </View>
                  </View>
                )}

                <AnimatedAppText
                  variant="sectionLabel"
                  tone="soft"
                  align="center"
                  lineContract="twoLines"
                  style={[
                    styles.tapHint,
                    shouldHighlightHint && {
                      color: activeScene.accent,
                      opacity: tapHintPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.55, 1],
                      }),
                      transform: [
                        {
                          scale: tapHintPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.025],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {visibleMessages >= activeScene.dialogue.length
                    ? "Toucher pour recommencer l’étape"
                    : isTyping
                      ? "Réponse en cours..."
                      : "Toucher pour continuer"}
                </AnimatedAppText>
              </Pressable>
            </BlurView>
          </Animated.View>

          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <AppText
                variant="sectionLabel"
                tone="muted"
                lineContract="fluid"
              >
                {toolboxTitle}
              </AppText>
              <View
                style={[styles.toolboxLine, { backgroundColor: activeScene.accent }]}
              />
            </View>

            <View style={styles.grid}>
              {activeScene.expressions.map((exp, i) => {
                const cardId = `${activeScene.id}-exp-${i}`;
                const isActive = selectedWord === cardId;

                return (
                  <Pressable
                    key={cardId}
                    onPress={() => {
                      void trackToolboxOpened();
                      speak(exp.speak ?? exp.word, cardId);
                    }}
                    style={({ pressed }) => [
                      styles.cardPressable,
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <BlurView
                      intensity={25}
                      tint="dark"
                      style={[styles.expCard, isActive && { borderColor: activeScene.accent }]}
                    >
                      <View
                        style={[
                          styles.expAccent,
                          { backgroundColor: activeScene.accent },
                        ]}
                      />
                      <View style={styles.expContent}>
                        <AppText
                          variant="koreanPrimary"
                          script="korean"
                          lineContract="fluid"
                          style={styles.expKr}
                        >
                          {exp.word}
                        </AppText>
                        <AppText
                          variant="sectionLabel"
                          lineContract="twoLines"
                          style={{ color: activeScene.accent }}
                        >
                          {exp.rom}
                        </AppText>
                        <AppText
                          variant="bodyStrong"
                          lineContract="fluid"
                          style={styles.expMean}
                        >
                          {exp.mean}
                        </AppText>
                        <AppText
                          variant="bodySecondary"
                          tone="muted"
                          lineContract="fluid"
                        >
                          {exp.context}
                        </AppText>
                      </View>
                    </BlurView>
                  </Pressable>
                );
              })}
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
    ...StyleSheet.absoluteFill,
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
  backArrow: { marginRight: 5 },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
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
  mainCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardInfo: { marginBottom: 30 },
  krBadge: { marginBottom: 4 },
  sceneDesc: {
    fontStyle: "italic",
    marginTop: 5,
  },
  chatSection: { gap: 28 },
  bubble: {
    maxWidth: "88%",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "transparent",
  },
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
  charName: { marginBottom: 6 },
  krText: { marginBottom: 4 },
  typingBubble: {
    minWidth: 110,
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
    marginTop: 4,
  },
  toolbox: { marginTop: 40 },
  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },
  grid: { gap: 14 },
  cardPressable: { width: "100%" },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expContent: { padding: 20 },
  expKr: { marginBottom: 2 },
  expMean: { marginBottom: 4 },
});
