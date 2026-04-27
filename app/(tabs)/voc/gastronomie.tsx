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
  chiliRed: "#EF4444",
  sunsetOrange: "#FB923C",
  matchaGreen: "#10B981",
  woodWarm: "#A16207",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "bbq",
    title: "Le K-BBQ",
    koreanTitle: "고기집 (Gogi-jib)",
    description:
      "L'art de griller la viande et de partager les accompagnements.",
    accent: COLORS.chiliRed,
    image:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "삼겹살 2인분 주세요.",
        fr: "Deux portions de Samgyeopsal s'il vous plaît.",
        side: "me",
      },
      {
        char: "Serveur",
        kr: "네, 알겠습니다. 상추도 같이 드릴게요.",
        fr: "Oui, bien compris. Je vais aussi vous apporter de la laitue.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "감사합니다. 불판도 갈아 주실 수 있나요?",
        fr: "Merci. Vous pouvez aussi changer la plaque ?",
        side: "me",
      },
      {
        char: "Serveur",
        kr: "네, 바로 갈아드릴게요. 맛있게 드세요!",
        fr: "Oui, je vous la change tout de suite. Bon appétit !",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "맛있게 드세요",
        rom: "Masitge deuseyo",
        mean: "Bon appétit",
        context: "Utilisé par les serveurs ou l'hôte.",
        speak: "맛있게 드세요",
      },
      {
        word: "1인분",
        rom: "Il-inbun",
        mean: "Une portion",
        context: "Indispensable pour commander la viande.",
        speak: "일 인분",
      },
      {
        word: "2인분 주세요",
        rom: "I-inbun juseyo",
        mean: "Deux portions s'il vous plaît",
        context: "Phrase pratique dans un restaurant BBQ.",
        speak: "이 인분 주세요",
      },
      {
        word: "삼겹살",
        rom: "Samgyeopsal",
        mean: "Poitrine de porc grillée",
        context: "Un classique absolu du barbecue coréen.",
        speak: "삼겹살",
      },
      {
        word: "목살",
        rom: "Moksal",
        mean: "Échine de porc",
        context: "Autre viande populaire au barbecue.",
        speak: "목살",
      },
      {
        word: "상추",
        rom: "Sangchu",
        mean: "Laitue",
        context: "Utilisée pour envelopper la viande.",
        speak: "상추",
      },
      {
        word: "쌈",
        rom: "Ssam",
        mean: "Wrap de laitue",
        context: "Bouchée avec viande, légumes et sauce.",
        speak: "쌈",
      },
      {
        word: "쌈장",
        rom: "Ssamjang",
        mean: "Sauce pour wrap",
        context: "Sauce épaisse souvent servie avec le BBQ.",
        speak: "쌈장",
      },
      {
        word: "불판 갈아 주세요",
        rom: "Bulp’an gara juseyo",
        mean: "Changez la plaque, s'il vous plaît",
        context: "Utile quand la plaque devient trop brûlée.",
        speak: "불판 갈아 주세요",
      },
    ],
  },
  {
    id: "street",
    title: "Street Food",
    koreanTitle: "길거리 음식",
    description: "Explorer les saveurs rapides et épicées de Myeongdong.",
    accent: COLORS.sunsetOrange,
    image:
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "이거 많이 매워요?",
        fr: "Est-ce que c'est très épicé ?",
        side: "me",
      },
      {
        char: "Vendeur",
        kr: "조금 매워요. 그래도 맛있어요.",
        fr: "C'est un peu épicé. Mais c'est très bon.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "그럼 하나 주세요. 물도 주세요.",
        fr: "Alors donnez-m'en un. Et de l'eau aussi s'il vous plaît.",
        side: "me",
      },
      {
        char: "Vendeur",
        kr: "네, 여기 있어요. 조심해서 드세요.",
        fr: "Oui, voici. Mangez doucement.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "매워요",
        rom: "Maewoyo",
        mean: "C'est épicé",
        context: "Mot clé avant de goûter un plat rouge-orange.",
        speak: "매워요",
      },
      {
        word: "안 매워요?",
        rom: "An maewoyo?",
        mean: "Ce n'est pas épicé ?",
        context: "Très utile si tu crains le piment.",
        speak: "안 매워요?",
      },
      {
        word: "얼마예요?",
        rom: "Eolmayeyo?",
        mean: "C'est combien ?",
        context: "Pour demander le prix sur un stand.",
        speak: "얼마예요?",
      },
      {
        word: "하나 주세요",
        rom: "Hana juseyo",
        mean: "Donnez-m'en un",
        context: "Phrase simple et naturelle pour commander.",
        speak: "하나 주세요",
      },
      {
        word: "떡볶이",
        rom: "Tteokbokki",
        mean: "Gâteaux de riz épicés",
        context: "Street food coréenne emblématique.",
        speak: "떡볶이",
      },
      {
        word: "어묵",
        rom: "Eomuk",
        mean: "Fish cake",
        context: "Souvent servi sur brochette avec du bouillon.",
        speak: "어묵",
      },
      {
        word: "호떡",
        rom: "Hotteok",
        mean: "Pancake sucré coréen",
        context: "Snack chaud, sucré, souvent hivernal.",
        speak: "호떡",
      },
      {
        word: "포장해 주세요",
        rom: "Pojang-hae juseyo",
        mean: "À emporter s'il vous plaît",
        context: "Pour prendre ton snack avec toi.",
        speak: "포장해 주세요",
      },
      {
        word: "물 주세요",
        rom: "Mul juseyo",
        mean: "De l'eau s'il vous plaît",
        context: "Très utile si c'est trop épicé.",
        speak: "물 주세요",
      },
    ],
  },
  {
    id: "cafe",
    title: "Culture Café",
    koreanTitle: "카페 투어 (Cafe Tour)",
    description: "Détente dans un café esthétique de Yeonnam-dong.",
    accent: COLORS.matchaGreen,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "아이스 아메리카노 한 잔이랑 치즈케이크 주세요.",
        fr: "Un Americano glacé et un cheesecake s'il vous plaît.",
        side: "me",
      },
      {
        char: "Barista",
        kr: "드시고 가세요? 아니면 테이크아웃 하세요?",
        fr: "C'est sur place ? Ou à emporter ?",
        side: "server",
      },
      {
        char: "Moi",
        kr: "먹고 갈게요. 조용한 자리 있어요?",
        fr: "Je vais consommer ici. Vous avez une place calme ?",
        side: "me",
      },
      {
        char: "Barista",
        kr: "네, 창가 자리가 조용해요. 진동벨 울리면 오세요.",
        fr: "Oui, la place près de la fenêtre est calme. Venez quand le bipeur sonne.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "아아",
        rom: "Ah-Ah",
        mean: "Ice Americano",
        context: "Abréviation ultra-populaire en Corée.",
        speak: "아아",
      },
      {
        word: "아이스 아메리카노",
        rom: "Aiseu Amerikano",
        mean: "Americano glacé",
        context: "Commande très fréquente dans les cafés coréens.",
        speak: "아이스 아메리카노",
      },
      {
        word: "한 잔 주세요",
        rom: "Han jan juseyo",
        mean: "Un verre s'il vous plaît",
        context: "Structure de base pour commander une boisson.",
        speak: "한 잔 주세요",
      },
      {
        word: "드시고 가세요?",
        rom: "Deusigo gaseyo?",
        mean: "C'est sur place ?",
        context: "Question fréquente au comptoir.",
        speak: "드시고 가세요?",
      },
      {
        word: "테이크아웃",
        rom: "Teikeu-aut",
        mean: "À emporter",
        context: "Mot emprunté à l'anglais, très utilisé.",
        speak: "테이크아웃",
      },
      {
        word: "진동벨",
        rom: "Jindong-bel",
        mean: "Bipeur / vibreur",
        context: "Objet remis en attendant la commande.",
        speak: "진동벨",
      },
      {
        word: "분위기 좋다",
        rom: "Bunwigi jota",
        mean: "L'ambiance est superbe",
        context: "Compliment typique pour un café esthétique.",
        speak: "분위기 좋다",
      },
      {
        word: "사진 찍어도 돼요?",
        rom: "Sajin jjigeodo dwaeyo?",
        mean: "Je peux prendre une photo ?",
        context: "Très utile dans un café esthétique.",
        speak: "사진 찍어도 돼요?",
      },
      {
        word: "조용한 자리 있어요?",
        rom: "Joyonghan jari isseoyo?",
        mean: "Vous avez une place calme ?",
        context: "Pratique pour travailler ou étudier.",
        speak: "조용한 자리 있어요?",
      },
    ],
  },
];

export default function GastronomyImmersion() {
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
      duration: 600,
      easing: Easing.out(Easing.back(1)),
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
              <Text style={styles.backText}>SÉOUL GOURMAND</Text>
            </Pressable>

            <View style={styles.badgeChef}>
              <Text style={styles.badgeText}>CRITIQUE FOOD</Text>
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
                style={StyleSheet.absoluteFill}
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
                    const isMe = chat.side === "me";

                    return (
                      <Animated.View
                        key={`${activeScene.id}-dialogue-${idx}`}
                        style={[
                          styles.bubble,
                          isMe ? styles.bubbleRight : styles.bubbleLeft,
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
                      </Animated.View>
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
              <Text style={styles.toolboxTitle}>GOURMET TOOLBOX</Text>
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
                    onPress={() => speak(exp.speak, cardId)}
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
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.84)",
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
