export type CafeChoice = {
  id: string;
  kr: string;
  fr: string;
  quality?: "best" | "ok" | "wrong";
};

export type CafeStep = {
  id: string;
  npcKr: string;
  npcFr: string;
  choices: CafeChoice[];
  acceptedChoiceIds: string[];
  bestChoiceId?: string;
  nextStepByChoice: Record<string, string>;
};

export const cafeSteps: Record<string, CafeStep> = {
  start: {
    id: "start",
    npcKr: "어서 오세요. 주문하시겠어요?",
    npcFr: "Bienvenue. Vous voulez commander ?",
    choices: [
      {
        id: "americano",
        kr: "아메리카노 하나 주세요.",
        fr: "Un americano, s'il vous plaît.",
        quality: "best",
      },
      {
        id: "water",
        kr: "물 주세요.",
        fr: "De l’eau, s'il vous plaît.",
        quality: "wrong",
      },
      {
        id: "toilet",
        kr: "화장실 어디예요?",
        fr: "Où sont les toilettes ?",
        quality: "wrong",
      },
    ],
    acceptedChoiceIds: ["americano"],
    bestChoiceId: "americano",
    nextStepByChoice: {
      americano: "hotOrIce",
      water: "repairOrder",
      toilet: "repairOrder",
    },
  },

  repairOrder: {
    id: "repairOrder",
    npcKr: "네, 그런데 먼저 주문부터 도와드릴게요.",
    npcFr: "Oui, mais je vais d’abord vous aider pour la commande.",
    choices: [
      {
        id: "americano_retry",
        kr: "아메리카노 하나 주세요.",
        fr: "Un americano, s'il vous plaît.",
        quality: "best",
      },
      {
        id: "latte_retry",
        kr: "라떼 하나 주세요.",
        fr: "Un latte, s'il vous plaît.",
        quality: "ok",
      },
    ],
    acceptedChoiceIds: ["americano_retry", "latte_retry"],
    bestChoiceId: "americano_retry",
    nextStepByChoice: {
      americano_retry: "hotOrIce",
      latte_retry: "hotOrIce",
    },
  },

  hotOrIce: {
    id: "hotOrIce",
    npcKr: "뜨거운 걸로 드릴까요, 아이스로 드릴까요?",
    npcFr: "Vous le voulez chaud ou glacé ?",
    choices: [
      {
        id: "ice",
        kr: "아이스로 주세요.",
        fr: "En glacé, s'il vous plaît.",
        quality: "best",
      },
      {
        id: "hot",
        kr: "뜨거운 걸로 주세요.",
        fr: "En chaud, s'il vous plaît.",
        quality: "ok",
      },
      {
        id: "dontknow",
        kr: "몰라요.",
        fr: "Je ne sais pas.",
        quality: "wrong",
      },
    ],
    acceptedChoiceIds: ["ice", "hot"],
    bestChoiceId: "ice",
    nextStepByChoice: {
      ice: "takeout",
      hot: "takeout",
      dontknow: "hotOrIceRepair",
    },
  },

  hotOrIceRepair: {
    id: "hotOrIceRepair",
    npcKr: "차가운 음료면 아이스, 따뜻한 음료면 뜨거운 걸로라고 하면 돼요.",
    npcFr:
      "Pour une boisson froide, dites 'glacée', et pour une boisson chaude, dites 'chaude'.",
    choices: [
      {
        id: "ice_fix",
        kr: "아이스로 주세요.",
        fr: "En glacé, s'il vous plaît.",
        quality: "best",
      },
      {
        id: "hot_fix",
        kr: "뜨거운 걸로 주세요.",
        fr: "En chaud, s'il vous plaît.",
        quality: "ok",
      },
    ],
    acceptedChoiceIds: ["ice_fix", "hot_fix"],
    bestChoiceId: "ice_fix",
    nextStepByChoice: {
      ice_fix: "takeout",
      hot_fix: "takeout",
    },
  },

  takeout: {
    id: "takeout",
    npcKr: "매장에서 드세요, 가져가세요?",
    npcFr: "Sur place ou à emporter ?",
    choices: [
      {
        id: "takeout_yes",
        kr: "가져갈게요.",
        fr: "Je vais l’emporter.",
        quality: "best",
      },
      {
        id: "here",
        kr: "매장에서 마실게요.",
        fr: "Je vais le boire sur place.",
        quality: "ok",
      },
    ],
    acceptedChoiceIds: ["takeout_yes", "here"],
    bestChoiceId: "takeout_yes",
    nextStepByChoice: {
      takeout_yes: "payment",
      here: "payment",
    },
  },

  payment: {
    id: "payment",
    npcKr: "결제는 어떻게 하시겠어요?",
    npcFr: "Comment souhaitez-vous payer ?",
    choices: [
      {
        id: "card",
        kr: "카드로 할게요.",
        fr: "Je vais payer par carte.",
        quality: "best",
      },
      {
        id: "cash",
        kr: "현금으로 할게요.",
        fr: "Je vais payer en espèces.",
        quality: "ok",
      },
    ],
    acceptedChoiceIds: ["card", "cash"],
    bestChoiceId: "card",
    nextStepByChoice: {
      card: "end",
      cash: "end",
    },
  },

  end: {
    id: "end",
    npcKr: "주문 완료되었습니다. 감사합니다.",
    npcFr: "Votre commande est terminée. Merci.",
    choices: [],
    acceptedChoiceIds: [],
    nextStepByChoice: {},
  },
};
