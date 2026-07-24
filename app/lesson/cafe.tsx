import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
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
import { AppText } from "../../components/app-text";
import { RESPONSIVE_AUDIO_COPY_MIN_WIDTH } from "../../constants/layout";

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
  glass: "rgba(255,255,255,0.05)",
};

const CAFE_IMAGE = require("../../assets/images/cafe.jpg");

const SCENES = [
  {
    id: "server",
    tab: "Barista",
    title: "Côté barista",
    koreanTitle: "바리스타 표현",
    description: "Les phrases utiles que le barista peut employer au café.",
    accent: COLORS.gold,
    image: CAFE_IMAGE,
    dialogue: [
      {
        char: "Barista",
        kr: "어서 오세요. 주문 도와드릴게요. 무엇으로 드시겠어요?",
        fr: "Bienvenue. Je vais vous aider pour la commande. Que souhaitez-vous prendre ?",
        side: "server",
      },
      {
        char: "Barista",
        kr: "네, 확인해 드릴게요. 아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 맞으시죠?",
        fr: "Très bien, je vérifie. Deux américanos glacés et un jus d'orange, c'est bien ça ?",
        side: "server",
      },
      {
        char: "Barista",
        kr: "드시고 가세요? 아니면 포장해 드릴까요?",
        fr: "Vous consommez sur place ou à emporter ?",
        side: "server",
      },
      {
        char: "Barista",
        kr: "총 9 500원입니다. 카드로 결제하시겠어요, 아니면 현금으로 하시겠어요?",
        fr: "Cela fait 9 500 wons au total. Vous souhaitez payer par carte ou en espèces ?",
        side: "server",
      },
      {
        char: "Barista",
        kr: "네, 카드 결제 도와드릴게요. 영수증 필요하세요?",
        fr: "Très bien, je lance le paiement par carte. Avez-vous besoin du reçu ?",
        side: "server",
      },
      {
        char: "Barista",
        kr: "진동벨 드릴게요. 편하신 자리에 앉아 계시면 됩니다.",
        fr: "Voici le buzzer. Vous pouvez vous asseoir où vous voulez.",
        side: "server",
      },
    ],
    expressions: [
      {
        word: "어서 오세요",
        rom: "Eoseo oseyo",
        mean: "Bienvenue",
        context: "Accueil naturel quand le client arrive au comptoir.",
      },
      {
        word: "주문 도와드릴게요",
        rom: "Jumun dowadeurilgeyo",
        mean: "Je vais vous aider pour la commande",
        context: "Phrase polie utilisée par le barista pour lancer l'échange.",
      },
      {
        word: "무엇으로 드시겠어요?",
        rom: "Mueoseuro deusigesseoyo?",
        mean: "Que souhaitez-vous prendre ?",
        context: "Question centrale du barista.",
      },
      {
        word: "뭐 드릴까요?",
        rom: "Mwo deurilkkayo?",
        mean: "Qu'est-ce que je vous sers ?",
        context: "Forme plus directe et familière, fréquente sur le terrain.",
      },
      {
        word: "확인해 드릴게요",
        rom: "Hwaginhae deurilgeyo",
        mean: "Je vais vérifier pour vous",
        context: "Le barista confirme la commande avant la suite.",
      },
      {
        word: "드시고 가세요? 아니면 포장해 드릴까요?",
        rom: "Deusigo gaseyo? Animyeon pojanghae deurilkkayo?",
        mean: "Sur place ou à emporter ?",
        context:
          "La question simple pour savoir si la commande est sur place ou à emporter.",
      },
      {
        word: "영수증 필요하세요?",
        rom: "Yeongsujeung piryohaseyo?",
        mean: "Avez-vous besoin du reçu ?",
        context: "Question de fin après le paiement.",
      },
    ],
  },
  {
    id: "client",
    tab: "Client",
    title: "Côté client",
    koreanTitle: "손님 표현",
    description: "Les phrases utiles pour commander et répondre au café.",
    accent: COLORS.pink,
    image: CAFE_IMAGE,
    dialogue: [
      {
        char: "Client",
        kr: "아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 주세요.",
        fr: "Je voudrais deux américanos glacés et un jus d'orange, s'il vous plaît.",
        side: "me",
      },
      {
        char: "Client",
        kr: "아이스 라떼 한 잔이랑 치즈케이크 한 조각 주세요.",
        fr: "Un latte glacé et un cheesecake, s'il vous plaît.",
        side: "me",
      },
      {
        char: "Client",
        kr: "다시 한번 말씀해 주시겠어요?",
        fr: "Pouvez-vous répéter ?",
        side: "me",
      },
      {
        char: "Client",
        kr: "네, 먹고 갈게요.",
        fr: "Sur place.",
        side: "me",
      },
      {
        char: "Client",
        kr: "포장해 주세요.",
        fr: "À emporter.",
        side: "me",
      },
      {
        char: "Client",
        kr: "카드로 할게요.",
        fr: "Par carte.",
        side: "me",
      },
      {
        char: "Client",
        kr: "아니요, 괜찮아요.",
        fr: "Non, merci.",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "아이스 아메리카노",
        rom: "Aiseu amerikano",
        mean: "Américano glacé",
        context: "Boisson principale côté client.",
      },
      {
        word: "두 잔",
        rom: "Du jan",
        mean: "Deux verres / deux tasses",
        context: "Quantité utile pour commander une boisson.",
      },
      {
        word: "한 잔",
        rom: "Han jan",
        mean: "Un verre / une tasse",
        context: "Compteur naturel pour les boissons au café.",
      },
      {
        word: "하나",
        rom: "Hana",
        mean: "Un / une",
        context: "Nombre général, à éviter seul pour commander une boisson.",
      },
      {
        word: "오렌지 주스",
        rom: "Orenji juseu",
        mean: "Jus d'orange",
        context: "Boisson complémentaire de la commande.",
      },
      {
        word: "이랑",
        rom: "irang",
        mean: "avec / et",
        context: "Connecteur oral côté client.",
      },
      {
        word: "주세요",
        rom: "juseyo",
        mean: "Donnez-moi / s'il vous plaît",
        context: "Formule essentielle pour commander.",
      },
      {
        word: "다시 한번 말씀해 주시겠어요?",
        rom: "Dasi hanbeon malsseumhae jusigesseoyo?",
        mean: "Pouvez-vous répéter ?",
        context: "À sortir quand la phrase est allée trop vite.",
      },
      {
        word: "네, 먹고 갈게요.",
        rom: "Ne, meokgo galgeyo.",
        mean: "Oui, je consomme sur place",
        context: "Pour indiquer que tu restes au café.",
      },
      {
        word: "포장해 주세요.",
        rom: "Pojanghae juseyo.",
        mean: "À emporter, s'il vous plaît",
        context: "Pour demander une commande à emporter.",
      },
      {
        word: "테이크아웃이요.",
        rom: "Teikeu-aut-iyo.",
        mean: "Take out / à emporter.",
        context: "Version Konglish très entendue dans les cafés.",
      },
      {
        word: "카드로 할게요.",
        rom: "Kadeuro halgeyo.",
        mean: "Je vais payer par carte",
        context: "À utiliser au moment de payer.",
      },
      {
        word: "아니요, 괜찮아요.",
        rom: "Aniyo, gwaenchanayo.",
        mean: "Non, merci / ça va",
        context: "Pour refuser poliment le reçu.",
      },
    ],
  },
];

export default function CafeLesson() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [previousBackground, setPreviousBackground] =
    useState<ImageSourcePropType | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const bgFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedWord(null);
    Speech.stop();
  }, [activeScene]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

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
            style={[StyleSheet.absoluteFillObject, { opacity: bgFadeAnim }]}
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

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
              <AppText variant="sectionLabel" lineContract="singleLine" style={styles.backText}>RETOUR</AppText>
            </Pressable>

            <AppText variant="sectionLabel" lineContract="singleLine" style={styles.headerTitle}>CAFÉ</AppText>
          </View>

          <View style={styles.selectorRow}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.selectorItem,
                  activeScene.id === scene.id && {
                    borderColor: scene.accent,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                ]}
              >
                <AppText variant="label" lineContract="singleLine"
                  style={[
                    styles.selectorText,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.tab}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <AppText variant="sectionLabel" style={styles.toolboxTitle}>Expressions clés</AppText>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.expressionGrid}>
              {activeScene.expressions.map((exp, i) => {
                const cardId = `${activeScene.id}-${i}`;
                const isActive = selectedWord === cardId;

                return (
                  <Pressable
                    key={cardId}
                    onPress={() => speak(exp.word, cardId)}
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
                        isActive && {
                          borderColor: activeScene.accent,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.expAccent,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.75,
                          },
                        ]}
                      />
                      <View style={styles.expContent}>
                        <View style={styles.expTopRow}>
                          <View style={{ flex: 1, minWidth: RESPONSIVE_AUDIO_COPY_MIN_WIDTH }}>
                            <AppText variant="koreanPrimary" script="korean" style={styles.expWord}>{exp.word}</AppText>
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
                        <AppText variant="bodySecondary" tone="muted" style={styles.expContext}>{exp.context}</AppText>
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
    ...StyleSheet.absoluteFillObject,
  },
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
  backArrow: { color: COLORS.txt, marginRight: 5 },
  backText: {
    color: COLORS.muted,
  },
  headerTitle: {
    color: COLORS.pink,
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
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expressionGrid: { gap: 14 },
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
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  expWord: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  expRom: {
  },
  expMean: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  expContext: {
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
