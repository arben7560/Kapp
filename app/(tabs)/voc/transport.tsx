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
import { ABSOLUTE_FILL } from "../../../constants/layout";

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
  image: ImageSourcePropType;
  dialogue: DialogueMessage[];
  expressions: ExpressionItem[];
};

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

const METRO_AUDIO = {
  message1: require("../../../assets/audio/voc/Metro/metro-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Metro/metro-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Metro/metro-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Metro/metro-bulle-4.mp3"),

  carteTransport: require("../../../assets/audio/voc/Metro/toolbox/carte-transport.mp3"),
  correspondance: require("../../../assets/audio/voc/Metro/toolbox/correspondance.mp3"),
  hongdaeipguyeok: require("../../../assets/audio/voc/Metro/toolbox/hongdaeibguyeok.mp3"),
  hwangseug: require("../../../assets/audio/voc/Metro/toolbox/hwanseung.mp3"),
  ligne2: require("../../../assets/audio/voc/Metro/toolbox/ligne2.mp3"),
  stationMetro: require("../../../assets/audio/voc/Metro/toolbox/station-metro.mp3"),
  taeumyeok: require("../../../assets/audio/voc/Metro/toolbox/taeumyeok.mp3"),
  metro: require("../../../assets/audio/voc/Metro/toolbox/metro.mp3"),
  cetteStation: require("../../../assets/audio/voc/Metro/toolbox/cette-station.mp3"),
};

const TAXI_AUDIO = {
  message1: require("../../../assets/audio/voc/Taxi/taxi-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Taxi/taxi-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Taxi/taxi-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Taxi/taxi-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-6.mp3"),
  toolbox7: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-7.mp3"),
  toolbox8: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-8.mp3"),
  toolbox9: require("../../../assets/audio/voc/Taxi/toolbox/taxi-toolbox-9.mp3"),
};

const STREET_AUDIO = {
  message1: require("../../../assets/audio/voc/Street/street-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Street/street-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Street/street-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Street/street-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-6.mp3"),
  toolbox7: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-7.mp3"),
  toolbox8: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-8.mp3"),
  toolbox9: require("../../../assets/audio/voc/Street/toolbox/street-toolbox-9.mp3"),
};

const SCENES: Scene[] = [
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
        kr: "저기요, 홍대입구역으로 가려면 어디서 갈아타요?",
        fr: "Excusez-moi, où dois-je changer pour aller à Hongdae ?",
        side: "me",
        audio: METRO_AUDIO.message1,
      },
      {
        char: "Agent",
        kr: "다음 역에서 2호선으로 환승하세요.",
        fr: "Changez pour la ligne 2 à la prochaine station.",
        side: "server",
        audio: METRO_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "이호선은 어느 방향으로 타야 해요?",
        fr: "Dans quelle direction dois-je prendre la ligne 2 ?",
        side: "me",
        audio: METRO_AUDIO.message3,
      },
      {
        char: "Agent",
        kr: "신촌 방향으로 타시면 돼요.",
        fr: "Prenez en direction de Sinchon.",
        side: "server",
        audio: METRO_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "지하철",
        rom: "Ji-ha-cheol",
        mean: "Métro",
        context: "Mot général pour parler du métro.",
        audio: METRO_AUDIO.metro,
      },
      {
        word: "지하철역",
        rom: "Ji-ha-cheol-yeok",
        mean: "Station de métro",
        context: "Très utile pour demander une station.",
        audio: METRO_AUDIO.stationMetro,
      },
      {
        word: "홍대입구역",
        rom: "Hongdae-ipgu-yeok",
        mean: "Station Hongdae-ipgu",
        context: "Station très connue de la ligne 2.",
        audio: METRO_AUDIO.hongdaeipguyeok,
      },
      {
        word: "환승",
        rom: "Hwan-seung",
        mean: "Correspondance",
        context: "Mot vital pour changer de ligne.",
        audio: METRO_AUDIO.hwangseug,
      },
      {
        word: "갈아타요",
        rom: "Gara-tayo",
        mean: "Changer de transport",
        context: "Utilisé pour demander où changer.",
        audio: METRO_AUDIO.correspondance,
      },
      {
        word: "2호선",
        rom: "I-ho-seon",
        mean: "Ligne 2",
        context: "La ligne circulaire verte de Séoul.",
        audio: METRO_AUDIO.ligne2,
      },
      {
        word: "다음 역",
        rom: "Daeum yeok",
        mean: "Prochaine station",
        context: "Entendu dans les annonces du métro.",
        audio: METRO_AUDIO.taeumyeok,
      },
      {
        word: "이번 역",
        rom: "Ibeon yeok",
        mean: "Cette station",
        context: "Annonce fréquente dans le métro.",
        audio: METRO_AUDIO.cetteStation,
      },
      {
        word: "교통카드",
        rom: "Gyo-tong-ka-deu",
        mean: "Carte de transport",
        context: "Carte type T-Money.",
        audio: METRO_AUDIO.carteTransport,
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
        audio: TAXI_AUDIO.message1,
      },
      {
        char: "Chauffeur",
        kr: "네, 알겠습니다. 강남역까지 가겠습니다.",
        fr: "Oui, bien compris. Je vais jusqu’à Gangnam Station.",
        side: "server",
        audio: TAXI_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "좀 서둘러 주실 수 있나요?",
        fr: "Pouvez-vous vous dépêcher un peu ?",
        side: "me",
        audio: TAXI_AUDIO.message3,
      },
      {
        char: "Chauffeur",
        kr: "네, 최대한 빨리 가겠습니다.",
        fr: "Oui, je vais y aller aussi vite que possible.",
        side: "server",
        audio: TAXI_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "택시",
        rom: "Taek-si",
        mean: "Taxi",
        audio: TAXI_AUDIO.toolbox1,
        context: "Mot directement emprunté à l’anglais.",
      },
      {
        word: "~로 가주세요",
        rom: "~ro ga-juseyo",
        mean: "Allez à...",
        audio: TAXI_AUDIO.toolbox2,
        context: "Structure de base pour donner une destination.",
      },
      {
        word: "강남역으로 가주세요",
        rom: "Gangnam-yeogeuro ga-juseyo",
        mean: "Allez à Gangnam Station",
        audio: TAXI_AUDIO.toolbox3,
        context: "Phrase modèle pour prendre un taxi.",
      },
      {
        word: "여기서 세워주세요",
        rom: "Yeogiseo sewo-juseyo",
        mean: "Arrêtez-vous ici",
        audio: TAXI_AUDIO.toolbox4,
        context: "Pour demander au chauffeur de s’arrêter.",
      },
      {
        word: "좀 서둘러 주세요",
        rom: "Jom seodulleo juseyo",
        mean: "Dépêchez-vous un peu",
        audio: TAXI_AUDIO.toolbox5,
        context: "À utiliser avec prudence et politesse.",
      },
      {
        word: "얼마예요?",
        rom: "Eolmayeyo?",
        mean: "C’est combien ?",
        audio: TAXI_AUDIO.toolbox6,
        context: "Utile si tu veux confirmer le prix.",
      },
      {
        word: "카드 돼요?",
        rom: "Kadeu dwaeyo?",
        mean: "La carte est acceptée ?",
        audio: TAXI_AUDIO.toolbox7,
        context: "Très pratique pour payer.",
      },
      {
        word: "영수증 주세요",
        rom: "Yeongsujeung juseyo",
        mean: "Un reçu, s’il vous plaît",
        audio: TAXI_AUDIO.toolbox8,
        context: "Pour demander un justificatif.",
      },
      {
        word: "기사님",
        rom: "Gisa-nim",
        mean: "Chauffeur",
        audio: TAXI_AUDIO.toolbox9,
        context: "Forme respectueuse pour s’adresser au conducteur.",
      },
    ],
  },
  {
    id: "street",
    title: "Dans la Rue",
    koreanTitle: "길 찾고 있어요 (Gil-eul Chat-go isseoyo)",
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
        audio: STREET_AUDIO.message1,
      },
      {
        char: "Passant",
        kr: "쭉 가서 오른쪽으로 도세요.",
        fr: "Allez tout droit, puis tournez à droite.",
        side: "server",
        audio: STREET_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "걸어서 얼마나 걸려요?",
        fr: "Combien de temps ça prend à pied ?",
        side: "me",
        audio: STREET_AUDIO.message3,
      },
      {
        char: "Passant",
        kr: "걸어서 십 분 정도 걸려요. 바로 보여요.",
        fr: "Ça prend environ dix minutes à pied. Vous le verrez tout de suite.",
        side: "server",
        audio: STREET_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "길을 찾고 있어요",
        rom: "Gil-eul Chat-go isseoyo",
        mean: "Je suis en train de chercher une rue",
        audio: STREET_AUDIO.toolbox1,
        context: "Expression liée à l’orientation.",
      },
      {
        word: "길을 잃었어요",
        rom: "Gil-eul ireosseoyo",
        mean: "Je suis perdu",
        audio: STREET_AUDIO.toolbox2,
        context: "À utiliser pour demander de l’aide.",
      },
      {
        word: "어디예요?",
        rom: "Eodi yeyo?",
        mean: "Où est-ce ?",
        audio: STREET_AUDIO.toolbox3,
        context: "Question simple pour localiser un lieu.",
      },
      {
        word: "경복궁이 어디예요?",
        rom: "Gyeongbokgung-i eodi yeyo?",
        mean: "Où est Gyeongbokgung ?",
        audio: STREET_AUDIO.toolbox4,
        context: "Phrase complète pour demander ton chemin.",
      },
      {
        word: "쭉 가세요",
        rom: "Jjuk gaseyo",
        mean: "Allez tout droit",
        audio: STREET_AUDIO.toolbox5,
        context: "Indication très fréquente.",
      },
      {
        word: "오른쪽",
        rom: "Oreun-jjok",
        mean: "Droite",
        audio: STREET_AUDIO.toolbox6,
        context: "Base de l’orientation.",
      },
      {
        word: "왼쪽",
        rom: "Oen-jjok",
        mean: "Gauche",
        audio: STREET_AUDIO.toolbox7,
        context: "Base de l’orientation.",
      },
      {
        word: "돌면 보여요",
        rom: "Dolmyeon boyeoyo",
        mean: "Vous verrez en tournant",
        audio: STREET_AUDIO.toolbox8,
        context: "Formule naturelle pour donner une direction.",
      },
      {
        word: "바로 보여요",
        rom: "Baro boyeoyo",
        mean: "Vous le verrez tout de suite",
        audio: STREET_AUDIO.toolbox9,
        context: "Très naturel pour rassurer quelqu’un.",
      },
    ],
  },
];

export default function TransportCity() {
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
      <ImageBackground source={activeScene.image} style={styles.bg}>
        <BlurView intensity={40} tint="dark" style={ABSOLUTE_FILL} />
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
              <Text style={styles.navTitle}>Transport & Ville</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            {SCENES.map((scene) => {
              const isActive = activeScene.id === scene.id;

              return (
                <Pressable
                  key={scene.id}
                  onPress={() => handleSceneChange(scene)}
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

              <View style={styles.cardInfo}>
                <Text style={[styles.krBadge, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>

                <Text style={styles.sceneMainTitle}>{activeScene.title}</Text>
                <Text style={styles.sceneSub}>{activeScene.description}</Text>
              </View>

              <View style={styles.dialogueList}>
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
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.85)",
  },

  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 90,
  },

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

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
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
