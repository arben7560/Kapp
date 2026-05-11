import ClassifierImmersionScreen from "../../../components/classificateur/ClassifierImmersionScreen";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — ROYAL AMETHYST EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  royalViolet: "#8B5CF6",
  softLavender: "#C084FC",
  roseGold: "#F472B6",
  honorGold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "restaurant",
    title: "Au Restaurant",
    koreanTitle: "식당에서 (Sikdang)",
    description: "Annoncer le nombre de convives à l'arrivée.",
    accent: COLORS.royalViolet,
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Serveur",
        kr: "몇 분이세요?",
        fr: "Combien de personnes êtes-vous ? (Honorifique)",
      },
      {
        char: "Moi",
        kr: "세 명이에요. 창가 자리 있을까요?",
        fr: "Nous sommes trois (se-myeong). Y a-t-il une place près de la fenêtre ?",
      },
      {
        char: "Serveur",
        kr: "네, 세 명 자리 준비해 드릴게요.",
        fr: "Oui, je vais préparer une table pour trois personnes.",
      },
      {
        char: "Moi",
        kr: "잠시 후 한 명 더 올 거예요.",
        fr: "Une personne de plus va arriver dans un instant.",
      },
    ],
    expressions: [
      {
        word: "명 (名)",
        rom: "Myeong",
        mean: "Personne (Standard)",
        context:
          "Le compteur le plus courant pour les amis, collègues ou soi-même.",
      },
      {
        word: "몇 명?",
        rom: "Myeot myeong?",
        mean: "Combien de personnes ?",
        context: "Question standard utilisée entre pairs.",
      },
      {
        word: "세 명",
        rom: "Se myeong",
        mean: "3 personnes",
        context: "Set devient 'Se' devant le compteur.",
      },
      {
        word: "한 명 더",
        rom: "Han myeong deo",
        mean: "Une personne de plus",
        context: "Utile quand le groupe n'est pas encore complet.",
      },
      {
        word: "자리",
        rom: "Jari",
        mean: "Place / table",
        context: "Mot essentiel au restaurant.",
      },
      {
        word: "창가 자리",
        rom: "Changga jari",
        mean: "Place près de la fenêtre",
        context: "Demande fréquente à l'arrivée.",
      },
    ],
  },
  {
    id: "service",
    title: "Le Service",
    koreanTitle: "손님 맞이 (Sonnim)",
    description:
      "L'utilisation de la forme honorifique pour les clients ou aînés.",
    accent: COLORS.honorGold,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Réception",
        kr: "예약하신 분은 두 분이신가요?",
        fr: "Les personnes ayant réservé sont-elles au nombre de deux ?",
      },
      {
        char: "Client",
        kr: "네, 저랑 친구 한 분 더 오실 거예요.",
        fr: "Oui, moi et un ami (honorable) de plus allons venir.",
      },
      {
        char: "Réception",
        kr: "그럼 총 세 분으로 예약해 드릴게요.",
        fr: "Alors je vais enregistrer la réservation pour trois personnes.",
      },
      {
        char: "Client",
        kr: "네, 세 분으로 부탁드립니다.",
        fr: "Oui, pour trois personnes, s'il vous plaît.",
      },
    ],
    expressions: [
      {
        word: "분",
        rom: "Bun",
        mean: "Personne (Honorifique)",
        context:
          "À utiliser pour compter les clients, les professeurs ou les aînés.",
      },
      {
        word: "두 분",
        rom: "Du bun",
        mean: "Deux personnes (poli)",
        context: "Dul devient 'Du'. Très utilisé par le personnel de service.",
      },
      {
        word: "몇 분?",
        rom: "Myeot bun?",
        mean: "Combien de personnes ? (poli)",
        context: "La question polie posée par les hôtes.",
      },
      {
        word: "한 분 더",
        rom: "Han bun deo",
        mean: "Une personne de plus (poli)",
        context: "Forme honorifique adaptée aux clients ou aînés.",
      },
      {
        word: "총 세 분",
        rom: "Chong se bun",
        mean: "Trois personnes au total (poli)",
        context: "Phrase parfaite pour confirmer une réservation.",
      },
      {
        word: "예약하다",
        rom: "Yeyakhada",
        mean: "Réserver",
        context: "Verbe courant avec les restaurants et hôtels.",
      },
    ],
  },
  {
    id: "solo",
    title: "Sortie Solo",
    koreanTitle: "혼자 (Honja)",
    description: "Savoir dire que l'on est seul sans utiliser de compteur.",
    accent: COLORS.roseGold,
    image:
      "https://images.unsplash.com/photo-1499591934245-40b55745b905?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      { char: "Hôte", kr: "일행 있으세요?", fr: "Êtes-vous accompagné ?" },
      {
        char: "Moi",
        kr: "아니요, 혼자 왔어요. 한 명이에요.",
        fr: "Non, je suis venu seul (honja). Je suis une seule personne.",
      },
      {
        char: "Hôte",
        kr: "그럼 한 분 자리로 안내해 드릴게요.",
        fr: "Alors je vais vous installer à une place pour une personne.",
      },
      {
        char: "Moi",
        kr: "네, 조용한 자리면 좋아요.",
        fr: "Oui, une place calme serait bien.",
      },
    ],
    expressions: [
      {
        word: "혼자",
        rom: "Honja",
        mean: "Seul",
        context: "Adverbe pour dire que l'on fait une action en solo.",
      },
      {
        word: "한 명",
        rom: "Han myeong",
        mean: "Une personne",
        context: "Hana devient 'Han'. Précise l'unité humaine.",
      },
      {
        word: "일행",
        rom: "Il-haeng",
        mean: "Groupe / Compagnie",
        context: "Désigne les personnes qui vous accompagnent.",
      },
      {
        word: "한 분 자리",
        rom: "Han bun jari",
        mean: "Place pour une personne",
        context: "Forme polie utilisée par le personnel.",
      },
      {
        word: "안내해 드리다",
        rom: "Annaehae deurida",
        mean: "Accompagner / guider",
        context: "Formule honorifique de service.",
      },
      {
        word: "조용한 자리",
        rom: "Joyonghan jari",
        mean: "Place calme",
        context: "Demande naturelle quand on mange seul.",
      },
    ],
  },
];

export default function PeopleClassifierImmersion() {
  return (
    <ClassifierImmersionScreen
      scenes={SCENES}
      backLabel="ÉTICKETTES SOCIALES"
      badgeLabel="HUMAN COUNT"
      toolboxTitle="HUMAN TOOLBOX"
    />
  );
}
