import CountingImmersionScreen from "../../../components/comptage/CountingImmersionScreen";

const COLORS = {
  sapphire: "#1D4ED8",
  indigo: "#6366F1",
  neonBlue: "#0EA5E9",
};

// ──────────────────────────────────────────────
// DESIGN SYSTEM — ARCHITECTURAL SAPPHIRE
// ──────────────────────────────────────────────

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
    title: "Le classement",
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
    title: "La fratrie",
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
        mean: "1er / 2e (enfant)",
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
        mean: "3e / 4e",
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
    title: "La première fois",
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
      backLabel="HIÉRARCHIE ET RANG"
      badgeLabel="CLASSEMENT"
      toolboxTitle="Expressions clés"
    />
  );
}
