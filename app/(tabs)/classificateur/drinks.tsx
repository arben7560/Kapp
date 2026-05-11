import ClassifierImmersionScreen from "../../../components/classificateur/ClassifierImmersionScreen";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — NEON SOCIAL EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  sojuGreen: "#10B981", // Vert bouteille
  beerAmber: "#F59E0B", // Ambre bière/café
  waterBlue: "#3B82F6", // Bleu eau
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "pocha",
    title: "Au Pocha",
    koreanTitle: "포장마차 (Pocha)",
    description: "Commander des bouteilles de Soju pour la table.",
    accent: COLORS.sojuGreen,
    image:
      "https://images.unsplash.com/photo-1570191599214-469b29442006?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "여기 소주 두 병이랑 맥주 한 병 주세요.",
        fr: "Ici, donnez-moi deux bouteilles de Soju et une bouteille de bière.",
      },
      {
        char: "Serveur",
        kr: "네, 소주 두 병, 맥주 한 병 나왔습니다!",
        fr: "Oui, voici les deux bouteilles de Soju et la bouteille de bière !",
      },
      {
        char: "Moi",
        kr: "물도 한 병 주세요.",
        fr: "Donnez-moi aussi une bouteille d'eau.",
      },
      {
        char: "Serveur",
        kr: "네, 물 한 병 바로 드릴게요.",
        fr: "Oui, je vous apporte tout de suite une bouteille d'eau.",
      },
    ],
    expressions: [
      {
        word: "병 (甁)",
        rom: "Byeong",
        mean: "Bouteille",
        context:
          "Utilisé pour toutes les boissons en bouteille (alcool, eau, soda).",
      },
      {
        word: "두 병",
        rom: "Du byeong",
        mean: "2 bouteilles",
        context: "Dul devient 'Du' devant le compteur.",
      },
      {
        word: "한 병 더",
        rom: "Han byeong deo",
        mean: "Une bouteille de plus",
        context: "La phrase culte des soirées coréennes.",
      },
      {
        word: "맥주 한 병",
        rom: "Maekju han byeong",
        mean: "Une bouteille de bière",
        context: "Commande simple et très fréquente au pocha.",
      },
      {
        word: "물 한 병",
        rom: "Mul han byeong",
        mean: "Une bouteille d'eau",
        context: "Byeong s'utilise aussi pour les bouteilles non alcoolisées.",
      },
      {
        word: "바로 드릴게요",
        rom: "Baro deurilgeyo",
        mean: "Je vous l'apporte tout de suite",
        context: "Réponse de service naturelle au restaurant.",
      },
    ],
  },
  {
    id: "cafe",
    title: "Au Café",
    koreanTitle: "카페 (Café)",
    description: "Compter les tasses lors d'une sortie entre amis.",
    accent: COLORS.beerAmber,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Barista",
        kr: "주문하시겠어요?",
        fr: "Souhaitez-vous commander ?",
      },
      {
        char: "Moi",
        kr: "따뜻한 아메리카노 세 잔 주세요.",
        fr: "Trois tasses (se-jan) d'Americano chaud s'il vous plaît.",
      },
      {
        char: "Barista",
        kr: "네, 차가운 라떼 한 잔도 필요하세요?",
        fr: "Bien, avez-vous aussi besoin d'un latte glacé ?",
      },
      {
        char: "Moi",
        kr: "네, 라떼 한 잔 추가해 주세요.",
        fr: "Oui, ajoutez un latte, s'il vous plaît.",
      },
    ],
    expressions: [
      {
        word: "잔 (盞)",
        rom: "Jan",
        mean: "Verre / Tasse",
        context: "Pour tout ce qui se boit dans un récipient ouvert.",
      },
      {
        word: "세 잔",
        rom: "Se jan",
        mean: "3 verres/tasses",
        context: "Set devient 'Se' devant le compteur.",
      },
      {
        word: "한 잔 해요",
        rom: "Han jan haeyo",
        mean: "Allons boire un verre",
        context: "Invitation sociale commune en Corée.",
      },
      {
        word: "따뜻한",
        rom: "Ttatteuthan",
        mean: "Chaud",
        context: "Utile pour préciser une boisson chaude.",
      },
      {
        word: "차가운",
        rom: "Chagaun",
        mean: "Froid",
        context: "Alternative naturelle pour les cafés glacés.",
      },
      {
        word: "한 잔 추가",
        rom: "Han jan chuga",
        mean: "Un verre en plus",
        context: "Formule simple pour modifier une commande.",
      },
    ],
  },
  {
    id: "dinner",
    title: "Dîner de Groupe",
    koreanTitle: "회식 (Hwaesik)",
    description:
      "L'étiquette de service au verre pendant un dîner d'entreprise.",
    accent: COLORS.waterBlue,
    image:
      "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Directeur",
        kr: "물 한 잔만 주시겠어요?",
        fr: "Pourriez-vous me donner juste un verre d'eau ?",
      },
      {
        char: "Moi",
        kr: "네, 여기 있습니다. 한 잔 더 드릴까요?",
        fr: "Oui, voici. Voulez-vous un autre verre ?",
      },
      {
        char: "Directeur",
        kr: "괜찮아요. 빈 잔은 제가 치울게요.",
        fr: "Ça va. Je vais enlever le verre vide.",
      },
      {
        char: "Moi",
        kr: "그럼 제가 차 한 잔 따라드릴게요.",
        fr: "Alors je vais vous verser une tasse de thé.",
      },
    ],
    expressions: [
      {
        word: "물 한 잔",
        rom: "Mul han jan",
        mean: "Un verre d'eau",
        context: "Hana devient 'Han'. Toujours poli de servir les autres.",
      },
      {
        word: "따라주다",
        rom: "Ttarajuda",
        mean: "Verser (boisson)",
        context: "Verbe clé pour l'étiquette de la table coréenne.",
      },
      {
        word: "빈 잔",
        rom: "Bin jan",
        mean: "Verre vide",
        context: "Un signe qu'il est temps de resservir votre interlocuteur.",
      },
      {
        word: "한 잔 더",
        rom: "Han jan deo",
        mean: "Un verre de plus",
        context: "Question courante pour proposer de resservir.",
      },
      {
        word: "차 한 잔",
        rom: "Cha han jan",
        mean: "Une tasse de thé",
        context: "Jan fonctionne pour les boissons servies en tasse.",
      },
      {
        word: "치우다",
        rom: "Chiuda",
        mean: "Débarrasser",
        context: "Verbe utile avec les verres ou assiettes vides.",
      },
    ],
  },
];

export default function DrinksClassifierImmersion() {
  return (
    <ClassifierImmersionScreen
      scenes={SCENES}
      backLabel="CONVIVIALITÉ"
      badgeLabel="DRINKS"
      toolboxTitle="BEVERAGE TOOLBOX"
      badgeVariant="solid"
    />
  );
}
