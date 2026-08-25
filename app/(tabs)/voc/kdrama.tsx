import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { AppBackButton } from "../../../components/ui/app-back-button";
import { useEffect, useRef, useState } from "react";
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
import {
  ABSOLUTE_FILL,
  RESPONSIVE_AUDIO_COPY_MIN_WIDTH,
} from "../../../constants/layout";
import { useVocAudio } from "../../../hooks/useVocAudio";
import { VOC_DIALOGUE_COPY } from "../../../hooks/useVocDialogue";

// ──────────────────────────────────────────────
// DESIGN SYSTEM
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
  glass: "rgba(255,255,255,0.05)",
};

const ROMANCE_AUDIO = {
  message1: require("../../../assets/audio/voc/romance/confession-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/romance/confession-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/romance/confession-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/romance/confession-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/romance/toolbox/confession-toolbox-6.mp3"),
};

const TENSION_AUDIO = {
  message1: require("../../../assets/audio/voc/Tension/tension-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Tension/tension-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Tension/tension-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Tension/tension-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/Tension/toolbox/tension-toolbox-6.mp3"),
};

const POCHA_AUDIO = {
  message1: require("../../../assets/audio/voc/pocha/pocha-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/pocha/pocha-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/pocha/pocha-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/pocha/pocha-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/pocha/toolbox/pocha-toolbox-6.mp3"),
};

const SCENES = [
  {
    id: "romance",
    tab: "Romance",
    title: "La confession",
    koreanTitle: "고백 (Gobaek)",
    description: "Une soirée pluvieuse sous un parapluie partagé.",
    mood: "Pluie • Silence • Aveu",
    mission:
      "Comprendre une confession douce et savoir répondre naturellement.",
    realLife:
      "À utiliser quand tu veux exprimer un sentiment sans être trop direct.",
    accent: COLORS.pink,
    image: require("../../../assets/images/love.jpg"),
    dialogue: [
      {
        char: "Ji-soo",
        kr: "사실... 너 좋아해.",
        fr: "En fait... je t'aime bien.",
        side: "server",
        audio: ROMANCE_AUDIO.message1,
      },
      {
        char: "Min-ho",
        kr: "진짜? 전혀 몰랐어.",
        fr: "Vraiment ? Je n'en avais aucune idée.",
        side: "me",
        audio: ROMANCE_AUDIO.message2,
      },
      {
        char: "Ji-soo",
        kr: "부담 주고 싶진 않아. 그냥 말하고 싶었어.",
        fr: "Je ne veux pas te mettre la pression. Je voulais juste te le dire.",
        side: "server",
        audio: ROMANCE_AUDIO.message3,
      },
      {
        char: "Min-ho",
        kr: "고마워. 나도 꿈만 같아.",
        fr: "Merci. Pour moi aussi, c'est comme un rêve.",
        side: "me",
        audio: ROMANCE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "좋아해",
        rom: "Joahae",
        mean: "Je t'aime bien",
        context: "Utilisé pour les confessions romantiques.",
        audio: ROMANCE_AUDIO.toolbox1,
      },
      {
        word: "꿈만 같아",
        rom: "Kkum-man gata",
        mean: "C'est comme un rêve",
        context: "Quand on ne croit pas à son bonheur.",
        audio: ROMANCE_AUDIO.toolbox2,
      },
      {
        word: "심쿵",
        rom: "Simkung",
        mean: "Coup de foudre / Cœur qui bat",
        context: "Argot drama. Littéralement : coup au cœur.",
        audio: ROMANCE_AUDIO.toolbox3,
      },
      {
        word: "부담 갖지 마",
        rom: "Budam gatji ma",
        mean: "Ne te mets pas la pression",
        context: "Phrase douce pour rassurer quelqu'un.",
        audio: ROMANCE_AUDIO.toolbox4,
      },
      {
        word: "나도 그래",
        rom: "Nado geurae",
        mean: "Moi aussi",
        context: "Réponse courte et naturelle à un aveu.",
        audio: ROMANCE_AUDIO.toolbox5,
      },
      {
        word: "진심이야",
        rom: "Jinsimiya",
        mean: "Je suis sincère",
        context: "Pour rendre une confession plus claire.",
        audio: ROMANCE_AUDIO.toolbox6,
      },
    ],
  },
  {
    id: "tension",
    tab: "Tension",
    title: "Le duel de regards",
    koreanTitle: "긴장 (Ginjang)",
    description: "Tension électrique dans l'ascenseur de l'entreprise.",
    mood: "Bureau • Pression • Silence",
    mission: "Reconnaître une phrase de tension et répondre avec respect.",
    realLife:
      "Utile dans les situations sérieuses, au travail ou face à une critique.",
    accent: COLORS.cyan,
    image: require("../../../assets/images/office.jpg"),
    dialogue: [
      {
        char: "Directeur",
        kr: "정신 차리세요! 이게 최선입니까?",
        fr: "Reprends-toi ! C'est le mieux que tu puisses faire ?",
        side: "server",
        audio: TENSION_AUDIO.message1,
      },
      {
        char: "Employée",
        kr: "죄송합니다. 다시 하겠습니다.",
        fr: "Je suis désolé. Je vais recommencer.",
        side: "me",
        audio: TENSION_AUDIO.message2,
      },
      {
        char: "Directeur",
        kr: "이번엔 실망시키지 마세요.",
        fr: "Cette fois, ne me décevez pas.",
        side: "server",
        audio: TENSION_AUDIO.message3,
      },
      {
        char: "Employée",
        kr: "네, 꼭 해내겠습니다.",
        fr: "Oui, je vais absolument y arriver.",
        side: "me",
        audio: TENSION_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "정신 차리세요",
        rom: "Jeongsin chariseyo",
        mean: "Reprends-toi / Réveille-toi",
        context: "Indispensable pour les scènes de bureau.",
        audio: TENSION_AUDIO.toolbox1,
      },
      {
        word: "대박",
        rom: "Daebak",
        mean: "Incroyable / Choquant",
        context: "Utilisé partout, pour le bon ou le mauvais.",
        audio: TENSION_AUDIO.toolbox2,
      },
      {
        word: "실망이야",
        rom: "Silmang-iya",
        mean: "Je suis déçu",
        context: "Phrase fatale pour briser l'ambiance.",
        audio: TENSION_AUDIO.toolbox3,
      },
      {
        word: "죄송합니다",
        rom: "Joesonghamnida",
        mean: "Je suis désolé",
        context: "Formule de base dans une scène sérieuse.",
        audio: TENSION_AUDIO.toolbox4,
      },
      {
        word: "다시 하겠습니다",
        rom: "Dasi hagetseumnida",
        mean: "Je vais recommencer",
        context: "Réponse utile après une critique.",
        audio: TENSION_AUDIO.toolbox5,
      },
      {
        word: "꼭 해내겠습니다",
        rom: "Kkok haenaegetseumnida",
        mean: "Je vais absolument y arriver",
        context: "Phrase déterminée typique des dramas de bureau.",
        audio: TENSION_AUDIO.toolbox6,
      },
    ],
  },
  {
    id: "daily",
    tab: "Pocha",
    title: "Le repas au pocha",
    koreanTitle: "포장마차 (Pocha)",
    description: "Boire du soju après une longue journée.",
    mood: "Nuit • Amitié • Après-travail",
    mission:
      "Comprendre une scène chaleureuse entre amis après une journée difficile.",
    realLife:
      "Très naturel pour encourager quelqu’un ou célébrer un petit moment.",
    accent: COLORS.gold,
    image: require("../../../assets/images/pocha.jpg"),
    dialogue: [
      {
        char: "Pil-Seung",
        kr: "짠! 오늘 진짜 수고했어.",
        fr: "Tchin ! Tu as vraiment bien travaillé aujourd'hui.",
        side: "server",
        audio: POCHA_AUDIO.message1,
      },
      {
        char: "Dora",
        kr: "고마워. 오늘 좀 힘들었어.",
        fr: "Merci. Aujourd'hui, c'était un peu difficile.",
        side: "me",
        audio: POCHA_AUDIO.message2,
      },
      {
        char: "Pil-Seung",
        kr: "그래도 잘 버텼어. 대박이야.",
        fr: "Mais tu as bien tenu. C'est impressionnant.",
        side: "server",
        audio: POCHA_AUDIO.message3,
      },
      {
        char: "Dora",
        kr: "내일도 화이팅!",
        fr: "Demain aussi, Fighting !",
        side: "me",
        audio: POCHA_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "짠!",
        rom: "Jjan!",
        mean: "Tchin ! / Santé !",
        context: "Le son des verres qui s'entrechoquent.",
        audio: POCHA_AUDIO.toolbox1,
      },
      {
        word: "수고했어",
        rom: "Sugo-haesseo",
        mean: "Bravo pour tes efforts",
        context: "Se dit après le travail ou une épreuve.",
        audio: POCHA_AUDIO.toolbox2,
      },
      {
        word: "화이팅",
        rom: "Hwaiting",
        mean: "Bon courage / Allez !",
        context: "L'expression de soutien universelle.",
        audio: POCHA_AUDIO.toolbox3,
      },
      {
        word: "잘 버텼어",
        rom: "Jal beotyeosseo",
        mean: "Tu as bien tenu",
        context: "Pour encourager quelqu'un après une journée difficile.",
        audio: POCHA_AUDIO.toolbox4,
      },
      {
        word: "오늘 힘들었어",
        rom: "Oneul himdeureosseo",
        mean: "Aujourd'hui, c'était dur",
        context: "Phrase naturelle pour parler de fatigue.",
        audio: POCHA_AUDIO.toolbox5,
      },
      {
        word: "내일도 힘내",
        rom: "Naeildo himnae",
        mean: "Courage aussi demain",
        context: "Encouragement simple entre amis.",
        audio: POCHA_AUDIO.toolbox6,
      },
    ],
  },
];

export default function KDramaCulture() {
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
    setVisibleMessages(1);
    setIsTyping(false);
    setSelectedWord(null);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    stopAudio();
    fadeAnim.setValue(0);

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
  const shouldHighlightHint =
    !isTyping && visibleMessages < activeScene.dialogue.length;

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
        <LinearGradient
          colors={[
            "rgba(2,3,6,0.34)",
            "rgba(2,3,6,0.64)",
            "rgba(2,3,6,0.93)",
          ]}
          locations={[0, 0.48, 1]}
          style={styles.overlay}
          pointerEvents="none"
        />

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* HEADER NAV */}
          <View style={styles.topNav}>
            <AppBackButton />
            <View>
              <AppText variant="cardTitle" style={styles.navTitle}>
                Culture des K-dramas
              </AppText>
            </View>
          </View>

          {/* SCENE SELECTOR */}
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
                <AppText
                  variant="label"
                  lineContract="singleLine"
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

          {/* MAIN STAGE */}
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
                colors={[`${activeScene.accent}28`, "rgba(4,8,18,0.18)", "transparent"]}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.sceneMetaRow}>
                <AppText
                  variant="koreanSecondary"
                  script="korean"
                  lineContract="singleLine"
                  style={[styles.sceneSub, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </AppText>
              </View>

              <AppText
                accessibilityRole="header"
                variant="sceneTitle"
                style={styles.sceneTitle}
              >
                {activeScene.title}
              </AppText>
              <AppText variant="body" style={styles.sceneDesc}>
                {activeScene.description}
              </AppText>

              {/* DIALOGUE BUBBLES */}
              <Pressable onPress={advanceDialogue} style={styles.dialogueBox}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((d, index) => {
                    const dialogueId = `${activeScene.id}-dialogue-${index}`;
                    const isMe = d.side === "me";
                    const isActive = selectedWord === dialogueId;

                    return (
                      <Pressable
                        key={dialogueId}
                        onPress={(event) => {
                          event.stopPropagation();
                          playAudio(d.audio, dialogueId);
                        }}
                        style={[
                          styles.bubble,
                          isMe ? styles.bubbleRight : styles.bubbleLeft,
                          isActive && { borderColor: activeScene.accent },
                        ]}
                      >
                        <AppText
                          variant="label"
                          style={[
                            styles.charName,
                            { color: activeScene.accent },
                          ]}
                        >
                          {d.char}
                        </AppText>
                        <AppText
                          variant="koreanSecondary"
                          script="korean"
                          style={styles.krText}
                        >
                          {d.kr}
                        </AppText>
                        <AppText
                          variant="bodySecondary"
                          tone="muted"
                          style={styles.frText}
                        >
                          {d.fr}
                        </AppText>
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
                    <AppText
                      variant="label"
                      style={[styles.charName, { color: activeScene.accent }]}
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

                <AnimatedAppText
                  variant="caption"
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
                    ? VOC_DIALOGUE_COPY.restart
                    : isTyping
                      ? VOC_DIALOGUE_COPY.typing
                      : VOC_DIALOGUE_COPY.continue}
                </AnimatedAppText>
              </Pressable>
            </BlurView>
          </Animated.View>

          {/* TOOLBOX - EXPRESSIONS */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <AppText variant="sectionTitle" style={styles.toolboxTitle}>
                Expressions clés
              </AppText>
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
                          <View
                            style={{
                              flex: 1,
                              minWidth: RESPONSIVE_AUDIO_COPY_MIN_WIDTH,
                            }}
                          >
                            <AppText
                              variant="koreanPrimary"
                              script="korean"
                              style={styles.expWord}
                            >
                              {exp.word}
                            </AppText>
                            <AppText
                              variant="caption"
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
                            <AppText
                              variant="caption"
                              lineContract="singleLine"
                              style={[
                                styles.listenIcon,
                                { color: activeScene.accent },
                              ]}
                            >
                              {isActive ? "●" : "▶"}
                            </AppText>
                            <AppText
                              variant="label"
                              lineContract="singleLine"
                              style={styles.listenText}
                            >
                              ÉCOUTER
                            </AppText>
                          </View>
                        </View>

                        <AppText variant="bodyStrong" style={styles.expMean}>
                          {exp.mean}
                        </AppText>
                        <AppText
                          variant="bodySecondary"
                          tone="muted"
                          style={styles.expContext}
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
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
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
  navEyebrow: {},
  navTitle: {
    color: "#F5F7FA",
    opacity: 0.94,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 25,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: {
    color: COLORS.muted,
  },
  headerTitle: {
    color: COLORS.pink,
  },

  selectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  selectorItem: {
    minHeight: 46,
    minWidth: 94,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(4,8,18,0.58)",
  },
  selectorText: {
    color: COLORS.muted,
    textAlign: "center",
  },

  stage: { marginBottom: 18 },
  glassCard: {
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(4,8,18,0.62)",
    boxShadow: "0px 18px 38px rgba(0,0,0,0.30)",
  },

  sceneMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sceneSub: {},
  livePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  livePillText: {},

  sceneTitle: {
    color: COLORS.txt,
    marginBottom: 8,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 26,
  },

  moodCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(4,8,18,0.58)",
    marginBottom: 22,
  },
  moodLabel: {
    marginBottom: 4,
  },
  moodText: {
    color: COLORS.txt,
  },

  dialogueBox: { gap: 16 },
  bubble: {
    maxWidth: "90%",
    padding: 17,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(6,11,20,0.74)",
    borderBottomLeftRadius: 6,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderBottomRightRadius: 6,
  },
  charName: {
    marginBottom: 6,
  },
  krText: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  frText: {
    color: COLORS.muted,
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
    color: "rgba(255,255,255,0.48)",
    marginTop: 8,
  },

  immersionCard: {
    padding: 18,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(4,8,18,0.62)",
    marginBottom: 30,
  },
  immersionAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  immersionLabel: {
    marginBottom: 8,
  },
  immersionText: {
    color: COLORS.txt,
    marginBottom: 8,
  },
  realLifeText: {
    color: COLORS.muted,
  },

  toolbox: {
    marginTop: 36,
  },
  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  toolboxTitle: {
    color: COLORS.txt,
  },
  toolboxLine: {
    flex: 1,
    height: 1,
    opacity: 0.38,
  },

  expressionGrid: {
    gap: 12,
  },
  expPressable: { width: "100%" },
  expCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(4,8,18,0.70)",
    boxShadow: "0px 10px 26px rgba(0,0,0,0.22)",
  },
  expAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  expContent: {
    padding: 20,
  },
  expTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  expWord: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  expRom: {},
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
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  listenIcon: {},
  listenText: {
    color: "rgba(255,255,255,0.84)",
  },
});
