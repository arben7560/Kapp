import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#020306",
  medicalBlue: "#38BDF8",
  safetyGreen: "#34D399",
  emergencyRed: "#FB7185",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "pharmacy",
    title: "La Pharmacie",
    koreanTitle: "약국 (Yak-guk)",
    description: "Demander conseil pour des symptômes courants.",
    accent: COLORS.safetyGreen,
    image:
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Patient",
        kr: "머리가 아프고 열이 나요.",
        fr: "J'ai mal à la tête et j'ai de la fièvre.",
        side: "me",
      },
      {
        char: "Pharmacien",
        kr: "언제부터 아프셨어요?",
        fr: "Depuis quand avez-vous mal ?",
        side: "server",
      },
      {
        char: "Patient",
        kr: "오늘 아침부터 아팠어요.",
        fr: "J'ai mal depuis ce matin.",
        side: "me",
      },
      {
        char: "Pharmacien",
        kr: "이 약은 식후에 드세요.",
        fr: "Prenez ce médicament après le repas.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "감기약",
        rom: "Gamgi-yak",
        mean: "Médicament contre le rhume",
        context: "Utile pour demander un traitement simple.",
      },
      {
        word: "진통제",
        rom: "Jintong-je",
        mean: "Antidouleur",
        context: "Pour les maux de tête ou de dents.",
      },
      {
        word: "식후",
        rom: "Sik-hu",
        mean: "Après le repas",
        context: "Instruction fréquente pour prendre un médicament.",
      },
    ],
  },
  {
    id: "hospital",
    title: "L'Hôpital",
    koreanTitle: "병원 (Byeong-won)",
    description: "Expliquer une douleur pendant une consultation.",
    accent: COLORS.medicalBlue,
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Médecin",
        kr: "어디가 아프세요?",
        fr: "Où avez-vous mal ?",
        side: "server",
      },
      {
        char: "Patient",
        kr: "어제부터 배가 너무 아파요.",
        fr: "J'ai très mal au ventre depuis hier.",
        side: "me",
      },
      {
        char: "Médecin",
        kr: "열도 나세요?",
        fr: "Vous avez aussi de la fièvre ?",
        side: "server",
      },
      {
        char: "Patient",
        kr: "네, 조금 열이 나요.",
        fr: "Oui, j'ai un peu de fièvre.",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "진찰",
        rom: "Jinchal",
        mean: "Consultation médicale",
        context: "Quand le médecin vous examine.",
      },
      {
        word: "처방전",
        rom: "Cheobang-jeon",
        mean: "Ordonnance",
        context: "À présenter à la pharmacie après la visite.",
      },
      {
        word: "보험",
        rom: "Boheom",
        mean: "Assurance",
        context: "Souvent demandé à l'accueil.",
      },
    ],
  },
  {
    id: "emergency",
    title: "Urgence 119",
    koreanTitle: "응급 상황",
    description: "Appeler les secours et signaler une urgence.",
    accent: COLORS.emergencyRed,
    image:
      "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Opérateur",
        kr: "119입니다. 위치가 어디입니까?",
        fr: "Ici le 119. Où êtes-vous ?",
        side: "server",
      },
      {
        char: "Appelant",
        kr: "사고가 났어요! 구급차가 필요해요.",
        fr: "Il y a eu un accident ! J'ai besoin d'une ambulance.",
        side: "me",
      },
      {
        char: "Opérateur",
        kr: "환자는 의식이 있습니까?",
        fr: "La personne est-elle consciente ?",
        side: "server",
      },
      {
        char: "Appelant",
        kr: "네, 하지만 많이 다쳤어요.",
        fr: "Oui, mais elle est gravement blessée.",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "도와주세요!",
        rom: "Dowajuseyo!",
        mean: "Aidez-moi !",
        context: "La phrase essentielle en cas de danger.",
      },
      {
        word: "구급차",
        rom: "Gugeup-cha",
        mean: "Ambulance",
        context: "À demander en cas d'urgence médicale.",
      },
      {
        word: "조심하세요",
        rom: "Josim-haseyo",
        mean: "Faites attention",
        context: "Pour prévenir quelqu'un d'un danger.",
      },
    ],
  },
];

export default function HealthEmergency() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fadeAnim.setValue(0);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.circle),
      useNativeDriver: true,
    }).start();
  }, [activeScene]);

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
    };
  }, [tapHintPulse]);

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
      <ImageBackground source={{ uri: activeScene.image }} style={styles.bg}>
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL SAFETY</Text>
            </Pressable>
            <View
              style={[styles.pulseCircle, { shadowColor: activeScene.accent }]}
            />
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
                    outputRange: [0.98, 1],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={45} tint="dark" style={styles.medicalCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardDot,
                    { backgroundColor: activeScene.accent },
                  ]}
                />
                <Text style={styles.sceneSubtitle}>
                  {activeScene.koreanTitle}
                </Text>
              </View>

              <Text style={styles.sceneTitle}>{activeScene.title}</Text>
              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <Pressable onPress={advanceDialogue} style={styles.dialogueArea}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((item, idx) => {
                    const isMe = item.side === "me";

                    return (
                      <View
                        key={`${activeScene.id}-dialogue-${idx}`}
                        style={[
                          styles.dialogueBubble,
                          isMe
                            ? styles.dialogueBubbleRight
                            : styles.dialogueBubbleLeft,
                        ]}
                      >
                        <View
                          style={[
                            styles.roleLabel,
                            { backgroundColor: `${activeScene.accent}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleText,
                              { color: activeScene.accent },
                            ]}
                          >
                            {item.char}
                          </Text>
                        </View>

                        <Text style={styles.krDialogue}>{item.kr}</Text>
                        <Text style={styles.frDialogue}>{item.fr}</Text>
                      </View>
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
                      <Text
                        style={[styles.roleText, { color: activeScene.accent }]}
                      >
                        {activeScene.dialogue[visibleMessages]?.char}
                      </Text>
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
            <View style={styles.toolboxTitleBox}>
              <Text style={styles.toolboxTitle}>MEDICAL TOOLBOX</Text>
              <View
                style={[styles.hLine, { backgroundColor: activeScene.accent }]}
              />
            </View>

            <View style={styles.expGrid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={20}
                  tint="dark"
                  style={styles.expCard}
                >
                  <View
                    style={[
                      styles.expIconBox,
                      { borderColor: activeScene.accent },
                    ]}
                  >
                    <Text style={{ color: activeScene.accent, fontSize: 10 }}>
                      +
                    </Text>
                  </View>
                  <View style={styles.expInfo}>
                    <Text style={styles.expKr}>{exp.word}</Text>
                    <Text style={styles.expRom}>{exp.rom}</Text>
                    <Text style={styles.expMean}>{exp.mean}</Text>
                    <Text style={styles.expCtx}>{exp.context}</Text>
                  </View>
                </BlurView>
              ))}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.85)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 32, marginRight: 5 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
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
  tabText: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

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
    marginBottom: 5,
  },
  cardDot: { width: 6, height: 6, borderRadius: 3 },
  sceneSubtitle: {
    color: COLORS.muted,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 13,
    letterSpacing: 1,
  },
  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 32,
    marginBottom: 6,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
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
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
  },
  krDialogue: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  frDialogue: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
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
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
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
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 3,
  },
  hLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 12 },
  expCard: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 15,
  },
  expIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  expInfo: { flex: 1 },
  expKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 22,
    marginBottom: 2,
  },
  expRom: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  expCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
