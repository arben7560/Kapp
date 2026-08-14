import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, usePathname } from "expo-router";
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
import { useVocAudio } from "../../hooks/useVocAudio";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { trackSceneCompleted } from "../../lib/immersionStreak";
import { buildProgressId } from "../../lib/progressIds";
import { AnimatedAppText, AppText } from "../app-text";
import { AppBackButton } from "../ui/app-back-button";

type AudioAsset = number;

type DialogueLine = {
  char: string;
  kr: string;
  fr: string;
  audio: AudioAsset;
};

type ExpressionItem = {
  word: string;
  rom: string;
  mean: string;
  context: string;
  audio: AudioAsset;
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
  completionPrefix?: string;
  stopAudioOnDialogueChange?: boolean;
};

const BACKGROUND_SOURCE = require("../../assets/images/comptage.jpg");

const COLORS = {
  bg: "#020306",
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clampMessageCount(value: string | undefined, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(Math.max(parsed, 1), Math.max(max, 1));
}

export default function CountingImmersionScreen({
  scenes,
  backLabel,
  badgeLabel,
  toolboxTitle,
  completionPrefix = "numbers",
  stopAudioOnDialogueChange = false,
}: Props) {
  const { complete } = useStore();
  const pathname = usePathname();
  const params = useLocalSearchParams<{
    scene?: string | string[];
    message?: string | string[];
  }>();
  const requestedSceneId = normalizeParam(params.scene);
  const requestedMessage = normalizeParam(params.message);
  const requestedScene = scenes.find((scene) => scene.id === requestedSceneId);
  const initialScene = requestedScene ?? scenes[0];
  const initialVisibleMessages = clampMessageCount(
    requestedMessage,
    initialScene.dialogue.length,
  );

  const [activeScene, setActiveScene] = useState(initialScene);
  const [visibleMessages, setVisibleMessages] = useState(initialVisibleMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { playAudio, stopAudio } = useVocAudio(setSelectedWord);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedSceneIdsRef = useRef<Set<string>>(new Set());
  const preserveInitialPositionRef = useRef(Boolean(requestedScene));

  useEffect(() => {
    fadeAnim.setValue(0);

    if (preserveInitialPositionRef.current) {
      preserveInitialPositionRef.current = false;
    } else {
      setVisibleMessages(1);
    }

    setIsTyping(false);
    setSelectedWord(null);
    stopAudio();

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  }, [activeScene, fadeAnim, stopAudio]);

  useEffect(() => {
    const detail = `${backLabel} · Dialogue ${Math.min(
      visibleMessages,
      activeScene.dialogue.length,
    )} / ${activeScene.dialogue.length}`;

    void saveHomeResumeContext({
      track: "numbers",
      title: activeScene.title,
      detail,
      route: pathname,
      routeParams: {
        scene: activeScene.id,
        message: String(visibleMessages),
      },
    }).catch(() => null);
  }, [activeScene, backLabel, pathname, visibleMessages]);

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

      stopAudio();
    };
  }, [tapHintPulse, stopAudio]);

  const playRecordedAudio = (audio: AudioAsset, id: string) => {
    Vibration.vibrate(8);
    void playAudio(audio, id);
  };

  const advanceDialogue = () => {
    if (isTyping) return;

    if (stopAudioOnDialogueChange) {
      stopAudio();
      setSelectedWord(null);
    }

    if (visibleMessages >= activeScene.dialogue.length) {
      if (!completedSceneIdsRef.current.has(activeScene.id)) {
        completedSceneIdsRef.current.add(activeScene.id);
        void Promise.all([
          complete(buildProgressId(completionPrefix, activeScene.id)),
          trackSceneCompleted(activeScene.id),
        ]);
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
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <View style={styles.backBtn}>
              <AppBackButton accessibilityLabel={`Retour — ${backLabel}`} />
            </View>

            <View
              style={[styles.badge, { borderColor: activeScene.accent }]}
            >
              <AppText
                variant="label"
                align="center"
                lineContract="twoLines"
                style={{ color: activeScene.accent }}
              >
                {badgeLabel}
              </AppText>
            </View>
          </View>

          <View style={styles.tabContainer}>
            {scenes.map((scene) => (
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
            <BlurView intensity={45} tint="dark" style={styles.stageCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.stageInfo}>
                <AppText
                  variant="koreanSecondary"
                  script="korean"
                  lineContract="singleLine"
                  style={[styles.krTitle, { color: activeScene.accent }]}
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
                  style={styles.mainSub}
                >
                  {activeScene.description}
                </AppText>
              </View>

              <Pressable onPress={advanceDialogue} style={styles.scriptBox}>
                {activeScene.dialogue.slice(0, visibleMessages).map((line, idx) => {
                  const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                  const isActive = selectedWord === dialogueId;

                  return (
                    <Pressable
                      key={dialogueId}
                      onPress={() => playRecordedAudio(line.audio, dialogueId)}
                      style={[
                        styles.bubble,
                        idx % 2 === 0 ? styles.bubbleL : styles.bubbleR,
                        isActive && { borderColor: activeScene.accent },
                      ]}
                    >
                      <AppText
                        variant="sectionLabel"
                        lineContract="singleLine"
                        style={[styles.charTag, { color: activeScene.accent }]}
                      >
                        {line.char}
                      </AppText>
                      <AppText
                        variant="koreanSecondary"
                        script="korean"
                        lineContract="fluid"
                        style={styles.krScript}
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
                      style={[styles.charTag, { color: activeScene.accent }]}
                    >
                      {activeScene.dialogue[visibleMessages]?.char}
                    </AppText>

                    <View style={styles.typingDots}>
                      <View
                        style={[styles.dot, { backgroundColor: activeScene.accent }]}
                      />
                      <View
                        style={[styles.dot, { backgroundColor: activeScene.accent }]}
                      />
                      <View
                        style={[styles.dot, { backgroundColor: activeScene.accent }]}
                      />
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
                    onPress={() => playRecordedAudio(exp.audio, cardId)}
                    style={({ pressed }) => [
                      styles.cardPressable,
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <BlurView
                      intensity={18}
                      tint="dark"
                      style={[
                        styles.vocabCard,
                        isActive && { borderColor: activeScene.accent },
                      ]}
                    >
                      <View
                        style={[
                          styles.vocabAccent,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.8,
                          },
                        ]}
                      />
                      <View style={styles.vocabInner}>
                        <View style={styles.vocabTopRow}>
                          <View style={{ flex: 1 }}>
                            <AppText
                              variant="koreanPrimary"
                              script="korean"
                              lineContract="fluid"
                              style={styles.vocabWord}
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
                            <AppText
                              variant="label"
                              lineContract="singleLine"
                              style={{ color: activeScene.accent }}
                            >
                              {isActive ? "●" : "▶"}
                            </AppText>
                            <AppText
                              variant="label"
                              tone="muted"
                              lineContract="fluid"
                            >
                              ÉCOUTER
                            </AppText>
                          </View>
                        </View>

                        <AppText
                          variant="bodyStrong"
                          lineContract="fluid"
                          style={styles.vocabMean}
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
  scroll: { paddingHorizontal: 22, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    paddingHorizontal: 10,
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

  stageCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stageInfo: { marginBottom: 30 },
  krTitle: { marginBottom: 2 },
  mainSub: {
    fontStyle: "italic",
    marginTop: 8,
  },

  scriptBox: { gap: 28 },
  bubble: {
    maxWidth: "88%",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "transparent",
  },
  bubbleL: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 4,
  },
  charTag: { marginBottom: 6 },
  krScript: { marginBottom: 4 },
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
  vocabCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  vocabAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  vocabInner: { padding: 20 },
  vocabTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  vocabWord: { marginBottom: 2 },
  vocabMean: { marginBottom: 4 },
  listenPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
