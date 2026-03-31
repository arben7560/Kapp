import type { ChoiceItem } from "../../../components/ai/ChoiceChips";

export type SceneChoice = ChoiceItem & {
  userText: string;
  hint?: string;
  action:
    | "order_drink"
    | "wait"
    | "set_dine_in"
    | "set_size"
    | "set_temp"
    | "set_name"
    | "repair_repeat"
    | "repair_slow";
  payload?: string;
};

export type CafeStep = {
  id: string;
  phase: string;
  narrator?: string;
  ai: string;
  aiRomanized?: string;
  aiMeaning: string;
  choices: SceneChoice[];
  kind: "greeting" | "order" | "temp" | "size" | "dine" | "name" | "final";
};

export type FinalCafeStep = {
  phase: string;
  narrator?: string;
  ai: string;
  aiRomanized?: string;
  aiMeaning: string;
};

export type DrinkOption = {
  id: string;
  label: string;
  korean: string;
  hint: string;
  defaultTemp: "iced" | "hot" | "either";
  askSize?: boolean;
};

export type CafeSessionState = {
  selectedDrink?: DrinkOption;
  temperature?: "iced" | "hot";
  size?: "tall" | "large" | "regular";
  dineIn?: "here" | "takeaway";
  customerName?: string;
};

type LocalizedLine = {
  ai: string;
  aiRomanized?: string;
  aiMeaning: string;
};

const randomOf = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const shuffle = <T>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const GREETINGS: LocalizedLine[] = [
  {
    ai: "어서 오세요. 무엇을 도와드릴까요?",
    aiRomanized: "Eoseo oseyo. Mueoseul dowadeurilkkayo?",
    aiMeaning: "Bienvenue. Que puis-je faire pour vous ?",
  },
  {
    ai: "안녕하세요. 어떤 음료 드릴까요?",
    aiRomanized: "Annyeonghaseyo. Eotteon eumnyo deurilkkayo?",
    aiMeaning: "Bonjour. Quelle boisson souhaitez-vous ?",
  },
  {
    ai: "어서 오세요. 주문 도와드릴게요.",
    aiRomanized: "Eoseo oseyo. Jumun dowadeurilgeyo.",
    aiMeaning: "Bienvenue. Je vais vous aider pour la commande.",
  },
];

export const ORDER_PROMPTS: LocalizedLine[] = [
  {
    ai: "어떤 음료 드릴까요?",
    aiRomanized: "Eotteon eumnyo deurilkkayo?",
    aiMeaning: "Quelle boisson souhaitez-vous ?",
  },
  {
    ai: "무엇을 주문하시겠어요?",
    aiRomanized: "Mueoseul jumunhasigesseoyo?",
    aiMeaning: "Que souhaitez-vous commander ?",
  },
  {
    ai: "어떤 걸로 하시겠어요?",
    aiRomanized: "Eotteon geollo hasigesseoyo?",
    aiMeaning: "Qu'allez-vous prendre ?",
  },
];

export const TEMP_PROMPTS: LocalizedLine[] = [
  {
    ai: "아이스로 드릴까요, 따뜻하게 드릴까요?",
    aiRomanized: "Aiseuro deurilkkayo, ttatteuthage deurilkkayo?",
    aiMeaning: "Je vous le sers glacé ou chaud ?",
  },
  {
    ai: "차가운 걸로 드릴까요, 따뜻한 걸로 드릴까요?",
    aiRomanized: "Chagaun geollo deurilkkayo, ttatteuthan geollo deurilkkayo?",
    aiMeaning: "Vous le voulez froid ou chaud ?",
  },
];

export const SIZE_PROMPTS: LocalizedLine[] = [
  {
    ai: "사이즈는 어떻게 하시겠어요?",
    aiRomanized: "Saijeuneun eotteoke hasigesseoyo?",
    aiMeaning: "Quelle taille souhaitez-vous ?",
  },
  {
    ai: "사이즈 선택해 주세요.",
    aiRomanized: "Saijeu seontaekhae juseyo.",
    aiMeaning: "Veuillez choisir une taille.",
  },
];

export const DINE_PROMPTS: LocalizedLine[] = [
  {
    ai: "매장에서 드시나요, 가지고 가시나요?",
    aiRomanized: "Maejangeseo deusinayo, gajigo gasinayo?",
    aiMeaning: "Sur place ou à emporter ?",
  },
  {
    ai: "여기서 드세요, 아니면 포장이세요?",
    aiRomanized: "Yeogiseo deuseyo, animyeon pojang-iseyo?",
    aiMeaning: "Sur place ou à emporter ?",
  },
];

export const NAME_PROMPTS: LocalizedLine[] = [
  {
    ai: "성함이 어떻게 되세요?",
    aiRomanized: "Seonghami eotteoke doeseyo?",
    aiMeaning: "Quel est votre nom ?",
  },
  {
    ai: "주문자 성함 부탁드릴게요.",
    aiRomanized: "Jumunja seongham butakdeurilgeyo.",
    aiMeaning: "Je peux avoir le nom pour la commande ?",
  },
];

export const REPAIR_REPEAT_RESPONSE: LocalizedLine = {
  ai: "네, 다시 말씀드릴게요.",
  aiRomanized: "Ne, dasi malsseumdeurilgeyo.",
  aiMeaning: "D'accord, je vais le redire.",
};

export const REPAIR_SLOW_RESPONSE: LocalizedLine = {
  ai: "네, 천천히 말씀드릴게요.",
  aiRomanized: "Ne, cheoncheonhi malsseumdeurilgeyo.",
  aiMeaning: "D'accord, je vais parler plus lentement.",
};

export const WAIT_RESPONSE: LocalizedLine[] = [
  {
    ai: "네, 천천히 보세요.",
    aiRomanized: "Ne, cheoncheonhi boseyo.",
    aiMeaning: "Oui, prenez votre temps.",
  },
  {
    ai: "네, 괜찮아요. 천천히 고르세요.",
    aiRomanized: "Ne, gwaenchanayo. Cheoncheonhi goreuseyo.",
    aiMeaning: "D'accord, pas de souci. Choisissez tranquillement.",
  },
];

export const FINAL_LINES: FinalCafeStep[] = [
  {
    phase: "Terminé",
    narrator: "Minji valide la commande avec un petit sourire.",
    ai: "주문이 완료됐어요. 감사합니다.",
    aiRomanized: "Jumuni wallyo dwaesseoyo. Gamsahamnida.",
    aiMeaning: "La commande est terminée. Merci.",
  },
  {
    phase: "Terminé",
    narrator: "Minji passe la commande à la préparation.",
    ai: "네, 준비되면 불러 드릴게요.",
    aiRomanized: "Ne, junbidoemyeon bulleo deurilgeyo.",
    aiMeaning: "D'accord, je vous appellerai quand ce sera prêt.",
  },
  {
    phase: "Terminé",
    narrator: "Minji termine l’échange calmement.",
    ai: "감사합니다. 잠시만 기다려 주세요.",
    aiRomanized: "Gamsahamnida. Jamsiman gidaryeo juseyo.",
    aiMeaning: "Merci. Veuillez patienter un instant.",
  },
];

export const DRINKS: DrinkOption[] = [
  {
    id: "iced-americano",
    label: "Je voudrais un americano glacé",
    korean: "아이스 아메리카노 한 잔 주세요.",
    hint: "Commande très naturelle pour un americano glacé.",
    defaultTemp: "iced",
    askSize: true,
  },
  {
    id: "hot-americano",
    label: "Je voudrais un americano chaud",
    korean: "따뜻한 아메리카노 한 잔 주세요.",
    hint: "Commande simple et naturelle.",
    defaultTemp: "hot",
    askSize: true,
  },
  {
    id: "latte",
    label: "Je voudrais un café latte",
    korean: "카페라테 한 잔 주세요.",
    hint: "Commande très courante en café.",
    defaultTemp: "either",
    askSize: true,
  },
  {
    id: "vanilla-latte",
    label: "Je vais prendre un vanilla latte",
    korean: "바닐라 라테 한 잔 주세요.",
    hint: "Bonne variante pour enrichir le vocabulaire.",
    defaultTemp: "either",
    askSize: true,
  },
  {
    id: "mocha",
    label: "Je voudrais un café mocha",
    korean: "카페모카 한 잔 주세요.",
    hint: "Une boisson courante aussi.",
    defaultTemp: "either",
    askSize: true,
  },
  {
    id: "matcha-latte",
    label: "Je voudrais un matcha latte",
    korean: "말차 라테 한 잔 주세요.",
    hint: "Très utile pour varier.",
    defaultTemp: "either",
    askSize: true,
  },
  {
    id: "tea",
    label: "Je voudrais un thé",
    korean: "차 한 잔 주세요.",
    hint: "Commande simple et pratique.",
    defaultTemp: "hot",
    askSize: false,
  },
  {
    id: "iced-tea",
    label: "Je voudrais un thé glacé",
    korean: "아이스티 한 잔 주세요.",
    hint: "Très fréquent aussi.",
    defaultTemp: "iced",
    askSize: false,
  },
  {
    id: "grapefruit-ade",
    label: "Je vais prendre un ade pamplemousse",
    korean: "자몽에이드 한 잔 주세요.",
    hint: "Boisson très café coréen.",
    defaultTemp: "iced",
    askSize: false,
  },
  {
    id: "strawberry-smoothie",
    label: "Je voudrais un smoothie fraise",
    korean: "딸기 스무디 한 잔 주세요.",
    hint: "Bonne commande non café.",
    defaultTemp: "iced",
    askSize: false,
  },
];

export function buildOrderChoices(): SceneChoice[] {
  const drinks = shuffle(DRINKS).slice(0, 3);

  return drinks.map((drink) => ({
    id: drink.id,
    label: drink.label,
    korean: drink.korean,
    userText: drink.korean,
    hint: drink.hint,
    action: "order_drink",
    payload: drink.id,
    correct: true,
  }));
}

export function buildGreetingChoices(): SceneChoice[] {
  const drinks = shuffle(DRINKS)
    .slice(0, 2)
    .map((drink) => ({
      id: drink.id,
      label: drink.label,
      korean: drink.korean,
      userText: drink.korean,
      hint: drink.hint,
      action: "order_drink" as const,
      payload: drink.id,
      correct: true,
    }));

  const waitChoice: SceneChoice = {
    id: "wait",
    label: "Je regarde encore un peu",
    korean: "조금 더 볼게요.",
    userText: "조금 더 볼게요.",
    hint: "Naturel seulement dans un contexte d’accueil.",
    action: "wait",
    correct: true,
  };

  return shuffle([...drinks, waitChoice]);
}

export function buildTempChoices(): SceneChoice[] {
  return [
    {
      id: "temp-iced",
      label: "En glacé",
      korean: "아이스로 주세요.",
      userText: "아이스로 주세요.",
      hint: "Réponse naturelle pour choisir froid.",
      action: "set_temp",
      payload: "iced",
      correct: true,
    },
    {
      id: "temp-hot",
      label: "En chaud",
      korean: "따뜻하게 주세요.",
      userText: "따뜻하게 주세요.",
      hint: "Réponse naturelle pour choisir chaud.",
      action: "set_temp",
      payload: "hot",
      correct: true,
    },
    {
      id: "repair-repeat",
      label: "Pouvez-vous répéter ?",
      korean: "다시 한 번 말씀해 주세요.",
      userText: "다시 한 번 말씀해 주세요.",
      hint: "Utile si tu n’as pas bien compris.",
      action: "repair_repeat",
      correct: true,
    },
  ];
}

export function buildSizeChoices(): SceneChoice[] {
  return [
    {
      id: "size-tall",
      label: "Taille normale / tall",
      korean: "톨 사이즈로 주세요.",
      userText: "톨 사이즈로 주세요.",
      hint: "Très courant dans les cafés.",
      action: "set_size",
      payload: "tall",
      correct: true,
    },
    {
      id: "size-large",
      label: "Grande taille",
      korean: "큰 사이즈로 주세요.",
      userText: "큰 사이즈로 주세요.",
      hint: "Simple et utile.",
      action: "set_size",
      payload: "large",
      correct: true,
    },
    {
      id: "repair-slow",
      label: "Parlez plus lentement",
      korean: "천천히 말씀해 주세요.",
      userText: "천천히 말씀해 주세요.",
      hint: "Très utile pour l’entraînement réel.",
      action: "repair_slow",
      correct: true,
    },
  ];
}

export function buildDineChoices(): SceneChoice[] {
  return [
    {
      id: "dine-here",
      label: "Sur place",
      korean: "여기서 마실게요.",
      userText: "여기서 마실게요.",
      hint: "Réponse naturelle pour consommer sur place.",
      action: "set_dine_in",
      payload: "here",
      correct: true,
    },
    {
      id: "dine-takeaway",
      label: "À emporter",
      korean: "포장이에요.",
      userText: "포장이에요.",
      hint: "Très fréquent en Corée.",
      action: "set_dine_in",
      payload: "takeaway",
      correct: true,
    },
    {
      id: "repair-repeat",
      label: "Pouvez-vous répéter ?",
      korean: "다시 한 번 말씀해 주세요.",
      userText: "다시 한 번 말씀해 주세요.",
      hint: "Réparation utile.",
      action: "repair_repeat",
      correct: true,
    },
  ];
}

export function buildNameChoices(): SceneChoice[] {
  return [
    {
      id: "name-simple",
      label: "Répondre avec ton prénom",
      korean: "민수예요.",
      userText: "민수예요.",
      hint: "Remplace 민수 par ton propre prénom.",
      action: "set_name",
      payload: "민수",
      correct: true,
    },
    {
      id: "name-polite",
      label: "Répondre de façon plus polie",
      korean: "제 이름은 민수예요.",
      userText: "제 이름은 민수예요.",
      hint: "Version plus complète et polie.",
      action: "set_name",
      payload: "민수",
      correct: true,
    },
    {
      id: "repair-slow",
      label: "Parlez plus lentement",
      korean: "천천히 말씀해 주세요.",
      userText: "천천히 말씀해 주세요.",
      hint: "Réponse cohérente si tu n’as pas compris.",
      action: "repair_slow",
      correct: true,
    },
  ];
}

export function makeStep(params: CafeStep): CafeStep {
  return params;
}

export function buildGreetingStep(): CafeStep {
  const greeting = randomOf(GREETINGS);

  return makeStep({
    id: "greeting",
    phase: "Accueil",
    ai: greeting.ai,
    aiRomanized: greeting.aiRomanized,
    aiMeaning: greeting.aiMeaning,
    choices: buildGreetingChoices(),
    kind: "greeting",
  });
}

export function buildOrderStep(): CafeStep {
  const prompt = randomOf(ORDER_PROMPTS);

  return makeStep({
    id: "order",
    phase: "Commande",
    narrator: "Minji attend ta commande.",
    ai: prompt.ai,
    aiRomanized: prompt.aiRomanized,
    aiMeaning: prompt.aiMeaning,
    choices: buildOrderChoices(),
    kind: "order",
  });
}

export function buildTempStep(): CafeStep {
  const prompt = randomOf(TEMP_PROMPTS);

  return makeStep({
    id: "temp",
    phase: "Température",
    narrator: "Minji précise la boisson avant de valider.",
    ai: prompt.ai,
    aiRomanized: prompt.aiRomanized,
    aiMeaning: prompt.aiMeaning,
    choices: buildTempChoices(),
    kind: "temp",
  });
}

export function buildSizeStep(): CafeStep {
  const prompt = randomOf(SIZE_PROMPTS);

  return makeStep({
    id: "size",
    phase: "Taille",
    narrator: "Minji vérifie la taille souhaitée.",
    ai: prompt.ai,
    aiRomanized: prompt.aiRomanized,
    aiMeaning: prompt.aiMeaning,
    choices: buildSizeChoices(),
    kind: "size",
  });
}

export function buildDineStep(): CafeStep {
  const prompt = randomOf(DINE_PROMPTS);

  return makeStep({
    id: "dine",
    phase: "Commande",
    narrator: "Minji confirme si tu restes sur place ou non.",
    ai: prompt.ai,
    aiRomanized: prompt.aiRomanized,
    aiMeaning: prompt.aiMeaning,
    choices: buildDineChoices(),
    kind: "dine",
  });
}

export function buildNameStep(): CafeStep {
  const prompt = randomOf(NAME_PROMPTS);

  return makeStep({
    id: "name",
    phase: "Nom",
    narrator: "Minji prépare le gobelet et demande le nom pour l’appel.",
    ai: prompt.ai,
    aiRomanized: prompt.aiRomanized,
    aiMeaning: prompt.aiMeaning,
    choices: buildNameChoices(),
    kind: "name",
  });
}

export function buildFinalStep(): FinalCafeStep {
  return randomOf(FINAL_LINES);
}
