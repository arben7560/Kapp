import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ABSOLUTE_FILL } from "../../../constants/layout";

const { width } = Dimensions.get("window");

type AudioAsset = number;

type DialogueMessage = {
  char: string;
  kr: string;
  fr: string;
  side: "me" | "server";
  audio?: AudioAsset;
};

type ExpressionItem = {
  word: string;
  rom: string;
  mean: string;
  context: string;
  audio?: AudioAsset;
};

type Scene = {
  id: string;
  title: string;
  koreanTitle: string;
  description: string;
  accent: string;
  image: number;
  dialogue: DialogueMessage[];
  expressions: ExpressionItem[];
};

const COLORS = {
  bg: "#020306",
  calmBlue: "#7DD3FC",
  softTeal: "#2DD4BF",
  pureWhite: "#F8FAFC",
  accentOrange: "#FB923C",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const RENCONTRE_AUDIO = {
  message1: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-4.mp3"),

  bonjour: require("../../../assets/audio/voc/Rencontre/toolbox/bonjour.mp3"),
  enchanteRencontre: require("../../../assets/audio/voc/Rencontre/toolbox/enchante-rencontre.mp3"),
  jeMappelle: require("../../../assets/audio/voc/Rencontre/toolbox/je-mappelle.mp3"),
  jeSuisFrancais: require("../../../assets/audio/voc/Rencontre/toolbox/je-suis-francais.mp3"),
  raviDeTeRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-te-rencontrer.mp3"),
  raviDeVousRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-vous-rencontrer.mp3"),
  jeCompteSurVous: require("../../../assets/audio/voc/Rencontre/toolbox/je-compte-sur-vous.mp3"),
};

const POLITESSE_AUDIO = {
  message1: require("../../../assets/audio/voc/Politesse/politesse-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Politesse/politesse-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Politesse/politesse-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Politesse/politesse-bulle-4.mp3"),

  excusezMoi: require("../../../assets/audio/voc/Politesse/toolbox/excusez-moi.mp3"),
  gomawoyo: require("../../../assets/audio/voc/Politesse/toolbox/gomawoyo.mp3"),
  jeogiyo: require("../../../assets/audio/voc/Politesse/toolbox/jeogiyo.mp3"),
  merci: require("../../../assets/audio/voc/Politesse/toolbox/merci.mp3"),
  unInstant: require("../../../assets/audio/voc/Politesse/toolbox/un-instant.mp3"),
  voici: require("../../../assets/audio/voc/Politesse/toolbox/voici.mp3"),
  pasGrave: require("../../../assets/audio/voc/Politesse/toolbox/pas-grave.mp3"),
};
const EXCUSER_AUDIO = {
  message1: require("../../../assets/audio/voc/Excuser/excuser-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Excuser/excuser-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Excuser/excuser-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Excuser/excuser-bulle-4.mp3"),

  anieyo: require("../../../assets/audio/voc/Excuser/toolbox/anieyo.mp3"),
  desole: require("../../../assets/audio/voc/Excuser/toolbox/desole.mp3"),
  mianhae: require("../../../assets/audio/voc/Excuser/toolbox/mianhae.mp3"),
  mianhaeyo: require("../../../assets/audio/voc/Excuser/toolbox/mianhaeyo.mp3"),
  retardDesole: require("../../../assets/audio/voc/Excuser/toolbox/retard-desole.mp3"),
  vraimentDesole: require("../../../assets/audio/voc/Excuser/toolbox/vraiment-desole.mp3"),
  caVa: require("../../../assets/audio/voc/Excuser/toolbox/ca-va.mp3"),
};
const SCENES: Scene[] = [
  {
    id: "greeting",
    title: "La Rencontre",
    koreanTitle: "첫 만남 (Cheot Mannam)",
    description: "Saluer poliment et se présenter pour la première fois.",
    accent: COLORS.calmBlue,
    image: require("../../../assets/images/meet.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "안녕하세요! 처음 뵙겠습니다.",
        fr: "Bonjour ! Enchanté de vous rencontrer.",
        side: "me",
        audio: RENCONTRE_AUDIO.message1,
      },
      {
        char: "Ji-won",
        kr: "네, 안녕하세요. 만나서 반가워요.",
        fr: "Oui, bonjour. Ravi de vous rencontrer.",
        side: "server",
        audio: RENCONTRE_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "제 이름은 마크예요. 저는 프랑스 사람이에요.",
        fr: "Je m'appelle Marc. Je suis français.",
        side: "me",
        audio: RENCONTRE_AUDIO.message3,
      },
      {
        char: "Ji-won",
        kr: "반갑습니다. 잘 부탁드립니다.",
        fr: "Enchantée. Je compte sur vous.",
        side: "server",
        audio: RENCONTRE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "안녕하세요",
        rom: "Annyeong-haseyo",
        mean: "Bonjour",
        context: "La salutation universelle et polie.",
        audio: RENCONTRE_AUDIO.bonjour,
      },
      {
        word: "처음 뵙겠습니다",
        rom: "Cheoeum boepgetseumnida",
        mean: "Enchanté de vous rencontrer",
        context: "Forme très polie lors d'une première rencontre.",
        audio: RENCONTRE_AUDIO.enchanteRencontre,
      },
      {
        word: "반갑습니다",
        rom: "Bangapseumnida",
        mean: "Ravi de vous rencontrer",
        context: "Très respectueux, utile en contexte formel.",
        audio: RENCONTRE_AUDIO.raviDeVousRencontrer,
      },
      {
        word: "만나서 반가워요",
        rom: "Mannaseo bangawoyo",
        mean: "Ravi de te/vous rencontrer",
        context: "Forme polie mais plus naturelle au quotidien.",
        audio: RENCONTRE_AUDIO.raviDeTeRencontrer,
      },
      {
        word: "제 이름은 마크예요",
        rom: "Je ireumeun makeu ieyo",
        mean: "Mon nom est Marc",
        context: "Structure formelle pour se présenter.",
        audio: RENCONTRE_AUDIO.jeMappelle,
      },
      {
        word: "저는 프랑스 사람이에요",
        rom: "Jeoneun Peurangseu saram-ieyo",
        mean: "Je suis français",
        context: "Phrase simple pour dire sa nationalité.",
        audio: RENCONTRE_AUDIO.jeSuisFrancais,
      },
      {
        word: "잘 부탁드립니다",
        rom: "Jal butakdeurimnida",
        mean: "Je compte sur vous",
        context: "Expression culturelle après une présentation.",
        audio: RENCONTRE_AUDIO.jeCompteSurVous,
      },
    ],
  },
  {
    id: "politeness",
    title: "Politesse",
    koreanTitle: "예의 (Yei)",
    description: "Demander un prix poliment dans une boutique.",
    accent: COLORS.softTeal,
    image: require("../../../assets/images/meet.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "죄송해요. 잠시만요.",
        fr: "Excusez-moi, je peux regarder un instant ?",
        side: "me",
        audio: POLITESSE_AUDIO.message1,
      },
      {
        char: "Vendeur",
        kr: "네, 괜찮습니다. 천천히 하세요.",
        fr: "Oui, bien sûr. Prenez votre temps.",
        side: "server",
        audio: POLITESSE_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "감사합니다. 저기요, 이거 얼마예요?",
        fr: "Merci. Excusez-moi, cet article coûte combien ?",
        side: "me",
        audio: POLITESSE_AUDIO.message3,
      },
      {
        char: "Vendeur",
        kr: "여기 있습니다. 만 원입니다.",
        fr: "Tenez, c'est 10 000 wons.",
        side: "server",
        audio: POLITESSE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "감사합니다",
        rom: "Gamsahamnida",
        mean: "Merci",
        context: "Forme très polie et standard.",
        audio: POLITESSE_AUDIO.merci,
      },
      {
        word: "고마워요",
        rom: "Gomawoyo",
        mean: "Merci",
        context: "Poli, plus doux et quotidien.",
        audio: POLITESSE_AUDIO.gomawoyo,
      },
      {
        word: "죄송해요",
        rom: "Joesonghaeyo",
        mean: "Excusez-moi",
        context: "Pour interpeller ou passer dans la foule.",
        audio: POLITESSE_AUDIO.excusezMoi,
      },
      {
        word: "잠시만요",
        rom: "Jamsimanyo",
        mean: "Un instant / laissez-moi passer",
        context: "Très fréquent dans les transports ou magasins.",
        audio: POLITESSE_AUDIO.unInstant,
      },
      {
        word: "저기요",
        rom: "Jeogiyo",
        mean: "S'il vous plaît / excusez-moi",
        context: "Pour appeler un serveur ou attirer l'attention.",
        audio: POLITESSE_AUDIO.jeogiyo,
      },
      {
        word: "여기 있습니다",
        rom: "Yeogi itseumnida",
        mean: "Voici",
        context: "Quand on donne quelque chose poliment.",
        audio: POLITESSE_AUDIO.voici,
      },
      {
        word: "괜찮습니다",
        rom: "Gwaenchansseumnida",
        mean: "Ça va / ce n'est pas grave",
        context: "Forme polie pour rassurer.",
        audio: POLITESSE_AUDIO.pasGrave,
      },
    ],
  },
  {
    id: "apology",
    title: "S'excuser",
    koreanTitle: "사과 (Sagwa)",
    description: "Exprimer des regrets de manière appropriée.",
    accent: COLORS.accentOrange,
    image: require("../../../assets/images/meet.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "늦어서 정말 죄송합니다.",
        fr: "Je suis vraiment désolé d'être en retard.",
        side: "me",
        audio: EXCUSER_AUDIO.message1,
      },
      {
        char: "Ji-ho",
        kr: "아니에요, 괜찮아요.",
        fr: "Ce n'est rien, ce n'est pas grave.",
        side: "server",
        audio: EXCUSER_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "기다리게 해서 미안해요.",
        fr: "Désolé de t'avoir fait attendre.",
        side: "me",
        audio: EXCUSER_AUDIO.message3,
      },
      {
        char: "Ji-ho",
        kr: "정말 괜찮아요. 그럼 갈까요?",
        fr: "Vraiment, ça va. Allons-y ensemble maintenant.",
        side: "server",
        audio: EXCUSER_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "죄송합니다",
        rom: "Joesong-hamnida",
        mean: "Je suis désolé",
        context: "Forme polie et standard d'excuse.",
        audio: EXCUSER_AUDIO.desole,
      },
      {
        word: "정말 죄송합니다",
        rom: "Jeongmal joesong-hamnida",
        mean: "Je suis vraiment désolé",
        context: "Plus intense, pour une vraie faute.",
        audio: EXCUSER_AUDIO.vraimentDesole,
      },
      {
        word: "늦어서 죄송합니다",
        rom: "Neujeoseo joesong-hamnida",
        mean: "Désolé d'être en retard",
        context: "Très utile dans un rendez-vous.",
        audio: EXCUSER_AUDIO.retardDesole,
      },
      {
        word: "미안해요",
        rom: "Mianhaeyo",
        mean: "Désolé",
        context: "Poli, plus doux et personnel.",
        audio: EXCUSER_AUDIO.mianhaeyo,
      },
      {
        word: "미안해",
        rom: "Mianhae",
        mean: "Désolé",
        context: "Familier, avec des amis proches.",
        audio: EXCUSER_AUDIO.mianhae,
      },
      {
        word: "아니에요",
        rom: "Anieyo",
        mean: "Ce n'est rien",
        context: "Réponse naturelle à des excuses.",
        audio: EXCUSER_AUDIO.anieyo,
      },
      {
        word: "괜찮아요",
        rom: "Gwaenchanayo",
        mean: "Ça va / ce n'est pas grave",
        context: "Pour rassurer quelqu'un.",
        audio: EXCUSER_AUDIO.caVa,
      },
    ],
  },
];

export default function FirstStepsImmersion() {
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAutoPlayNextMessageRef = useRef(false);

  const playerRef = useRef<AudioPlayer | null>(null);
  const activeAudioIdRef = useRef<string | null>(null);
  const playbackListenerRef = useRef<{ remove: () => void } | null>(null);

  const cleanupAudioListener = useCallback(() => {
    if (playbackListenerRef.current) {
      playbackListenerRef.current.remove();
      playbackListenerRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    try {
      cleanupAudioListener();

      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
        playerRef.current = null;
      }

      activeAudioIdRef.current = null;
    } catch {
      playerRef.current = null;
      activeAudioIdRef.current = null;
    }
  }, [cleanupAudioListener]);

  const playAudio = useCallback(
    (audioSource?: AudioAsset, id?: string) => {
      if (!audioSource) return;

      try {
        stopAudio();

        if (id) {
          activeAudioIdRef.current = id;
          setSelectedWord(id);
        }

        Vibration.vibrate(8);

        const player = createAudioPlayer(audioSource, {
          updateInterval: 250,
        });

        playerRef.current = player;

        playbackListenerRef.current = player.addListener(
          "playbackStatusUpdate",
          (status) => {
            const currentId = activeAudioIdRef.current;
            const statusAny = status as any;

            const didFinish =
              statusAny.didJustFinish === true ||
              statusAny.playbackState === "ended" ||
              statusAny.playbackState === "finished" ||
              statusAny.timeControlStatus === "ended" ||
              (typeof statusAny.currentTime === "number" &&
                typeof statusAny.duration === "number" &&
                statusAny.duration > 0 &&
                statusAny.currentTime >= statusAny.duration - 0.05 &&
                statusAny.playing === false);

            if (!didFinish) return;

            if (currentId) {
              setSelectedWord((current) =>
                current === currentId ? null : current,
              );
            }

            cleanupAudioListener();

            try {
              player.remove();
            } catch {
              // évite un crash si le player est déjà libéré
            }

            if (playerRef.current === player) {
              playerRef.current = null;
            }

            activeAudioIdRef.current = null;
          },
        );

        player.seekTo(0);
        player.play();
      } catch {
        setSelectedWord(null);
        activeAudioIdRef.current = null;
      }
    },
    [cleanupAudioListener, stopAudio],
  );

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
    }).catch(() => null);
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }).start();

    stopAudio();
    shouldAutoPlayNextMessageRef.current = false;
    setSelectedWord(null);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
  }, [activeScene, fadeAnim, stopAudio]);

  useEffect(() => {
    if (!shouldAutoPlayNextMessageRef.current || isTyping) return;

    shouldAutoPlayNextMessageRef.current = false;

    const currentMessageIndex = visibleMessages - 1;
    const currentMessage = activeScene.dialogue[currentMessageIndex];

    if (!currentMessage) return;

    playAudio(
      currentMessage.audio,
      `${activeScene.id}-dialogue-${currentMessageIndex}`,
    );
  }, [activeScene, visibleMessages, isTyping, playAudio]);

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

  const handleSceneChange = (scene: Scene) => {
    if (scene.id === activeScene.id) return;

    stopAudio();
    shouldAutoPlayNextMessageRef.current = false;
    setSelectedWord(null);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    setActiveScene(scene);
  };

  const advanceDialogue = () => {
    if (isTyping) return;

    if (visibleMessages >= activeScene.dialogue.length) {
      Vibration.vibrate(8);
      stopAudio();
      shouldAutoPlayNextMessageRef.current = false;
      setSelectedWord(null);
      setVisibleMessages(1);
      setIsTyping(false);
      return;
    }

    const nextMessage = activeScene.dialogue[visibleMessages];

    Vibration.vibrate(8);
    shouldAutoPlayNextMessageRef.current = true;

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

  const shouldHighlightHint =
    !isTyping && visibleMessages < activeScene.dialogue.length;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={activeScene.image}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.topNav}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <View>
              <Text style={[styles.navEyebrow, { color: activeScene.accent }]}>
                SÉOUL IMMERSION
              </Text>
              <Text style={styles.navTitle}>Premiers Pas</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeScene.id === scene.id && {
                      color: activeScene.accent,
                    },
                  ]}
                >
                  {scene.title}
                </Text>
              </Pressable>
            ))}
          </View>

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
            <BlurView intensity={30} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.cardInfo}>
                <Text
                  style={[styles.krCategory, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.sceneTitle}>{activeScene.title}</Text>
                <Text style={styles.sceneSubtitle}>
                  {activeScene.description}
                </Text>
              </View>

              <View style={styles.chatArea}>
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
                          playAudio(line.audio, dialogueId);
                        }}
                        style={[
                          styles.msgBox,
                          isMe ? styles.msgRight : styles.msgLeft,
                          isActive && {
                            borderColor: activeScene.accent,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.msgChar,
                            { color: activeScene.accent },
                          ]}
                        >
                          {line.char}
                        </Text>
                        <Text style={styles.msgKr}>{line.kr}</Text>
                        <Text style={styles.msgFr}>{line.fr}</Text>
                      </Pressable>
                    );
                  })}

                {isTyping && (
                  <View
                    style={[styles.msgBox, styles.msgLeft, styles.typingBubble]}
                  >
                    <Text
                      style={[styles.msgChar, { color: activeScene.accent }]}
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

                <Pressable onPress={advanceDialogue} disabled={isTyping}>
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
              </View>
            </BlurView>
          </Animated.View>

          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>FOUNDATION TOOLBOX</Text>
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
                      intensity={18}
                      tint="dark"
                      style={[
                        styles.expCard,
                        isActive && { borderColor: activeScene.accent },
                      ]}
                    >
                      <View
                        style={[
                          styles.expGlow,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.8,
                          },
                        ]}
                      />

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
                      <Text style={styles.expCtx}>{exp.context}</Text>
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
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.86)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 90 },

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
    fontWeight: "900",
    letterSpacing: 2,
  },
  navTitle: { color: "#fff", fontSize: 14, fontWeight: "600", opacity: 0.8 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  levelText: {
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
  },

  tabBar: { flexDirection: "row", gap: 10, marginBottom: 25 },
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

  mainCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardInfo: { marginBottom: 30 },
  krCategory: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
  },
  sceneSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 20,
  },

  chatArea: { gap: 16 },
  msgBox: {
    maxWidth: "85%",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  msgLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 2,
  },
  msgRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 2,
  },
  msgChar: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  msgKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 5,
  },
  msgFr: {
    color: COLORS.muted,
    fontSize: 12,
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
    fontSize: 11,
    letterSpacing: 3,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expPressable: { width: "100%" },
  expCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  expTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 22,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    textTransform: "uppercase",
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  expCtx: {
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
    color: "rgba(255, 255, 255, 0.78)",
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
});
