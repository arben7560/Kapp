import CountingImmersionScreen from "../../../components/comptage/CountingImmersionScreen";

const COLORS = {
  sinoNeon: "#10B981",
  cobalt: "#3B82F6",
  slate: "#94A3B8",
};

// ──────────────────────────────────────────────
// DESIGN SYSTEM — SINO-STRUCTURE EDITION
// ──────────────────────────────────────────────

type CountingAudioSet = {
  messages: number[];
  toolbox: (number | undefined)[];
};

const withSceneAudio = (
  scenes: any[],
  audioSets: (CountingAudioSet | undefined)[],
) =>
  scenes.map((scene, sceneIndex) => {
    const audioSet = audioSets[sceneIndex];

    if (!audioSet) return scene;

    return {
      ...scene,
      dialogue: scene.dialogue.map((line: any, index: number) => ({
        ...line,
        ...(audioSet.messages[index]
          ? { audio: audioSet.messages[index] }
          : {}),
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

const SCENES = withSceneAudio(
  [
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
          mean: "35 000 won",
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
          context:
            "Deux articles à 35 000 won donnent naturellement 70 000 won.",
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
        {
          char: "Ami",
          kr: "언제 만날까요?",
          fr: "Quand est-ce qu'on se voit ?",
        },
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
          word: "연락처",
          rom: "Yeollak-cheo",
          mean: "Coordonnées",
          context: "Mot général pour un contact ou un numéro.",
        },
      ],
    },
  ],
  [SHOPPING_AUDIO, RDV_AUDIO, COORDONNEE_AUDIO],
);

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
