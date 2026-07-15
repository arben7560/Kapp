import CountingImmersionScreen from "../../../components/comptage/CountingImmersionScreen";

const COLORS = {
  amber: "#F59E0B",
  bronze: "#D97706",
  coral: "#FB7185",
};

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SUNSET HERITAGE EDITION
// ──────────────────────────────────────────────

type CountingAudioSet = {
  messages: (number | null)[];
  toolbox: (number | null)[];
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
    null,
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
    null,
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
    null,
    null,
    require("../../../assets/audio/comptage/age/majorité/majorité-bulle-3.mp3"),
    null,
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
        kr: "저는 서른 살이에요. 인호 씨는요?",
        fr: "J'ai 30 ans. Et vous, In-ho ?",
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
    description:
      "Comprendre la règle civile et administrative généralisée en 2023.",
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
        kr: "네. 만 나이는 생일이 지날 때마다 한 살씩 늘어요.",
        fr: "Oui. Avec l'âge international, on prend un an à chaque anniversaire.",
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
        context:
          "Règle générale civile et administrative fondée sur la date de naissance, avec des exceptions prévues par certaines lois.",
      },
      {
        word: "띠",
        rom: "Tti",
        mean: "Signe zodiacal",
        context:
          "Souvent utilisé pour deviner l'âge (Année du Dragon, Rat...).",
      },
      {
        word: "연도",
        rom: "Yeon-do",
        mean: "Année",
        context:
          "Pour préciser l'année de naissance, on dit 출생 연도 (chulsaeng yeondo).",
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
    description:
      "Distinguer la majorité civile à 19 ans révolus de la règle d'achat d'alcool, fixée au 1er janvier de l'année des 19 ans.",
    accent: COLORS.coral,
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "드디어 만 열아홉 살이네! 성인이 된 걸 축하해!",
        fr: "Enfin 19 ans révolus ! Félicitations pour ta majorité !",
      },
      {
        char: "Moi",
        kr: "고마워! 술은 이미 올해 1월 1일부터 살 수 있었어.",
        fr: "Merci ! Je pouvais déjà acheter de l'alcool depuis le 1er janvier de cette année.",
      },
      {
        char: "Ami",
        kr: "그래도 천천히 마셔. 오늘은 특별한 날이야.",
        fr: "Bois quand même doucement. Aujourd'hui est un jour spécial.",
      },
      {
        char: "Moi",
        kr: "알겠어. 성년이 되는 날과 술을 살 수 있는 기준은 다르구나.",
        fr: "Compris. La majorité civile et la règle applicable à l'achat d'alcool ne suivent donc pas la même date.",
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
        context:
          "Mineur au sens civil : personne n'ayant pas encore 19 ans révolus. La vente d'alcool suit une règle distincte liée à l'année de naissance.",
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
