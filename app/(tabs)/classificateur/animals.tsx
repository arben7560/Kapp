import ClassifierImmersionScreen from "../../../components/classificateur/ClassifierImmersionScreen";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — NATURAL OASIS EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  forest: "#10B981", // Vert nature
  earth: "#B45309", // Terre cuite
  amber: "#F59E0B", // Ambre animal
  sky: "#38BDF8",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "pet-cafe",
    title: "Le Cat Café",
    koreanTitle: "고양이 카페 (Goyangi)",
    description: "Compter les résidents poilus d'un café thématique.",
    accent: COLORS.forest,
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "와! 고양이가 진짜 많아요. 몇 마리예요?",
        fr: "Waouh ! Il y a vraiment beaucoup de chats. Combien sont-ils ?",
      },
      {
        char: "Moi",
        kr: "음... 하나, 둘, 셋... 열 마리나 있어요!",
        fr: "Mmh... 1, 2, 3... il y en a carrément dix (yeol-mari) !",
      },
      {
        char: "Ami",
        kr: "강아지는 몇 마리 있어요?",
        fr: "Et combien y a-t-il de chiens ?",
      },
      {
        char: "Moi",
        kr: "강아지는 두 마리밖에 없어요.",
        fr: "Il n'y a que deux chiens.",
      },
    ],
    expressions: [
      {
        word: "마리",
        rom: "Mari",
        mean: "Compteur animal",
        context: "Utilisé pour tous les animaux, des insectes aux éléphants.",
      },
      {
        word: "키우다",
        rom: "Ki-u-da",
        mean: "Élever / Avoir (animal)",
        context: "Le verbe pour dire qu'on possède un animal de compagnie.",
      },
      {
        word: "강아지 / 고양이",
        rom: "Gang-aji / Goyangi",
        mean: "Chien / Chat",
        context: "Les deux animaux domestiques les plus populaires en Corée.",
      },
      {
        word: "열 마리",
        rom: "Yeol mari",
        mean: "Dix animaux",
        context: "Nombre courant dans un café à thème.",
      },
      {
        word: "두 마리밖에",
        rom: "Du mari-bakke",
        mean: "Seulement deux animaux",
        context: "Bakke souligne que la quantité est faible.",
      },
      {
        word: "몇 마리예요?",
        rom: "Myeot mari-yeyo?",
        mean: "Combien d'animaux ?",
        context: "Question standard avec le classificateur Mari.",
      },
    ],
  },
  {
    id: "national-symbol",
    title: "Le Tigre",
    koreanTitle: "호랑이 (Horangi)",
    description: "Rencontre avec le protecteur spirituel de la Corée.",
    accent: COLORS.amber,
    image:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Guide",
        kr: "저기 호랑이 두 마리가 자고 있어요.",
        fr: "Là-bas, deux tigres (du-mari) sont en train de dormir.",
      },
      {
        char: "Moi",
        kr: "정말 용맹해 보여요. 한국의 상징이죠?",
        fr: "Ils ont l'air vraiment vaillants. C'est le symbole de la Corée, non ?",
      },
      {
        char: "Guide",
        kr: "맞아요. 새끼 호랑이 한 마리도 있어요.",
        fr: "Exact. Il y a aussi un bébé tigre.",
      },
      {
        char: "Moi",
        kr: "그럼 모두 세 마리네요.",
        fr: "Alors cela fait trois au total.",
      },
    ],
    expressions: [
      {
        word: "두 마리",
        rom: "Du mari",
        mean: "Deux animaux",
        context: "Dul devient 'Du' devant le classificateur.",
      },
      {
        word: "용맹하다",
        rom: "Yong-maeng-hada",
        mean: "Être vaillant",
        context: "Adjectif souvent associé au tigre coréen.",
      },
      {
        word: "상징",
        rom: "Sang-jing",
        mean: "Symbole",
        context: "Pour parler de l'importance culturelle d'un animal.",
      },
      {
        word: "새끼 호랑이",
        rom: "Saekki horangi",
        mean: "Bébé tigre",
        context: "Saekki indique le petit d'un animal.",
      },
      {
        word: "한 마리",
        rom: "Han mari",
        mean: "Un animal",
        context: "Hana devient Han devant le classificateur.",
      },
      {
        word: "모두 세 마리",
        rom: "Modu se mari",
        mean: "Trois animaux au total",
        context: "Modu permet de donner un total.",
      },
    ],
  },
  {
    id: "rural",
    title: "La Ferme",
    koreanTitle: "시골 농장 (Nongjang)",
    description: "Compter le bétail dans un village traditionnel.",
    accent: COLORS.earth,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Grand-père",
        kr: "우리 집에 소 세 마리가 있단다.",
        fr: "Dans notre maison, il y a trois vaches (se-mari).",
      },
      {
        char: "Moi",
        kr: "와, 닭도 여러 마리 있네요!",
        fr: "Waouh, il y a aussi plusieurs poulets (yeoreo-mari) !",
      },
      {
        char: "Grand-père",
        kr: "돼지도 네 마리 있단다.",
        fr: "Il y a aussi quatre cochons.",
      },
      {
        char: "Moi",
        kr: "농장에 동물이 정말 많네요.",
        fr: "Il y a vraiment beaucoup d'animaux à la ferme.",
      },
    ],
    expressions: [
      {
        word: "소 / 닭 / 돼지",
        rom: "So / Dak / Dwaeji",
        mean: "Vache / Poulet / Porc",
        context: "Les animaux de ferme essentiels.",
      },
      {
        word: "세 마리",
        rom: "Se mari",
        mean: "Trois animaux",
        context: "Set devient 'Se' devant le compteur.",
      },
      {
        word: "여러 마리",
        rom: "Yeoreo mari",
        mean: "Plusieurs animaux",
        context: "Utile quand on ne veut pas compter précisément.",
      },
      {
        word: "네 마리",
        rom: "Ne mari",
        mean: "Quatre animaux",
        context: "Net devient Ne devant un classificateur.",
      },
      {
        word: "농장",
        rom: "Nongjang",
        mean: "Ferme",
        context: "Lieu naturel pour pratiquer les animaux et les quantités.",
      },
      {
        word: "정말 많네요",
        rom: "Jeongmal manneyo",
        mean: "Il y en a vraiment beaucoup",
        context: "Réaction naturelle devant une grande quantité.",
      },
    ],
  },
];

export default function AnimalClassifierImmersion() {
  return (
    <ClassifierImmersionScreen
      scenes={SCENES}
      backLabel="VIE SAUVAGE"
      badgeLabel="LIVING BEINGS"
      toolboxTitle="ANIMAL TOOLBOX"
    />
  );
}
