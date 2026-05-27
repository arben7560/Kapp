import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
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

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
  glass: "rgba(255,255,255,0.05)",
};

const CAFE_IMAGE = require("../../assets/images/culturecafe.png");

const SCENES = [
  {
    id: "server",
    tab: "Serveur",
    title: "Script IA",
    koreanTitle: "AI 바리스타",
    description: "Les répliques exactes que l'IA peut dire dans le café.",
    accent: COLORS.gold,
    image: CAFE_IMAGE,
    dialogue: [
      {
        char: "IA",
        kr: "어서 오세요. 주문 도와드릴게요. 무엇으로 드시겠어요?",
        fr: "Bienvenue. Je vais vous aider pour la commande. Que souhaitez-vous prendre ?",
        side: "server",
      },
      {
        char: "IA",
        kr: "네, 확인해 드릴게요. 아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 맞으시죠?",
        fr: "Très bien, je vérifie. Deux américanos glacés et un jus d'orange, c'est bien ça ?",
        side: "server",
      },
      {
        char: "IA",
        kr: "드시고 가세요, 아니면 포장하세요?",
        fr: "Vous consommez sur place ou à emporter ?",
        side: "server",
      },
      {
        char: "IA",
        kr: "총 9,500원입니다. 카드로 결제하시겠어요, 아니면 현금으로 하시겠어요?",
        fr: "Cela fait 9 500 wons au total. Vous souhaitez payer par carte ou en espèces ?",
        side: "server",
      },
      {
        char: "IA",
        kr: "네, 카드 결제 도와드릴게요. 영수증 필요하세요?",
        fr: "Très bien, je lance le paiement par carte. Avez-vous besoin du reçu ?",
        side: "server",
      },
      {
        char: "IA",
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
        context: "Ouverture du script IA au début de la scène café.",
      },
      {
        word: "주문 도와드릴게요",
        rom: "Jumun dowadeurilgeyo",
        mean: "Je vais vous aider pour la commande",
        context: "Phrase polie utilisée par l'IA pour lancer l'échange.",
      },
      {
        word: "무엇으로 드시겠어요?",
        rom: "Mueoseuro deusigesseoyo?",
        mean: "Que souhaitez-vous prendre ?",
        context: "Question serveur centrale du dialogue IA.",
      },
      {
        word: "확인해 드릴게요",
        rom: "Hwaginhae deurilgeyo",
        mean: "Je vais vérifier pour vous",
        context: "L'IA confirme la commande avant la suite.",
      },
      {
        word: "드시고 가세요, 아니면 포장하세요?",
        rom: "Deusigo gaseyo, animyeon pojanghaseyo?",
        mean: "Sur place ou à emporter ?",
        context: "Choix clé du script après la confirmation.",
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
    tab: "Clients",
    title: "Réponses User",
    koreanTitle: "사용자 선택",
    description: "Les réponses exactes que l'utilisateur peut choisir dans le dialogue IA.",
    accent: COLORS.pink,
    image: CAFE_IMAGE,
    dialogue: [
      {
        char: "User",
        kr: "아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 주세요.",
        fr: "Je voudrais deux américanos glacés et un jus d'orange, s'il vous plaît.",
        side: "me",
      },
      {
        char: "User",
        kr: "아이스 라떼 한 잔이랑 치즈케이크 한 조각 주세요.",
        fr: "Un latte glacé et un cheesecake, s'il vous plaît.",
        side: "me",
      },
      {
        char: "User",
        kr: "다시 한번 말씀해 주시겠어요?",
        fr: "Pouvez-vous répéter ?",
        side: "me",
      },
      {
        char: "User",
        kr: "네, 먹고 갈게요.",
        fr: "Sur place.",
        side: "me",
      },
      {
        char: "User",
        kr: "포장해 주세요.",
        fr: "À emporter.",
        side: "me",
      },
      {
        char: "User",
        kr: "카드로 할게요.",
        fr: "Par carte.",
        side: "me",
      },
      {
        char: "User",
        kr: "아니요, 괜찮아요.",
        fr: "Non, merci.",
        side: "me",
      },
    ],
    expressions: [
      {
        word: "아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 주세요.",
        rom: "Aiseu amerikano du janirang orenji juseu han jan juseyo.",
        mean: "Deux américanos glacés et un jus d'orange, s'il vous plaît",
        context: "Choix utilisateur principal dans le script pédagogique.",
      },
      {
        word: "아이스 라떼 한 잔이랑 치즈케이크 한 조각 주세요.",
        rom: "Aiseu ratte han janirang chijeu keikeu han jogak juseyo.",
        mean: "Un latte glacé et une part de cheesecake, s'il vous plaît",
        context: "Deuxième commande possible dans le dialogue IA.",
      },
      {
        word: "다시 한번 말씀해 주시겠어요?",
        rom: "Dasi hanbeon malsseumhae jusigesseoyo?",
        mean: "Pouvez-vous répéter ?",
        context: "Réponse de réparation prévue dans le script.",
      },
      {
        word: "네, 먹고 갈게요.",
        rom: "Ne, meokgo galgeyo.",
        mean: "Oui, je consomme sur place",
        context: "Choix utilisateur pour rester au café.",
      },
      {
        word: "포장해 주세요.",
        rom: "Pojanghae juseyo.",
        mean: "À emporter, s'il vous plaît",
        context: "Choix utilisateur pour l'option takeout.",
      },
      {
        word: "카드로 할게요.",
        rom: "Kadeuro halgeyo.",
        mean: "Je vais payer par carte",
        context: "Réponse attendue au moment du paiement.",
      },
      {
        word: "아니요, 괜찮아요.",
        rom: "Aniyo, gwaenchanayo.",
        mean: "Non, merci / ça va",
        context: "Réponse utilisateur quand le reçu n'est pas nécessaire.",
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
          resizeMode="contain"
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
              resizeMode="contain"
            />
          </Animated.View>
        ) : null}
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>RETOUR</Text>
            </Pressable>

            <Text style={styles.headerTitle}>CAFE IMMERSION</Text>
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
<View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>CAFE TOOLBOX</Text>
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
                        <Text style={styles.expContext}>{exp.context}</Text>
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
    fontSize: 12,
    letterSpacing: 3,
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
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
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
