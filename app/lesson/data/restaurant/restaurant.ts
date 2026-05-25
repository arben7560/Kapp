export interface DialogueChoice {
  id: string;
  label: string;
  korean: string;
  romanization?: string;
  nextNodeId: string;
}

export interface DialogueNode {
  id: string;
  type: "ia" | "user_choice";
  korean?: string;
  french?: string;
  romanization?: string;
  nextNodeId?: string | null;
  choices?: DialogueChoice[];
}

export interface DialogueScenario {
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export type RestaurantLine = {
  speaker: "Serveur" | "Client";
  korean: string;
  french: string;
  romanization?: string;
};

export const restaurantDialogueData = {
  scenarioTitle: "Commande au restaurant a Seoul",
  scenarioDescription:
    "Commander un plat, ajuster le niveau de piment et payer naturellement.",

  pedagogical: {
    startNodeId: "ped_order_prompt",
    nodes: {
      ped_order_prompt: {
        id: "ped_order_prompt",
        type: "ia",
        korean: "주문하시겠어요?",
        french: "Voulez-vous commander ?",
        romanization: "Jumunhasigesseoyo?",
        nextNodeId: "ped_order_choice",
      },

      ped_order_choice: {
        id: "ped_order_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_bibimbap",
            label: "Commander un bibimbap.",
            korean: "비빔밥 주세요.",
            romanization: "Bibimbap juseyo.",
            nextNodeId: "ped_spicy_prompt",
          },
          {
            id: "ped_water",
            label: "Demander de l'eau.",
            korean: "물 주세요.",
            romanization: "Mul juseyo.",
            nextNodeId: "ped_spicy_prompt",
          },
          {
            id: "ped_ask_what",
            label: "Demander ce que c'est.",
            korean: "이거 뭐예요?",
            romanization: "Igeo mwoyeyo?",
            nextNodeId: "ped_spicy_prompt",
          },
        ],
      },

      ped_spicy_prompt: {
        id: "ped_spicy_prompt",
        type: "ia",
        korean: "맵게 드릴까요?",
        french: "Je vous le fais epice ?",
        romanization: "Maepge deurilkkayo?",
        nextNodeId: "ped_spicy_choice",
      },

      ped_spicy_choice: {
        id: "ped_spicy_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_not_spicy",
            label: "Pas epice.",
            korean: "안 매운 걸로 주세요.",
            romanization: "An maeun geollo juseyo.",
            nextNodeId: "ped_payment_prompt",
          },
          {
            id: "ped_yes_spicy",
            label: "Oui, epice.",
            korean: "네, 맵게 주세요.",
            romanization: "Ne, maepge juseyo.",
            nextNodeId: "ped_payment_prompt",
          },
          {
            id: "ped_recommend",
            label: "Demander une recommandation.",
            korean: "혹시 추천 메뉴 있어요?",
            romanization: "Hoksi chucheon menyu isseoyo?",
            nextNodeId: "ped_payment_prompt",
          },
        ],
      },

      ped_payment_prompt: {
        id: "ped_payment_prompt",
        type: "ia",
        korean: "계산 도와드릴게요.",
        french: "Je vous aide pour le paiement.",
        romanization: "Gyesan dowadeurilgeyo.",
        nextNodeId: "ped_payment_choice",
      },

      ped_payment_choice: {
        id: "ped_payment_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_bill",
            label: "Demander l'addition.",
            korean: "계산서 주세요.",
            romanization: "Gyesanseo juseyo.",
            nextNodeId: "ped_goodbye",
          },
          {
            id: "ped_card",
            label: "Payer par carte.",
            korean: "카드로 할게요.",
            romanization: "Kadeuro halgeyo.",
            nextNodeId: "ped_goodbye",
          },
          {
            id: "ped_cash",
            label: "Payer en especes.",
            korean: "현금으로 할게요.",
            romanization: "Hyeongeumeuro halgeyo.",
            nextNodeId: "ped_goodbye",
          },
        ],
      },

      ped_goodbye: {
        id: "ped_goodbye",
        type: "ia",
        korean: "네, 감사합니다. 좋은 하루 보내세요.",
        french: "D'accord, merci beaucoup. Passez une bonne journee.",
        romanization: "Ne, gamsahamnida. Joeun haru bonaeseyo.",
        nextNodeId: null,
      },
    },
  } as DialogueScenario,

  serverLines: [
    {
      speaker: "Serveur",
      korean: "어서 오세요!",
      french: "Bienvenue !",
      romanization: "Eoseo oseyo!",
    },
    {
      speaker: "Serveur",
      korean: "몇 분이세요?",
      french: "Vous etes combien ?",
      romanization: "Myeot buniseyo?",
    },
    {
      speaker: "Serveur",
      korean: "주문하시겠어요?",
      french: "Voulez-vous commander ?",
      romanization: "Jumunhasigesseoyo?",
    },
    {
      speaker: "Serveur",
      korean: "맵게 드릴까요?",
      french: "Je vous le fais epice ?",
      romanization: "Maepge deurilkkayo?",
    },
    {
      speaker: "Serveur",
      korean: "더 필요하신 거 있어요?",
      french: "Vous avez besoin d'autre chose ?",
      romanization: "Deo piryohasin geo isseoyo?",
    },
    {
      speaker: "Serveur",
      korean: "계산 도와드릴게요.",
      french: "Je vous aide pour le paiement.",
      romanization: "Gyesan dowadeurilgeyo.",
    },
  ] satisfies RestaurantLine[],

  clientLines: [
    {
      speaker: "Client",
      korean: "이거 주세요.",
      french: "Je prends ca, s'il vous plait.",
      romanization: "Igeo juseyo.",
    },
    {
      speaker: "Client",
      korean: "물 주세요.",
      french: "De l'eau, s'il vous plait.",
      romanization: "Mul juseyo.",
    },
    {
      speaker: "Client",
      korean: "안 매운 걸로 주세요.",
      french: "Quelque chose de non piquant, s'il vous plait.",
      romanization: "An maeun geollo juseyo.",
    },
    {
      speaker: "Client",
      korean: "이거 뭐예요?",
      french: "C'est quoi, ca ?",
      romanization: "Igeo mwoyeyo?",
    },
    {
      speaker: "Client",
      korean: "계산서 주세요.",
      french: "L'addition, s'il vous plait.",
      romanization: "Gyesanseo juseyo.",
    },
    {
      speaker: "Client",
      korean: "카드로 할게요.",
      french: "Je vais payer par carte.",
      romanization: "Kadeuro halgeyo.",
    },
  ] satisfies RestaurantLine[],

  miniDialogues: [
    {
      title: "Dialogue 1 - commander un plat",
      lines: [
        {
          speaker: "Serveur",
          korean: "주문하시겠어요?",
          french: "Voulez-vous commander ?",
        },
        {
          speaker: "Client",
          korean: "비빔밥 주세요.",
          french: "Un bibimbap, s'il vous plait.",
        },
        {
          speaker: "Serveur",
          korean: "맵게 드릴까요?",
          french: "Je vous le fais epice ?",
        },
        {
          speaker: "Client",
          korean: "안 매운 걸로 주세요.",
          french: "Quelque chose de non piquant, s'il vous plait.",
        },
      ] satisfies RestaurantLine[],
    },
    {
      title: "Dialogue 2 - demander l'addition",
      lines: [
        {
          speaker: "Client",
          korean: "계산서 주세요.",
          french: "L'addition, s'il vous plait.",
        },
        {
          speaker: "Serveur",
          korean: "카드예요, 현금이에요?",
          french: "Carte ou especes ?",
        },
        {
          speaker: "Client",
          korean: "카드로 할게요.",
          french: "Je vais payer par carte.",
        },
      ] satisfies RestaurantLine[],
    },
  ],
} as const;
