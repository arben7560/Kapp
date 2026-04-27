import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
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
  calmBlue: "#7DD3FC",
  softTeal: "#2DD4BF",
  pureWhite: "#F8FAFC",
  accentOrange: "#FB923C",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "greeting",
    title: "La Rencontre",
    koreanTitle: "첫 만남 (Cheot Mannam)",
    description: "Saluer poliment et se présenter pour la première fois.",
    accent: COLORS.calmBlue,
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "안녕하세요! 처음 뵙겠습니다.",
        fr: "Bonjour ! Enchanté de vous rencontrer.",
        side: "me",
      },
      {
        char: "Ji-won",
        kr: "네, 안녕하세요. 만나서 반가워요.",
        fr: "Oui, bonjour. Ravi de vous rencontrer.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "제 이름은 마크입니다. 저는 프랑스 사람이에요.",
        fr: "Je m'appelle Marc. Je suis français.",
        side: "me",
      },
      {
        char: "Ji-won",
        kr: "반갑습니다. 잘 부탁드립니다.",
        fr: "Enchantée. Je compte sur vous.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "안녕하세요",
        rom: "Annyeong-haseyo",
        mean: "Bonjour",
        context: "La salutation universelle et polie.",
        speak: "안녕하세요",
      },
      {
        word: "처음 뵙겠습니다",
        rom: "Cheoeum boepgetseumnida",
        mean: "Enchanté de vous rencontrer",
        context: "Forme très polie lors d'une première rencontre.",
        speak: "처음 뵙겠습니다",
      },
      {
        word: "반갑습니다",
        rom: "Bangapseumnida",
        mean: "Ravi de vous rencontrer",
        context: "Très respectueux, utile en contexte formel.",
        speak: "반갑습니다",
      },
      {
        word: "만나서 반가워요",
        rom: "Mannaseo bangawoyo",
        mean: "Ravi de te/vous rencontrer",
        context: "Forme polie mais plus naturelle au quotidien.",
        speak: "만나서 반가워요",
      },
      {
        word: "제 이름은 ~입니다",
        rom: "Je ireumeun ~imnida",
        mean: "Mon nom est...",
        context: "Structure formelle pour se présenter.",
        speak: "제 이름은 마크입니다",
      },
      {
        word: "저는 프랑스 사람이에요",
        rom: "Jeoneun Peurangseu saram-ieyo",
        mean: "Je suis français",
        context: "Phrase simple pour dire sa nationalité.",
        speak: "저는 프랑스 사람이에요",
      },
      {
        word: "잘 부탁드립니다",
        rom: "Jal butakdeurimnida",
        mean: "Je compte sur vous",
        context: "Expression culturelle après une présentation.",
        speak: "잘 부탁드립니다",
      },
    ],
  },
  {
    id: "politeness",
    title: "Politesse",
    koreanTitle: "예의 (Yei)",
    description: "Interagir avec respect dans les lieux publics.",
    accent: COLORS.softTeal,
    image:
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "실례합니다. 잠시만요.",
        fr: "Excusez-moi. Un instant s'il vous plaît.",
        side: "me",
      },
      {
        char: "Vendeur",
        kr: "네, 괜찮습니다. 천천히 오세요.",
        fr: "Oui, ce n'est pas grave. Allez-y doucement.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "감사합니다. 저기요, 이거 얼마예요?",
        fr: "Merci. Excusez-moi, c'est combien ?",
        side: "me",
      },
      {
        char: "Vendeur",
        kr: "여기 있습니다. 만 원입니다.",
        fr: "Voici. C'est 10 000 wons.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "감사합니다",
        rom: "Gamsahamnida",
        mean: "Merci",
        context: "Forme très polie et standard.",
        speak: "감사합니다",
      },
      {
        word: "고마워요",
        rom: "Gomawoyo",
        mean: "Merci",
        context: "Poli, plus doux et quotidien.",
        speak: "고마워요",
      },
      {
        word: "실례합니다",
        rom: "Sillye-hamnida",
        mean: "Excusez-moi",
        context: "Pour interpeller ou passer dans la foule.",
        speak: "실례합니다",
      },
      {
        word: "잠시만요",
        rom: "Jamsimanyo",
        mean: "Un instant / laissez-moi passer",
        context: "Très fréquent dans les transports ou magasins.",
        speak: "잠시만요",
      },
      {
        word: "저기요",
        rom: "Jeogiyo",
        mean: "S'il vous plaît / excusez-moi",
        context: "Pour appeler un serveur ou attirer l'attention.",
        speak: "저기요",
      },
      {
        word: "여기 있습니다",
        rom: "Yeogi itseumnida",
        mean: "Voici",
        context: "Quand on donne quelque chose poliment.",
        speak: "여기 있습니다",
      },
      {
        word: "괜찮습니다",
        rom: "Gwaenchansseumnida",
        mean: "Ça va / ce n'est pas grave",
        context: "Forme polie pour rassurer.",
        speak: "괜찮습니다",
      },
    ],
  },
  {
    id: "apology",
    title: "S'excuser",
    koreanTitle: "사과 (Sagwa)",
    description: "Exprimer des regrets de manière appropriée.",
    accent: COLORS.accentOrange,
    image:
      "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "늦어서 정말 죄송합니다.",
        fr: "Je suis vraiment désolé d'être en retard.",
        side: "me",
      },
      {
        char: "Ji-ho",
        kr: "아니에요, 괜찮아요.",
        fr: "Ce n'est rien, ce n'est pas grave.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "기다리게 해서 미안해요.",
        fr: "Désolé de t'avoir fait attendre.",
        side: "me",
      },
      {
        char: "Ji-ho",
        kr: "정말 괜찮아요. 이제 같이 가요.",
        fr: "Vraiment, ça va. Allons-y ensemble maintenant.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "죄송합니다",
        rom: "Joesong-hamnida",
        mean: "Je suis désolé",
        context: "Forme polie et standard d'excuse.",
        speak: "죄송합니다",
      },
      {
        word: "정말 죄송합니다",
        rom: "Jeongmal joesong-hamnida",
        mean: "Je suis vraiment désolé",
        context: "Plus intense, pour une vraie faute.",
        speak: "정말 죄송합니다",
      },
      {
        word: "늦어서 죄송합니다",
        rom: "Neujeoseo joesong-hamnida",
        mean: "Désolé d'être en retard",
        context: "Très utile dans un rendez-vous.",
        speak: "늦어서 죄송합니다",
      },
      {
        word: "미안해요",
        rom: "Mianhaeyo",
        mean: "Désolé",
        context: "Poli, plus doux et personnel.",
        speak: "미안해요",
      },
      {
        word: "미안해",
        rom: "Mianhae",
        mean: "Désolé",
        context: "Familier, avec des amis proches.",
        speak: "미안해",
      },
      {
        word: "아니에요",
        rom: "Anieyo",
        mean: "Ce n'est rien",
        context: "Réponse naturelle à des excuses.",
        speak: "아니에요",
      },
      {
        word: "괜찮아요",
        rom: "Gwaenchanayo",
        mean: "Ça va / ce n'est pas grave",
        context: "Pour rassurer quelqu'un.",
        speak: "괜찮아요",
      },
    ],
  },
];

export default function FirstStepsImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();

    Speech.stop();
    setSelectedWord(null);
    setVisibleMessages(1);
    setIsTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
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

      Speech.stop();
    };
  }, [tapHintPulse]);

  const speak = (text: string, id: string) => {
    Speech.stop();
    setSelectedWord(id);
    Vibration.vibrate(8);

    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.78,
      pitch: 1,
      onDone: () => setSelectedWord(null),
      onStopped: () => setSelectedWord(null),
      onError: () => setSelectedWord(null),
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
      <ImageBackground source={{ uri: activeScene.image }} style={styles.bg}>
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>FONDATIONS</Text>
            </Pressable>

            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>STEP 01</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
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
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={30} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={StyleSheet.absoluteFill}
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

              <Pressable onPress={advanceDialogue} style={styles.chatArea}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((line, idx) => {
                    const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                    const isMe = line.side === "me";

                    return (
                      <Pressable
                        key={dialogueId}
                        onPress={() => speak(line.kr, dialogueId)}
                        style={[
                          styles.msgBox,
                          isMe ? styles.msgRight : styles.msgLeft,
                          selectedWord === dialogueId && {
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
                    onPress={() => speak(exp.speak, cardId)}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.86)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 90 },

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
    color: "rgba(255,255,255,0.78)",
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
});
