import type {
  HangulCard,
  HangulModule,
  HangulQuestion,
  HangulQuestionOption,
  HangulScene,
} from "./types";

export const ALL_HANGUL_VOWELS = [
  "ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ",
  "ㅐ", "ㅒ", "ㅔ", "ㅖ", "ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅞ", "ㅟ", "ㅢ",
] as const;

export const ALL_HANGUL_CONSONANTS = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

export const ESSENTIAL_FINAL_SOUNDS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅇ"] as const;
export const HANGUL_MASTERY_THRESHOLD = 0.85;
export const HANGUL_ASSESSMENT_PASS_SCORE = 11;

export const SIMPLE_FINAL_GROUPS: Record<(typeof ESSENTIAL_FINAL_SOUNDS)[number], string[]> = {
  ㄱ: ["ㄱ", "ㄲ", "ㅋ"],
  ㄴ: ["ㄴ"],
  ㄷ: ["ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅌ", "ㅎ"],
  ㄹ: ["ㄹ"],
  ㅁ: ["ㅁ"],
  ㅂ: ["ㅂ", "ㅍ"],
  ㅇ: ["ㅇ"],
};

const o = (value: string, label = value, audio?: string): HangulQuestionOption => ({ value, label, audio });

const q = (
  id: string,
  type: HangulQuestion["type"],
  prompt: string,
  answer: string,
  options: HangulQuestionOption[],
  explanation: string,
  characters: string[],
  display?: string,
  audio?: string,
): HangulQuestion => ({ id, type, prompt, answer, options, explanation, characters, display, audio });

type CardTuple = [string, string, string | undefined, string, string, string?];

const cards = (items: CardTuple[], kind: HangulCard["kind"]): HangulCard[] =>
  items.map(([id, glyph, romanization, label, explanation, audio]) => ({
    id,
    glyph,
    romanization,
    label,
    explanation,
    audio: audio ?? glyph,
    kind,
  }));

const characterQuestions = (prefix: string, items: HangulCard[]): HangulQuestion[] => {
  const eligible = items.filter((item) => item.romanization);
  return eligible.flatMap((item, index) => {
    const others = [...eligible.slice(index + 1), ...eligible.slice(0, index)]
      .filter((candidate) => candidate.id !== item.id)
      .slice(0, 3);
    const audioChoices = [item, ...others].map((candidate, choiceIndex) =>
      o(candidate.glyph, `Son ${choiceIndex + 1}`, candidate.audio),
    );
    return [
      q(
        `${prefix}-${item.id}-visual`,
        "character-to-sound",
        "Écoute les propositions, puis choisis le son de ce caractère.",
        item.glyph,
        audioChoices,
        `${item.glyph} : ${item.explanation}`,
        [item.glyph],
        item.glyph,
      ),
      q(
        `${prefix}-${item.id}-audio`,
        "audio-to-character",
        "Écoute, puis choisis le caractère entendu.",
        item.glyph,
        [o(item.glyph), ...others.map((candidate) => o(candidate.glyph))],
        `Le son entendu correspond à ${item.glyph}.`,
        [item.glyph],
        undefined,
        item.audio,
      ),
    ];
  });
};

const makeCharacterScene = (
  id: string,
  title: string,
  koreanTitle: string,
  description: string,
  instruction: string,
  accent: string,
  sceneCards: HangulCard[],
  introducedConsonants?: string[],
  introducedVowels?: string[],
): HangulScene => ({
  id,
  title,
  koreanTitle,
  description,
  instruction,
  accent,
  cards: sceneCards,
  questions: characterQuestions(id, sceneCards),
  introducedConsonants,
  introducedVowels,
});

const coreVowels = cards([
  ["a", "ㅏ", "a", "A ouvert", "Comme le a de « ami ».", "아"],
  ["eo", "ㅓ", "eo", "EO", "Aucun équivalent français exact : mâchoire détendue, langue en arrière.", "어"],
  ["o", "ㅗ", "o", "O", "Lèvres arrondies ; petit trait au-dessus.", "오"],
  ["u", "ㅜ", "u = ou", "OU", "Le u de la romanisation se lit comme « ou », jamais comme le u français.", "우"],
  ["eu", "ㅡ", "eu", "EU coréen", "Lèvres non arrondies et langue reculée.", "으"],
  ["i", "ㅣ", "i", "I", "Comme le i de « idée ».", "이"],
], "vowel");

const yVowels = cards([
  ["ya", "ㅑ", "ya", "YA", "Deux petits traits ajoutent un départ en y.", "야"],
  ["yeo", "ㅕ", "yeo", "YEO", "Version en y de ㅓ.", "여"],
  ["yo", "ㅛ", "yo", "YO", "Version en y de ㅗ.", "요"],
  ["yu", "ㅠ", "yu = you", "YOU", "Version en y de ㅜ.", "유"],
], "vowel");

const blocksScene: HangulScene = {
  id: "blocks",
  title: "Le bloc syllabique",
  koreanTitle: "아 · 오",
  description: "Le coréen regroupe les lettres dans un carré. Une syllabe contient au minimum une consonne initiale et une voyelle.",
  instruction: "La romanisation est une aide temporaire. Observe surtout la direction de la voyelle.",
  accent: "#22D3EE",
  introducedConsonants: ["ㅇ"],
  introducedVowels: ["ㅏ", "ㅗ"],
  cards: cards([
    ["block-a", "아", "a", "Voyelle verticale", "ㅇ se place à gauche de ㅏ.", "아"],
    ["block-o", "오", "o", "Voyelle horizontale", "ㅇ se place au-dessus de ㅗ.", "오"],
    ["guardian", "ㅇ", "muet", "Gardien initial", "Au début du bloc, ㅇ occupe la place de la consonne sans son.", "아"],
  ], "syllable"),
  questions: [
    q("block-vertical", "layout", "Où va la consonne devant une voyelle verticale ?", "À gauche", [o("À gauche"), o("Au-dessus"), o("En dessous")], "La voyelle verticale se place à droite de l’initiale.", ["ㅇ", "ㅏ"], "ㅇ + ㅏ"),
    q("block-horizontal", "layout", "Où va la consonne devant une voyelle horizontale ?", "Au-dessus", [o("Au-dessus"), o("À gauche"), o("En dessous")], "La voyelle horizontale se place sous l’initiale.", ["ㅇ", "ㅗ"], "ㅇ + ㅗ"),
    q("block-a", "assemble", "Assemble ㅇ + ㅏ.", "아", [o("아"), o("오")], "ㅏ est verticale : ㅇ se place à gauche.", ["ㅇ", "ㅏ"], "ㅇ + ㅏ"),
    q("block-o", "assemble", "Assemble ㅇ + ㅗ.", "오", [o("오"), o("아")], "ㅗ est horizontale : ㅇ se place au-dessus.", ["ㅇ", "ㅗ"], "ㅇ + ㅗ"),
    q("guardian-role", "layout", "Quel son produit ㅇ au début de 아 ?", "Aucun", [o("Aucun"), o("ng"), o("g")], "ㅇ est silencieux en position initiale.", ["ㅇ", "ㅏ"], "아"),
    q("block-audio", "audio-to-character", "Écoute et choisis le bloc.", "오", [o("아"), o("오")], "Le son entendu est 오.", ["ㅇ", "ㅗ"], undefined, "오"),
  ],
};

const yReadingCards = cards([
  ["ai", "아이", undefined, "Enfant", "아 + 이."],
  ["oi", "오이", undefined, "Concombre", "오 + 이."],
  ["uyu", "우유", undefined, "Lait", "우 + 유."],
  ["yeou", "여우", undefined, "Renard", "여 + 우."],
], "word");

const vowelsBasic: HangulModule = {
  id: "hangul_vowels_basic",
  route: "/(tabs)/hangul/vowels-basic",
  nextRoute: "/(tabs)/hangul/consonants-basic",
  nextLabel: "LES CONSONNES",
  title: "Blocs & voyelles",
  subtitle: "Principe des blocs et 10 voyelles",
  icon: "ㅏ",
  accent: "#22D3EE",
  eyebrow: "FONDATIONS",
  romanizationDefault: true,
  scenes: [
    blocksScene,
    makeCharacterScene("core-vowels", "Six voyelles repères", "아 · 어 · 오 · 우 · 으 · 이", "Ces six formes servent de repères au système vocalique.", "Écoute chaque voyelle et évite de lire eo, eu ou u comme du français.", "#22D3EE", coreVowels, undefined, ["ㅓ", "ㅜ", "ㅡ", "ㅣ"]),
    {
      ...makeCharacterScene("y-vowels", "Les voyelles en Y", "야 · 여 · 요 · 유", "Un second petit trait ajoute une attaque en y.", "Compare ㅏ/ㅑ, ㅓ/ㅕ, ㅗ/ㅛ et ㅜ/ㅠ.", "#F472B6", yVowels, undefined, yVowels.map((item) => item.glyph)),
      cards: [...yVowels, ...yReadingCards],
      questions: [
        ...characterQuestions("y-vowels", yVowels),
        q("read-uyu", "read", "Écoute et choisis le mot.", "우유", [o("우유"), o("오이"), o("여우")], "우유 contient 우 puis 유.", ["ㅇ", "ㅜ", "ㅠ"], undefined, "우유"),
        q("read-yeou", "read", "Quel mot est formé par 여 + 우 ?", "여우", [o("여우"), o("우유"), o("아이")], "여 + 우 forme 여우.", ["ㅇ", "ㅕ", "ㅜ"], "여 + 우"),
      ],
    },
  ],
};

const simpleA = cards([
  ["g", "ㄱ", "g/k", "G/K doux", "Le dos de la langue touche le palais.", "가"],
  ["n", "ㄴ", "n", "N", "La pointe de la langue touche les dents du haut.", "나"],
  ["d", "ㄷ", "d/t", "D/T doux", "La langue ferme brièvement le passage de l’air.", "다"],
  ["m", "ㅁ", "m", "M", "Les lèvres se ferment.", "마"],
  ["b", "ㅂ", "b/p", "B/P doux", "Les lèvres s’ouvrent sans forte aspiration.", "바"],
], "consonant");

const simpleB = cards([
  ["r", "ㄹ", "r/l", "R/L coréen", "Entre deux voyelles, r battu ; en finale, plutôt l.", "라"],
  ["s", "ㅅ", "s", "S", "Devant ㅣ et les voyelles en y, le son se rapproche de « ch ».", "사"],
  ["j", "ㅈ", "j", "J doux", "Une attaque affriquée douce, avec peu de souffle.", "자"],
  ["h", "ㅎ", "h", "H", "Un souffle produit dans la gorge.", "하"],
], "consonant");

const aspirated = cards([
  ["k", "ㅋ", "k", "K aspiré", "Version aspirée de ㄱ.", "카"],
  ["t", "ㅌ", "t", "T aspiré", "Version aspirée de ㄷ.", "타"],
  ["p", "ㅍ", "p", "P aspiré", "Version aspirée de ㅂ.", "파"],
  ["ch", "ㅊ", "ch", "CH aspiré", "Version aspirée de ㅈ.", "차"],
], "consonant");

const cvWords = cards([
  ["nabi", "나비", undefined, "Papillon", "나 + 비."],
  ["moja", "모자", undefined, "Chapeau", "모 + 자."],
  ["gicha", "기차", undefined, "Train", "기 + 차."],
  ["bada", "바다", undefined, "Mer", "바 + 다."],
  ["haru", "하루", undefined, "Une journée", "하 + 루."],
], "word");

const consonantsBasic: HangulModule = {
  id: "hangul_consonants_basic",
  route: "/(tabs)/hangul/consonants-basic",
  nextRoute: "/(tabs)/hangul/consonants-tense",
  nextLabel: "LES CONSONNES TENDUES",
  title: "Consonnes & blocs CV",
  subtitle: "10 simples, 4 aspirées et assemblage",
  icon: "ㄱ",
  accent: "#60A5FA",
  eyebrow: "ARCHITECTURE",
  romanizationDefault: true,
  scenes: [
    makeCharacterScene("simple-a", "Consonnes simples I", "ㄱ · ㄴ · ㄷ · ㅁ · ㅂ", "Cinq consonnes très fréquentes.", "Lis la consonne, puis écoute son bloc modèle en ㅏ.", "#60A5FA", simpleA, simpleA.map((item) => item.glyph)),
    makeCharacterScene("simple-b", "Consonnes simples II", "ㄹ · ㅅ · ㅇ · ㅈ · ㅎ", "Cette famille complète les dix consonnes simples.", "Porte une attention particulière à ㄹ et aux deux rôles de ㅇ.", "#34D399", simpleB, simpleB.map((item) => item.glyph)),
    makeCharacterScene("aspirated", "Consonnes aspirées", "ㅋ · ㅌ · ㅍ · ㅊ", "Ces quatre consonnes ajoutent un souffle net aux séries ㄱ, ㄷ, ㅂ et ㅈ.", "Place une main devant la bouche et écoute le souffle.", "#A78BFA", aspirated, aspirated.map((item) => item.glyph)),
    {
      id: "cv-reading",
      title: "Assembler et lire CV",
      koreanTitle: "가 · 노 · 차",
      description: "Assemble les consonnes avec les dix voyelles déjà connues.",
      instruction: "Lis d’abord sans aide, puis écoute pour vérifier.",
      accent: "#FDE047",
      cards: cvWords,
      questions: [
        q("cv-ga", "assemble", "Assemble ㄱ + ㅏ.", "가", [o("가"), o("거"), o("고")], "ㄱ se place à gauche de ㅏ.", ["ㄱ", "ㅏ"], "ㄱ + ㅏ"),
        q("cv-no", "assemble", "Assemble ㄴ + ㅗ.", "노", [o("노"), o("누"), o("나")], "ㄴ se place au-dessus de ㅗ.", ["ㄴ", "ㅗ"], "ㄴ + ㅗ"),
        q("cv-cha", "assemble", "Assemble ㅊ + ㅏ.", "차", [o("차"), o("자"), o("카")], "ㅊ + ㅏ forme 차.", ["ㅊ", "ㅏ"], "ㅊ + ㅏ"),
        q("cv-nabi", "read", "Écoute et choisis le mot.", "나비", [o("나비"), o("바다"), o("모자")], "Le mot entendu est 나비.", ["ㄴ", "ㅏ", "ㅂ", "ㅣ"], undefined, "나비"),
        q("cv-gicha", "read", "Quel mot est formé par 기 + 차 ?", "기차", [o("기차"), o("모자"), o("하루")], "기 + 차 forme 기차.", ["ㄱ", "ㅣ", "ㅊ", "ㅏ"], "기 + 차"),
        q("cv-layout", "layout", "Dans 누, où se place ㅜ ?", "Sous ㄴ", [o("Sous ㄴ"), o("À droite de ㄴ"), o("Au-dessus de ㄴ")], "ㅜ est horizontale.", ["ㄴ", "ㅜ"], "누"),
        q("cv-haru", "read", "Écoute et choisis l’écriture.", "하루", [o("하루"), o("다리"), o("나라")], "하루 se décompose en 하 + 루.", ["ㅎ", "ㅏ", "ㄹ", "ㅜ"], undefined, "하루"),
      ],
    },
  ],
};

const tense = cards([
  ["kk", "ㄲ", "kk", "K tendu", "Attaque serrée sans souffle marqué.", "까"],
  ["tt", "ㄸ", "tt", "T tendu", "Version tendue de ㄷ.", "따"],
  ["pp", "ㅃ", "pp", "P tendu", "Version tendue de ㅂ.", "빠"],
  ["ss", "ㅆ", "ss", "S tendu", "Friction plus serrée.", "싸"],
  ["jj", "ㅉ", "jj", "J tendu", "Version tendue de ㅈ.", "짜"],
], "consonant");

const tenseModule: HangulModule = {
  id: "hangul_consonants_tense",
  route: "/(tabs)/hangul/consonants-tense",
  nextRoute: "/(tabs)/hangul/vowels-compound",
  nextLabel: "LES VOYELLES COMPOSÉES",
  title: "Consonnes tendues",
  subtitle: "5 consonnes et contrastes essentiels",
  icon: "ㄲ",
  accent: "#F472B6",
  eyebrow: "TENSION",
  romanizationDefault: false,
  scenes: [
    makeCharacterScene("tense-letters", "Les cinq consonnes tendues", "ㄲ · ㄸ · ㅃ · ㅆ · ㅉ", "Doubler la forme crée une attaque serrée, pas simplement plus forte.", "Écoute l’attaque sèche.", "#F472B6", tense, tense.map((item) => item.glyph)),
    {
      id: "three-way",
      title: "Simple, tendue ou aspirée",
      koreanTitle: "가 · 까 · 카",
      description: "Le coréen oppose trois types d’attaque.",
      instruction: "Écoute chaque syllabe seule et choisis sa consonne.",
      accent: "#22D3EE",
      cards: cards([
        ["kg", "가 · 까 · 카", undefined, "ㄱ · ㄲ · ㅋ", "Simple, tendue, aspirée.", "가|까|카"],
        ["td", "다 · 따 · 타", undefined, "ㄷ · ㄸ · ㅌ", "Simple, tendue, aspirée.", "다|따|타"],
        ["pb", "바 · 빠 · 파", undefined, "ㅂ · ㅃ · ㅍ", "Simple, tendue, aspirée.", "바|빠|파"],
        ["jch", "자 · 짜 · 차", undefined, "ㅈ · ㅉ · ㅊ", "Simple, tendue, aspirée.", "자|짜|차"],
      ], "syllable"),
      questions: [
        q("three-kka", "contrast", "Quelle consonne commence le son entendu ?", "ㄲ", [o("ㄱ"), o("ㄲ"), o("ㅋ")], "까 commence par ㄲ.", ["ㄱ", "ㄲ", "ㅋ", "ㅏ"], undefined, "까"),
        q("three-ka", "contrast", "Quelle consonne commence le son entendu ?", "ㅋ", [o("ㄱ"), o("ㄲ"), o("ㅋ")], "카 commence par ㅋ.", ["ㄱ", "ㄲ", "ㅋ", "ㅏ"], undefined, "카"),
        q("three-da", "contrast", "Quelle consonne commence le son entendu ?", "ㄷ", [o("ㄷ"), o("ㄸ"), o("ㅌ")], "다 commence par ㄷ.", ["ㄷ", "ㄸ", "ㅌ", "ㅏ"], undefined, "다"),
        q("three-ppa", "contrast", "Quelle consonne commence le son entendu ?", "ㅃ", [o("ㅂ"), o("ㅃ"), o("ㅍ")], "빠 commence par ㅃ.", ["ㅂ", "ㅃ", "ㅍ", "ㅏ"], undefined, "빠"),
        q("three-cha", "contrast", "Quelle consonne commence le son entendu ?", "ㅊ", [o("ㅈ"), o("ㅉ"), o("ㅊ")], "차 commence par ㅊ.", ["ㅈ", "ㅉ", "ㅊ", "ㅏ"], undefined, "차"),
        q("three-ssa", "contrast", "Quelle consonne commence le son entendu ?", "ㅆ", [o("ㅅ"), o("ㅆ"), o("ㅈ")], "싸 commence par ㅆ.", ["ㅅ", "ㅆ", "ㅏ"], undefined, "싸"),
      ],
    },
    {
      id: "tense-reading",
      title: "Lire les sons tendus",
      koreanTitle: "꼬리 · 아빠",
      description: "Ces mots n’utilisent que les caractères déjà étudiés.",
      instruction: "Lis sans romanisation puis écoute.",
      accent: "#A78BFA",
      cards: cards([
        ["kkori", "꼬리", undefined, "Queue", "꼬 + 리."],
        ["ttada", "따다", undefined, "Cueillir", "따 + 다."],
        ["appa", "아빠", undefined, "Papa", "아 + 빠."],
        ["ssada", "싸다", undefined, "Être bon marché", "싸 + 다."],
        ["jjada", "짜다", undefined, "Être salé", "짜 + 다."],
      ], "word"),
      questions: [
        q("tr-appa", "read", "Écoute et choisis le mot.", "아빠", [o("아빠"), o("따다"), o("짜다")], "아빠 contient ㅃ.", ["ㅇ", "ㅏ", "ㅃ"], undefined, "아빠"),
        q("tr-kkori", "read", "Quel mot commence par ㄲ ?", "꼬리", [o("꼬리"), o("싸다"), o("따다")], "꼬리 commence par ㄲ.", ["ㄲ", "ㅗ", "ㄹ", "ㅣ"], "꼬리"),
        q("tr-jja", "assemble", "Assemble ㅉ + ㅏ.", "짜", [o("자"), o("짜"), o("차")], "ㅉ + ㅏ forme 짜.", ["ㅉ", "ㅏ"], "ㅉ + ㅏ"),
        q("tr-ssada", "read", "Écoute et choisis l’écriture.", "싸다", [o("사다"), o("싸다"), o("짜다")], "싸다 commence par ㅆ.", ["ㅆ", "ㅏ", "ㄷ"], undefined, "싸다"),
        q("tr-ttada", "read", "Quel mot se décompose en 따 + 다 ?", "따다", [o("따다"), o("짜다"), o("아빠")], "따 + 다 forme 따다.", ["ㄸ", "ㅏ", "ㄷ"], "따 + 다"),
        q("tr-jjada", "read", "Quelle première syllabe entends-tu ?", "짜", [o("자"), o("짜"), o("차")], "짜다 commence par 짜.", ["ㅈ", "ㅉ", "ㅊ", "ㅏ"], undefined, "짜다"),
      ],
    },
  ],
};

const eVowels = cards([
  ["ae", "ㅐ", "ae", "AE", "Distinct dans l’orthographe de ㅔ, mais souvent très proche à l’oral.", "애"],
  ["e", "ㅔ", "e", "E", "Très proche de ㅐ dans la prononciation contemporaine.", "에"],
  ["yae", "ㅒ", "yae", "YAE", "ㅑ + ㅣ ; souvent proche de ㅖ à l’oral.", "얘"],
  ["ye", "ㅖ", "ye", "YE", "ㅕ + ㅣ.", "예"],
  ["oe", "ㅚ", "oe / we", "OE", "Se prononce très souvent comme « we » aujourd’hui.", "외"],
], "vowel");

const wVowels = cards([
  ["wa", "ㅘ", "wa", "WA", "ㅗ + ㅏ.", "와"],
  ["wae", "ㅙ", "wae", "WAE", "ㅗ + ㅐ.", "왜"],
  ["wo", "ㅝ", "wo", "WO", "ㅜ + ㅓ.", "워"],
  ["we", "ㅞ", "we", "WE", "ㅜ + ㅔ.", "웨"],
  ["wi", "ㅟ", "wi", "WI", "ㅜ + ㅣ, proche de « oui ».", "위"],
  ["ui", "ㅢ", "ui", "UI", "À l’initiale, ㅡ glisse vers ㅣ ; après une consonne, souvent i ; la particule 의 se prononce souvent é.", "의"],
], "vowel");

const compoundModule: HangulModule = {
  id: "hangul_vowels_compound",
  route: "/(tabs)/hangul/vowels-compound",
  nextRoute: "/(tabs)/hangul/batchim",
  nextLabel: "LES BATCHIM",
  title: "Voyelles composées",
  subtitle: "Les 11 voyelles restantes",
  icon: "ㅘ",
  accent: "#A78BFA",
  eyebrow: "COMPLEXITÉ",
  romanizationDefault: false,
  scenes: [
    makeCharacterScene("e-vowels", "Les sons E et OE", "ㅐ · ㅔ · ㅒ · ㅖ · ㅚ", "L’orthographe distingue ces formes même lorsque leur prononciation est proche.", "Mémorise la forme écrite et vérifie le son par l’écoute.", "#A78BFA", eVowels, undefined, eVowels.map((item) => item.glyph)),
    makeCharacterScene("w-vowels", "Les glissements W et UI", "ㅘ · ㅙ · ㅝ · ㅞ · ㅟ · ㅢ", "Ces voyelles combinent deux mouvements.", "Observe leur composition puis écoute le glissement.", "#F472B6", wVowels, undefined, wVowels.map((item) => item.glyph)),
    {
      id: "compound-reading",
      title: "Lecture cumulative",
      koreanTitle: "사과 · 의사 · 세계",
      description: "Ces mots utilisent l’alphabet complet, sans batchim nouveau.",
      instruction: "Lis d’abord sans aide latine.",
      accent: "#FDE047",
      cards: cards([
        ["sagwa", "사과", undefined, "Pomme", "사 + 과 ; 과 contient ㅘ."],
        ["uisa", "의사", undefined, "Médecin", "의 + 사 ; 의 contient ㅢ."],
        ["segye", "세계", undefined, "Monde", "세 + 계 ; 계 contient ㅖ."],
        ["word-wae", "왜", undefined, "Pourquoi", "Un bloc avec ㅙ."],
        ["oegyo", "외교", undefined, "Diplomatie", "외 + 교 ; 외 contient ㅚ."],
        ["word-wi", "위", undefined, "Dessus", "Un bloc avec ㅟ."],
      ], "word"),
      questions: [
        q("cr-sagwa", "read", "Écoute puis choisis le mot.", "사과", [o("사과"), o("의사"), o("외교")], "사과 contient ㅘ.", ["ㅅ", "ㅏ", "ㄱ", "ㅘ"], undefined, "사과"),
        q("cr-uisa", "read", "Quel mot commence par ㅢ ?", "의사", [o("의사"), o("세계"), o("사과")], "의사 commence par 의.", ["ㅇ", "ㅢ", "ㅅ", "ㅏ"], "의사"),
        q("cr-oe", "audio-to-character", "Choisis la voyelle entendue.", "ㅚ", [o("ㅚ"), o("ㅙ"), o("ㅞ")], "외 contient ㅚ.", ["ㅇ", "ㅚ"], undefined, "외"),
        q("cr-gwa", "assemble", "Assemble ㄱ + ㅘ.", "과", [o("과"), o("가"), o("궈")], "ㄱ + ㅘ forme 과.", ["ㄱ", "ㅘ"], "ㄱ + ㅘ"),
        q("cr-segye", "read", "Quel mot se décompose en 세 + 계 ?", "세계", [o("세계"), o("외교"), o("의사")], "세 + 계 forme 세계.", ["ㅅ", "ㅔ", "ㄱ", "ㅖ"], "세 + 계"),
        q("cr-wae", "read", "Écoute et choisis le bloc.", "왜", [o("왜"), o("웨"), o("외")], "Le bloc entendu est 왜.", ["ㅇ", "ㅙ"], undefined, "왜"),
        q("cr-ui", "character-to-sound", "Quelle remarque est correcte pour ㅢ ?", "Sa prononciation varie selon la position", [o("Sa prononciation varie selon la position"), o("Il se prononce toujours eu-i"), o("Il est muet")], "ㅢ se réalise différemment selon sa position et son rôle.", ["ㅢ"], "ㅢ"),
      ],
    },
  ],
};

const finalSoundCards = cards([
  ["k", "각", "gak", "Finale ㄱ : K coupé", "Le son s’arrête sans relâchement."],
  ["n", "간", "gan", "Finale ㄴ : N", "La langue ferme la syllabe."],
  ["t", "갇", "gat", "Finale ㄷ : T coupé", "Un t final non relâché."],
  ["l", "갈", "gal", "Finale ㄹ : L", "La langue reste en contact."],
  ["m", "감", "gam", "Finale ㅁ : M", "Les lèvres se ferment."],
  ["p", "갑", "gap", "Finale ㅂ : P coupé", "Les lèvres ferment le son."],
  ["ng", "강", "gang", "Finale ㅇ : NG", "Le son résonne au fond de la bouche."],
], "syllable");

const batchimModule: HangulModule = {
  id: "hangul_batchim",
  route: "/(tabs)/hangul/batchim",
  nextRoute: "/(tabs)/hangul/assessment",
  nextLabel: "L’ÉVALUATION FINALE",
  title: "Batchim essentiels",
  subtitle: "Structure CVC et 7 sons finaux",
  icon: "각",
  accent: "#34D399",
  eyebrow: "FINALES",
  romanizationDefault: false,
  scenes: [
    {
      id: "cvc-structure",
      title: "Construire un bloc CVC",
      koreanTitle: "각 · 간 · 갇 · 갈 · 감 · 갑 · 강",
      description: "Un batchim est une consonne placée sous le bloc CV.",
      instruction: "Assemble 가, puis ajoute la finale sous le bloc.",
      accent: "#34D399",
      introducedFinals: [...ESSENTIAL_FINAL_SOUNDS],
      cards: finalSoundCards,
      questions: [
        q("cvc-gak", "assemble", "Assemble ㄱ + ㅏ + ㄱ.", "각", [o("각"), o("간"), o("가")], "Le dernier ㄱ se place sous 가.", ["ㄱ", "ㅏ"], "ㄱ + ㅏ + ㄱ"),
        q("cvc-gan", "assemble", "Assemble ㄱ + ㅏ + ㄴ.", "간", [o("간"), o("강"), o("감")], "ㄴ devient le batchim.", ["ㄱ", "ㅏ", "ㄴ"], "ㄱ + ㅏ + ㄴ"),
        q("cvc-layout", "layout", "Où se place le batchim ?", "En dessous", [o("En dessous"), o("À gauche"), o("Au-dessus")], "La finale occupe la partie basse du bloc.", ["ㄱ", "ㅏ", "ㄴ"], "간"),
        q("cvc-t", "batchim", "Quel son final entends-tu ?", "ㄷ", ESSENTIAL_FINAL_SOUNDS.map((item) => o(item)), "갇 se termine par ㄷ.", ["ㄱ", "ㅏ", "ㄷ"], undefined, "갇"),
        q("cvc-ng", "batchim", "Quel batchim termine 강 ?", "ㅇ", [o("ㄴ"), o("ㅁ"), o("ㅇ")], "강 se termine par ㅇ.", ["ㄱ", "ㅏ", "ㅇ"], "강"),
        q("cvc-p", "batchim", "Quel son final termine 갑 ?", "ㅂ", [o("ㄱ"), o("ㅂ"), o("ㅁ")], "갑 se ferme avec ㅂ.", ["ㄱ", "ㅏ", "ㅂ"], "갑"),
        q("cvc-l", "batchim", "Écoute et choisis le bloc avec ㄹ final.", "갈", [o("간"), o("갈"), o("감")], "갈 se termine par ㄹ.", ["ㄱ", "ㅏ", "ㄹ"], undefined, "갈"),
      ],
    },
    {
      id: "simple-final-spellings",
      title: "Seize graphies, sept sons",
      koreanTitle: "ㄱ · ㄴ · ㄷ · ㄹ · ㅁ · ㅂ · ㅇ",
      description: "Les graphies simples se regroupent en sept réalisations finales.",
      instruction: "Apprends chaque famille sonore.",
      accent: "#22D3EE",
      introducedFinals: Object.values(SIMPLE_FINAL_GROUPS).flat(),
      cards: cards([
        ["fg-k", "ㄱ · ㄲ · ㅋ", undefined, "→ ㄱ final", "Trois graphies, un K final coupé.", "각"],
        ["fg-n", "ㄴ", undefined, "→ ㄴ final", "N final.", "간"],
        ["fg-t", "ㄷ · ㅅ · ㅆ · ㅈ · ㅊ · ㅌ · ㅎ", undefined, "→ ㄷ final", "Sept graphies, un T final coupé.", "옷"],
        ["fg-l", "ㄹ", undefined, "→ ㄹ final", "L final.", "달"],
        ["fg-m", "ㅁ", undefined, "→ ㅁ final", "M final.", "밤"],
        ["fg-p", "ㅂ · ㅍ", undefined, "→ ㅂ final", "Deux graphies, un P final coupé.", "앞"],
        ["fg-ng", "ㅇ", undefined, "→ ㅇ final", "NG final.", "강"],
      ], "consonant"),
      questions: [
        q("fs-book", "batchim", "Quel son final produit ㄱ dans 책 ?", "ㄱ", ESSENTIAL_FINAL_SOUNDS.map((item) => o(item)), "책 se termine par la classe ㄱ.", ["ㅊ", "ㅐ", "ㄱ"], "책"),
        q("fs-clothes", "batchim", "Quel son final produit ㅅ dans 옷 ?", "ㄷ", ESSENTIAL_FINAL_SOUNDS.map((item) => o(item)), "ㅅ final rejoint la classe ㄷ.", ["ㅇ", "ㅗ", "ㅅ"], "옷"),
        q("fs-flower", "batchim", "Quel son final produit ㅊ dans 꽃 ?", "ㄷ", ESSENTIAL_FINAL_SOUNDS.map((item) => o(item)), "ㅊ final rejoint la classe ㄷ.", ["ㄲ", "ㅗ", "ㅊ"], "꽃"),
        q("fs-outside", "batchim", "Quel son final produit ㄲ dans 밖 ?", "ㄱ", ESSENTIAL_FINAL_SOUNDS.map((item) => o(item)), "ㄲ final rejoint la classe ㄱ.", ["ㅂ", "ㅏ", "ㄲ"], "밖"),
        q("fs-front", "batchim", "Quel son final produit ㅍ dans 앞 ?", "ㅂ", ESSENTIAL_FINAL_SOUNDS.map((item) => o(item)), "ㅍ final rejoint la classe ㅂ.", ["ㅇ", "ㅏ", "ㅍ"], "앞"),
        q("fs-end", "batchim", "Quel son final produit ㅌ dans 끝 ?", "ㄷ", ESSENTIAL_FINAL_SOUNDS.map((item) => o(item)), "ㅌ final rejoint la classe ㄷ.", ["ㄲ", "ㅡ", "ㅌ"], "끝"),
        q("fs-seven", "batchim", "Combien de sons finaux essentiels ?", "7", [o("7"), o("16"), o("27")], "Les 16 graphies simples se regroupent en sept sons.", [...ESSENTIAL_FINAL_SOUNDS], "ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅇ"),
      ],
    },
    {
      id: "batchim-reading",
      title: "Lire des mots fermés",
      koreanTitle: "밥 · 집 · 물 · 밤 · 문 · 강 · 옷",
      description: "Repère le batchim avant de chercher le sens.",
      instruction: "La traduction vient après le décodage.",
      accent: "#A78BFA",
      cards: cards([
        ["bap", "밥", undefined, "Riz cuit / repas", "ㅂ se réalise p final."],
        ["jip", "집", undefined, "Maison", "Finale ㅂ."],
        ["mul", "물", undefined, "Eau", "Finale ㄹ."],
        ["bam", "밤", undefined, "Nuit / châtaigne", "Finale ㅁ."],
        ["mun", "문", undefined, "Porte", "Finale ㄴ."],
        ["gang", "강", undefined, "Rivière", "Finale ㅇ."],
        ["ot", "옷", undefined, "Vêtement", "ㅅ final rejoint le son ㄷ."],
      ], "word"),
      questions: [
        q("br-bap", "read", "Écoute puis choisis le mot.", "밥", [o("밥"), o("밤"), o("집")], "밥 se termine par ㅂ.", ["ㅂ", "ㅏ"], undefined, "밥"),
        q("br-mul", "read", "Quel mot se termine par ㄹ ?", "물", [o("문"), o("물"), o("밤")], "물 se termine par ㄹ.", ["ㅁ", "ㅜ", "ㄹ"], "물"),
        q("br-bam", "read", "Écoute et distingue 밤 de 밥.", "밤", [o("밤"), o("밥"), o("강")], "밤 finit par m ; 밥 finit par p.", ["ㅂ", "ㅏ", "ㅁ"], undefined, "밤"),
        q("br-jip", "batchim", "Quel batchim est écrit dans 집 ?", "ㅂ", [o("ㅂ"), o("ㅁ"), o("ㄹ")], "Le dernier élément est ㅂ.", ["ㅈ", "ㅣ", "ㅂ"], "집"),
        q("br-ot", "batchim", "Quel son final produit 옷 ?", "ㄷ", [o("ㅅ"), o("ㄷ"), o("ㅈ")], "La graphie ㅅ se réalise comme ㄷ en finale.", ["ㅇ", "ㅗ", "ㅅ"], "옷"),
        q("br-mun", "read", "Choisis le mot entendu.", "문", [o("문"), o("물"), o("밤")], "문 se termine par n.", ["ㅁ", "ㅜ", "ㄴ"], undefined, "문"),
        q("br-gang", "batchim", "Quel son ferme 강 ?", "ㅇ", [o("ㄴ"), o("ㅇ"), o("ㅁ")], "강 se termine par ng.", ["ㄱ", "ㅏ", "ㅇ"], "강"),
      ],
    },
    {
      id: "liaison",
      title: "Première liaison",
      koreanTitle: "먹어 · 집에 · 옷이 · 한국어",
      description: "Devant une syllabe commençant par ㅇ, le son final se rattache souvent à la voyelle suivante.",
      instruction: "Cette première règle ne couvre pas encore tous les changements phonétiques.",
      accent: "#FDE047",
      cards: cards([
        ["meogeo", "먹어", undefined, "Mange", "먹 + 어 se lit de façon liée : 머거."],
        ["jibe", "집에", undefined, "À la maison", "집 + 에 se lit 지베."],
        ["osi", "옷이", undefined, "Le vêtement", "옷 + 이 se lit 오시."],
        ["hangugeo", "한국어", undefined, "Langue coréenne", "한국 + 어 se lit 한구거."],
      ], "word"),
      questions: [
        q("link-rule", "layout", "Que se passe-t-il souvent devant ㅇ initial ?", "Le son final se rattache à la voyelle", [o("Le son final se rattache à la voyelle"), o("Le mot devient muet"), o("La voyelle disparaît")], "ㅇ est muet, permettant la liaison.", ["ㅇ"], "집 + 에"),
        q("link-jibe", "read", "Choisis la lecture liée de 집에.", "지베", [o("지베"), o("집에"), o("지메")], "ㅂ se lie à 에.", ["ㅈ", "ㅣ", "ㅂ", "ㅇ", "ㅔ"], undefined, "집에"),
        q("link-meogeo", "read", "Quel enchaînement correspond à 먹어 ?", "머거", [o("머거"), o("먹어"), o("먼어")], "ㄱ se lie à 어.", ["ㅁ", "ㅓ", "ㄱ", "ㅇ"], "먹어"),
        q("link-osi", "read", "Choisis la forme entendue pour 옷이.", "오시", [o("오시"), o("오디"), o("오치")], "ㅅ se lie devant 이.", ["ㅇ", "ㅗ", "ㅅ", "ㅣ"], undefined, "옷이"),
        q("link-hangugeo", "read", "Quel groupe se lit 한구거 ?", "한국어", [o("한국어"), o("한구어"), o("한국오")], "ㄱ se lie à 어.", ["ㅎ", "ㅏ", "ㄴ", "ㄱ", "ㅜ", "ㅇ", "ㅓ"], "한구거"),
        q("link-scope", "layout", "Cette leçon couvre-t-elle toutes les règles ?", "Non", [o("Non"), o("Oui")], "Les batchim doubles et changements avancés sont reportés.", ["ㅇ"], "받침"),
      ],
    },
  ],
};

export const HANGUL_MODULES: HangulModule[] = [vowelsBasic, consonantsBasic, tenseModule, compoundModule, batchimModule];

export const isHangulCurriculumComplete = (completed: Record<string, boolean>) =>
  HANGUL_MODULES.every((module) => completed[module.id]);

export const HANGUL_MODULE_BY_ID = Object.fromEntries(HANGUL_MODULES.map((module) => [module.id, module])) as Record<string, HangulModule>;

export const HANGUL_PROGRESS_IDS = [
  ...HANGUL_MODULES.flatMap((module) => [module.id, ...module.scenes.map((scene) => `${module.id}_${scene.id}`)]),
  "hangul_assessment",
];

export const HANGUL_ROUTE_ORDER = [
  ...HANGUL_MODULES.map((module) => module.route),
  "/(tabs)/hangul/assessment",
  "/(tabs)/hangul/bridge",
];

export const getHangulModule = (id: string) => {
  const module = HANGUL_MODULE_BY_ID[id];
  if (!module) throw new Error(`Unknown Hangul module: ${id}`);
  return module;
};

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
// Unicode syllable decomposition uses this fixed medial order. The public
// inventory above deliberately follows the more approachable lesson order.
const MEDIAL_CHARACTERS = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];
const FINAL_CHARACTERS = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ",
  "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

export function decomposeHangulText(value: string) {
  const consonants = new Set<string>();
  const vowels = new Set<string>();
  const finals = new Set<string>();

  for (const char of value) {
    if ((ALL_HANGUL_CONSONANTS as readonly string[]).includes(char)) consonants.add(char);
    if ((ALL_HANGUL_VOWELS as readonly string[]).includes(char)) vowels.add(char);
    const code = char.codePointAt(0);
    if (code === undefined || code < HANGUL_BASE || code > HANGUL_END) continue;
    const offset = code - HANGUL_BASE;
    consonants.add(ALL_HANGUL_CONSONANTS[Math.floor(offset / (21 * 28))]);
    vowels.add(MEDIAL_CHARACTERS[Math.floor(offset / 28) % 21]);
    const finalIndex = offset % 28;
    if (finalIndex > 0) finals.add(FINAL_CHARACTERS[finalIndex]);
  }

  return { consonants: [...consonants], vowels: [...vowels], finals: [...finals] };
}

const getSceneText = (scene: HangulScene) => [
  scene.koreanTitle,
  scene.description,
  scene.instruction,
  ...scene.cards.flatMap((item) => [item.glyph, item.label, item.explanation, item.audio]),
  ...scene.questions.flatMap((item) => [
    item.prompt,
    item.display ?? "",
    item.audio ?? "",
    item.answer,
    item.explanation,
    ...item.characters,
    ...item.options.flatMap((entry) => [entry.value, entry.label, entry.audio ?? ""]),
  ]),
].join(" ");

export function validateHangulCurriculum() {
  const errors: string[] = [];
  const taughtConsonants = new Set<string>();
  const taughtVowels = new Set<string>();
  const taughtFinals = new Set<string>();
  const ids = new Set<string>();

  for (const module of HANGUL_MODULES) {
    if (ids.has(module.id)) errors.push(`Duplicate id: ${module.id}`);
    ids.add(module.id);
    for (const scene of module.scenes) {
      const progressId = `${module.id}_${scene.id}`;
      if (ids.has(progressId)) errors.push(`Duplicate id: ${progressId}`);
      ids.add(progressId);
      scene.introducedConsonants?.forEach((item) => taughtConsonants.add(item));
      scene.introducedVowels?.forEach((item) => taughtVowels.add(item));
      scene.introducedFinals?.forEach((item) => taughtFinals.add(item));
      const used = decomposeHangulText(getSceneText(scene));
      used.consonants.forEach((item) => {
        if (!taughtConsonants.has(item)) errors.push(`${progressId} uses consonant ${item} before teaching it`);
      });
      used.vowels.forEach((item) => {
        if (!taughtVowels.has(item)) errors.push(`${progressId} uses vowel ${item} before teaching it`);
      });
      used.finals.forEach((item) => {
        if (!taughtFinals.has(item) && ![...item].every((part) => taughtFinals.has(part))) {
          errors.push(`${progressId} uses final ${item} before teaching it`);
        }
      });
      if (scene.questions.length < 6) errors.push(`${progressId} has fewer than 6 questions`);
    }
  }

  ALL_HANGUL_CONSONANTS.forEach((item) => {
    if (!taughtConsonants.has(item)) errors.push(`Missing consonant: ${item}`);
  });
  ALL_HANGUL_VOWELS.forEach((item) => {
    if (!taughtVowels.has(item)) errors.push(`Missing vowel: ${item}`);
  });
  ESSENTIAL_FINAL_SOUNDS.forEach((item) => {
    if (!taughtFinals.has(item)) errors.push(`Missing essential final sound: ${item}`);
  });
  HANGUL_MODULES.forEach((module, index) => {
    const expected = HANGUL_MODULES[index + 1]?.route ?? "/(tabs)/hangul/assessment";
    if (module.nextRoute !== expected) errors.push(`${module.id} should transition to ${expected}`);
  });
  return errors;
}
