import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { AnimatedAppText, AppText } from "../../../components/app-text";
import { useVocAudio } from "../../../hooks/useVocAudio";
import { ABSOLUTE_FILL } from "../../../constants/layout";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — NIGHTLIFE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  sojuGreen: "#34D399",
  neonPurple: "#A855F7",
  electricBlue: "#3B82F6",
  warningOrange: "#FB923C",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const POCHA_AUDIO = {
  message1: require("../../../assets/audio/voc/nuit/pocha-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/nuit/pocha-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/nuit/pocha-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/nuit/pocha-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/nuit/toolbox/pocha-toolbox-3.mp3"),
};

const NORAEBANG_AUDIO = {
  message1: require("../../../assets/audio/voc/noraebang/noraebang-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/noraebang/noraebang-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/noraebang/noraebang-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/noraebang/noraebang-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/noraebang/toolbox/noraebang-toolbox-3.mp3"),
};

const NUIT_AUDIO = {
  message1: require("../../../assets/audio/voc/after/after-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/after/after-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/after/after-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/after/after-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/after/toolbox/after-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/after/toolbox/after-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/after/toolbox/after-toolbox-3.mp3"),
};

const SCENES = [
  {
    id: "pocha",
    title: "Le Pocha",
    koreanTitle: "포장마차",
    description: "Sous la tente orange, entre soju et anju.",
    cultureHint: "On sert souvent le verre des autres avant le sien.",
    accent: COLORS.sojuGreen,
    image: require("../../../assets/images/pocha2.png"),
    dialogue: [
      {
        char: "Ji-hun",
        kr: "한 잔 더 할까요? 제가 따를게요.",
        fr: "On en reprend un verre ? Je vous sers.",
        side: "server",
        audio: POCHA_AUDIO.message1,
      },
      {
        char: "Min-a",
        kr: "좋아요! 안주도 더 시킬까요?",
        fr: "D’accord ! On commande aussi plus d’anju ?",
        side: "me",
        audio: POCHA_AUDIO.message2,
      },
      {
        char: "Ji-hun",
        kr: "네, 떡볶이 하나 더 시켜요.",
        fr: "Oui, commandons encore un tteokbokki.",
        side: "server",
        audio: POCHA_AUDIO.message3,
      },
      {
        char: "Min-a",
        kr: "좋아요. 그럼 건배할까요?",
        fr: "Très bien. Alors on trinque ?",
        side: "me",
        audio: POCHA_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "건배!",
        rom: "Geonbae!",
        mean: "Santé !",
        context: "L'expression universelle pour trinquer.",
        audio: POCHA_AUDIO.toolbox1,
      },
      {
        word: "안주",
        rom: "Anju",
        mean: "Accompagnement",
        context: "Plats servis avec l'alcool.",
        audio: POCHA_AUDIO.toolbox2,
      },
      {
        word: "원샷!",
        rom: "One-shot!",
        mean: "Cul sec !",
        context: "Souvent crié lors des jeux à boire.",
        audio: POCHA_AUDIO.toolbox3,
      },
      {
        word: "한 잔 더 할까요?",
        rom: "Han jan deo halkkayo?",
        mean: "On reprend un verre ?",
        context: "Phrase naturelle pour proposer une autre tournée.",
      },
      {
        word: "제가 따를게요",
        rom: "Jega ttareulgeyo",
        mean: "Je vais vous servir",
        context: "Très utile dans la culture du soju et du partage.",
      },
      {
        word: "계산할게요",
        rom: "Gyesan-halgeyo",
        mean: "Je vais payer",
        context: "Formule pratique pour régler au pocha.",
      },
    ],
  },
  {
    id: "noraebang",
    title: "Le Noraebang",
    koreanTitle: "노래방",
    description: "Libérer le stress dans une salle de karaoké privée.",
    cultureHint: "Le tambourin fait presque partie du rituel.",
    accent: COLORS.neonPurple,
    image: require("../../../assets/images/noraebang.png"),
    dialogue: [
      {
        char: "Sora",
        kr: "이 노래 취향저격이에요! 탬버린 줘요.",
        fr: "Cette chanson est pile mon style ! Donne-moi le tambourin.",
        side: "server",
        audio: NORAEBANG_AUDIO.message1,
      },
      {
        char: "Kevin",
        kr: "좋아요. 분위기 진짜 좋네요.",
        fr: "D’accord. L’ambiance est vraiment bonne.",
        side: "me",
        audio: NORAEBANG_AUDIO.message2,
      },
      {
        char: "Sora",
        kr: "다 같이 떼창해요!",
        fr: "Chantons tous ensemble !",
        side: "server",
        audio: NORAEBANG_AUDIO.message3,
      },
      {
        char: "Kevin",
        kr: "다음 곡은 제가 부를게요. 점수 대박!",
        fr: "C’est moi qui chante la suivante. Score de dingue !",
        side: "me",
        audio: NORAEBANG_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "취향저격",
        rom: "Chwihyang-jeogyeok",
        mean: "Pile mon style",
        context: "Quand quelque chose correspond parfaitement à vos goûts.",
        audio: NORAEBANG_AUDIO.toolbox1,
      },
      {
        word: "떼창",
        rom: "Ttechang",
        mean: "Chanter en chœur",
        context: "Quand tout le monde chante ensemble.",
        audio: NORAEBANG_AUDIO.toolbox2,
      },
      {
        word: "서비스",
        rom: "Seobiseu",
        mean: "Temps offert",
        context: "Temps supplémentaire offert au noraebang.",
        audio: NORAEBANG_AUDIO.toolbox3,
      },
      {
        word: "다음 곡",
        rom: "Daeum gok",
        mean: "Chanson suivante",
        context: "Pour choisir ou annoncer le prochain morceau.",
      },
      {
        word: "마이크 주세요",
        rom: "Maikeu juseyo",
        mean: "Passez-moi le micro",
        context: "Phrase simple pour participer au karaoké.",
      },
      {
        word: "점수 대박!",
        rom: "Jeomsu daebak!",
        mean: "Score de dingue !",
        context: "Réaction naturelle après une bonne performance.",
      },
    ],
  },
  {
    id: "after",
    title: "Le '2-cha'",
    koreanTitle: "2차 가자!",
    description: "Deuxième étape : on change de lieu pour continuer.",
    cultureHint:
      "2차 signifie passer à un autre endroit après le premier lieu.",
    accent: COLORS.warningOrange,
    image: require("../../../assets/images/2cha.png"),
    dialogue: [
      {
        char: "Jun",
        kr: "벌써 끝이에요? 2차 갑시다!",
        fr: "C'est déjà fini ? Allons au deuxième endroit !",
        side: "server",
        audio: NUIT_AUDIO.message1,
      },
      {
        char: "Yuna",
        kr: "좋아요. 근처로 가요.",
        fr: "D’accord. Allons dans les environs.",
        side: "me",
        audio: NUIT_AUDIO.message2,
      },
      {
        char: "Jun",
        kr: "근처에 좋은 노래방 있어요.",
        fr: "Il y a un bon noraebang juste à côté.",
        side: "server",
        audio: NUIT_AUDIO.message3,
      },
      {
        char: "Yuna",
        kr: "좋아요. 내일 해장국 먹어야겠어요.",
        fr: "D’accord. Demain, il va falloir manger du haejangguk.",
        side: "me",
        audio: NUIT_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "2차",
        rom: "I-cha",
        mean: "Deuxième étape",
        context: "Changer de lieu pour continuer la soirée.",
        audio: NUIT_AUDIO.toolbox1,
      },
      {
        word: "해장국",
        rom: "Haejangguk",
        mean: "Soupe de lendemain",
        context: "Soupe coréenne associée à la gueule de bois.",
        audio: NUIT_AUDIO.toolbox2,
      },
      {
        word: "불금",
        rom: "Bul-geum",
        mean: "Vendredi de feu",
        context: "Le vendredi soir où l'on sort après le travail.",
        audio: NUIT_AUDIO.toolbox3,
      },
      {
        word: "근처로 가요",
        rom: "Geuncheoro gayo",
        mean: "Allons dans les environs",
        context: "Très pratique quand on cherche le prochain lieu.",
      },
      {
        word: "아직 안 끝났어요",
        rom: "Ajik an kkeunnasseoyo",
        mean: "Ce n'est pas encore fini",
        context: "Phrase parfaite pour prolonger la soirée.",
      },
      {
        word: "물 좀 주세요",
        rom: "Mul jom juseyo",
        mean: "Un peu d'eau, s'il vous plaît",
        context: "Utile et prudent après une longue soirée.",
      },
    ],
  },
];

export default function NightlifeImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [previousBackground, setPreviousBackground] =
    useState<ImageSourcePropType | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { playAudio, stopAudio } = useVocAudio(setSelectedWord);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bgFadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fadeAnim.setValue(0);
    setSelectedWord(null);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    stopAudio();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }).start();
  }, [activeScene, fadeAnim, stopAudio]);

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

      stopAudio();
    };
  }, [tapHintPulse, stopAudio]);

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

  const handleSceneChange = (scene: (typeof SCENES)[number]) => {
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

  const shouldHighlightHint =
    !isTyping && visibleMessages < activeScene.dialogue.length;

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* NAV HEADER */}
          <View style={styles.topNav}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
            </Pressable>
            <View>
              <AppText variant="sectionLabel" style={[styles.navEyebrow, { color: activeScene.accent }]}>
                SÉOUL IMMERSION
              </AppText>
              <AppText variant="cardTitle" style={styles.navTitle}>Vie Nocturne</AppText>
            </View>
          </View>

          {/* SCENE NAVIGATOR */}
          <View style={styles.tabContainer}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: `${activeScene.accent}30`,
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <AppText variant="label" lineContract="singleLine"
                  style={[
                    styles.tabText,
                    activeScene.id === scene.id && {
                      color: activeScene.accent,
                    },
                  ]}
                >
                  {scene.title}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* CONTENT STAGE */}
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
            <BlurView intensity={60} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}25`, "transparent"]}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.cardHeader}>
                <AppText variant="koreanPrimary" script="korean"
                  style={[styles.koreanHeader, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </AppText>
                <AppText accessibilityRole="header" variant="sceneTitle" style={styles.sceneTitle}>{activeScene.title}</AppText>
              </View>

              <AppText variant="body" style={styles.sceneDesc}>{activeScene.description}</AppText>

              <Pressable onPress={advanceDialogue} style={styles.dialogueWrap}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((line, idx) => {
                    const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                    const isMe = line.side === "me";
                    const isActive = selectedWord === dialogueId;

                    return (
                      <Pressable
                        key={dialogueId}
                        onPress={(event) => {
                          event.stopPropagation();
                          playAudio((line as any).audio, dialogueId);
                        }}
                        style={[
                          styles.msg,
                          isMe ? styles.msgRight : styles.msgLeft,
                          isActive && { borderColor: activeScene.accent },
                        ]}
                      >
                        <AppText variant="label"
                          style={[styles.sender, { color: activeScene.accent }]}
                        >
                          {line.char}
                        </AppText>
                        <AppText variant="koreanSecondary" script="korean" style={styles.krTxt}>{line.kr}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.frTxt}>{line.fr}</AppText>
                      </Pressable>
                    );
                  })}

                {isTyping && (
                  <View style={[styles.msg, styles.msgLeft, styles.typingMsg]}>
                    <AppText variant="label"
                      style={[styles.sender, { color: activeScene.accent }]}
                    >
                      {activeScene.dialogue[visibleMessages]?.char}
                    </AppText>

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

                <AnimatedAppText variant="caption"
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
                </AnimatedAppText>
              </Pressable>

              <View
                style={[
                  styles.cultureHint,
                  { borderColor: `${activeScene.accent}35` },
                ]}
              >
                <AppText variant="bodySecondary"
                  style={[
                    styles.cultureHintText,
                    { color: activeScene.accent },
                  ]}
                >
                  ✦ {activeScene.cultureHint}
                </AppText>
              </View>
            </BlurView>
          </Animated.View>

          {/* NIGHTLIFE TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxTitleRow}>
              <AppText variant="sectionTitle" style={styles.toolboxTitle}>NIGHTLIFE TOOLBOX</AppText>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.expGrid}>
              {activeScene.expressions.map((exp, i) => {
                const cardId = `${activeScene.id}-${i}`;
                const isActive = selectedWord === cardId;

                return (
                  <Pressable
                    key={cardId}
                    onPress={() => playAudio(exp.audio, cardId)}
                    style={({ pressed }) => [
                      styles.expPressable,
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <BlurView
                      intensity={25}
                      tint="dark"
                      style={[
                        styles.expBox,
                        isActive && {
                          borderColor: activeScene.accent,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.expGlow,
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
                        <AppText variant="bodySecondary" tone="muted" style={styles.expCtx}>{exp.context}</AppText>
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
    backgroundColor: "rgba(2,3,6,0.54)",
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 80 },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  backArrow: { color: "#fff", fontSize: 24, marginTop: -2 },
  navEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
  },
  navTitle: { color: "#fff", fontSize: 14, opacity: 0.8 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 2,
  },
  neonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  neonBadgeText: {
    fontSize: 10,
    letterSpacing: 1,
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  tab: {
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: "center",
  },

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: { marginBottom: 12 },
  koreanHeader: {
    fontSize: 14,
    letterSpacing: 1,
  },
  sceneTitle: {
    color: COLORS.txt,
    fontSize: 34,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 30,
  },

  dialogueWrap: { gap: 16 },
  msg: {
    maxWidth: "85%",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  msgLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 2,
  },
  msgRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 2,
  },
  sender: {
    fontSize: 10,
    marginBottom: 5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  krTxt: {
    color: COLORS.txt,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 5,
  },
  frTxt: {
    color: COLORS.muted,
    fontSize: 13,
  },
  typingMsg: {
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
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 4,
  },

  cultureHint: {
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  cultureHintText: {
    fontSize: 11,
    lineHeight: 16,
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
    fontSize: 12,
    letterSpacing: 3,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expPressable: { width: "100%" },
  expBox: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expGlow: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
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
    textTransform: "uppercase",
  },
  expMean: {
    color: COLORS.txt,
    fontSize: 16,
    marginBottom: 4,
  },
  expCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
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
