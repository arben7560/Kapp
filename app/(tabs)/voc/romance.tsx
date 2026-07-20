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
// DESIGN SYSTEM — ROMANCE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  romance: "#F472B6",
  lavender: "#A78BFA",
  heart: "#FB7185",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SOGETING_AUDIO = {
  message1: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/sogaeting/sogaeting-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/sogaeting/toolbox/sogaeting-toolbox-3.mp3"),
};

const SOME_AUDIO = {
  message1: require("../../../assets/audio/voc/le-some/flirt-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/le-some/flirt-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/le-some/flirt-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/le-some/flirt-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/le-some/toolbox/some-toolbox-3.mp3"),
};

const COUPLE_AUDIO = {
  message1: require("../../../assets/audio/voc/couple/couple-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/couple/couple-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/couple/couple-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/couple/couple-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/couple/toolbox/couple-toolbox-3.mp3"),
};

const SCENES = [
  {
    id: "sogeting",
    title: "Le sogeting",
    koreanTitle: "Le rendez-vous",
    description: "Le premier rendez-vous arrangé dans un café chic de Gangnam.",
    accent: COLORS.romance,
    image: require("../../../assets/images/sogeting.png"),
    dialogue: [
      {
        char: "Mirae",
        kr: "사진보다 실물이 더 예쁘시네요.",
        fr: "Vous êtes encore plus jolie qu'en photo.",
        side: "server",
        audio: SOGETING_AUDIO.message1,
      },
      {
        char: "Kyung Seok",
        kr: "아니에요. 준수 씨도 인상이 참 좋으세요.",
        fr: "Ce n'est rien. Vous avez une très bonne impression aussi, Jun-su.",
        side: "me",
        audio: SOGETING_AUDIO.message2,
      },
      {
        char: "Mirae",
        kr: "혹시 이상형이 어떻게 되세요?",
        fr: "Quel est votre type idéal ?",
        side: "server",
        audio: SOGETING_AUDIO.message3,
      },
      {
        char: "Kyung Seok",
        kr: "대화가 잘 통하는 사람이 좋아요.",
        fr: "J'aime les personnes avec qui la conversation passe bien.",
        side: "me",
        audio: SOGETING_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "소개팅",
        rom: "Sogeting",
        mean: "Blind date",
        context: "Rendez-vous arrangé par des amis communs.",
        audio: SOGETING_AUDIO.toolbox1,
      },
      {
        word: "이상형",
        rom: "Isang-hyeong",
        mean: "Type idéal",
        context: "La question incontournable du premier RDV.",
        audio: SOGETING_AUDIO.toolbox2,
      },
      {
        word: "첫눈에 반하다",
        rom: "Cheonnune banhada",
        mean: "Avoir le coup de foudre",
        context: "Tomber amoureux au premier regard.",
        audio: SOGETING_AUDIO.toolbox3,
      },
      {
        word: "대화가 잘 통해요",
        rom: "Daehwaga jal tonghaeyo",
        mean: "La conversation passe bien",
        context: "Compliment naturel pendant un premier rendez-vous.",
      },
      {
        word: "실물이 더 예쁘시네요",
        rom: "Silmuri deo yeppeusineyo",
        mean: "Vous êtes plus jolie en vrai",
        context: "Compliment direct, à utiliser avec tact.",
      },
      {
        word: "다음에 또 만날까요?",
        rom: "Daeume tto mannalkkayo?",
        mean: "On se revoit la prochaine fois ?",
        context: "Phrase utile pour proposer un deuxième rendez-vous.",
      },
    ],
  },
  {
    id: "sseom",
    title: "Le sseom",
    koreanTitle: "Premiers flirts",
    description: "Flirt et tension au bord du fleuve Han à minuit.",
    accent: COLORS.lavender,
    image: require("../../../assets/images/han.png"),
    dialogue: [
      {
        char: "Do-yun",
        kr: "밤공기가 차네요. 제 옷 입을래요?",
        fr: "L'air de la nuit est froid. Vous voulez porter ma veste ?",
        side: "server",
        audio: SOME_AUDIO.message1,
      },
      {
        char: "Hae-in",
        kr: "괜찮아요. 고마워요.",
        fr: "Ça va. Mais merci quand même.",
        side: "me",
        audio: SOME_AUDIO.message2,
      },
      {
        char: "Do-yun",
        kr: "우리 지금... 무슨 사이예요?",
        fr: "Nous... c'est quoi notre relation actuellement ?",
        side: "server",
        audio: SOME_AUDIO.message3,
      },
      {
        char: "Hae-in",
        kr: "나도 잘 모르겠어요. 그런데 보고 싶었어요.",
        fr: "Je ne sais pas vraiment. Mais tu m'as manqué.",
        side: "me",
        audio: SOME_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "썸",
        rom: "Sseom",
        mean: "Le 'Some'",
        context: "La phase d'ambiguïté avant d'être en couple.",
        audio: SOME_AUDIO.toolbox1,
      },
      {
        word: "밀당",
        rom: "Mildang",
        mean: "Suis-moi, je te fuis",
        context: "Le jeu de 'pousse-tire' émotionnel.",
        audio: SOME_AUDIO.toolbox2,
      },
      {
        word: "보고 싶어",
        rom: "Bogo sipeo",
        mean: "Tu me manques",
        context: "Expression de manque et d'affection.",
        audio: SOME_AUDIO.toolbox3,
      },
      {
        word: "우리 무슨 사이예요?",
        rom: "Uri museun saiyeyo?",
        mean: "C'est quoi notre relation ?",
        context: "La grande question dans une relation ambiguë.",
      },
      {
        word: "괜찮아요",
        rom: "Gwaenchanayo",
        mean: "Ça va / C'est bon",
        context: "Réponse douce quand on ne veut pas trop en dire.",
      },
      {
        word: "더 알고 싶어요",
        rom: "Deo algo sipeoyo",
        mean: "J'aimerais mieux vous connaître",
        context: "Phrase polie pour faire avancer le flirt.",
      },
    ],
  },
  {
    id: "couple",
    title: "Le couple",
    koreanTitle: "Le couple",
    description: "Promesse d'éternité à la N Seoul Tower.",
    accent: COLORS.heart,
    image: require("../../../assets/images/tower.png"),
    dialogue: [
      {
        char: "Tae-yang",
        kr: "나랑 사귈래?",
        fr: "Tu veux sortir avec moi ?",
        side: "server",
        audio: COUPLE_AUDIO.message1,
      },
      {
        char: "Eun-ji",
        kr: "응... 나도 같은 마음이야.",
        fr: "Oui... je ressens la même chose.",
        side: "me",
        audio: COUPLE_AUDIO.message2,
      },
      {
        char: "Tae-yang",
        kr: "평생 지켜줄게.",
        fr: "Je te protégerai toute ma vie.",
        side: "server",
        audio: COUPLE_AUDIO.message3,
      },
      {
        char: "Eun-ji",
        kr: "우리 절대 헤어지지 말자.",
        fr: "Ne nous séparons jamais.",
        side: "me",
        audio: COUPLE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "사귀자",
        rom: "Sagwija",
        mean: "Sortons ensemble",
        context: "La phrase officielle pour devenir un couple.",
        audio: COUPLE_AUDIO.toolbox1,
      },
      {
        word: "고무신",
        rom: "Gomusin",
        mean: "Attendre son militaire",
        context: "Expression pour une fille dont le copain est à l'armée.",
        audio: COUPLE_AUDIO.toolbox2,
      },
      {
        word: "영원히",
        rom: "Yeongwonhi",
        mean: "Pour toujours",
        context: "Le serment romantique ultime.",
        audio: COUPLE_AUDIO.toolbox3,
      },
      {
        word: "나랑 사귈래?",
        rom: "Narang sagwillae?",
        mean: "Tu veux sortir avec moi ?",
        context: "Version plus complète et naturelle de la demande.",
      },
      {
        word: "같은 마음이야",
        rom: "Gateun maeumiya",
        mean: "Je ressens la même chose",
        context: "Réponse tendre à une déclaration.",
      },
      {
        word: "헤어지지 말자",
        rom: "Heeojiji malja",
        mean: "Ne nous séparons pas",
        context: "Promesse romantique très drama.",
      },
    ],
  },
];

export default function RomanceDating() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [previousBackground, setPreviousBackground] =
    useState<ImageSourcePropType | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { playAudio, stopAudio } = useVocAudio(setSelectedWord);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [bgFadeAnim] = useState(() => new Animated.Value(0));
  const [tapHintPulse] = useState(() => new Animated.Value(0));
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fadeAnim.setValue(0);

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

    setSelectedWord(null);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    stopAudio();
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
          {/* HEADER */}
          <View style={styles.topNav}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
            </Pressable>
            <View>
              <AppText variant="sectionLabel" style={[styles.navEyebrow, { color: activeScene.accent }]}>
                SÉOUL IMMERSION
              </AppText>
              <AppText variant="cardTitle" style={styles.navTitle}>Rencontres</AppText>
            </View>
          </View>

          {/* SCENE NAVIGATOR */}
          <View style={styles.sceneTabs}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    borderColor: scene.accent,
                    backgroundColor: `${scene.accent}18`,
                  },
                ]}
              >
                <AppText variant="label" lineContract="singleLine"
                  style={[
                    styles.tabText,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.koreanTitle}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* MAIN HERO CARD */}
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
            <BlurView intensity={50} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}30`, "transparent"]}
                style={ABSOLUTE_FILL}
              />
              <AppText variant="koreanSecondary" script="korean" lineContract="singleLine"
                style={[styles.sceneCategory, { color: activeScene.accent }]}
              >
                {activeScene.koreanTitle}
              </AppText>
              <AppText accessibilityRole="header" variant="sceneTitle" style={styles.sceneTitle}>{activeScene.title}</AppText>
              <AppText variant="body" style={styles.sceneDesc}>{activeScene.description}</AppText>

              <Pressable onPress={advanceDialogue} style={styles.chatContainer}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((chat, idx) => {
                    const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                    const isMe = chat.side === "me";
                    const isActive = selectedWord === dialogueId;

                    return (
                      <Pressable
                        key={dialogueId}
                        onPress={(event) => {
                          event.stopPropagation();
                          playAudio(chat.audio, dialogueId);
                        }}
                        style={[
                          styles.bubble,
                          isMe ? styles.bubbleRight : styles.bubbleLeft,
                          isActive && { borderColor: activeScene.accent },
                        ]}
                      >
                        <AppText variant="label"
                          style={[
                            styles.charLabel,
                            { color: activeScene.accent },
                          ]}
                        >
                          {chat.char}
                        </AppText>
                        <AppText variant="koreanSecondary" script="korean" style={styles.krText}>{chat.kr}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.frText}>{chat.fr}</AppText>
                      </Pressable>
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
                    <AppText variant="label"
                      style={[styles.charLabel, { color: activeScene.accent }]}
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
            </BlurView>
          </Animated.View>

          {/* ROMANCE TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxTitleRow}>
              <AppText variant="sectionTitle" style={styles.toolboxTitle}>Expressions clés</AppText>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.vocabGrid}>
              {activeScene.expressions.map((exp, i) => {
                const cardId = `${activeScene.id}-${i}`;
                const isActive = selectedWord === cardId;

                return (
                  <Pressable
                    key={cardId}
                    onPress={() => playAudio(exp.audio, cardId)}
                    style={({ pressed }) => [
                      styles.vocabPressable,
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <BlurView
                      intensity={25}
                      tint="dark"
                      style={[
                        styles.vocabCard,
                        isActive && {
                          borderColor: activeScene.accent,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.vocabAccent,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.75,
                          },
                        ]}
                      />
                      <View style={styles.vocabContent}>
                        <View style={styles.vocabTopRow}>
                          <View style={{ flex: 1 }}>
                            <AppText variant="koreanPrimary" script="korean" style={styles.vocabKr}>{exp.word}</AppText>
                            <AppText variant="caption"
                              style={[
                                styles.vocabRom,
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

                        <AppText variant="bodyStrong" style={styles.vocabMean}>{exp.mean}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.vocabCtx}>{exp.context}</AppText>
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
    backgroundColor: "rgba(2,3,6,0.52)",
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

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
  backArrow: { color: "#fff", marginTop: -2 },
  navEyebrow: {
  },
  navTitle: { color: "#fff", opacity: 0.8 },

  sceneTabs: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 25,
    gap: 10,
  },
  tab: {
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabText: {
    color: COLORS.muted,
    textAlign: "center",
  },

  mainCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sceneCategory: {
    marginBottom: 2,
  },
  sceneTitle: {
    color: COLORS.txt,
    marginBottom: 10,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontStyle: "italic",
    marginBottom: 30,
  },

  chatContainer: { gap: 16 },
  bubble: {
    maxWidth: "88%",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderTopRightRadius: 4,
  },
  charLabel: {
    marginBottom: 6,
  },
  krText: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  frText: { color: COLORS.muted},

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
    marginTop: 4,
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
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  vocabGrid: { gap: 14 },
  vocabPressable: { width: "100%" },
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
  vocabContent: { padding: 20 },
  vocabTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  vocabKr: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  vocabRom: {
  },
  vocabMean: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  vocabCtx: { color: COLORS.muted},
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
