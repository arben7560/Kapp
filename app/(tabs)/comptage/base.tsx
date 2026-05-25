import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import CountingImmersionScreen from "../../../components/comptage/CountingImmersionScreen";
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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../../assets/images/comptage.png");

// ----------------------------------------------
// DESIGN SYSTEM — NATIVE ROOTS EDITION
// ----------------------------------------------
const COLORS = {
  bg: "#020306",
  nativeCyan: "#22D3EE",
  indigoDeep: "#4F46E5",
  softViolet: "#A78BFA",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const CAFE_AUDIO = {
  message1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-1.mp3"),
  message2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-2.mp3"),
  message3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-3.mp3"),
  message4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/cafe-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/comptage/nombres de bases/au-cafe/toolbox/au-cafe-toolbox-6.mp3"),
  toolbox6: undefined,
  toolbox7: undefined,
  toolbox8: undefined,
};

const ENTRAINEMENT_AUDIO = {
  message1: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-1.mp3"),
  message2: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-2.mp3"),
  message3: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-3.mp3"),
  message4: require("../../../assets/audio/comptage/nombres de bases/entrainement/entrainement-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/comptage/nombres de bases/entrainement/toolbox/entrainement-toolbox-5.mp3"),
  toolbox6: undefined,
};

const ANNIVERSAIRE_AUDIO = {
  message1: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-1.mp3"),
  message2: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-2.mp3"),
  message3: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-3.mp3"),
  message4: require("../../../assets/audio/comptage/nombres de bases/anniversaire/anniversaire-bulle-4.mp3"),
  toolbox1: require("../../../assets/audio/comptage/anniversaire/toolbox/anniversaire-toolbox-1.mp3"),
  toolbox2: require("../../../assets/audio/comptage/anniversaire/toolbox/anniversaire-toolbox-2.mp3"),
  toolbox3: require("../../../assets/audio/comptage/anniversaire/toolbox/anniversaire-toolbox-3.mp3"),
  toolbox4: require("../../../assets/audio/comptage/anniversaire/toolbox/anniversaire-toolbox-4.mp3"),
  toolbox5: require("../../../assets/audio/comptage/anniversaire/toolbox/anniversaire-toolbox-5.mp3"),
  toolbox6: require("../../../assets/audio/comptage/anniversaire/toolbox/anniversaire-toolbox-6.mp3"),
};

const SCENES = [
  {
    id: "cafe",
    title: "Au Café",
    koreanTitle: "카페에서 (Café-eseo)",
    description: "Compter les articles lors d'une commande de groupe.",
    accent: COLORS.nativeCyan,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "아메리카노 세 잔 주세요.",
        fr: "Donnez-moi trois (set) americanos s'il vous plaît.",
        audio: CAFE_AUDIO.message1,
      },
      {
        char: "Barista",
        kr: "네, 세 잔 확인했습니다.",
        fr: "D'accord, trois (set) verres confirmés.",
        audio: CAFE_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "그리고 케이크 두 조각도 주세요.",
        fr: "Et deux parts de gâteau aussi, s'il vous plaît.",
        audio: CAFE_AUDIO.message3,
      },
      {
        char: "Barista",
        kr: "네, 음료 세 잔이랑 케이크 두 조각 맞죠?",
        fr: "Très bien, trois boissons et deux parts de gâteau, c'est bien ça ?",
        audio: CAFE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "하나, 둘, 셋",
        rom: "Hana, Dul, Set",
        mean: "1, 2, 3",
        context: "Les bases du système natif pour les petits objets.",
        audio: CAFE_AUDIO.toolbox1,
      },
      {
        word: "넷, 다섯, 여섯",
        rom: "Net, Tasot, Yosot",
        mean: "4, 5, 6",
        context: "Suite des nombres natifs utiles pour compter au café.",
        audio: CAFE_AUDIO.toolbox2,
      },
      {
        word: "한 잔, 두 잔",
        rom: "Han jan, Tu jan",
        mean: "Un verre, deux verres",
        context: "Formes naturelles avec le classificateur des boissons.",
        audio: CAFE_AUDIO.toolbox3,
      },
      {
        word: "세 잔",
        rom: "Se-jan",
        mean: "Trois verres",
        context: "Notez comment 'Set' devient 'Se' devant un classificateur.",
        audio: CAFE_AUDIO.toolbox4,
      },
      {
        word: "몇 개예요?",
        rom: "Myeot gae-yeyo?",
        mean: "Combien y en a-t-il ?",
        context: "Question essentielle pour demander une quantité.",
        audio: CAFE_AUDIO.toolbox5,
      },
      {
        word: "두 조각",
        rom: "Du jogak",
        mean: "Deux parts",
        context: "Classificateur naturel pour les parts de gâteau ou de pizza.",
        audio: CAFE_AUDIO.toolbox6,
      },
      {
        word: "네 잔",
        rom: "Ne jan",
        mean: "Quatre verres",
        context: "Net devient Ne devant un classificateur comme 'jan'.",
        audio: CAFE_AUDIO.toolbox7,
      },
      {
        word: "다섯 개",
        rom: "Daseot gae",
        mean: "Cinq unités",
        context: "Gae est le classificateur passe-partout pour les objets.",
        audio: CAFE_AUDIO.toolbox8,
      },
    ],
  },
  {
    id: "workout",
    title: "Entraînement",
    koreanTitle: "운동 (Undong)",
    description: "Le rythme du comptage de 1 à 10 dans un parc de Séoul.",
    accent: COLORS.softViolet,
    image:
      "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Coach",
        kr: "여덟, 아홉, 열! 마지막 하나 더!",
        fr: "Huit, neuf, dix ! Un dernier de plus !",
        audio: ENTRAINEMENT_AUDIO.message1,
      },
      {
        char: "Moi",
        kr: "하나... 둘... 너무 힘들어요!",
        fr: "Un... deux... c'est trop dur !",
        audio: ENTRAINEMENT_AUDIO.message2,
      },
      {
        char: "Coach",
        kr: "세 번만 더 할게요. 셋, 넷, 다섯!",
        fr: "On en fait seulement trois fois de plus. Trois, quatre, cinq !",
        audio: ENTRAINEMENT_AUDIO.message3,
      },
      {
        char: "Moi",
        kr: "좋아요, 마지막 하나 더 할게요.",
        fr: "D'accord, j'en fais un dernier de plus.",
        audio: ENTRAINEMENT_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "여덟, 아홉, 열",
        rom: "Yeodeol, Ahop, Yeol",
        mean: "8, 9, 10",
        context: "Fin de la série numérique de base.",
        audio: ENTRAINEMENT_AUDIO.toolbox1,
      },
      {
        word: "하나 더",
        rom: "Hana deo",
        mean: "Un de plus",
        context: "La phrase redoutée (ou motivante) du coach.",
        audio: ENTRAINEMENT_AUDIO.toolbox2,
      },
      {
        word: "다섯, 여섯, 일곱",
        rom: "Daseot, Yeoseot, Ilgob",
        mean: "5, 6, 7",
        context: "Le milieu de la progression numérique.",
        audio: ENTRAINEMENT_AUDIO.toolbox3,
      },
      {
        word: "셋만 더",
        rom: "Set-man deo",
        mean: "Seulement trois de plus",
        context: "Très utile pour motiver ou négocier un dernier effort.",
        audio: ENTRAINEMENT_AUDIO.toolbox4,
      },
      {
        word: "열 번",
        rom: "Yeol beon",
        mean: "Dix fois",
        context: "Beon compte les répétitions d'un exercice ou d'une action.",
        audio: ENTRAINEMENT_AUDIO.toolbox5,
      },
      {
        word: "마지막",
        rom: "Majimak",
        mean: "Dernier",
        context: "Annonce la fin d'une série ou d'un entraînement.",
        audio: ENTRAINEMENT_AUDIO.toolbox6,
      },
    ],
  },
  {
    id: "birthday",
    title: "L'Anniversaire",
    koreanTitle: "생일 (Saeng-il)",
    description: "Exprimer l'âge lors d'une fête entre amis.",
    accent: COLORS.indigoDeep,
    image:
      "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "올해 몇 살이 됐어요?",
        fr: "Quel âge as-tu eu cette année ?",
        audio: ANNIVERSAIRE_AUDIO.message1,
      },
      {
        char: "Moi",
        kr: "스무 살이 됐어요. 아직 어려요!",
        fr: "J'ai eu vingt (seumu) ans. Je suis encore jeune !",
        audio: ANNIVERSAIRE_AUDIO.message2,
      },
      {
        char: "Ami",
        kr: "케이크에 초 스무 개 꽂을까요?",
        fr: "On met vingt bougies sur le gâteau ?",
        audio: ANNIVERSAIRE_AUDIO.message3,
      },
      {
        char: "Moi",
        kr: "네, 스무 개면 충분해요!",
        fr: "Oui, vingt, c'est largement suffisant !",
        audio: ANNIVERSAIRE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "스무 살",
        rom: "Seumu-sal",
        mean: "20 ans",
        context: "Passage à l'âge adulte. 'Seumeul' devient 'Seumu'.",
        audio: ANNIVERSAIRE_AUDIO.toolbox1,
      },
      {
        word: "서른, 마흔",
        rom: "Seoreun, Maheun",
        mean: "30, 40",
        context: "Les dizaines en natif (jusqu'à 99).",
        audio: ANNIVERSAIRE_AUDIO.toolbox2,
      },
      {
        word: "몇 살?",
        rom: "Myeot sal?",
        mean: "Quel âge ?",
        context: "Toujours utiliser le système natif pour l'âge.",
        audio: ANNIVERSAIRE_AUDIO.toolbox3,
      },
      {
        word: "초 스무 개",
        rom: "Cho seumu gae",
        mean: "Vingt bougies",
        context: "Pour parler du nombre de bougies sur un gâteau.",
        audio: ANNIVERSAIRE_AUDIO.toolbox4,
      },
      {
        word: "어려요",
        rom: "Eoryeoyo",
        mean: "Être jeune",
        context: "Réponse légère quand on parle de son âge.",
        audio: ANNIVERSAIRE_AUDIO.toolbox5,
      },
      {
        word: "됐어요",
        rom: "Dwaesseoyo",
        mean: "Avoir atteint / devenir",
        context: "Se combine avec l'âge pour dire 'j'ai eu ... ans'.",
        audio: ANNIVERSAIRE_AUDIO.toolbox6,
      },
    ],
  },
];

export default function NativeNumbersImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="SYSTÈME NATIF"
      badgeLabel="PURE KOREAN"
      toolboxTitle="NUMERIC TOOLBOX"
    />
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: { color: COLORS.muted, fontSize: 9, fontFamily: "Outfit_700Bold" },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  glassCard: {
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
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 34 },
  mainDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
  },

  chatSection: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 16, borderRadius: 24 },
  bubbleL: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 4,
  },
  bubbleName: {
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
    lineHeight: 25,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
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

  expGrid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expBody: { padding: 20 },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
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
