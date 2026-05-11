import ClassifierImmersionScreen from "../../../components/classificateur/ClassifierImmersionScreen";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — LITERARY EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  paper: "#FDE68A", // Jaune parchemin
  leather: "#78350F", // Brun livre
  ink: "#1E293B", // Bleu encre
  sepia: "#A8A29E",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "bookstore",
    title: "La Librairie",
    koreanTitle: "서점에서 (Seojeom)",
    description: "Acheter des ouvrages reliés dans la célèbre librairie Kyobo.",
    accent: COLORS.paper,
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "이 소설책 두 권이랑 잡지 한 권 주세요.",
        fr: "Donnez-moi ces deux romans et un magazine s'il vous plaît.",
      },
      {
        char: "Vendeur",
        kr: "네, 총 세 권 맞으시죠? 여기 있습니다.",
        fr: "Oui, c'est bien trois volumes (se-gwon) au total ? Voici.",
      },
      {
        char: "Moi",
        kr: "네, 그리고 한국어 교재 한 권도 주세요.",
        fr: "Oui, et donnez-moi aussi un manuel de coréen.",
      },
      {
        char: "Vendeur",
        kr: "그럼 모두 네 권입니다.",
        fr: "Alors cela fait quatre livres au total.",
      },
    ],
    expressions: [
      {
        word: "권 (卷)",
        rom: "Gwon",
        mean: "Compteur de livres",
        context:
          "Utilisé pour tout ce qui est relié : livres, cahiers, dictionnaires.",
      },
      {
        word: "두 권",
        rom: "Du gwon",
        mean: "2 livres",
        context: "Dul devient 'Du' devant le classificateur.",
      },
      {
        word: "잡지 / 소설",
        rom: "Jap-ji / Soseol",
        mean: "Magazine / Roman",
        context: "Les deux types d'ouvrages les plus courants.",
      },
      {
        word: "세 권",
        rom: "Se gwon",
        mean: "Trois livres",
        context: "Set devient Se devant Gwon.",
      },
      {
        word: "교재 한 권",
        rom: "Gyojae han gwon",
        mean: "Un manuel",
        context: "Gwon s'emploie aussi pour les manuels d'étude.",
      },
      {
        word: "모두 네 권",
        rom: "Modu ne gwon",
        mean: "Quatre livres au total",
        context: "Net devient Ne devant le classificateur.",
      },
    ],
  },
  {
    id: "cinema",
    title: "Le Guichet",
    koreanTitle: "매표소 (Maepyoso)",
    description: "Récupérer des billets ou des documents fins et plats.",
    accent: COLORS.sepia,
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "영화 티켓 네 장 출력해 주세요.",
        fr: "Veuillez imprimer quatre billets de cinéma s'il vous plaît.",
      },
      {
        char: "Agent",
        kr: "네, 네 장 여기 있습니다. 즐거운 관람 되세요!",
        fr: "Oui, voici les quatre feuilles (ne-jang). Bon film !",
      },
      {
        char: "Moi",
        kr: "영수증도 한 장 부탁드려요.",
        fr: "Je voudrais aussi un reçu, s'il vous plaît.",
      },
      {
        char: "Agent",
        kr: "네, 영수증 한 장 같이 드릴게요.",
        fr: "Oui, je vous donne aussi un reçu.",
      },
    ],
    expressions: [
      {
        word: "장 (張)",
        rom: "Jang",
        mean: "Compteur d'objets plats",
        context:
          "Pour le papier, les billets, les photos, les t-shirts ou les timbres.",
      },
      {
        word: "네 장",
        rom: "Ne jang",
        mean: "4 feuilles/billets",
        context: "Net devient 'Ne' devant le classificateur.",
      },
      {
        word: "출력하다",
        rom: "Chul-lyeok-hada",
        mean: "Imprimer",
        context: "Verbe indispensable pour les documents papier.",
      },
      {
        word: "티켓 네 장",
        rom: "Tiket ne jang",
        mean: "Quatre billets",
        context: "Jang compte les billets plats.",
      },
      {
        word: "영수증 한 장",
        rom: "Yeongsujeung han jang",
        mean: "Un reçu",
        context: "Le reçu est aussi compté comme une feuille.",
      },
      {
        word: "즐거운 관람",
        rom: "Jeulgeoun gwallam",
        mean: "Bon visionnage",
        context: "Formule polie au cinéma ou au spectacle.",
      },
    ],
  },
  {
    id: "photo",
    title: "Le Studio Photo",
    koreanTitle: "사진관 (Sajingwan)",
    description: "Choisir le nombre de tirages pour ses souvenirs de voyage.",
    accent: COLORS.ink,
    image:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Photographe",
        kr: "사진 몇 장 인화해 드릴까요?",
        fr: "Combien de photos voulez-vous que je développe ?",
      },
      {
        char: "Moi",
        kr: "제일 잘 나온 거 열 장 주세요.",
        fr: "Donnez-moi dix photos (yeol-jang) de la meilleure.",
      },
      {
        char: "Photographe",
        kr: "여권 사진은 두 장 더 필요하세요?",
        fr: "Avez-vous besoin de deux photos d'identité en plus ?",
      },
      {
        char: "Moi",
        kr: "네, 여권 사진 두 장도 주세요.",
        fr: "Oui, donnez-moi aussi deux photos d'identité.",
      },
    ],
    expressions: [
      {
        word: "인화하다",
        rom: "In-hwa-hada",
        mean: "Développer (photo)",
        context: "Terme technique pour le tirage papier.",
      },
      {
        word: "열 장",
        rom: "Yeol jang",
        mean: "10 photos",
        context: "Utilisation du nombre natif standard.",
      },
      {
        word: "기념 사진",
        rom: "Ginyeom sajin",
        mean: "Photo souvenir",
        context: "Le but de tout passage dans un studio photo coréen.",
      },
      {
        word: "몇 장",
        rom: "Myeot jang",
        mean: "Combien de feuilles/photos",
        context: "Question standard pour les objets plats.",
      },
      {
        word: "여권 사진",
        rom: "Yeogwon sajin",
        mean: "Photo d'identité",
        context: "Objet plat compté avec Jang.",
      },
      {
        word: "두 장 더",
        rom: "Du jang deo",
        mean: "Deux de plus",
        context: "Formule utile pour commander des tirages supplémentaires.",
      },
    ],
  },
];

export default function PaperClassifierImmersion() {
  return (
    <ClassifierImmersionScreen
      scenes={SCENES}
      backLabel="SAVOIR-FAIRE"
      badgeLabel="BOUND & FLAT"
      toolboxTitle="LITERARY TOOLBOX"
      badgeVariant="solid"
    />
  );
}
