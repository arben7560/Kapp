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
// DESIGN SYSTEM — SUNSET HERITAGE EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  amber: "#F59E0B", // Ambre hiérarchie
  bronze: "#D97706", // Bronze tradition
  coral: "#FB7185", // Corail vitalité
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

type CountingAudioSet = {
  messages: number[];
  toolbox: number[];
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

const HIERARCHIE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-1.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-2.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-3.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/hierarchie-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/age/hierarchie/toolbox/hierarchie-toolbox-6.mp3"),
  ],
};

const SYSTEM_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/age/system/system-bulle-1.mp3"),
    require("../../../assets/audio/comptage/age/system/system-bulle-2.mp3"),
    require("../../../assets/audio/comptage/age/system/system-bulle-3.mp3"),
    require("../../../assets/audio/comptage/age/system/system-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/age/system/toolbox/system-toolbox-6.mp3"),
  ],
};

const MAJORITE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/age/majorité/majorité-bulle-1.mp3"),
    require("../../../assets/audio/comptage/age/majorité/majorité-bulle-2.mp3"),
    require("../../../assets/audio/comptage/age/majorité/majorité-bulle-3.mp3"),
    require("../../../assets/audio/comptage/age/majorité/majorité-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/age/majorité/toolbox/majorité-toolbox-6.mp3"),
  ],
};

const SCENES = withSceneAudio([
  {
    id: "introduction",
    title: "La Hiérarchie",
    koreanTitle: "나이가 어떻게 되세요? (Nai-ga...)",
    description: "Déterminer l'âge pour ajuster son niveau de politesse.",
    accent: COLORS.amber,
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "In-ho",
        kr: "나이가 어떻게 되세요?",
        fr: "Quel âge avez-vous ? (formel)",
      },
      {
        char: "Moi",
        kr: "저는 서른 살이에요. 오빠라고 불러도 돼요?",
        fr: "J'ai 30 ans (Seoreun-sal). Puis-je vous appeler Oppa ?",
      },
      {
        char: "In-ho",
        kr: "네, 저도 서른 살이에요. 우리 동갑이네요.",
        fr: "Oui, j'ai aussi trente ans. Nous avons le même âge.",
      },
      {
        char: "Moi",
        kr: "그럼 편하게 말해도 돼요?",
        fr: "Alors, on peut parler plus naturellement ?",
      },
    ],
    expressions: [
      {
        word: "살",
        rom: "Sal",
        mean: "An(s) [Natif]",
        context: "Utilisé avec Hana, Dul, Set pour l'âge parlé.",
      },
      {
        word: "서른",
        rom: "Seoreun",
        mean: "30 ans",
        context: "Nombres natifs obligatoires pour l'âge (Seoreun, Maheun...).",
      },
      {
        word: "동갑",
        rom: "Dong-gap",
        mean: "Même âge",
        context: "Mot magique pour briser la glace et parler plus librement.",
      },
      {
        word: "서른 살",
        rom: "Seoreun sal",
        mean: "30 ans",
        context: "Dizaine native utilisée avec le classificateur 'sal'.",
      },
      {
        word: "편하게 말하다",
        rom: "Pyeonhage malhada",
        mean: "Parler plus librement",
        context: "Souvent proposé quand l'âge ou la relation le permet.",
      },
      {
        word: "불러도 돼요?",
        rom: "Bulleodo dwaeyo?",
        mean: "Je peux vous appeler... ?",
        context: "Forme pratique pour demander un titre relationnel.",
      },
    ],
  },
  {
    id: "system",
    title: "Âge Coréen vs Mondial",
    koreanTitle: "만 나이 (Man Nai)",
    description: "Comprendre le nouveau système officiel adopté en 2023.",
    accent: COLORS.bronze,
    image:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "이제 한국도 '만 나이'를 쓰죠?",
        fr: "Maintenant, la Corée utilise l'âge international, n'est-ce pas ?",
      },
      {
        char: "Min-ji",
        kr: "네, 하지만 생일이 지나야 한 살 줄어들어요.",
        fr: "Oui, mais il faut attendre son anniversaire pour 'perdre' un an.",
      },
      {
        char: "Moi",
        kr: "그럼 생일 전에는 아직 스물아홉 살이에요?",
        fr: "Donc avant l'anniversaire, j'ai encore vingt-neuf ans ?",
      },
      {
        char: "Min-ji",
        kr: "맞아요, 생일이 지나면 서른 살이에요.",
        fr: "Exactement, après l'anniversaire, vous avez trente ans.",
      },
    ],
    expressions: [
      {
        word: "만 나이",
        rom: "Man Nai",
        mean: "Âge international",
        context: "Le système légal actuel basé sur la date de naissance.",
      },
      {
        word: "띠",
        rom: "Ddi",
        mean: "Signe zodiacal",
        context:
          "Souvent utilisé pour deviner l'âge (Année du Dragon, Rat...).",
      },
      {
        word: "연도",
        rom: "Yeon-do",
        mean: "Année de naissance",
        context: "C'est le chiffre le plus important pour la hiérarchie.",
      },
      {
        word: "생일 전",
        rom: "Saengil jeon",
        mean: "Avant l'anniversaire",
        context: "Repère important avec l'âge international.",
      },
      {
        word: "생일이 지나다",
        rom: "Saengili jinada",
        mean: "L'anniversaire est passé",
        context: "Condition qui fait changer l'âge officiel.",
      },
      {
        word: "스물아홉 살",
        rom: "Seumul-ahop sal",
        mean: "29 ans",
        context: "Exemple natif juste avant la trentaine.",
      },
    ],
  },
  {
    id: "majority",
    title: "La Majorité",
    koreanTitle: "성인 (Seong-in)",
    description: "Célébrer le passage à l'âge adulte (20 ans).",
    accent: COLORS.coral,
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "드디어 스무 살이네! 성인 축하해!",
        fr: "Enfin 20 ans (Seumu-sal) ! Félicitations pour ta majorité !",
      },
      {
        char: "Moi",
        kr: "고마워! 이제 술 마실 수 있어!",
        fr: "Merci ! Maintenant je peux boire de l'alcool !",
      },
      {
        char: "Ami",
        kr: "그래도 천천히 마셔. 오늘은 특별한 날이야.",
        fr: "Bois quand même doucement. Aujourd'hui est un jour spécial.",
      },
      {
        char: "Moi",
        kr: "알겠어, 스무 살 첫날이니까 조심할게.",
        fr: "Compris, c'est mon premier jour à vingt ans, je ferai attention.",
      },
    ],
    expressions: [
      {
        word: "스무 살",
        rom: "Seumu-sal",
        mean: "20 ans",
        context: "Seumeul devient Seumu lorsqu'il est suivi de 'Sal'.",
      },
      {
        word: "성년의 날",
        rom: "Seongnyeon-ui nal",
        mean: "Jour de la majorité",
        context: "Fête célébrée le 3e lundi de mai.",
      },
      {
        word: "미성년자",
        rom: "Mi-seong-nyeon-ja",
        mean: "Mineur",
        context: "Interdit de tabac et d'alcool.",
      },
      {
        word: "첫날",
        rom: "Cheonnal",
        mean: "Premier jour",
        context: "Utile pour marquer une nouvelle étape de vie.",
      },
      {
        word: "천천히 마시다",
        rom: "Cheoncheonhi masida",
        mean: "Boire lentement",
        context: "Conseil naturel dans une conversation sur la majorité.",
      },
      {
        word: "특별한 날",
        rom: "Teukbyeolhan nal",
        mean: "Jour spécial",
        context: "Expression simple pour célébrer un anniversaire important.",
      },
    ],
  },
], [HIERARCHIE_AUDIO, SYSTEM_AUDIO, MAJORITE_AUDIO]);

export default function AgeLifeImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="CYCLE DE VIE"
      badgeLabel="SOCIO-KOREAN"
      toolboxTitle="LIFE TOOLBOX"
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
  ageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  ageBadgeText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

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
