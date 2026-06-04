import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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
import { useVocAudio } from "../../../hooks/useVocAudio";
import { ABSOLUTE_FILL } from "../../../constants/layout";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#020306",
  corporateBlue: "#38BDF8",
  executiveViolet: "#8B5CF6",
  premiumGold: "#F59E0B",
  graphite: "#64748B",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const REUNION_AUDIO = {
  message1: require("../../../assets/audio/voc/reunion/reunion-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/reunion/reunion-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/reunion/reunion-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/reunion/reunion-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-6.mp3"),
  toolbox7: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-7.mp3"),
  toolbox8: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-8.mp3"),
  toolbox9: require("../../../assets/audio/voc/reunion/toolbox/reunion-toolbox-9.mp3"),
};

const MAIL_AUDIO = {
  message1: require("../../../assets/audio/voc/mail/mail-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/mail/mail-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/mail/mail-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/mail/mail-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-6.mp3"),
  toolbox7: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-7.mp3"),
  toolbox8: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-8.mp3"),
  toolbox9: require("../../../assets/audio/voc/mail/toolbox/message-toolbox-9.mp3"),
};

const INTERVIEW_AUDIO = {
  message1: require("../../../assets/audio/voc/interview/interview-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/interview/interview-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/interview/interview-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/interview/interview-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-6.mp3"),
  toolbox7: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-7.mp3"),
  toolbox8: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-8.mp3"),
  toolbox9: require("../../../assets/audio/voc/interview/toolbox/interview-toolbox-9.mp3"),
};

const SCENES = [
  {
    id: "meeting",
    title: "La Réunion",
    koreanTitle: "회의 (Hoeui)",
    description:
      "Donner son avis, demander une explication et participer avec respect.",
    accent: COLORS.corporateBlue,
    image: require("../../../assets/images/businessmeeting.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "회의 시작할까요?",
        fr: "On commence la réunion ?",
        side: "me",
        audio: REUNION_AUDIO.message1,
      },
      {
        char: "Manager",
        kr: "네, 시작하겠습니다. 먼저 보고드리겠습니다.",
        fr: "Oui, nous allons commencer. Je vais d'abord vous faire le rapport.",
        side: "server",
        audio: REUNION_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "제 의견은 조금 다릅니다. 다시 설명해 주시겠어요?",
        fr: "Mon avis est un peu différent. Pouvez-vous réexpliquer ?",
        side: "me",
        audio: REUNION_AUDIO.message3,
      },
      {
        char: "Manager",
        kr: "네, 좋은 질문입니다. 자료를 보면서 설명드리겠습니다.",
        fr: "Oui, bonne question. Je vais expliquer avec les documents.",
        side: "server",
        audio: REUNION_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "회의",
        rom: "Hoeui",
        mean: "Réunion",
        context: "Mot de base pour parler d'une réunion professionnelle.",
        speak: "회의",
        audio: REUNION_AUDIO.toolbox1,
      },
      {
        word: "회의 시작할까요?",
        rom: "Hoeui sijak-halkkayo?",
        mean: "On commence la réunion ?",
        context: "Phrase naturelle pour ouvrir une réunion.",
        speak: "회의 시작할까요?",
        audio: REUNION_AUDIO.toolbox2,
      },
      {
        word: "제 의견은...",
        rom: "Je uigyeoneun...",
        mean: "Mon avis est...",
        context: "Structure utile pour donner son point de vue.",
        speak: "제 의견은",
        audio: REUNION_AUDIO.toolbox3,
      },
      {
        word: "좋은 생각입니다",
        rom: "Joeun saenggagimnida",
        mean: "C'est une bonne idée",
        context: "Réaction polie et positive en réunion.",
        speak: "좋은 생각입니다",
        audio: REUNION_AUDIO.toolbox4,
      },
      {
        word: "다시 설명해 주세요",
        rom: "Dasi seolmyeong-hae juseyo",
        mean: "Expliquez à nouveau, s'il vous plaît",
        context: "Très utile quand tu n'as pas bien compris.",
        speak: "다시 설명해 주세요",
        audio: REUNION_AUDIO.toolbox5,
      },
      {
        word: "자료",
        rom: "Jaryo",
        mean: "Document / support",
        context: "Documents utilisés en réunion ou présentation.",
        speak: "자료",
        audio: REUNION_AUDIO.toolbox6,
      },
      {
        word: "공유하겠습니다",
        rom: "Gongyu-hagetseumnida",
        mean: "Je vais partager",
        context: "Pour parler d'un document ou d'une information.",
        speak: "공유하겠습니다",
        audio: REUNION_AUDIO.toolbox7,
      },
      {
        word: "질문 있습니다",
        rom: "Jilmun itseumnida",
        mean: "J'ai une question",
        context: "Formule professionnelle pour intervenir.",
        speak: "질문 있습니다",
        audio: REUNION_AUDIO.toolbox8,
      },
      {
        word: "확인해 보겠습니다",
        rom: "Hwagin-hae bogetseumnida",
        mean: "Je vais vérifier",
        context: "Très fréquent dans les échanges professionnels.",
        speak: "확인해 보겠습니다",
        audio: REUNION_AUDIO.toolbox9,
      },
    ],
  },
  {
    id: "message",
    title: "Le Message Pro",
    koreanTitle: "업무 메일",
    description:
      "Demander, confirmer et répondre avec une formule professionnelle.",
    accent: COLORS.executiveViolet,
    image: require("../../../assets/images/businessmail.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "안녕하세요. 첨부 파일 확인 부탁드립니다.",
        fr: "Bonjour. Merci de vérifier la pièce jointe.",
        side: "me",
        audio: MAIL_AUDIO.message1,
      },
      {
        char: "Collègue",
        kr: "네, 확인 후 답변드리겠습니다.",
        fr: "Oui, je vérifierai puis je vous répondrai.",
        side: "server",
        audio: MAIL_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "감사합니다. 오늘 중으로 가능할까요?",
        fr: "Merci. Est-ce possible dans la journée ?",
        side: "me",
        audio: MAIL_AUDIO.message3,
      },
      {
        char: "Collègue",
        kr: "네, 가능합니다. 곧 답변드리겠습니다.",
        fr: "Oui, c'est possible. Je vous répondrai bientôt.",
        side: "server",
        audio: MAIL_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "업무 메일",
        rom: "Eommu meil",
        mean: "Mail professionnel",
        context: "Expression générale pour parler d'un email de travail.",
        speak: "업무 메일",
        audio: MAIL_AUDIO.toolbox1,
      },
      {
        word: "확인 부탁드립니다",
        rom: "Hwagin butakdeurimnida",
        mean: "Merci de vérifier",
        context: "Formule extrêmement fréquente dans les mails coréens.",
        speak: "확인 부탁드립니다",
        audio: MAIL_AUDIO.toolbox2,
      },
      {
        word: "첨부 파일",
        rom: "Cheombu pail",
        mean: "Pièce jointe",
        context: "Indispensable pour les échanges par email.",
        speak: "첨부 파일",
        audio: MAIL_AUDIO.toolbox3,
      },
      {
        word: "답변드리겠습니다",
        rom: "Dapbyeon-deurigetseumnida",
        mean: "Je vous répondrai",
        context: "Formule polie et professionnelle.",
        speak: "답변드리겠습니다",
        audio: MAIL_AUDIO.toolbox4,
      },
      {
        word: "오늘 중으로",
        rom: "Oneul jungeuro",
        mean: "Dans la journée",
        context: "Pour donner ou demander un délai court.",
        speak: "오늘 중으로",
        audio: MAIL_AUDIO.toolbox5,
      },
      {
        word: "가능할까요?",
        rom: "Ganeung-halkkayo?",
        mean: "Est-ce possible ?",
        context: "Formule douce pour demander quelque chose.",
        speak: "가능할까요?",
        audio: MAIL_AUDIO.toolbox6,
      },
      {
        word: "늦게 연락드려 죄송합니다",
        rom: "Neutge yeollakdeuryeo joesonghamnida",
        mean: "Désolé de vous contacter tard",
        context: "Formule utile en contexte professionnel sensible.",
        speak: "늦게 연락드려 죄송합니다",
        audio: MAIL_AUDIO.toolbox7,
      },
      {
        word: "감사합니다",
        rom: "Gamsahamnida",
        mean: "Merci / Cordialement",
        context: "Très utilisé pour terminer un mail professionnel.",
        speak: "감사합니다",
        audio: MAIL_AUDIO.toolbox8,
      },
      {
        word: "좋은 하루 보내고 계시길 바랍니다",
        rom: "Joeun haru bonego gyesigil barabnida",
        mean: "J'espère que vous passez une bonne journée",
        context: "Formule polie et chaleureuse dans un message professionnel.",
        speak: "좋은 하루 보내고 계시길 바랍니다",
        audio: undefined,
      },
      {
        word: "회신 부탁드립니다",
        rom: "Hoesin butakdeurimnida",
        mean: "Merci de répondre",
        context: "Formule pour demander une réponse par mail.",
        speak: "회신 부탁드립니다",
        audio: MAIL_AUDIO.toolbox9,
      },
    ],
  },
  {
    id: "interview",
    title: "L’Entretien",
    koreanTitle: "면접 (Myeonjeop)",
    description:
      "Se présenter, répondre avec confiance et laisser une bonne impression.",
    accent: COLORS.premiumGold,
    image: require("../../../assets/images/businessinterview.png"),
    dialogue: [
      {
        char: "Recruteur",
        kr: "자기소개 부탁드립니다.",
        fr: "Présentez-vous, s'il vous plaît.",
        side: "server",
        audio: INTERVIEW_AUDIO.message1,
      },
      {
        char: "Moi",
        kr: "안녕하세요. 저는 프랑스에서 온 마크입니다.",
        fr: "Bonjour. Je suis Marc, je viens de France.",
        side: "me",
        audio: INTERVIEW_AUDIO.message2,
      },
      {
        char: "Recruteur",
        kr: "이 분야에 관심이 많은 이유가 있나요?",
        fr: "Pourquoi vous intéressez-vous beaucoup à ce domaine ?",
        side: "server",
        audio: INTERVIEW_AUDIO.message3,
      },
      {
        char: "Moi",
        kr: "경력이 있고, 한국어와 비즈니스에 관심이 많습니다.",
        fr: "J'ai de l'expérience professionnelle et je m'intéresse beaucoup au coréen et au business.",
        side: "me",
        audio: INTERVIEW_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "면접",
        rom: "Myeonjeop",
        mean: "Entretien",
        context: "Mot clé pour un entretien d'embauche.",
        speak: "면접",
        audio: INTERVIEW_AUDIO.toolbox1,
      },
      {
        word: "자기소개",
        rom: "Jagi-sogae",
        mean: "Présentation de soi",
        context: "Moment classique au début d'un entretien.",
        speak: "자기소개",
        audio: INTERVIEW_AUDIO.toolbox2,
      },
      {
        word: "자기소개 부탁드립니다",
        rom: "Jagi-sogae butakdeurimnida",
        mean: "Présentez-vous, s'il vous plaît",
        context: "Phrase très fréquente en entretien.",
        speak: "자기소개 부탁드립니다",
        audio: INTERVIEW_AUDIO.toolbox3,
      },
      {
        word: "저는 프랑스에서 왔습니다",
        rom: "Jeoneun Peurangseu-eseo watseumnida",
        mean: "Je viens de France",
        context: "Formule simple pour présenter son origine.",
        speak: "저는 프랑스에서 왔습니다",
        audio: INTERVIEW_AUDIO.toolbox4,
      },
      {
        word: "이 분야",
        rom: "I bunya",
        mean: "Ce domaine",
        context: "Très utile pour parler d'un secteur professionnel.",
        speak: "이 분야",
        audio: INTERVIEW_AUDIO.toolbox5,
      },
      {
        word: "관심이 많습니다",
        rom: "Gwansimi manseumnida",
        mean: "Je m'y intéresse beaucoup",
        context: "Expression professionnelle pour parler de motivation.",
        speak: "관심이 많습니다",
        audio: INTERVIEW_AUDIO.toolbox6,
      },
      {
        word: "경력이 있습니다",
        rom: "Gyeongryeogi itseumnida",
        mean: "J'ai de l'expérience professionnelle",
        context: "Phrase clé pour valoriser son profil.",
        speak: "경력이 있습니다",
        audio: INTERVIEW_AUDIO.toolbox7,
      },
      {
        word: "장점",
        rom: "Jangjeom",
        mean: "Point fort",
        context: "Utile pour parler de ses qualités.",
        speak: "장점",
        audio: INTERVIEW_AUDIO.toolbox8,
      },
      {
        word: "잘 부탁드립니다",
        rom: "Jal butakdeurimnida",
        mean: "Je compte sur vous",
        context: "Expression culturelle très importante en contexte pro.",
        speak: "잘 부탁드립니다",
        audio: INTERVIEW_AUDIO.toolbox9,
      },
    ],
  },
];

export default function BusinessImmersion() {
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

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }).start();

    stopAudio();
    setSelectedWord(null);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
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
          <View style={styles.topNav}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <View>
              <Text style={[styles.navEyebrow, { color: activeScene.accent }]}>
                SÉOUL IMMERSION
              </Text>
              <Text style={styles.navTitle}>Business</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: `${activeScene.accent}25`,
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
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
            <BlurView intensity={40} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}20`, "transparent"]}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.cardHeader}>
                <Text style={[styles.krLabel, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.sceneMainTitle}>{activeScene.title}</Text>
              </View>

              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <Pressable onPress={advanceDialogue} style={styles.dialogueList}>
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
                        <Text
                          style={[
                            styles.bubbleChar,
                            { color: activeScene.accent },
                          ]}
                        >
                          {chat.char}
                        </Text>
                        <Text style={styles.bubbleKr}>{chat.kr}</Text>
                        <Text style={styles.bubbleFr}>{chat.fr}</Text>
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
                    <Text
                      style={[styles.bubbleChar, { color: activeScene.accent }]}
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
            <View style={styles.toolboxTitleRow}>
              <Text style={styles.toolboxTitle}>BUSINESS TOOLBOX</Text>
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
                            <Text style={styles.vocabKr}>{exp.word}</Text>
                            <Text
                              style={[
                                styles.vocabRom,
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

                        <Text style={styles.vocabMean}>{exp.mean}</Text>
                        <Text style={styles.vocabCtx}>{exp.context}</Text>
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
    backgroundColor: "rgba(2,3,6,0.56)",
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
  badgeChef: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: {
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1,
  },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
  },

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardHeader: { marginBottom: 15 },
  krLabel: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sceneMainTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 30,
    lineHeight: 20,
  },

  dialogueList: { gap: 16 },
  bubble: {
    maxWidth: "88%",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 4,
  },
  bubbleChar: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bubbleKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 4,
  },
  bubbleFr: {
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

  toolbox: { marginTop: 40 },
  toolboxTitleRow: {
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
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  vocabRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    textTransform: "uppercase",
  },
  vocabMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  vocabCtx: {
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
