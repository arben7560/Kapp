import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

const COLORS = {
  bg: "#020306",
  metroGreen: "#22C55E",
  metroBlue: "#3B82F6",
  taxiYellow: "#F59E0B",
  mapPink: "#EC4899",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const METRO_BG = require("../../../assets/images/bg-metro-station.png");
const TAXI_BG = require("../../../assets/images/bg-taxi-night.png");
const BUKCHON_BG = require("../../../assets/images/bg-bukchon-alley.png");

const SCENES = [
  {
    id: "subway",
    title: "Le Métro",
    koreanTitle: "지하철 (Ji-ha-cheol)",
    description: "Naviguer dans le métro de Séoul et changer de ligne.",
    accent: COLORS.metroGreen,
    image: METRO_BG,
    dialogue: [
      {
        char: "Moi",
        kr: "홍대입구역으로 가려면 어디서 갈아타요?",
        fr: "Où dois-je changer pour aller à Hongdae ?",
        side: "me",
      },
      {
        char: "Agent",
        kr: "다음 역에서 2호선으로 환승하세요.",
        fr: "Changez pour la ligne 2 à la prochaine station.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "2호선은 어느 방향으로 타야 해요?",
        fr: "Dans quelle direction dois-je prendre la ligne 2 ?",
        side: "me",
      },
      {
        char: "Agent",
        kr: "신촌 방향으로 타시면 돼요.",
        fr: "Prenez en direction de Sinchon.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "지하철",
        rom: "Ji-ha-cheol",
        mean: "Métro",
        context: "Mot général pour parler du métro.",
        speak: "지하철",
      },
      {
        word: "지하철역",
        rom: "Ji-ha-cheol-yeok",
        mean: "Station de métro",
        context: "Très utile pour demander une station.",
        speak: "지하철역",
      },
      {
        word: "홍대입구역",
        rom: "Hongdae-ipgu-yeok",
        mean: "Station Hongdae-ipgu",
        context: "Station très connue de la ligne 2.",
        speak: "홍대입구역",
      },
      {
        word: "환승",
        rom: "Hwan-seung",
        mean: "Correspondance",
        context: "Mot vital pour changer de ligne.",
        speak: "환승",
      },
      {
        word: "갈아타요",
        rom: "Gara-tayo",
        mean: "Changer de transport",
        context: "Utilisé pour demander où changer.",
        speak: "갈아타요",
      },
      {
        word: "2호선",
        rom: "I-ho-seon",
        mean: "Ligne 2",
        context: "La ligne circulaire verte de Séoul.",
        speak: "이 호선",
      },
      {
        word: "다음 역",
        rom: "Daeum yeok",
        mean: "Prochaine station",
        context: "Entendu dans les annonces du métro.",
        speak: "다음 역",
      },
      {
        word: "이번 역",
        rom: "Ibeon yeok",
        mean: "Cette station",
        context: "Annonce fréquente dans le métro.",
        speak: "이번 역",
      },
      {
        word: "교통카드",
        rom: "Gyo-tong-ka-deu",
        mean: "Carte de transport",
        context: "Carte type T-Money.",
        speak: "교통카드",
      },
    ],
  },
  {
    id: "taxi",
    title: "Le Taxi",
    koreanTitle: "택시 (Taek-si)",
    description:
      "Donner des instructions précises au chauffeur à la tombée de la nuit.",
    accent: COLORS.taxiYellow,
    image: TAXI_BG,
    dialogue: [
      {
        char: "Moi",
        kr: "기사님, 강남역으로 가주세요.",
        fr: "Monsieur le chauffeur, allez à la station Gangnam s’il vous plaît.",
        side: "me",
      },
      {
        char: "Chauffeur",
        kr: "네, 알겠습니다. 강남역까지 가겠습니다.",
        fr: "Oui, bien compris. Je vais jusqu’à Gangnam Station.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "좀 서둘러 주실 수 있나요?",
        fr: "Pouvez-vous vous dépêcher un peu ?",
        side: "me",
      },
      {
        char: "Chauffeur",
        kr: "네, 최대한 빨리 가겠습니다.",
        fr: "Oui, je vais y aller aussi vite que possible.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "택시",
        rom: "Taek-si",
        mean: "Taxi",
        context: "Mot directement emprunté à l’anglais.",
        speak: "택시",
      },
      {
        word: "~로 가주세요",
        rom: "~ro ga-juseyo",
        mean: "Allez à...",
        context: "Structure de base pour donner une destination.",
        speak: "강남역으로 가주세요",
      },
      {
        word: "강남역으로 가주세요",
        rom: "Gangnam-yeogeuro ga-juseyo",
        mean: "Allez à Gangnam Station",
        context: "Phrase modèle pour prendre un taxi.",
        speak: "강남역으로 가주세요",
      },
      {
        word: "여기서 세워주세요",
        rom: "Yeogiseo sewo-juseyo",
        mean: "Arrêtez-vous ici",
        context: "Pour demander au chauffeur de s’arrêter.",
        speak: "여기서 세워주세요",
      },
      {
        word: "좀 서둘러 주세요",
        rom: "Jom seodulleo juseyo",
        mean: "Dépêchez-vous un peu",
        context: "À utiliser avec prudence et politesse.",
        speak: "좀 서둘러 주세요",
      },
      {
        word: "얼마예요?",
        rom: "Eolmayeyo?",
        mean: "C’est combien ?",
        context: "Utile si tu veux confirmer le prix.",
        speak: "얼마예요?",
      },
      {
        word: "카드 돼요?",
        rom: "Kadeu dwaeyo?",
        mean: "La carte est acceptée ?",
        context: "Très pratique pour payer.",
        speak: "카드 돼요?",
      },
      {
        word: "영수증 주세요",
        rom: "Yeongsujeung juseyo",
        mean: "Un reçu, s’il vous plaît",
        context: "Pour demander un justificatif.",
        speak: "영수증 주세요",
      },
      {
        word: "기사님",
        rom: "Gisa-nim",
        mean: "Chauffeur",
        context: "Forme respectueuse pour s’adresser au conducteur.",
        speak: "기사님",
      },
    ],
  },
  {
    id: "street",
    title: "Dans la Rue",
    koreanTitle: "길 찾기 (Gil Chat-gi)",
    description:
      "S'orienter et demander son chemin dans les ruelles de Bukchon.",
    accent: COLORS.mapPink,
    image: BUKCHON_BG,
    dialogue: [
      {
        char: "Moi",
        kr: "실례합니다, 경복궁이 어디에 있어요?",
        fr: "Excusez-moi, où se trouve le palais Gyeongbokgung ?",
        side: "me",
      },
      {
        char: "Passant",
        kr: "쭉 가서 오른쪽으로 도세요.",
        fr: "Allez tout droit, puis tournez à droite.",
        side: "server",
      },
      {
        char: "Moi",
        kr: "걸어서 얼마나 걸려요?",
        fr: "Combien de temps ça prend à pied ?",
        side: "me",
      },
      {
        char: "Passant",
        kr: "걸어서 십 분 정도 걸려요. 바로 보여요.",
        fr: "Ça prend environ dix minutes à pied. Vous le verrez tout de suite.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "길 찾기",
        rom: "Gil chat-gi",
        mean: "Recherche d’itinéraire",
        context: "Expression liée à l’orientation.",
        speak: "길 찾기",
      },
      {
        word: "길을 잃었어요",
        rom: "Gil-eul ireosseoyo",
        mean: "Je suis perdu",
        context: "À utiliser pour demander de l’aide.",
        speak: "길을 잃었어요",
      },
      {
        word: "어디에 있어요?",
        rom: "Eodie isseoyo?",
        mean: "Où est-ce ?",
        context: "Question simple pour localiser un lieu.",
        speak: "어디에 있어요?",
      },
      {
        word: "경복궁이 어디에 있어요?",
        rom: "Gyeongbokgung-i eodie isseoyo?",
        mean: "Où est Gyeongbokgung ?",
        context: "Phrase complète pour demander ton chemin.",
        speak: "경복궁이 어디에 있어요?",
      },
      {
        word: "쭉 가세요",
        rom: "Jjuk gaseyo",
        mean: "Allez tout droit",
        context: "Indication très fréquente.",
        speak: "쭉 가세요",
      },
      {
        word: "오른쪽",
        rom: "Oreun-jjok",
        mean: "Droite",
        context: "Base de l’orientation.",
        speak: "오른쪽",
      },
      {
        word: "왼쪽",
        rom: "Oen-jjok",
        mean: "Gauche",
        context: "Base de l’orientation.",
        speak: "왼쪽",
      },
      {
        word: "돌면 보여요",
        rom: "Dolmyeon boyeoyo",
        mean: "Vous verrez en tournant",
        context: "Formule naturelle pour donner une direction.",
        speak: "돌면 보여요",
      },
      {
        word: "바로 보여요",
        rom: "Baro boyeoyo",
        mean: "Vous le verrez tout de suite",
        context: "Très naturel pour rassurer quelqu’un.",
        speak: "바로 보여요",
      },
    ],
  },
];

export default function TransportCity() {
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
      easing: Easing.out(Easing.cubic),
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
  }, [activeScene, fadeAnim]);

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
      <ImageBackground source={activeScene.image} style={styles.bg}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL DYNAMIQUE</Text>
            </Pressable>

            <View style={styles.gpsIcon}>
              <View
                style={[styles.gpsDot, { backgroundColor: activeScene.accent }]}
              />
              <Text style={styles.gpsText}>GPS ACTIVE</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            {SCENES.map((scene) => {
              const isActive = activeScene.id === scene.id;

              return (
                <Pressable
                  key={scene.id}
                  onPress={() => setActiveScene(scene)}
                  style={[
                    styles.tab,
                    isActive && {
                      backgroundColor: "rgba(255,255,255,0.12)",
                      borderColor: scene.accent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive && {
                        color: scene.accent,
                      },
                    ]}
                  >
                    {scene.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
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

              <View style={styles.cardInfo}>
                <Text style={[styles.krBadge, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>

                <Text style={styles.sceneMainTitle}>{activeScene.title}</Text>
                <Text style={styles.sceneSub}>{activeScene.description}</Text>
              </View>

              <Pressable onPress={advanceDialogue} style={styles.dialogueList}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((line, idx) => {
                    const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                    const isMe = line.side === "me";
                    const isActive = selectedWord === dialogueId;

                    return (
                      <Pressable
                        key={dialogueId}
                        onPress={() => speak(line.kr, dialogueId)}
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
                          {line.char}
                        </Text>

                        <Text style={styles.bubbleKr}>{line.kr}</Text>
                        <Text style={styles.bubbleFr}>{line.fr}</Text>
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
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>URBAN TOOLBOX</Text>

              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.vocabularyGrid}>
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
                          styles.vocabGlow,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.8,
                          },
                        ]}
                      />

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
    backgroundColor: "rgba(2,3,6,0.85)",
  },

  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 90,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  backArrow: {
    color: COLORS.txt,
    fontSize: 32,
    marginRight: 5,
  },

  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },

  gpsIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  gpsText: {
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
  },

  tabBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },

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

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  cardInfo: {
    marginBottom: 30,
  },

  krBadge: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },

  sceneMainTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 34,
  },

  sceneSub: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
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
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
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

  toolbox: {
    marginTop: 40,
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

  toolboxLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },

  vocabularyGrid: {
    gap: 14,
  },

  vocabPressable: {
    width: "100%",
  },

  vocabCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  vocabGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

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
