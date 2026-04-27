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

const SCENES = [
  {
    id: "romance",
    tab: "Romance",
    title: "La Confession",
    koreanTitle: "고백 (Gobaek)",
    description: "Une soirée pluvieuse sous un parapluie partagé.",
    mood: "Pluie • Silence • Aveu",
    mission:
      "Comprendre une confession douce et savoir répondre naturellement.",
    realLife:
      "À utiliser quand tu veux exprimer un sentiment sans être trop direct.",
    accent: COLORS.pink,
    dialogue: [
      {
        char: "Min-ho",
        kr: "사실... 너 좋아해.",
        fr: "En fait... je t'aime bien.",
        side: "server",
      },
      {
        char: "Ji-soo",
        kr: "진짜? 나도 조금 놀랐어.",
        fr: "Vraiment ? Je suis un peu surprise aussi.",
        side: "me",
      },
      {
        char: "Min-ho",
        kr: "부담 주고 싶진 않아. 그냥 말하고 싶었어.",
        fr: "Je ne veux pas te mettre la pression. Je voulais juste te le dire.",
        side: "server",
      },
      {
        char: "Ji-soo",
        kr: "고마워. 나도 꿈만 같아.",
        fr: "Merci. Pour moi aussi, c'est comme un rêve.",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "좋아해",
        rom: "Joahae",
        mean: "Je t'aime bien",
        context: "Utilisé pour les confessions romantiques.",
      },
      {
        word: "꿈만 같아",
        rom: "Kkum-man gata",
        mean: "C'est comme un rêve",
        context: "Quand on ne croit pas à son bonheur.",
      },
      {
        word: "심쿵",
        rom: "Simkung",
        mean: "Coup de foudre / Cœur qui bat",
        context: "Argot Drama. Littéralement : coup au cœur.",
      },
    ],
  },
  {
    id: "tension",
    tab: "Tension",
    title: "Le Duel de Regards",
    koreanTitle: "긴장 (Ginjang)",
    description: "Tension électrique dans l'ascenseur de l'entreprise.",
    mood: "Bureau • Pression • Silence",
    mission: "Reconnaître une phrase de tension et répondre avec respect.",
    realLife:
      "Utile dans les situations sérieuses, au travail ou face à une critique.",
    accent: COLORS.cyan,
    dialogue: [
      {
        char: "Directeur",
        kr: "정신 차려! 이게 최선입니까?",
        fr: "Reprends-toi ! C'est le mieux que tu puisses faire ?",
        side: "server",
      },
      {
        char: "Employé",
        kr: "죄송합니다. 다시 하겠습니다.",
        fr: "Je suis désolé. Je vais recommencer.",
        side: "me",
      },
      {
        char: "Directeur",
        kr: "이번엔 실망시키지 마세요.",
        fr: "Cette fois, ne me décevez pas.",
        side: "server",
      },
      {
        char: "Employé",
        kr: "네, 꼭 해내겠습니다.",
        fr: "Oui, je vais absolument y arriver.",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "정신 차려",
        rom: "Jeongsin charyeo",
        mean: "Reprends-toi / Réveille-toi",
        context: "Indispensable pour les scènes de bureau.",
      },
      {
        word: "대박",
        rom: "Daebak",
        mean: "Incroyable / Choquant",
        context: "Utilisé partout, pour le bon ou le mauvais.",
      },
      {
        word: "실망이야",
        rom: "Silmang-iya",
        mean: "Je suis déçu",
        context: "Phrase fatale pour briser l'ambiance.",
      },
    ],
  },
  {
    id: "daily",
    tab: "Pocha",
    title: "Le Repas au Pocha",
    koreanTitle: "포장마차 (Pocha)",
    description: "Boire du soju après une longue journée.",
    mood: "Nuit • Amitié • Après-travail",
    mission:
      "Comprendre une scène chaleureuse entre amis après une journée difficile.",
    realLife:
      "Très naturel pour encourager quelqu’un ou célébrer un petit moment.",
    accent: COLORS.gold,
    dialogue: [
      {
        char: "Ami 1",
        kr: "짠! 오늘 진짜 수고했어.",
        fr: "Tchin ! Tu as vraiment bien travaillé aujourd'hui.",
        side: "server",
      },
      {
        char: "Ami 2",
        kr: "고마워. 오늘 좀 힘들었어.",
        fr: "Merci. Aujourd'hui, c'était un peu difficile.",
        side: "me",
      },
      {
        char: "Ami 1",
        kr: "그래도 잘 버텼어. 대박이야.",
        fr: "Mais tu as bien tenu. C'est impressionnant.",
        side: "server",
      },
      {
        char: "Ami 2",
        kr: "내일도 화이팅!",
        fr: "Demain aussi, Fighting !",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "짠!",
        rom: "Jjan!",
        mean: "Tchin ! / Santé !",
        context: "Le son des verres qui s'entrechoquent.",
      },
      {
        word: "수고했어",
        rom: "Sugo-haesseo",
        mean: "Bravo pour tes efforts",
        context: "Se dit après le travail ou une épreuve.",
      },
      {
        word: "화이팅",
        rom: "Hwaiting",
        mean: "Bon courage / Allez !",
        context: "L'expression de soutien universelle.",
      },
    ],
  },
];

export default function KDramaCulture() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [activeExpression, setActiveExpression] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveExpression(0);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
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

  const selectedExpression = activeScene.expressions[activeExpression];
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

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.bg}
      >
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* HEADER NAV */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>RETOUR</Text>
            </Pressable>

            <Text style={styles.headerTitle}>K-DRAMA IMMERSION</Text>
          </View>

          {/* SCENE SELECTOR */}
          <View style={styles.selectorRow}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.selectorItem,
                  activeScene.id === scene.id && {
                    borderColor: scene.accent,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* MAIN STAGE */}
          <Animated.View style={[styles.stage, { opacity: fadeAnim }]}>
            <BlurView intensity={40} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}20`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.sceneMetaRow}>
                <Text style={[styles.sceneSub, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>

                <View
                  style={[
                    styles.livePill,
                    { borderColor: `${activeScene.accent}55` },
                  ]}
                >
                  <Text
                    style={[styles.livePillText, { color: activeScene.accent }]}
                  >
                    SCÈNE
                  </Text>
                </View>
              </View>

              <Text style={styles.sceneTitle}>{activeScene.title}</Text>
              <Text style={styles.sceneDesc}>{activeScene.description}</Text>

              <View
                style={[
                  styles.moodCard,
                  { borderColor: `${activeScene.accent}35` },
                ]}
              >
                <Text style={[styles.moodLabel, { color: activeScene.accent }]}>
                  AMBIANCE
                </Text>
                <Text style={styles.moodText}>{activeScene.mood}</Text>
              </View>

              {/* DIALOGUE BUBBLES */}
              <Pressable onPress={advanceDialogue} style={styles.dialogueBox}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((d, index) => {
                    const isMe = d.side === "me";

                    return (
                      <View
                        key={`${activeScene.id}-dialogue-${index}`}
                        style={[
                          styles.bubble,
                          isMe ? styles.bubbleRight : styles.bubbleLeft,
                        ]}
                      >
                        <Text
                          style={[
                            styles.charName,
                            { color: activeScene.accent },
                          ]}
                        >
                          {d.char}
                        </Text>
                        <Text style={styles.krText}>{d.kr}</Text>
                        <Text style={styles.frText}>{d.fr}</Text>
                      </View>
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
                      style={[styles.charName, { color: activeScene.accent }]}
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

          {/* TOOLBOX - EXPRESSIONS */}
          <View style={styles.toolboxHeader}>
            <Text style={styles.toolboxTitle}>DRAMA TOOLBOX</Text>
            <View
              style={[
                styles.titleLine,
                { backgroundColor: activeScene.accent },
              ]}
            />
          </View>

          <BlurView intensity={22} tint="dark" style={styles.focusCard}>
            <Text style={[styles.focusLabel, { color: activeScene.accent }]}>
              EXPRESSION À RETENIR
            </Text>
            <Text style={styles.focusWord}>{selectedExpression.word}</Text>
            <Text style={styles.focusRom}>{selectedExpression.rom}</Text>
            <Text style={styles.focusMean}>{selectedExpression.mean}</Text>
          </BlurView>

          <View style={styles.expressionGrid}>
            {activeScene.expressions.map((exp, i) => {
              const isActive = i === activeExpression;

              return (
                <Pressable key={i} onPress={() => setActiveExpression(i)}>
                  <BlurView
                    intensity={isActive ? 30 : 20}
                    tint="dark"
                    style={[
                      styles.expCard,
                      isActive && {
                        borderColor: `${activeScene.accent}55`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.expAccent,
                        { backgroundColor: activeScene.accent },
                      ]}
                    />
                    <Text style={styles.expWord}>{exp.word}</Text>
                    <Text
                      style={[styles.expRom, { color: activeScene.accent }]}
                    >
                      {exp.rom}
                    </Text>
                    <Text style={styles.expMean}>{exp.mean}</Text>
                    <Text style={styles.expContext}>{exp.context}</Text>
                  </BlurView>
                </Pressable>
              );
            })}
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
  scroll: { paddingHorizontal: 20, paddingBottom: 50 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 25,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 32, marginRight: 5 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  headerTitle: {
    color: COLORS.pink,
    fontFamily: "Outfit_900Black",
    fontSize: 14,
    letterSpacing: 2,
  },

  selectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  selectorItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  selectorText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
  },

  stage: { marginBottom: 18 },
  glassCard: {
    borderRadius: 30,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  sceneMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  sceneSub: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 16,
  },
  livePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  livePillText: {
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    letterSpacing: 1.5,
  },

  sceneTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 28,
    marginBottom: 8,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 18,
  },

  moodCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 22,
  },
  moodLabel: {
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  moodText: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
  },

  dialogueBox: { gap: 16 },
  bubble: {
    maxWidth: "85%",
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 2,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 2,
  },
  charName: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  krText: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 4,
  },
  frText: {
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

  immersionCard: {
    padding: 18,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
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
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
  immersionText: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  realLifeText: {
    color: COLORS.muted,
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
    lineHeight: 17,
  },

  toolboxHeader: {
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
  titleLine: { flex: 1, height: 1, opacity: 0.3 },

  focusCard: {
    padding: 18,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 12,
  },
  focusLabel: {
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
  },
  focusWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  focusRom: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    marginBottom: 8,
  },
  focusMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 18,
  },

  expressionGrid: { gap: 12 },
  expCard: {
    padding: 18,
    borderRadius: 20,
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
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 22,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    marginBottom: 8,
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  expContext: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
