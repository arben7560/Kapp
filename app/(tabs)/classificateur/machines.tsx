import ClassifierImmersionScreen from "../../../components/classificateur/ClassifierImmersionScreen";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — TECH & PRECISION EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  techBlue: "#0EA5E9",
  titanium: "#94A3B8",
  neonCyan: "#22D3EE",
  chrome: "#E2E8F0",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "electronics",
    title: "Tech Store",
    koreanTitle: "전자제품 매장 (Jeon-ja)",
    description: "Acheter du matériel informatique de pointe.",
    accent: COLORS.techBlue,
    image:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Client",
        kr: "노트북 두 대랑 모니터 한 대 살게요.",
        fr: "Je vais acheter deux ordinateurs portables et un moniteur.",
      },
      {
        char: "Vendeur",
        kr: "네, 노트북 두 대 맞으시죠? 이쪽으로 오세요.",
        fr: "Oui, deux ordinateurs (du-dae), c'est bien ça ? Venez par ici.",
      },
      {
        char: "Client",
        kr: "태블릿도 한 대 보여주세요.",
        fr: "Montrez-moi aussi une tablette.",
      },
      {
        char: "Vendeur",
        kr: "네, 총 네 대 비교해 보실 수 있어요.",
        fr: "Oui, vous pouvez comparer quatre appareils au total.",
      },
    ],
    expressions: [
      {
        word: "대 (臺)",
        rom: "Dae",
        mean: "Compteur de machines",
        context:
          "Utilisé pour les ordinateurs, téléphones, voitures et gros appareils.",
      },
      {
        word: "노트북",
        rom: "No-teu-buk",
        mean: "Ordinateur portable",
        context: "Le terme standard en coréen pour 'Laptop'.",
      },
      {
        word: "두 대",
        rom: "Du dae",
        mean: "2 machines",
        context: "Dul devient 'Du' devant le classificateur.",
      },
      {
        word: "한 대",
        rom: "Han dae",
        mean: "Une machine",
        context: "Hana devient Han devant le classificateur.",
      },
      {
        word: "태블릿",
        rom: "Taebeullit",
        mean: "Tablette",
        context: "Appareil moderne naturellement compté avec Dae.",
      },
      {
        word: "총 네 대",
        rom: "Chong ne dae",
        mean: "Quatre machines au total",
        context: "Net devient Ne devant Dae.",
      },
    ],
  },
  {
    id: "street",
    title: "Le Parking",
    koreanTitle: "주차장 (Ju-cha-jang)",
    description: "Identifier et compter les véhicules dans la ville.",
    accent: COLORS.neonCyan,
    image:
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "여기에 차가 몇 대 있어요?",
        fr: "Combien de voitures y a-t-il ici ?",
      },
      {
        char: "Ami",
        kr: "세 대밖에 없어요. 주차 자리가 많네요.",
        fr: "Il n'y en a que trois (se-dae). Il y a beaucoup de places.",
      },
      {
        char: "Moi",
        kr: "오토바이는 몇 대 있어요?",
        fr: "Combien y a-t-il de motos ?",
      },
      {
        char: "Ami",
        kr: "오토바이는 두 대 있어요.",
        fr: "Il y a deux motos.",
      },
    ],
    expressions: [
      {
        word: "차 / 자동차",
        rom: "Cha / Ja-dong-cha",
        mean: "Voiture",
        context: "L'objet le plus courant compté avec 'Dae'.",
      },
      {
        word: "몇 대?",
        rom: "Myeot dae?",
        mean: "Combien de machines ?",
        context: "Question essentielle pour les stocks ou les véhicules.",
      },
      {
        word: "세 대",
        rom: "Se dae",
        mean: "3 voitures/machines",
        context: "Set devient 'Se' devant le compteur.",
      },
      {
        word: "오토바이",
        rom: "Otobai",
        mean: "Moto",
        context: "Les motos se comptent aussi avec Dae.",
      },
      {
        word: "주차 자리",
        rom: "Jucha jari",
        mean: "Place de parking",
        context: "Expression utile en ville.",
      },
      {
        word: "두 대 있어요",
        rom: "Du dae isseoyo",
        mean: "Il y en a deux",
        context: "Réponse simple à 'myeot dae?'.",
      },
    ],
  },
  {
    id: "appliances",
    title: "Équipement",
    koreanTitle: "가전제품 (Ga-jeon)",
    description: "Aménager son appartement avec de l'électroménager.",
    accent: COLORS.titanium,
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "에어컨 한 대 더 설치해 주세요.",
        fr: "Veuillez installer un climatiseur de plus s'il vous plaît.",
      },
      {
        char: "Technicien",
        kr: "네, 거실에 한 대 설치하겠습니다.",
        fr: "D'accord, je vais en installer un (han-dae) dans le salon.",
      },
      {
        char: "Moi",
        kr: "침실에도 선풍기 한 대 필요해요.",
        fr: "J'ai aussi besoin d'un ventilateur dans la chambre.",
      },
      {
        char: "Technicien",
        kr: "그럼 가전제품 두 대 설치하겠습니다.",
        fr: "Alors j'installerai deux appareils électroménagers.",
      },
    ],
    expressions: [
      {
        word: "에어컨",
        rom: "E-eo-keon",
        mean: "Climatiseur",
        context: "Appareil vital en été, toujours compté avec 'Dae'.",
      },
      {
        word: "한 대",
        rom: "Han dae",
        mean: "1 machine",
        context: "Hana devient 'Han' devant le classificateur.",
      },
      {
        word: "설치하다",
        rom: "Seol-chi-hada",
        mean: "Installer",
        context: "Verbe souvent associé aux machines lourdes.",
      },
      {
        word: "선풍기",
        rom: "Seonpunggi",
        mean: "Ventilateur",
        context: "Petit appareil domestique compté avec Dae.",
      },
      {
        word: "가전제품",
        rom: "Gajeon-jepum",
        mean: "Électroménager",
        context: "Catégorie générale des machines domestiques.",
      },
      {
        word: "두 대 설치",
        rom: "Du dae seolchi",
        mean: "Installation de deux machines",
        context: "Structure utile pour une demande de technicien.",
      },
    ],
  },
];

export default function MachinesClassifierImmersion() {
  return (
    <ClassifierImmersionScreen
      scenes={SCENES}
      backLabel="SÉOUL MODERNE"
      badgeLabel="TECH COUNTER"
      toolboxTitle="TECH TOOLBOX"
    />
  );
}
