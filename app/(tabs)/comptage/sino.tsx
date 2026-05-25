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

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SINO-STRUCTURE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  sinoNeon: "#10B981", // Vert émeraude précision
  cobalt: "#3B82F6", // Bleu data
  slate: "#94A3B8",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

type CountingAudioSet = {
  messages: number[];
  toolbox: (number | undefined)[];
};

const withSceneAudio = (scenes: any[], audioSets: (CountingAudioSet | undefined)[]) =>
  scenes.map((scene, sceneIndex) => {
    const audioSet = audioSets[sceneIndex];

    if (!audioSet) return scene;

    return {
      ...scene,
      dialogue: scene.dialogue.map((line: any, index: number) => ({
        ...line,
        ...(audioSet.messages[index] ? { audio: audioSet.messages[index] } : {}),
      })),
      expressions: scene.expressions.map((expression: any, index: number) => ({
        ...expression,
        ...(audioSet.toolbox[index] ? { audio: audioSet.toolbox[index] } : {}),
      })),
    };
  });

const SHOPPING_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-1.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-2.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-3.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/shopping-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/toolbox/shooping-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/sino/shooping/toolbox/shopping-toolbox-6.mp3"),
  ],
};

const RDV_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-1.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-2.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-3.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/rdv-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/sino/rdv/toolbox/rdv-toolbox-6.mp3"),
  ],
};

const COORDONNEE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-1.mp3"),
    require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-2.mp3"),
    require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-3.mp3"),
    require("../../../assets/audio/comptage/sino/coordonnée/coordonnée-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/sino/coordonnée/toolbox/coordonnée-toolbox-5.mp3"),
    undefined,
  ],
};

const SCENES = withSceneAudio([
  {
    id: "shopping",
    title: "Le Shopping",
    koreanTitle: "쇼핑 (Shopping)",
    description: "Négocier et comprendre les prix élevés en Won.",
    accent: COLORS.sinoNeon,
    image:
      "https://images.unsplash.com/photo-1534452203293-497d1f39106d?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "이 티셔츠 얼마예요?",
        fr: "Combien coûte ce t-shirt ?",
      },
      {
        char: "Vendeur",
        kr: "삼만 오천 원입니다.",
        fr: "C'est trente-cinq mille (Sam-man Oh-cheon) won.",
      },
      {
        char: "Moi",
        kr: "두 장 사면 칠만 원이에요?",
        fr: "Si j'en achète deux, ça fait 70 000 won ?",
      },
      {
        char: "Vendeur",
        kr: "네, 두 장이면 칠만 원입니다.",
        fr: "Oui, pour deux pièces, cela fait 70 000 won.",
      },
    ],
    expressions: [
      {
        word: "삼만 오천 원",
        rom: "Sam-man Oh-cheon won",
        mean: "35 000 Won",
        context: "Sino-coréen pur pour l'argent.",
      },
      {
        word: "십, 백, 천, 만",
        rom: "Sip, Baek, Cheon, Man",
        mean: "10, 100, 1000, 10000",
        context: "Les paliers de puissance pour compter l'argent.",
      },
      {
        word: "비싸요",
        rom: "Bissayo",
        mean: "C'est cher",
        context: "Réaction utile quand le nombre est trop élevé !",
      },
      {
        word: "칠만 원",
        rom: "Chil-man won",
        mean: "70 000 won",
        context: "Deux articles à 35 000 won donnent naturellement 70 000 won.",
      },
      {
        word: "두 장",
        rom: "Du jang",
        mean: "Deux pièces",
        context: "Jang sert pour les vêtements plats, billets ou feuilles.",
      },
      {
        word: "얼마예요?",
        rom: "Eolma-yeyo?",
        mean: "Combien ça coûte ?",
        context: "Question indispensable pour tout achat.",
      },
    ],
  },
  {
    id: "appointment",
    title: "Le Rendez-vous",
    koreanTitle: "약속 (Yaksok)",
    description: "Préciser les dates et les minutes d'une rencontre.",
    accent: COLORS.cobalt,
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      { char: "Ami", kr: "언제 만날까요?", fr: "Quand est-ce qu'on se voit ?" },
      {
        char: "Moi",
        kr: "오월 사일, 두 시 삼십분에 봐요.",
        fr: "Voyons-nous le 4 mai (Sa-il) à 2h30 (Sam-sip-bun).",
      },
      {
        char: "Ami",
        kr: "삼십분 늦으면 연락할게요.",
        fr: "Si j'ai trente minutes de retard, je te contacte.",
      },
      {
        char: "Moi",
        kr: "괜찮아요, 사일 오후에 시간 있어요.",
        fr: "Pas de souci, je suis disponible l'après-midi du 4.",
      },
    ],
    expressions: [
      {
        word: "사일 / 오월",
        rom: "Sa-il / Oh-wol",
        mean: "4 jour / 5e mois (Mai)",
        context: "Dates = Toujours en Sino-coréen.",
      },
      {
        word: "삼십분",
        rom: "Sam-sip-bun",
        mean: "30 minutes",
        context: "L'heure est mixte, mais les minutes sont Sino.",
      },
      {
        word: "일주일",
        rom: "Il-ju-il",
        mean: "Une semaine",
        context: "Compter la durée des jours/semaines.",
      },
      {
        word: "오후",
        rom: "Ohu",
        mean: "Après-midi / PM",
        context: "Se place avant l'heure pour préciser le moment.",
      },
      {
        word: "삼십 분 늦다",
        rom: "Sam-sip bun neutda",
        mean: "Avoir 30 minutes de retard",
        context: "Les minutes utilisent le système sino-coréen.",
      },
      {
        word: "연락할게요",
        rom: "Yeollakhalgeyo",
        mean: "Je te contacterai",
        context: "Phrase pratique quand l'horaire change.",
      },
    ],
  },
  {
    id: "phone",
    title: "Coordonnées",
    koreanTitle: "연락처 (Yeonrak-cheo)",
    description: "Échanger des numéros de téléphone et des étages.",
    accent: COLORS.slate,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Manager",
        kr: "제 번호는 010-팔이구-사칠일육입니다.",
        fr: "Mon numéro est le 010-829-4716.",
      },
      {
        char: "Moi",
        kr: "사무실은 구 층에 있나요?",
        fr: "Le bureau est-il au 9e (Gu) étage ?",
      },
      {
        char: "Manager",
        kr: "네, 구 층 구백일 호예요.",
        fr: "Oui, c'est au 9e étage, bureau 901.",
      },
      {
        char: "Moi",
        kr: "알겠습니다. 공일공 번호로 연락드릴게요.",
        fr: "Compris. Je vous contacterai au numéro en 010.",
      },
    ],
    expressions: [
      {
        word: "팔, 이, 구",
        rom: "Pal, I, Gu",
        mean: "8, 2, 9",
        context:
          "Les numéros de téléphone se lisent chiffre par chiffre en Sino.",
      },
      {
        word: "구 층",
        rom: "Gu cheung",
        mean: "9e étage",
        context: "Les étages et numéros de chambre utilisent le Sino.",
      },
      {
        word: "공 / 영",
        rom: "Gong / Yeong",
        mean: "Zéro",
        context: "Gong est préféré pour les numéros de téléphone.",
      },
      {
        word: "구백일 호",
        rom: "Gu-baek-il ho",
        mean: "Bureau 901",
        context: "Les numéros de chambre se lisent en sino-coréen.",
      },
      {
        word: "구 층",
        rom: "Gu cheung",
        mean: "9e étage",
        context: "Cheung indique l'étage d'un bâtiment.",
      },
      {
        word: "연락처",
        rom: "Yeollak-cheo",
        mean: "Coordonnées",
        context: "Mot général pour un contact ou un numéro.",
      },
    ],
  },
], [SHOPPING_AUDIO, RDV_AUDIO, COORDONNEE_AUDIO]);

export default function SinoNumbersImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="SYSTÈME SINO"
      badgeLabel="OFFICIEL"
      toolboxTitle="SINO-KOREAN TOOLBOX"
    />
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.88)",
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

  tabRow: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  stageCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stageInfo: { marginBottom: 30 },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 34 },
  mainSub: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
  },

  scriptBox: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 18, borderRadius: 24 },
  bubbleL: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 4,
  },
  charTag: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  krScript: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 4,
  },
  frScript: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },

  toolbox: { marginTop: 40 },
  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  toolboxLabel: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 3,
  },
  line: { flex: 1, height: 1, opacity: 0.2 },

  grid: { gap: 14 },
  vocabCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  vocabAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  vocabInner: { padding: 20 },
  vocabWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  vocabRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  vocabMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  vocabCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
