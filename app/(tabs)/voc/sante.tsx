import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { AnimatedAppText, AppText } from "../../../components/app-text";
import { useVocAudio } from "../../../hooks/useVocAudio";
import { ABSOLUTE_FILL } from "../../../constants/layout";

const COLORS = {
  bg: "#020306",
  medicalBlue: "#38BDF8",
  safetyGreen: "#34D399",
  emergencyRed: "#FB7185",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const PHARMACIE_AUDIO = {
  message1: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/pharmacie/pharmacie-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/pharmacie/toolbox/pharmacie-toolbox-4.mp3"),
};

const HOPITAL_AUDIO = {
  message1: require("../../../assets/audio/voc/hopital/hopital-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/hopital/hopital-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/hopital/hopital-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/hopital/hopital-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/hopital/toolbox/hopital-toolbox-3.mp3"),
};

const URGENCE_AUDIO = {
  message1: require("../../../assets/audio/voc/urgence/urgence-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/urgence/urgence-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/urgence/urgence-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/urgence/urgence-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/urgence/toolbox/urgence-toolbox-3.mp3"),
};

const SCENES = [
  {
    id: "pharmacy",
    title: "La Pharmacie",
    koreanTitle: "약국 (Yak-guk)",
    description: "Demander conseil pour des symptômes courants.",
    accent: COLORS.safetyGreen,
    image: require("../../../assets/images/safety.png"),
    dialogue: [
      {
        char: "Patient",
        kr: "머리가 아프고 열이 나요.",
        fr: "J'ai mal à la tête et j'ai de la fièvre.",
        side: "me",
        audio: PHARMACIE_AUDIO.message1,
      },
      {
        char: "Pharmacien",
        kr: "언제부터 아프셨어요?",
        fr: "Depuis quand avez-vous mal ?",
        side: "server",
        audio: PHARMACIE_AUDIO.message2,
      },
      {
        char: "Patient",
        kr: "오늘 아침부터 아팠어요.",
        fr: "J'ai mal depuis ce matin.",
        side: "me",
        audio: PHARMACIE_AUDIO.message3,
      },
      {
        char: "Pharmacien",
        kr: "이 약은 식후에 드세요.",
        fr: "Prenez ce médicament après le repas.",
        side: "server",
        audio: PHARMACIE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "감기약",
        rom: "Gamgi-yak",
        mean: "Médicament contre le rhume",
        context: "Utile pour demander un traitement simple.",
        audio: PHARMACIE_AUDIO.toolbox1,
      },
      {
        word: "소화제",
        rom: "Sohwa-jae",
        mean: "Médicament pour la digestion",
        context: "Utile pour demander un traitement simple.",
        audio: PHARMACIE_AUDIO.toolbox2,
      },
      {
        word: "진통제",
        rom: "Jintong-je",
        mean: "Antidouleur",
        context: "Pour les maux de tête ou de dents.",
        audio: PHARMACIE_AUDIO.toolbox3,
      },
      {
        word: "식후",
        rom: "Sik-hu",
        mean: "Après le repas",
        context: "Instruction fréquente pour prendre un médicament.",
        audio: PHARMACIE_AUDIO.toolbox4,
      },
    ],
  },
  {
    id: "hospital",
    title: "L'Hôpital",
    koreanTitle: "병원 (Byeong-won)",
    description: "Expliquer une douleur pendant une consultation.",
    accent: COLORS.medicalBlue,
    image: require("../../../assets/images/safety.png"),
    dialogue: [
      {
        char: "Médecin",
        kr: "어디가 아프세요?",
        fr: "Où avez-vous mal ?",
        side: "server",
        audio: HOPITAL_AUDIO.message1,
      },
      {
        char: "Patient",
        kr: "어제부터 배가 너무 아파요.",
        fr: "J'ai très mal au ventre depuis hier.",
        side: "me",
        audio: HOPITAL_AUDIO.message2,
      },
      {
        char: "Médecin",
        kr: "열도 나세요?",
        fr: "Vous avez aussi de la fièvre ?",
        side: "server",
        audio: HOPITAL_AUDIO.message3,
      },
      {
        char: "Patient",
        kr: "네, 조금 열이 나요.",
        fr: "Oui, j'ai un peu de fièvre.",
        side: "me",
        audio: HOPITAL_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "진찰",
        rom: "Jinchal",
        mean: "Consultation médicale",
        context: "Quand le médecin vous examine.",
        audio: HOPITAL_AUDIO.toolbox1,
      },
      {
        word: "처방전",
        rom: "Cheobang-jeon",
        mean: "Ordonnance",
        context: "À présenter à la pharmacie après la visite.",
        audio: HOPITAL_AUDIO.toolbox2,
      },
      {
        word: "보험",
        rom: "Boheom",
        mean: "Assurance",
        context: "Souvent demandé à l'accueil.",
        audio: HOPITAL_AUDIO.toolbox3,
      },
      {
        word: "어디가 아프세요?",
        rom: "Eodiga apeuseyo?",
        mean: "Où avez-vous mal ?",
        context: "Question très fréquente pendant une consultation.",
      },
      {
        word: "배가 아파요",
        rom: "Baega apayo",
        mean: "J'ai mal au ventre",
        context: "Phrase simple pour décrire une douleur courante.",
      },
      {
        word: "열이 나요",
        rom: "Yeori nayo",
        mean: "J'ai de la fièvre",
        context: "Symptôme essentiel à expliquer au médecin.",
      },
    ],
  },
  {
    id: "emergency",
    title: "Urgence 119",
    koreanTitle: "응급 상황",
    description: "Appeler les secours et signaler une urgence.",
    accent: COLORS.emergencyRed,
    image: require("../../../assets/images/safety.png"),
    dialogue: [
      {
        char: "Opérateur",
        kr: "119입니다. 위치가 어디입니까?",
        fr: "Ici le 119. Où êtes-vous ?",
        side: "server",
        audio: URGENCE_AUDIO.message1,
      },
      {
        char: "Appelant",
        kr: "사고가 났어요! 구급차가 필요해요.",
        fr: "Il y a eu un accident ! J'ai besoin d'une ambulance.",
        side: "me",
        audio: URGENCE_AUDIO.message2,
      },
      {
        char: "Opérateur",
        kr: "환자는 의식이 있습니까?",
        fr: "La personne est-elle consciente ?",
        side: "server",
        audio: URGENCE_AUDIO.message3,
      },
      {
        char: "Appelant",
        kr: "네, 하지만 많이 다쳤어요.",
        fr: "Oui, mais elle est gravement blessée.",
        side: "me",
        audio: URGENCE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "도와주세요!",
        rom: "Dowajuseyo!",
        mean: "Aidez-moi !",
        context: "La phrase essentielle en cas de danger.",
        audio: URGENCE_AUDIO.toolbox1,
      },
      {
        word: "구급차",
        rom: "Gugeup-cha",
        mean: "Ambulance",
        context: "À demander en cas d'urgence médicale.",
        audio: URGENCE_AUDIO.toolbox2,
      },
      {
        word: "조심하세요",
        rom: "Josim-haseyo",
        mean: "Faites attention",
        context: "Pour prévenir quelqu'un d'un danger.",
        audio: URGENCE_AUDIO.toolbox3,
      },
      {
        word: "사고가 났어요",
        rom: "Sagoga nasseoyo",
        mean: "Il y a eu un accident",
        context: "Phrase cruciale pour signaler une urgence.",
      },
      {
        word: "위치가 어디예요?",
        rom: "Wichiga eodiyeyo?",
        mean: "Quelle est la position ?",
        context: "Question centrale lors d'un appel aux secours.",
      },
      {
        word: "의식이 있어요",
        rom: "Uisigi isseoyo",
        mean: "La personne est consciente",
        context: "Information importante à donner au 119.",
      },
    ],
  },
];

export default function HealthEmergency() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { playAudio, stopAudio } = useVocAudio(setSelectedWord);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stopAudio();
    fadeAnim.setValue(0);
    setVisibleMessages(1);
    setIsTyping(false);
    setSelectedWord(null);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

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

  const shouldHighlightHint =
    !isTyping && visibleMessages < activeScene.dialogue.length;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={activeScene.image} style={styles.bg}>
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.topNav}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
            </Pressable>
            <View>
              <AppText variant="sectionLabel" style={[styles.navEyebrow, { color: activeScene.accent }]}>
                SÉOUL IMMERSION
              </AppText>
              <AppText variant="cardTitle" style={styles.navTitle}>Urgence & Santé</AppText>
            </View>
          </View>

          <View style={styles.tabContainer}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    borderColor: activeScene.accent,
                    backgroundColor: "rgba(255,255,255,0.08)",
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
            <BlurView intensity={45} tint="dark" style={styles.medicalCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardDot,
                    { backgroundColor: activeScene.accent },
                  ]}
                />
                <AppText
                  variant="koreanSecondary"
                  script="korean"
                  lineContract="singleLine"
                  style={[styles.sceneSubtitle, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </AppText>
              </View>

              <AppText accessibilityRole="header" variant="sceneTitle" style={styles.sceneTitle}>{activeScene.title}</AppText>
              <AppText variant="body" style={styles.sceneDesc}>{activeScene.description}</AppText>

              <Pressable onPress={advanceDialogue} style={styles.dialogueArea}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((item, idx) => {
                    const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                    const isMe = item.side === "me";
                    const isActive = selectedWord === dialogueId;

                    return (
                      <Pressable
                        key={dialogueId}
                        onPress={(event) => {
                          event.stopPropagation();
                          playAudio(item.audio, dialogueId);
                        }}
                        style={[
                          styles.dialogueBubble,
                          isMe
                            ? styles.dialogueBubbleRight
                            : styles.dialogueBubbleLeft,
                          isActive && { borderColor: activeScene.accent },
                        ]}
                      >
                        <View
                          style={[
                            styles.roleLabel,
                            { backgroundColor: `${activeScene.accent}20` },
                          ]}
                        >
                          <AppText variant="label"
                            style={[
                              styles.roleText,
                              { color: activeScene.accent },
                            ]}
                          >
                            {item.char}
                          </AppText>
                        </View>

                        <AppText variant="koreanSecondary" script="korean" style={styles.krDialogue}>{item.kr}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.frDialogue}>{item.fr}</AppText>
                      </Pressable>
                    );
                  })}

                {isTyping && (
                  <View
                    style={[
                      styles.dialogueBubble,
                      styles.dialogueBubbleLeft,
                      styles.typingBubble,
                    ]}
                  >
                    <View
                      style={[
                        styles.roleLabel,
                        { backgroundColor: `${activeScene.accent}20` },
                      ]}
                    >
                      <AppText variant="label"
                        style={[styles.roleText, { color: activeScene.accent }]}
                      >
                        {activeScene.dialogue[visibleMessages]?.char}
                      </AppText>
                    </View>

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

          <View style={styles.toolbox}>
            <View style={styles.toolboxTitleBox}>
              <AppText variant="sectionTitle" style={styles.toolboxTitle}>MEDICAL TOOLBOX</AppText>
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
                        styles.expCard,
                        isActive && { borderColor: activeScene.accent },
                      ]}
                    >
                      <View
                        style={[
                          styles.expAccent,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.8,
                          },
                        ]}
                      />
                      <View style={styles.expContent}>
                        <View style={styles.expTopRow}>
                          <View style={{ flex: 1 }}>
                            <AppText variant="koreanPrimary" script="korean" style={styles.expKr}>{exp.word}</AppText>
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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  overlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.85)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 60 },

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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: {
    color: COLORS.muted,
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
    shadowRadius: 10,
    shadowOpacity: 0.8,
  },

  tabContainer: { flexDirection: "row", gap: 8, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabText: { color: COLORS.muted},

  medicalCard: {
    borderRadius: 30,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  cardDot: { width: 6, height: 6, borderRadius: 3 },
  sceneSubtitle: {
    color: COLORS.muted,
  },
  sceneTitle: {
    color: COLORS.txt,
    marginBottom: 6,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontStyle: "italic",
    marginBottom: 30,
  },

  dialogueArea: { gap: 16 },
  dialogueBubble: {
    maxWidth: "88%",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dialogueBubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 3,
  },
  dialogueBubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 3,
  },
  roleLabel: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  roleText: {
  },
  krDialogue: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  frDialogue: {
    color: COLORS.muted,
  },
  typingBubble: {
    minWidth: 108,
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
  toolboxTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  toolboxTitle: {
    color: COLORS.muted,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
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
  expKr: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  expRom: {
  },
  expMean: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  expCtx: { color: COLORS.muted},
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
