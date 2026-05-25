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
// DESIGN SYSTEM — NEON TWILIGHT EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  electricPurple: "#A855F7",
  nightBlue: "#3B82F6",
  twilightPink: "#E879F9",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

type CountingAudioSet = {
  messages: number[];
  toolbox: (number | undefined)[];
};

const withSceneAudio = (scenes: any[], audioSets: CountingAudioSet[]) =>
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

const HEURE_RDV_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/heure/rdv/heure-bulle-1.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/heure-bulle-2.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/heure-bulle-3.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/heure-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/heure/rdv/toolbox/heure-toolbox-6.mp3"),
  ],
};

const DERNIER_METRO_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-1.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-2.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-3.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/metro-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/heure/dernier-metro/toolbox/metro-toolbox-6.mp3"),
  ],
};

const AUBE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/heure/aube/aube-bulle-1.mp3"),
    require("../../../assets/audio/comptage/heure/aube/aube-bulle-2.mp3"),
    require("../../../assets/audio/comptage/heure/aube/aube-bulle-3.mp3"),
    require("../../../assets/audio/comptage/heure/aube/aube-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/heure/aube/toolbox/aube-toolbox-6.mp3"),
  ],
};

const SCENES = withSceneAudio([
  {
    id: "appointment",
    title: "Le Rendez-vous",
    koreanTitle: "약속 시간 (Yaksok Sigan)",
    description: "Fixer l'heure exacte d'une rencontre à la station Gangnam.",
    accent: COLORS.electricPurple,
    image:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "우리 몇 시에 만날까요?",
        fr: "À quelle heure nous voyons-nous ?",
      },
      {
        char: "Moi",
        kr: "일곱 시 삼십분에 봐요.",
        fr: "Voyons-nous à 7h30 (Ilgop-si Sam-sip-bun).",
      },
      {
        char: "Ami",
        kr: "그럼 강남역 몇 번 출구예요?",
        fr: "Alors, quelle sortie de la station Gangnam ?",
      },
      {
        char: "Moi",
        kr: "이 번 출구에서 일곱 시 반에 만나요.",
        fr: "Rendez-vous à 7h30 à la sortie 2.",
      },
    ],
    expressions: [
      {
        word: "시 / 분",
        rom: "Si / Bun",
        mean: "Heure / Minute",
        context: "Si (Natif) pour l'heure, Bun (Sino) pour la minute.",
      },
      {
        word: "일곱 시",
        rom: "Ilgop-si",
        mean: "7 heures",
        context: "Utilise le système natif (Hana, Dul, Set...).",
      },
      {
        word: "삼십분 / 반",
        rom: "Sam-sip-bun / Ban",
        mean: "30 minutes / Demi",
        context: "Utilise le système sino (Il, I, Sam...).",
      },
      {
        word: "일곱 시 반",
        rom: "Ilgop si ban",
        mean: "7h30",
        context: "Forme orale plus naturelle que 'sam-sip-bun'.",
      },
      {
        word: "몇 번 출구",
        rom: "Myeot beon chulgu",
        mean: "Quelle sortie",
        context: "Indispensable pour se retrouver dans le métro.",
      },
      {
        word: "이 번 출구",
        rom: "I beon chulgu",
        mean: "Sortie 2",
        context: "Les numéros de sortie utilisent le sino-coréen.",
      },
    ],
  },
  {
    id: "last-train",
    title: "Le Dernier Métro",
    koreanTitle: "막차 시간 (Mak-cha)",
    description: "Vérifier l'heure du dernier train pour ne pas rester bloqué.",
    accent: COLORS.nightBlue,
    image:
      "https://images.unsplash.com/photo-1494883441020-00d72bd1f3b3?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "막차가 몇 시예요?",
        fr: "C'est à quelle heure le dernier train ?",
      },
      {
        char: "Agent",
        kr: "밤 열두 시 십오 분에 끊겨요.",
        fr: "Il s'arrête à minuit 15 (Yeol-du-si Sip-oh-bun).",
      },
      {
        char: "Moi",
        kr: "그럼 열한 시 오십 분까지 타야겠네요.",
        fr: "Alors je devrais le prendre avant 23h50.",
      },
      {
        char: "Agent",
        kr: "네, 십 분 전에 오시면 안전해요.",
        fr: "Oui, si vous arrivez dix minutes avant, c'est plus sûr.",
      },
    ],
    expressions: [
      {
        word: "열두 시",
        rom: "Yeol-du-si",
        mean: "12 heures (Minuit/Midi)",
        context: "Yeol-dul devient Yeol-du devant 'Si'.",
      },
      {
        word: "십오 분",
        rom: "Sip-oh-bun",
        mean: "15 minutes",
        context: "Comptage sino-coréen classique.",
      },
      {
        word: "오전 / 오후",
        rom: "Ojeon / Ohu",
        mean: "AM / PM",
        context: "Placé avant l'heure pour préciser le moment de la journée.",
      },
      {
        word: "막차",
        rom: "Makcha",
        mean: "Dernier train",
        context: "Mot vital pour rentrer tard à Séoul.",
      },
      {
        word: "열한 시 오십 분",
        rom: "Yeolhan si o-sip bun",
        mean: "23h50",
        context: "Heure native + minutes sino-coréennes.",
      },
      {
        word: "십 분 전",
        rom: "Sip bun jeon",
        mean: "Dix minutes avant",
        context: "Jeon indique 'avant' dans une expression temporelle.",
      },
    ],
  },
  {
    id: "early-bird",
    title: "L'Aube à Séoul",
    koreanTitle: "새벽 (Saebyeok)",
    description: "Se lever tôt pour voir le lever du soleil sur le fleuve Han.",
    accent: COLORS.twilightPink,
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8bef99c17?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "지금 몇 시예요?",
        fr: "Il est quelle heure maintenant ?",
      },
      {
        char: "Ji-soo",
        kr: "새벽 다섯 시 사십오 분이에요.",
        fr: "Il est 5h45 (Daseot-si Sa-sip-oh-bun) du matin.",
      },
      {
        char: "Moi",
        kr: "여섯 시 전에 한강에 도착할 수 있어요?",
        fr: "On peut arriver au fleuve Han avant 6h ?",
      },
      {
        char: "Ji-soo",
        kr: "네, 지금 출발하면 다섯 시 오십오 분쯤 도착해요.",
        fr: "Oui, si on part maintenant, on arrive vers 5h55.",
      },
    ],
    expressions: [
      {
        word: "다섯 시",
        rom: "Daseot-si",
        mean: "5 heures",
        context: "Natif : Hana, Dul, Set, Net, Daseot.",
      },
      {
        word: "사십오 분",
        rom: "Sa-sip-oh-bun",
        mean: "45 minutes",
        context: "Sino : Sam-sip (30), Sa-sip (40), Oh (5).",
      },
      {
        word: "새벽",
        rom: "Saebyeok",
        mean: "Aube / Petit matin",
        context: "Désigne la période entre minuit et le lever du soleil.",
      },
      {
        word: "여섯 시 전",
        rom: "Yeoseot si jeon",
        mean: "Avant 6h",
        context: "Forme utile pour parler d'une limite horaire.",
      },
      {
        word: "다섯 시 오십오 분",
        rom: "Daseot si o-sip-o bun",
        mean: "5h55",
        context: "Exemple complet avec heure native et minutes sino.",
      },
      {
        word: "도착하다",
        rom: "Dochakhada",
        mean: "Arriver",
        context: "Verbe de base pour parler d'horaires de trajet.",
      },
    ],
  },
], [HEURE_RDV_AUDIO, DERNIER_METRO_AUDIO, AUBE_AUDIO]);

export default function TimeImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="SYSTÈME MIXTE"
      badgeLabel="REAL-TIME"
      toolboxTitle="TIME TOOLBOX"
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
  timeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeBadgeText: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1,
  },

  tabRow: { flexDirection: "row", gap: 8, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  mainCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardInfo: { marginBottom: 30 },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  enTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 32 },
  desc: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 18,
  },

  chatSection: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 16, borderRadius: 24 },
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
  krLine: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 25,
    marginBottom: 4,
  },
  frLine: { color: COLORS.muted, fontSize: 12, fontFamily: "Outfit_500Medium" },

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
  divider: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expGlow: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expContent: { padding: 20 },
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
