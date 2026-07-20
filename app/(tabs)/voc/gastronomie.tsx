import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedAppText, AppText } from "../../../components/app-text";
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
  chiliRed: "#EF4444",
  sunsetOrange: "#FB923C",
  matchaGreen: "#10B981",
  woodWarm: "#A16207",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const BBQ_AUDIO = {
  message1: require("../../../assets/audio/voc/Bbq/bbq-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Bbq/bbq-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Bbq/bbq-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Bbq/bbq-bulle-4.mp3"),

  bonAppetit: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-1.mp3"),
  unePortion: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-2.mp3"),
  deuxPortions: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-3.mp3"),
  poitrinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-4.mp3"),
  echinePorc: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-5.mp3"),
  laitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-6.mp3"),
  wrapLaitue: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-7.mp3"),
  sauceWrap: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-8.mp3"),
  changerPlaque: require("../../../assets/audio/voc/Bbq/Toolbox/bbq-toolbox-9.mp3"),
};

const STREET_FOOD_AUDIO = {
  message1: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/StreetFood/streetfood-bulle-4.mp3"),

  epice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-1.mp3"),
  pasEpice: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-2.mp3"),
  cestCombien: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-3.mp3"),
  unSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-4.mp3"),
  tteokbokki: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-5.mp3"),
  eomuk: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-6.mp3"),
  hotteok: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-7.mp3"),
  aEmporter: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-8.mp3"),
  eauSvp: require("../../../assets/audio/voc/StreetFood/toolbox/streetfood-toolbox-9.mp3"),
};
const CULTURE_CAFE_AUDIO = {
  message1: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/CultureCafe/culture-cafe-bulle-4.mp3"),

  ahAh: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-1.mp3"),
  iceAmericano: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-2.mp3"),
  unVerreSvp: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-3.mp3"),
  surPlace: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-4.mp3"),
  takeout: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-5.mp3"),
  jindongbel: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-6.mp3"),
  ambiance: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-7.mp3"),
  photo: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-8.mp3"),
  placeCalme: require("../../../assets/audio/voc/CultureCafe/toolbox/culturecafe-toolbox-9.mp3"),
};
const SCENES: Scene[] = [
  {
    id: "bbq",
    title: "Le K-BBQ",
    koreanTitle: "고기집 (Gogi-jib)",
    description:
      "L'art de griller la viande et de partager les accompagnements.",
    accent: COLORS.chiliRed,
    image: require("../../../assets/images/bbq.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "삼겹살 2인분 주세요.",
        fr: "Deux portions de Samgyeopsal s'il vous plaît.",
        side: "me",
        audio: BBQ_AUDIO.message1,
      },
      {
        char: "Serveur",
        kr: "네, 알겠습니다. 상추도 같이 드릴게요.",
        fr: "Oui, bien compris. Je vais aussi vous apporter de la laitue.",
        side: "server",
        audio: BBQ_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "감사합니다. 불판도 갈아 주실 수 있나요?",
        fr: "Merci. Vous pouvez aussi changer la plaque ?",
        side: "me",
        audio: BBQ_AUDIO.message3,
      },
      {
        char: "Serveur",
        kr: "네, 바로 갈아드릴게요. 맛있게 드세요!",
        fr: "Oui, je vous la change tout de suite. Bon appétit !",
        side: "server",
        audio: BBQ_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "맛있게 드세요",
        rom: "Masitge deuseyo",
        mean: "Bon appétit",
        context: "Utilisé par les serveurs ou l'hôte.",
        audio: BBQ_AUDIO.bonAppetit,
      },
      {
        word: "1인분",
        rom: "Il-inbun",
        mean: "Une portion",
        context: "Indispensable pour commander la viande.",
        audio: BBQ_AUDIO.unePortion,
      },
      {
        word: "2인분 주세요",
        rom: "I-inbun juseyo",
        mean: "Deux portions s'il vous plaît",
        context: "Phrase pratique dans un restaurant BBQ.",
        audio: BBQ_AUDIO.deuxPortions,
      },
      {
        word: "삼겹살",
        rom: "Samgyeopsal",
        mean: "Poitrine de porc grillée",
        context: "Un classique absolu du barbecue coréen.",
        audio: BBQ_AUDIO.poitrinePorc,
      },
      {
        word: "목살",
        rom: "Moksal",
        mean: "Échine de porc",
        context: "Autre viande populaire au barbecue.",
        audio: BBQ_AUDIO.echinePorc,
      },
      {
        word: "상추",
        rom: "Sangchu",
        mean: "Laitue",
        context: "Utilisée pour envelopper la viande.",
        audio: BBQ_AUDIO.laitue,
      },
      {
        word: "쌈",
        rom: "Ssam",
        mean: "Wrap de laitue",
        context: "Bouchée avec viande, légumes et sauce.",
        audio: BBQ_AUDIO.wrapLaitue,
      },
      {
        word: "쌈장",
        rom: "Ssamjang",
        mean: "Sauce pour wrap",
        context: "Sauce épaisse souvent servie avec le BBQ.",
        audio: BBQ_AUDIO.sauceWrap,
      },
      {
        word: "불판 갈아 주세요",
        rom: "Bulp’an gara juseyo",
        mean: "Changez la plaque, s'il vous plaît",
        context: "Utile quand la plaque devient trop brûlée.",
        audio: BBQ_AUDIO.changerPlaque,
      },
    ],
  },
  {
    id: "street",
    title: "Cuisine de rue",
    koreanTitle: "길거리 음식",
    description: "Explorer les saveurs rapides et épicées de Myeongdong.",
    accent: COLORS.sunsetOrange,
    image: require("../../../assets/images/streetfood.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "이거 많이 매워요?",
        fr: "Est-ce que c'est très épicé ?",
        side: "me",
        audio: STREET_FOOD_AUDIO.message1,
      },
      {
        char: "Vendeur",
        kr: "조금 매워요. 그래도 맛있어요.",
        fr: "C'est un peu épicé. Mais c'est très bon.",
        side: "server",
        audio: STREET_FOOD_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "그럼 하나 주세요. 물도 주세요.",
        fr: "Alors donnez-m'en un. Et de l'eau aussi s'il vous plaît.",
        side: "me",
        audio: STREET_FOOD_AUDIO.message3,
      },
      {
        char: "Vendeur",
        kr: "네, 여기 있어요. 조심해서 드세요.",
        fr: "Oui, voici. Mangez doucement.",
        side: "server",
        audio: STREET_FOOD_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "매워요",
        rom: "Maewoyo",
        mean: "C'est épicé",
        context: "Mot clé avant de goûter un plat rouge-orange.",
        audio: STREET_FOOD_AUDIO.epice,
      },
      {
        word: "안 매워요?",
        rom: "An maewoyo?",
        mean: "Ce n'est pas épicé ?",
        context: "Très utile si tu crains le piment.",
        audio: STREET_FOOD_AUDIO.pasEpice,
      },
      {
        word: "얼마예요?",
        rom: "Eolmayeyo?",
        mean: "C'est combien ?",
        context: "Pour demander le prix sur un stand.",
        audio: STREET_FOOD_AUDIO.cestCombien,
      },
      {
        word: "하나 주세요",
        rom: "Hana juseyo",
        mean: "Donnez-m'en un",
        context: "Phrase simple et naturelle pour commander.",
        audio: STREET_FOOD_AUDIO.unSvp,
      },
      {
        word: "떡볶이",
        rom: "Tteokbokki",
        mean: "Gâteaux de riz épicés",
        context: "Cuisine de rue coréenne emblématique.",
        audio: STREET_FOOD_AUDIO.tteokbokki,
      },
      {
        word: "어묵",
        rom: "Eomuk",
        mean: "Fish cake",
        context: "Souvent servi sur brochette avec du bouillon.",
        audio: STREET_FOOD_AUDIO.eomuk,
      },
      {
        word: "호떡",
        rom: "Hotteok",
        mean: "Pancake sucré coréen",
        context: "Snack chaud, sucré, souvent hivernal.",
        audio: STREET_FOOD_AUDIO.hotteok,
      },
      {
        word: "포장해 주세요",
        rom: "Pojang-hae juseyo",
        mean: "À emporter s'il vous plaît",
        context: "Pour prendre ton snack avec toi.",
        audio: STREET_FOOD_AUDIO.aEmporter,
      },
      {
        word: "물 주세요",
        rom: "Mul juseyo",
        mean: "De l'eau s'il vous plaît",
        context: "Très utile si c'est trop épicé.",
        audio: STREET_FOOD_AUDIO.eauSvp,
      },
    ],
  },
  {
    id: "cafe",
    title: "Cafés à Séoul",
    koreanTitle: "카페 투어 (Tournée des cafés)",
    description: "Détente dans un café esthétique de Yeonnam-dong.",
    accent: COLORS.matchaGreen,
    image: require("../../../assets/images/culturecafe.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "아이스 아메리카노 한 잔이랑 치즈케이크 주세요.",
        fr: "Un Americano glacé et un cheesecake s'il vous plaît.",
        side: "me",
        audio: CULTURE_CAFE_AUDIO.message1,
      },
      {
        char: "Barista",
        kr: "드시고 가세요? 아니면 테이크아웃 하세요?",
        fr: "C'est sur place ? Ou à emporter ?",
        side: "server",
        audio: CULTURE_CAFE_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "먹고 갈게요. 조용한 자리 있어요?",
        fr: "Je vais consommer ici. Vous avez une place calme ?",
        side: "me",
        audio: CULTURE_CAFE_AUDIO.message3,
      },
      {
        char: "Barista",
        kr: "네, 창가 자리가 조용해요. 진동벨 울리면 오세요.",
        fr: "Oui, la place près de la fenêtre est calme. Venez quand le bipeur sonne.",
        side: "server",
        audio: CULTURE_CAFE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "아이스 아메리카노",
        rom: "Aiseu Amerikano",
        mean: "Americano glacé",
        context: "Commande très fréquente dans les cafés coréens.",
        audio: CULTURE_CAFE_AUDIO.iceAmericano,
      },
      {
        word: "한 잔 주세요",
        rom: "Han jan juseyo",
        mean: "Un verre s'il vous plaît",
        context: "Structure de base pour commander une boisson.",
        audio: CULTURE_CAFE_AUDIO.unVerreSvp,
      },
      {
        word: "드시고 가세요?",
        rom: "Deusigo gaseyo?",
        mean: "C'est sur place ?",
        context: "Question fréquente au comptoir.",
        audio: CULTURE_CAFE_AUDIO.surPlace,
      },
      {
        word: "테이크아웃",
        rom: "Teikeu-aut",
        mean: "À emporter",
        context: "Mot emprunté à l'anglais, très utilisé.",
        audio: CULTURE_CAFE_AUDIO.takeout,
      },
      {
        word: "진동벨",
        rom: "Jindong-bel",
        mean: "Bipeur / vibreur",
        context: "Objet remis en attendant la commande.",
        audio: CULTURE_CAFE_AUDIO.jindongbel,
      },
      {
        word: "분위기 좋다",
        rom: "Bunwigi jota",
        mean: "L'ambiance est superbe",
        context: "Compliment typique pour un café esthétique.",
        audio: CULTURE_CAFE_AUDIO.ambiance,
      },
      {
        word: "사진 찍어도 돼요?",
        rom: "Sajin jjigeodo dwaeyo?",
        mean: "Je peux prendre une photo ?",
        context: "Très utile dans un café esthétique.",
        audio: CULTURE_CAFE_AUDIO.photo,
      },
      {
        word: "조용한 자리 있어요?",
        rom: "Joyonghan jari isseoyo?",
        mean: "Vous avez une place calme ?",
        context: "Pratique pour travailler ou étudier.",
        audio: CULTURE_CAFE_AUDIO.placeCalme,
      },
    ],
  },
];

export default function GastronomyImmersion() {
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);
  const [previousBackground, setPreviousBackground] =
    useState<ImageSourcePropType | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bgFadeAnim = useRef(new Animated.Value(0)).current;
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
              // silence volontaire : évite un crash si le player est déjà libéré
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
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
            </Pressable>
            <View>
              <AppText variant="sectionLabel" style={[styles.navEyebrow, { color: activeScene.accent }]}>
                SÉOUL IMMERSION
              </AppText>
              <AppText variant="cardTitle" style={styles.navTitle}>Gastronomie</AppText>
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
            <BlurView intensity={40} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}20`, "transparent"]}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.cardHeader}>
                <AppText variant="koreanSecondary" script="korean" lineContract="singleLine" style={[styles.krLabel, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </AppText>
                <AppText accessibilityRole="header" variant="sceneTitle" style={styles.sceneMainTitle}>{activeScene.title}</AppText>
              </View>

              <AppText variant="body" style={styles.sceneDesc}>{activeScene.description}</AppText>

              <View style={styles.dialogueList}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((chat, idx) => {
                    const isMe = chat.side === "me";
                    const isActive =
                      selectedWord === `${activeScene.id}-dialogue-${idx}`;

                    return (
                      <Pressable
                        key={`${activeScene.id}-dialogue-${idx}`}
                        onPress={(event) => {
                          event.stopPropagation();
                          playAudio(
                            chat.audio,
                            `${activeScene.id}-dialogue-${idx}`,
                          );
                        }}
                        style={[
                          styles.bubble,
                          isMe ? styles.bubbleRight : styles.bubbleLeft,
                          isActive && {
                            borderColor: activeScene.accent,
                          },
                        ]}
                      >
                        <AppText variant="label"
                          style={[
                            styles.bubbleChar,
                            { color: activeScene.accent },
                          ]}
                        >
                          {chat.char}
                        </AppText>
                        <AppText variant="koreanSecondary" script="korean" style={styles.bubbleKr}>{chat.kr}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.bubbleFr}>{chat.fr}</AppText>
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
                    <AppText variant="label"
                      style={[styles.bubbleChar, { color: activeScene.accent }]}
                    >
                      {activeScene.dialogue[visibleMessages]?.char}
                    </AppText>

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
              </View>
            </BlurView>
          </Animated.View>

          <View style={styles.toolbox}>
            <View style={styles.toolboxTitleRow}>
              <AppText variant="sectionTitle" style={styles.toolboxTitle}>Expressions clés</AppText>
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
                            <AppText variant="koreanPrimary" script="korean" style={styles.vocabKr}>{exp.word}</AppText>
                            <AppText variant="caption"
                              style={[
                                styles.vocabRom,
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

                        <AppText variant="bodyStrong" style={styles.vocabMean}>{exp.mean}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.vocabCtx}>{exp.context}</AppText>
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
  bg: { flex: 1, position: "relative", overflow: "hidden" },
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
  backArrow: { color: "#fff", marginTop: -2 },
  navEyebrow: {
  },
  navTitle: {
    color: "#fff",
    opacity: 0.8,
  },

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
    marginBottom: 2,
  },
  sceneMainTitle: {
    color: COLORS.txt,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontStyle: "italic",
    marginBottom: 30,
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
    marginBottom: 6,
  },
  bubbleKr: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
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
    marginBottom: 2,
  },
  vocabRom: {
  },
  vocabMean: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  vocabCtx: {
    color: COLORS.muted,
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
  },
  listenText: {
    color: "rgba(255,255,255,0.78)",
  },
});
