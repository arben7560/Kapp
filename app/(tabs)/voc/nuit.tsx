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

const SCENES = [
  {
    id: "pocha",
    title: "Le Pocha",
    koreanTitle: "포장마차",
    description: "Sous la tente orange, entre soju et anju.",
    cultureHint: "On sert souvent le verre des autres avant le sien.",
    accent: COLORS.sojuGreen,
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=85",
    dialogue: [
      {
        char: "Ji-hun",
        kr: "한 잔 더 할까요? 제가 따를게요.",
        fr: "On en reprend un verre ? Je vous sers.",
        side: "server",
      },
      {
        char: "Min-a",
        kr: "좋아요! 안주도 더 시킬까요?",
        fr: "D’accord ! On commande aussi plus d’anju ?",
        side: "me",
      },
      {
        char: "Ji-hun",
        kr: "네, 떡볶이 하나 더 시켜요.",
        fr: "Oui, commandons encore un tteokbokki.",
        side: "server",
      },
      {
        char: "Min-a",
        kr: "좋아요. 그럼 건배할까요?",
        fr: "Très bien. Alors on trinque ?",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "건배!",
        rom: "Geonbae!",
        mean: "Santé !",
        context: "L'expression universelle pour trinquer.",
      },
      {
        word: "안주",
        rom: "Anju",
        mean: "Accompagnement",
        context: "Plats servis avec l'alcool.",
      },
      {
        word: "원샷!",
        rom: "One-shot!",
        mean: "Cul sec !",
        context: "Souvent crié lors des jeux à boire.",
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
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85",
    dialogue: [
      {
        char: "Sora",
        kr: "이 노래 취향저격이에요! 탬버린 줘요.",
        fr: "Cette chanson est pile mon style ! Donne-moi le tambourin.",
        side: "server",
      },
      {
        char: "Kevin",
        kr: "좋아요. 분위기 진짜 좋네요.",
        fr: "D’accord. L’ambiance est vraiment bonne.",
        side: "me",
      },
      {
        char: "Sora",
        kr: "다 같이 떼창해요!",
        fr: "Chantons tous ensemble !",
        side: "server",
      },
      {
        char: "Kevin",
        kr: "다음 곡은 제가 부를게요. 점수 대박!",
        fr: "C’est moi qui chante la suivante. Score de dingue !",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "취향저격",
        rom: "Chwihyang-jeogyeok",
        mean: "Pile mon style",
        context: "Quand quelque chose correspond parfaitement à vos goûts.",
      },
      {
        word: "떼창",
        rom: "Ttechang",
        mean: "Chanter en chœur",
        context: "Quand tout le monde chante ensemble.",
      },
      {
        word: "서비스",
        rom: "Seobiseu",
        mean: "Temps offert",
        context: "Temps supplémentaire offert au noraebang.",
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
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
    dialogue: [
      {
        char: "Jun",
        kr: "벌써 끝이에요? 2차 갑시다!",
        fr: "C'est déjà fini ? Allons au deuxième endroit !",
        side: "server",
      },
      {
        char: "Yuna",
        kr: "좋아요. 그런데 너무 멀면 안 돼요.",
        fr: "D’accord. Mais il ne faut pas que ce soit trop loin.",
        side: "me",
      },
      {
        char: "Jun",
        kr: "근처에 좋은 노래방 있어요.",
        fr: "Il y a un bon noraebang juste à côté.",
        side: "server",
      },
      {
        char: "Yuna",
        kr: "좋아요. 내일 해장국 먹어야겠어요.",
        fr: "D’accord. Demain, il va falloir manger du haejangguk.",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "2차",
        rom: "I-cha",
        mean: "Deuxième étape",
        context: "Changer de lieu pour continuer la soirée.",
      },
      {
        word: "해장국",
        rom: "Haejangguk",
        mean: "Soupe de lendemain",
        context: "Soupe coréenne associée à la gueule de bois.",
      },
      {
        word: "불금",
        rom: "Bul-geum",
        mean: "Vendredi de feu",
        context: "Le vendredi soir où l'on sort après le travail.",
      },
    ],
  },
];

export default function NightlifeImmersion() {
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
      duration: 600,
      easing: Easing.out(Easing.exp),
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
          {/* NAV HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL BY NIGHT</Text>
            </Pressable>

            <BlurView intensity={20} tint="light" style={styles.neonBadge}>
              <Text
                style={[styles.neonBadgeText, { color: activeScene.accent }]}
              >
                LIVE NOW
              </Text>
            </BlurView>
          </View>

          {/* SCENE NAVIGATOR */}
          <View style={styles.tabContainer}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: `${activeScene.accent}30`,
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
                  {scene.koreanTitle}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* CONTENT STAGE */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <BlurView intensity={60} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}25`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardHeader}>
                <Text
                  style={[styles.koreanHeader, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.sceneTitle}>{activeScene.title}</Text>
              </View>

              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <Pressable onPress={advanceDialogue} style={styles.dialogueWrap}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((line, idx) => {
                    const isMe = line.side === "me";

                    return (
                      <View
                        key={`${activeScene.id}-dialogue-${idx}`}
                        style={[
                          styles.msg,
                          isMe ? styles.msgRight : styles.msgLeft,
                        ]}
                      >
                        <Text
                          style={[styles.sender, { color: activeScene.accent }]}
                        >
                          {line.char}
                        </Text>
                        <Text style={styles.krTxt}>{line.kr}</Text>
                        <Text style={styles.frTxt}>{line.fr}</Text>
                      </View>
                    );
                  })}

                {isTyping && (
                  <View style={[styles.msg, styles.msgLeft, styles.typingMsg]}>
                    <Text
                      style={[styles.sender, { color: activeScene.accent }]}
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

              <View
                style={[
                  styles.cultureHint,
                  { borderColor: `${activeScene.accent}35` },
                ]}
              >
                <Text
                  style={[
                    styles.cultureHintText,
                    { color: activeScene.accent },
                  ]}
                >
                  ✦ {activeScene.cultureHint}
                </Text>
              </View>
            </BlurView>
          </Animated.View>

          {/* NIGHTLIFE TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxTitleRow}>
              <Text style={styles.toolboxTitle}>NIGHTLIFE TOOLBOX</Text>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.expGrid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={25}
                  tint="dark"
                  style={styles.expBox}
                >
                  <View
                    style={[
                      styles.expGlow,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.expContent}>
                    <Text style={styles.expWord}>{exp.word}</Text>
                    <Text
                      style={[styles.expRom, { color: activeScene.accent }]}
                    >
                      {exp.rom}
                    </Text>
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
    backgroundColor: "rgba(2,3,6,0.80)",
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 80 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 30, marginRight: 8 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
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
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabText: {
    color: COLORS.muted,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 13,
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
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
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
    fontFamily: "Outfit_700Bold",
    marginBottom: 5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  krTxt: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 5,
  },
  frTxt: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
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
    fontFamily: "Outfit_700Bold",
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
    fontFamily: "Outfit_700Bold",
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
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    letterSpacing: 3,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expBox: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expGlow: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  expContent: { padding: 20 },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    marginBottom: 8,
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
