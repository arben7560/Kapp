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
// DESIGN SYSTEM — ARCHITECTURAL SAPPHIRE
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  sapphire: "#1D4ED8",
  indigo: "#6366F1",
  platinum: "#E2E8F0",
  neonBlue: "#0EA5E9",
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

const CLASSEMENT_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-1.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-2.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-3.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/classement-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/ordinal/classement/toolbox/classement-toolbox-6.mp3"),
  ],
};

const FAMILLE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-1.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-2.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-3.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/famille-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/ordinal/famille/toolbox/famille-toolbox-6.mp3"),
  ],
};

const PREMIERE_FOIS_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-1.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-2.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-3.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/premierefois-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/ordinal/premiere-fois/toolbox/premierefois-toolbox-6.mp3"),
  ],
};

const SCENES = withSceneAudio([
  {
    id: "ranking",
    title: "Le Classement",
    koreanTitle: "순위 (Sun-wi)",
    description: "Annoncer les résultats d'une compétition ou d'un examen.",
    accent: COLORS.neonBlue,
    image:
      "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Juge",
        kr: "첫 번째 우승자는 누구입니까?",
        fr: "Qui est le premier vainqueur ?",
      },
      {
        char: "Moi",
        kr: "제가 첫 번째예요! 정말 기뻐요.",
        fr: "Je suis le premier (cheot-beon-jjae) ! Je suis vraiment heureux.",
      },
      {
        char: "Juge",
        kr: "두 번째 참가자도 곧 발표하겠습니다.",
        fr: "Nous allons aussi annoncer le deuxième participant.",
      },
      {
        char: "Moi",
        kr: "마지막까지 긴장했어요.",
        fr: "J'étais nerveux jusqu'au dernier moment.",
      },
    ],
    expressions: [
      {
        word: "첫 번째",
        rom: "Cheot-beon-jjae",
        mean: "Le premier",
        context: "Le suffixe '-beon-jjae' transforme un nombre en ordinal.",
      },
      {
        word: "두 번째",
        rom: "Du-beon-jjae",
        mean: "Le deuxième",
        context: "Utilise le système natif (Hana -> Cheot, Dul -> Du).",
      },
      {
        word: "마지막",
        rom: "Ma-ji-mak",
        mean: "Le dernier",
        context: "Indispensable pour clore une liste ou un rang.",
      },
      {
        word: "우승자",
        rom: "Useungja",
        mean: "Vainqueur",
        context: "Mot utile pour annoncer un gagnant.",
      },
      {
        word: "참가자",
        rom: "Chamgaja",
        mean: "Participant",
        context: "Se combine naturellement avec premier, deuxième, etc.",
      },
      {
        word: "발표하다",
        rom: "Balpyohada",
        mean: "Annoncer",
        context: "Verbe fréquent pour les résultats ou classements.",
      },
    ],
  },
  {
    id: "family",
    title: "La Fratrie",
    koreanTitle: "형제 순서 (Hyeongje)",
    description: "Expliquer son ordre de naissance dans la famille.",
    accent: COLORS.indigo,
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "형제가 어떻게 되세요?",
        fr: "Comment est composée votre fratrie ?",
      },
      {
        char: "Moi",
        kr: "저는 첫째 아들이고, 둘째는 여동생이에요.",
        fr: "Je suis le premier fils (cheot-jjae), et la deuxième est ma sœur cadette.",
      },
      {
        char: "Ami",
        kr: "그럼 막내는 누구예요?",
        fr: "Alors, qui est le petit dernier ?",
      },
      {
        char: "Moi",
        kr: "셋째 남동생이 막내예요.",
        fr: "Mon troisième petit frère est le benjamin.",
      },
    ],
    expressions: [
      {
        word: "첫째 / 둘째",
        rom: "Cheot-jjae / Dul-jjae",
        mean: "1er / 2ème (enfant)",
        context:
          "Suffixe '-jjae' utilisé spécifiquement pour l'ordre des personnes/enfants.",
      },
      {
        word: "막내",
        rom: "Mang-nae",
        mean: "Le petit dernier",
        context:
          "Terme affectueux pour le benjamin de la famille ou du groupe.",
      },
      {
        word: "셋째 / 넷째",
        rom: "Set-jjae / Net-jjae",
        mean: "3ème / 4ème",
        context: "L'ordre continue en suivant les nombres natifs.",
      },
      {
        word: "첫째 아들",
        rom: "Cheot-jjae adeul",
        mean: "Fils aîné",
        context: "Forme précise pour situer un garçon dans la fratrie.",
      },
      {
        word: "여동생",
        rom: "Yeodongsaeng",
        mean: "Petite sœur",
        context: "Permet d'expliquer qui est deuxième ou troisième.",
      },
      {
        word: "남동생",
        rom: "Namdongsaeng",
        mean: "Petit frère",
        context: "Mot de famille très utile avec les ordres de naissance.",
      },
    ],
  },
  {
    id: "experience",
    title: "La Première Fois",
    koreanTitle: "처음 (Cheo-eum)",
    description: "Parler d'une expérience inédite ou répétée.",
    accent: COLORS.sapphire,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "한국 방문은 이번이 처음이에요.",
        fr: "C'est la première fois (cheo-eum) que je visite la Corée.",
      },
      {
        char: "Guide",
        kr: "두 번째 방문 때는 경주에 꼭 가보세요.",
        fr: "Lors de votre deuxième (du-beon-jjae) visite, allez absolument à Gyeongju.",
      },
      {
        char: "Moi",
        kr: "좋아요, 다음 여행은 경주가 첫 번째예요.",
        fr: "D'accord, pour le prochain voyage, Gyeongju sera le premier arrêt.",
      },
      {
        char: "Guide",
        kr: "마지막 날에는 한옥 마을도 좋아요.",
        fr: "Le dernier jour, le village hanok est aussi très bien.",
      },
    ],
    expressions: [
      {
        word: "처음",
        rom: "Cheo-eum",
        mean: "La première fois / Début",
        context: "Nom utilisé pour désigner l'origine d'une action.",
      },
      {
        word: "이번",
        rom: "I-beon",
        mean: "Cette fois-ci",
        context: "Désigne l'occurrence actuelle.",
      },
      {
        word: "다음",
        rom: "Da-eum",
        mean: "La prochaine fois",
        context: "Désigne l'occurrence suivante.",
      },
      {
        word: "첫 번째 여행",
        rom: "Cheot-beon-jjae yeohaeng",
        mean: "Premier voyage",
        context: "Ordre appliqué à une expérience ou une étape.",
      },
      {
        word: "두 번째 방문",
        rom: "Du-beon-jjae bangmun",
        mean: "Deuxième visite",
        context: "Expression naturelle pour parler d'un retour en Corée.",
      },
      {
        word: "마지막 날",
        rom: "Majimak nal",
        mean: "Dernier jour",
        context: "Utile pour organiser une fin de séjour.",
      },
    ],
  },
], [CLASSEMENT_AUDIO, FAMILLE_AUDIO, PREMIERE_FOIS_AUDIO]);

export default function OrdinalsImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="HIÉRARCHIE & RANG"
      badgeLabel="TOP RANK"
      toolboxTitle="ORDINAL TOOLBOX"
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
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  rankText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

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
  cardHeader: { marginBottom: 30 },
  krOrder: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 34 },
  mainSub: {
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 4,
  },
  bubbleFr: {
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
