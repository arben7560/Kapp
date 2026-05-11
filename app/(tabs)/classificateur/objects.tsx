import ClassifierImmersionScreen from "../../../components/classificateur/ClassifierImmersionScreen";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — UNIVERSAL UTILITY EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  universalCyan: "#22D3EE",
  deepTeal: "#0891B2",
  softIce: "#E0F2FE",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "market",
    title: "Au Marché",
    koreanTitle: "시장 쇼핑 (Sijang)",
    description: "Acheter des fruits frais en utilisant le compteur universel.",
    accent: COLORS.universalCyan,
    image:
      "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "사과 다섯 개 주세요. 얼마예요?",
        fr: "Donnez-moi cinq (daseot) pommes s'il vous plaît. C'est combien ?",
      },
      {
        char: "Vendeuse",
        kr: "사과 다섯 개에 오천 원이에요.",
        fr: "Pour cinq pommes, c'est 5000 won.",
      },
      {
        char: "Moi",
        kr: "그럼 한 개 더 주세요.",
        fr: "Alors donnez-m'en une de plus.",
      },
      {
        char: "Vendeuse",
        kr: "네, 여섯 개면 육천 원이에요.",
        fr: "Oui, pour six unités, cela fait 6000 won.",
      },
    ],
    expressions: [
      {
        word: "개 (個)",
        rom: "Gae",
        mean: "Unité / Objet",
        context:
          "Le classificateur universel pour les choses sans catégorie spécifique.",
      },
      {
        word: "다섯 개",
        rom: "Daseot gae",
        mean: "5 objets",
        context: "Utilise toujours les nombres natifs (Hana, Dul, Set...).",
      },
      {
        word: "한 개 더",
        rom: "Han gae deo",
        mean: "Un de plus",
        context: "Pratique pour ajouter un article à la dernière minute.",
      },
      {
        word: "여섯 개",
        rom: "Yeoseot gae",
        mean: "Six objets",
        context: "Quantité fréquente pour acheter un petit lot.",
      },
      {
        word: "오천 원",
        rom: "O-cheon won",
        mean: "5000 won",
        context: "Prix simple à associer à une quantité au marché.",
      },
      {
        word: "얼마예요?",
        rom: "Eolma-yeyo?",
        mean: "Combien ça coûte ?",
        context: "Question réflexe après avoir donné une quantité.",
      },
    ],
  },
  {
    id: "office",
    title: "Au Bureau",
    koreanTitle: "사무실 (Samusil)",
    description: "Demander et compter des fournitures de travail.",
    accent: COLORS.deepTeal,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Collègue",
        kr: "책상 위에 볼펜 몇 개 있어요?",
        fr: "Combien de stylos y a-t-il sur le bureau ?",
      },
      {
        char: "Moi",
        kr: "두 개밖에 없어요. 더 필요하세요?",
        fr: "Il n'y en a que deux (du). En avez-vous besoin de plus ?",
      },
      {
        char: "Collègue",
        kr: "네, 세 개 더 필요해요.",
        fr: "Oui, j'en ai besoin de trois de plus.",
      },
      {
        char: "Moi",
        kr: "알겠어요. 총 다섯 개 준비할게요.",
        fr: "Compris. Je vais en préparer cinq au total.",
      },
    ],
    expressions: [
      {
        word: "몇 개?",
        rom: "Myeot gae?",
        mean: "Combien (d'objets) ?",
        context: "La question standard pour demander une quantité d'objets.",
      },
      {
        word: "두 개",
        rom: "Du gae",
        mean: "2 objets",
        context: "Dul devient 'Du' devant le classificateur.",
      },
      {
        word: "여러 개",
        rom: "Yeoreo gae",
        mean: "Plusieurs objets",
        context: "Pour désigner une quantité indéfinie mais nombreuse.",
      },
      {
        word: "두 개밖에",
        rom: "Du gae-bakke",
        mean: "Seulement deux",
        context: "Bakke insiste sur une quantité limitée.",
      },
      {
        word: "세 개 더",
        rom: "Se gae deo",
        mean: "Trois de plus",
        context: "Formule pratique pour compléter un stock.",
      },
      {
        word: "총 다섯 개",
        rom: "Chong daseot gae",
        mean: "Cinq au total",
        context: "Chong annonce le total final.",
      },
    ],
  },
  {
    id: "daily",
    title: "Quotidien",
    koreanTitle: "일상 생활 (Ilsang)",
    description: "Gérer les petits objets de la vie de tous les jours.",
    accent: COLORS.softIce,
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "여기 지우개 네 개 있어요.",
        fr: "Ici, il y a quatre (ne) gommes.",
      },
      {
        char: "Ami",
        kr: "와, 많네요! 한 개만 빌려줘요.",
        fr: "Waouh, c'est beaucoup ! Prête-m'en juste une.",
      },
      {
        char: "Moi",
        kr: "좋아요. 두 개 빌려줘도 돼요.",
        fr: "D'accord. Je peux même t'en prêter deux.",
      },
      {
        char: "Ami",
        kr: "고마워요. 전부 몇 개 남아요?",
        fr: "Merci. Combien en reste-t-il au total ?",
      },
    ],
    expressions: [
      {
        word: "네 개",
        rom: "Ne gae",
        mean: "4 objets",
        context: "Net devient 'Ne' devant le classificateur.",
      },
      {
        word: "한 개만",
        rom: "Han gae-man",
        mean: "Seulement un",
        context: "Le suffixe '-man' signifie 'seulement'.",
      },
      {
        word: "전부 몇 개",
        rom: "Jeonbu myeot gae",
        mean: "Combien au total",
        context: "Pour demander le compte final de tous les objets.",
      },
      {
        word: "빌려주다",
        rom: "Billyeojuda",
        mean: "Prêter",
        context: "Très naturel quand on parle de petits objets du quotidien.",
      },
      {
        word: "두 개",
        rom: "Du gae",
        mean: "Deux objets",
        context: "Dul devient Du devant un classificateur.",
      },
      {
        word: "남아요",
        rom: "Namayo",
        mean: "Il en reste",
        context: "Verbe utile après avoir prêté ou donné quelque chose.",
      },
    ],
  },
];

export default function ObjectsClassifierImmersion() {
  return (
    <ClassifierImmersionScreen
      scenes={SCENES}
      backLabel="CLASSIFICATEURS"
      badgeLabel="GENERAL"
      toolboxTitle='"GAE" TOOLBOX'
      badgeVariant="solid"
    />
  );
}
