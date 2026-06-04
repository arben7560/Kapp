export interface ScenarioChoice {
  id: string;
  label: string;
  korean: string;
  romanization?: string;
  nextNodeId: string;
}

export interface ScenarioNode {
  id: string;
  type: "ia" | "user_choice";
  korean?: string;
  french?: string;
  romanization?: string;
  nextNodeId?: string | null;
  choices?: ScenarioChoice[];
}

export interface ScenarioData {
  id: string;
  title: string;
  description: string;
  context: string;
  learningGoals: string[];
  pedagogical: {
    startNodeId: string;
    nodes: Record<string, ScenarioNode>;
  };
  real: {
    startNodeId: string;
    nodes: Record<string, ScenarioNode>;
  };
}

export const cafeScenario: ScenarioData = {
  id: "cafe",
  title: "Commande au café à Séoul",
  description: "Scénario pour apprendre à commander dans un café coréen.",
  context: `
L'utilisateur pratique une situation réaliste dans un café à Séoul.
Le but est de savoir :

* commander une boisson ou un dessert
* répondre sur place ou à emporter
* payer par carte ou en espèces
* demander ou refuser le reçu
* comprendre les phrases naturelles d'un employé de café
  `.trim(),
  learningGoals: [
    "Commander une boisson",
    "Commander un dessert",
    "Répondre sur place ou à emporter",
    "Payer par carte ou en espèces",
    "Demander ou refuser un reçu",
    "Comprendre des formulations polies et naturelles",
  ],
  pedagogical: {
    startNodeId: "ped_welcome",
    nodes: {
      ped_welcome: {
        id: "ped_welcome",
        type: "ia",
        korean: "어서 오세요. 주문 도와드릴게요. 무엇으로 드시겠어요?",
        french:
          "Bienvenue. Je vais vous aider pour la commande. Que souhaitez-vous prendre ?",
        romanization:
          "Eoseo oseyo. Jumun dowadeurilgeyo. Mueoseuro deusigesseoyo?",
        nextNodeId: "ped_choice1",
      },
      ped_choice1: {
        id: "ped_choice1",
        type: "user_choice",
        choices: [
          {
            id: "ped_order1",
            label:
              "Je voudrais deux américanos glacés et un jus d'orange, s'il vous plaît.",
            korean: "아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 주세요.",
            romanization:
              "Aiseu Amerikano du janirang orenji juseu han jan juseyo.",
            nextNodeId: "ped_confirm",
          },
          {
            id: "ped_order2",
            label: "Un latte glacé et un cheesecake, s'il vous plaît.",
            korean: "아이스 라떼 한 잔이랑 치즈케이크 한 조각 주세요.",
            romanization:
              "Aiseu latte han janirang chijeu keikeu han jogak juseyo.",
            nextNodeId: "ped_confirm_alt",
          },
          {
            id: "repeat_ped1",
            label: "Pouvez-vous répéter ?",
            korean: "다시 한번 말씀해 주시겠어요?",
            romanization: "Dasi hanbeon malsseumhae jusigesseoyo?",
            nextNodeId: "ped_welcome",
          },
        ],
      },
      ped_confirm: {
        id: "ped_confirm",
        type: "ia",
        korean:
          "네, 확인해 드릴게요. 아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 맞으시죠? 드시고 가세요, 아니면 포장하세요?",
        french:
          "Très bien, je vérifie. Deux américanos glacés et un jus d'orange, c'est bien ça ? Vous consommez sur place ou à emporter ?",
        romanization:
          "Ne, hwaginhae deurilgeyo. Aiseu Amerikano du janirang orenji juseu han jan majeusijyo? Deusigo gaseyo, animyeon pojanghaseyo?",
        nextNodeId: "ped_choice2_drink",
      },
      ped_confirm_alt: {
        id: "ped_confirm_alt",
        type: "ia",
        korean:
          "네, 확인해 드릴게요. 아이스 라떼 한 잔이랑 치즈케이크 한 조각 맞으시죠? 드시고 가세요, 아니면 포장하세요?",
        french:
          "Très bien, je vérifie. Un latte glacé et une part de cheesecake, c'est bien ça ? Vous consommez sur place ou à emporter ?",
        romanization:
          "Ne, hwaginhae deurilgeyo. Aiseu latte han janirang chijeu keikeu han jogak majeusijyo? Deusigo gaseyo, animyeon pojanghaseyo?",
        nextNodeId: "ped_choice2_cake",
      },
      ped_choice2_drink: {
        id: "ped_choice2_drink",
        type: "user_choice",
        choices: [
          {
            id: "ped_here_drink",
            label: "Sur place.",
            korean: "네, 먹고 갈게요.",
            romanization: "Ne, meokgo galgeyo.",
            nextNodeId: "ped_payment_here",
          },
          {
            id: "ped_takeout_drink",
            label: "À emporter.",
            korean: "포장해 주세요.",
            romanization: "Pojanghae juseyo.",
            nextNodeId: "ped_payment_takeout",
          },
          {
            id: "repeat_ped2_drink",
            label: "Pouvez-vous répéter ?",
            korean: "다시 한번 말씀해 주시겠어요?",
            romanization: "Dasi hanbeon malsseumhae jusigesseoyo?",
            nextNodeId: "ped_confirm",
          },
        ],
      },
      ped_choice2_cake: {
        id: "ped_choice2_cake",
        type: "user_choice",
        choices: [
          {
            id: "ped_here_cake",
            label: "Sur place.",
            korean: "네, 먹고 갈게요.",
            romanization: "Ne, meokgo galgeyo.",
            nextNodeId: "ped_payment_here",
          },
          {
            id: "ped_takeout_cake",
            label: "À emporter.",
            korean: "포장해 주세요.",
            romanization: "Pojanghae juseyo.",
            nextNodeId: "ped_payment_takeout",
          },
          {
            id: "repeat_ped2_cake",
            label: "Pouvez-vous répéter ?",
            korean: "다시 한번 말씀해 주시겠어요?",
            romanization: "Dasi hanbeon malsseumhae jusigesseoyo?",
            nextNodeId: "ped_confirm_alt",
          },
        ],
      },
      ped_payment_here: {
        id: "ped_payment_here",
        type: "ia",
        korean:
          "총 9,500원입니다. 카드로 결제하시겠어요, 아니면 현금으로 하시겠어요?",
        french:
          "Cela fait 9 500 wons au total. Vous souhaitez payer par carte ou en espèces ?",
        romanization:
          "Chong gucheon obaegwonimnida. Kadeuro gyeoljehasigesseoyo, animyeon hyeongeumeuro hasigesseoyo?",
        nextNodeId: "ped_choice3_here",
      },
      ped_payment_takeout: {
        id: "ped_payment_takeout",
        type: "ia",
        korean:
          "총 9,500원입니다. 카드로 결제하시겠어요, 아니면 현금으로 하시겠어요?",
        french:
          "Cela fait 9 500 wons au total. Vous souhaitez payer par carte ou en espèces ?",
        romanization:
          "Chong gucheon obaegwonimnida. Kadeuro gyeoljehasigesseoyo, animyeon hyeongeumeuro hasigesseoyo?",
        nextNodeId: "ped_choice3_takeout",
      },
      ped_choice3_here: {
        id: "ped_choice3_here",
        type: "user_choice",
        choices: [
          {
            id: "ped_card_here",
            label: "Par carte.",
            korean: "카드로 할게요.",
            romanization: "Kadeuro halgeyo.",
            nextNodeId: "ped_receipt_card_here",
          },
          {
            id: "ped_cash_here",
            label: "En espèces.",
            korean: "현금으로 할게요.",
            romanization: "Hyeongeumeuro halgeyo.",
            nextNodeId: "ped_receipt_cash_here",
          },
          {
            id: "repeat_ped3_here",
            label: "Pouvez-vous répéter ?",
            korean: "다시 한번 말씀해 주시겠어요?",
            romanization: "Dasi hanbeon malsseumhae jusigesseoyo?",
            nextNodeId: "ped_payment_here",
          },
        ],
      },
      ped_choice3_takeout: {
        id: "ped_choice3_takeout",
        type: "user_choice",
        choices: [
          {
            id: "ped_card_takeout",
            label: "Par carte.",
            korean: "카드로 할게요.",
            romanization: "Kadeuro halgeyo.",
            nextNodeId: "ped_receipt_card_takeout",
          },
          {
            id: "ped_cash_takeout",
            label: "En espèces.",
            korean: "현금으로 할게요.",
            romanization: "Hyeongeumeuro halgeyo.",
            nextNodeId: "ped_receipt_cash_takeout",
          },
          {
            id: "repeat_ped3_takeout",
            label: "Pouvez-vous répéter ?",
            korean: "다시 한번 말씀해 주시겠어요?",
            romanization: "Dasi hanbeon malsseumhae jusigesseoyo?",
            nextNodeId: "ped_payment_takeout",
          },
        ],
      },
      ped_receipt_card_here: {
        id: "ped_receipt_card_here",
        type: "ia",
        korean: "네, 카드 결제 도와드릴게요. 영수증 필요하세요?",
        french:
          "Très bien, je lance le paiement par carte. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, kadeu gyeolje dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        nextNodeId: "ped_receipt_choice_here",
      },
      ped_receipt_cash_here: {
        id: "ped_receipt_cash_here",
        type: "ia",
        korean: "네, 현금으로 도와드릴게요. 영수증 필요하세요?",
        french: "Très bien, en espèces. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, hyeongeumeuro dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        nextNodeId: "ped_receipt_choice_here",
      },
      ped_receipt_card_takeout: {
        id: "ped_receipt_card_takeout",
        type: "ia",
        korean: "네, 카드 결제 도와드릴게요. 영수증 필요하세요?",
        french:
          "Très bien, je lance le paiement par carte. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, kadeu gyeolje dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        nextNodeId: "ped_receipt_choice_takeout",
      },
      ped_receipt_cash_takeout: {
        id: "ped_receipt_cash_takeout",
        type: "ia",
        korean: "네, 현금으로 도와드릴게요. 영수증 필요하세요?",
        french: "Très bien, en espèces. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, hyeongeumeuro dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        nextNodeId: "ped_receipt_choice_takeout",
      },
      ped_receipt_choice_here: {
        id: "ped_receipt_choice_here",
        type: "user_choice",
        choices: [
          {
            id: "ped_receipt_yes_here",
            label: "Oui, s'il vous plaît.",
            korean: "네, 주세요.",
            romanization: "Ne, juseyo.",
            nextNodeId: "ped_bell",
          },
          {
            id: "ped_receipt_no_here",
            label: "Non, merci.",
            korean: "아니요, 괜찮아요.",
            romanization: "Aniyo, gwaenchanayo.",
            nextNodeId: "ped_bell",
          },
        ],
      },
      ped_receipt_choice_takeout: {
        id: "ped_receipt_choice_takeout",
        type: "user_choice",
        choices: [
          {
            id: "ped_receipt_yes_takeout",
            label: "Oui, s'il vous plaît.",
            korean: "네, 주세요.",
            romanization: "Ne, juseyo.",
            nextNodeId: "ped_takeout_end",
          },
          {
            id: "ped_receipt_no_takeout",
            label: "Non, merci.",
            korean: "아니요, 괜찮아요.",
            romanization: "Aniyo, gwaenchanayo.",
            nextNodeId: "ped_takeout_end",
          },
        ],
      },
      ped_bell: {
        id: "ped_bell",
        type: "ia",
        korean: "진동벨 드릴게요. 준비되면 불러드릴게요.",
        french: "Voici le buzzer. Je vous appellerai quand ce sera prêt.",
        romanization: "Jindongbel deurilgeyo. Junbidoemyeon bulleodeurilgeyo.",
        nextNodeId: null,
      },
      ped_takeout_end: {
        id: "ped_takeout_end",
        type: "ia",
        korean:
          "포장 주문이 완료되었습니다. 준비되면 바로 드릴게요. 감사합니다.",
        french:
          "La commande à emporter est bien enregistrée. Je vous la donne dès qu'elle est prête. Merci.",
        romanization:
          "Pojang jumuni wallyodoeeotseumnida. Junbidoemyeon baro deurilgeyo. Gamsahamnida.",
        nextNodeId: null,
      },
    },
  },
  real: {
    startNodeId: "real_welcome",
    nodes: {
      real_welcome: {
        id: "real_welcome",
        type: "ia",
        korean: "어서 오세요. 뭐 드릴까요?",
        french: "Bienvenue. Qu'est-ce que je vous sers ?",
        romanization: "Eoseo oseyo. Mwo deurilkkayo?",
        nextNodeId: "real_choice1",
      },
      real_choice1: {
        id: "real_choice1",
        type: "user_choice",
        choices: [
          {
            id: "real_order1",
            label: "Deux américanos glacés et un jus d'orange.",
            korean: "아이스 아메리카노 두 잔이랑 오렌지 주스 하나 주세요.",
            romanization:
              "Aiseu Amerikano du janirang orenji juseu hana juseyo.",
            nextNodeId: "real_confirm",
          },
          {
            id: "real_order2",
            label: "Un latte glacé et un cheesecake.",
            korean: "아이스 라떼 하나랑 치즈케이크 하나 주세요.",
            romanization: "Aiseu latte hanarang chijeu keikeu hana juseyo.",
            nextNodeId: "real_confirm_alt",
          },
          {
            id: "repeat_real1",
            label: "Pouvez-vous répéter ?",
            korean: "다시 말씀해 주실래요?",
            romanization: "Dasi malsseumhae jusillaeyo?",
            nextNodeId: "real_welcome",
          },
        ],
      },
      real_confirm: {
        id: "real_confirm",
        type: "ia",
        korean:
          "네, 아이스 아메리카노 두 잔이랑 오렌지 주스 하나 맞죠? 드시고 가세요, 가져가세요?",
        french:
          "D'accord, deux américanos glacés et un jus d'orange, c'est bien ça ? Sur place ou à emporter ?",
        romanization:
          "Ne, Aiseu Amerikano du janirang orenji juseu hana matjyo? Deusigo gaseyo, gajyeogaseyo?",
        nextNodeId: "real_choice2_drink",
      },
      real_confirm_alt: {
        id: "real_confirm_alt",
        type: "ia",
        korean:
          "네, 아이스 라떼 하나랑 치즈케이크 하나 맞죠? 드시고 가세요, 가져가세요?",
        french:
          "D'accord, un latte glacé et un cheesecake, c'est bien ça ? Sur place ou à emporter ?",
        romanization:
          "Ne, Aiseu latte hanarang chijeu keikeu hana matjyo? Deusigo gaseyo, gajyeogaseyo?",
        nextNodeId: "real_choice2_cake",
      },
      real_choice2_drink: {
        id: "real_choice2_drink",
        type: "user_choice",
        choices: [
          {
            id: "real_here_drink",
            label: "Sur place.",
            korean: "먹고 갈게요.",
            romanization: "Meokgo galgeyo.",
            nextNodeId: "real_payment_here",
          },
          {
            id: "real_takeout_drink",
            label: "À emporter.",
            korean: "가져갈게요.",
            romanization: "Gajyeogalgeyo.",
            nextNodeId: "real_payment_takeout",
          },
          {
            id: "repeat_real2_drink",
            label: "Pouvez-vous répéter ?",
            korean: "다시 말씀해 주실래요?",
            romanization: "Dasi malsseumhae jusillaeyo?",
            nextNodeId: "real_confirm",
          },
        ],
      },
      real_choice2_cake: {
        id: "real_choice2_cake",
        type: "user_choice",
        choices: [
          {
            id: "real_here_cake",
            label: "Sur place.",
            korean: "먹고 갈게요.",
            romanization: "Meokgo galgeyo.",
            nextNodeId: "real_payment_here",
          },
          {
            id: "real_takeout_cake",
            label: "À emporter.",
            korean: "가져갈게요.",
            romanization: "Gajyeogalgeyo.",
            nextNodeId: "real_payment_takeout",
          },
          {
            id: "repeat_real2_cake",
            label: "Pouvez-vous répéter ?",
            korean: "다시 말씀해 주실래요?",
            romanization: "Dasi malsseumhae jusillaeyo?",
            nextNodeId: "real_confirm_alt",
          },
        ],
      },
      real_payment_here: {
        id: "real_payment_here",
        type: "ia",
        korean: "총 9,500원이요. 카드세요, 현금이세요?",
        french: "Cela fait 9 500 wons. Carte ou espèces ?",
        romanization: "Chong gucheon obaegwoniyo. Kadeuseyo, hyeongeumiseyo?",
        nextNodeId: "real_choice3_here",
      },
      real_payment_takeout: {
        id: "real_payment_takeout",
        type: "ia",
        korean: "총 9,500원이요. 카드세요, 현금이세요?",
        french: "Cela fait 9 500 wons. Carte ou espèces ?",
        romanization: "Chong gucheon obaegwoniyo. Kadeuseyo, hyeongeumiseyo?",
        nextNodeId: "real_choice3_takeout",
      },
      real_choice3_here: {
        id: "real_choice3_here",
        type: "user_choice",
        choices: [
          {
            id: "real_card_here",
            label: "Par carte.",
            korean: "카드로 할게요.",
            romanization: "Kadeuro halgeyo.",
            nextNodeId: "real_here_end",
          },
          {
            id: "real_cash_here",
            label: "En espèces.",
            korean: "현금으로 할게요.",
            romanization: "Hyeongeumeuro halgeyo.",
            nextNodeId: "real_here_end",
          },
          {
            id: "repeat_real3_here",
            label: "Pouvez-vous répéter ?",
            korean: "다시 말씀해 주실래요?",
            romanization: "Dasi malsseumhae jusillaeyo?",
            nextNodeId: "real_payment_here",
          },
        ],
      },
      real_choice3_takeout: {
        id: "real_choice3_takeout",
        type: "user_choice",
        choices: [
          {
            id: "real_card_takeout",
            label: "Par carte.",
            korean: "카드로 할게요.",
            romanization: "Kadeuro halgeyo.",
            nextNodeId: "real_takeout_end",
          },
          {
            id: "real_cash_takeout",
            label: "En espèces.",
            korean: "현금으로 할게요.",
            romanization: "Hyeongeumeuro halgeyo.",
            nextNodeId: "real_takeout_end",
          },
          {
            id: "repeat_real3_takeout",
            label: "Pouvez-vous répéter ?",
            korean: "다시 말씀해 주실래요?",
            romanization: "Dasi malsseumhae jusillaeyo?",
            nextNodeId: "real_payment_takeout",
          },
        ],
      },
      real_here_end: {
        id: "real_here_end",
        type: "ia",
        korean: "네, 진동벨 드릴게요. 준비되면 알려드릴게요.",
        french:
          "Très bien, voici le buzzer. Je vous préviens quand c'est prêt.",
        romanization:
          "Ne, jindongbel deurilgeyo. Junbidoemyeon allyeodeurilgeyo.",
        nextNodeId: null,
      },
      real_takeout_end: {
        id: "real_takeout_end",
        type: "ia",
        korean: "네, 준비되면 바로 드릴게요. 감사합니다.",
        french: "D'accord, je vous le donne dès que c'est prêt. Merci.",
        romanization: "Ne, junbidoemyeon baro deurilgeyo. Gamsahamnida.",
        nextNodeId: null,
      },
    },
  },
};

function formatScenarioNode(node: ScenarioNode): string {
  if (node.type === "ia") {
    return `IA: ${node.korean} / ${node.romanization} / ${node.french}`;
  }

  return (
    node.choices
      ?.map(
        (choice) =>
          `Utilisateur: ${choice.korean} / ${choice.romanization} / ${choice.label}`,
      )
      .join("\n") ?? ""
  );
}

export function getCafeScenarioForPrompt(): string {
  const pedagogicalNodes = Object.values(cafeScenario.pedagogical.nodes)
    .map(formatScenarioNode)
    .filter(Boolean)
    .join("\n");

  const realNodes = Object.values(cafeScenario.real.nodes)
    .map(formatScenarioNode)
    .filter(Boolean)
    .join("\n");

  return `
SCÉNARIO CAFÉ :
${cafeScenario.context}

OBJECTIFS :
${cafeScenario.learningGoals.map((goal) => `- ${goal}`).join("\n")}

RÉPLIQUES IMPORTANTES - MODE PÉDAGOGIQUE :
${pedagogicalNodes}

RÉPLIQUES IMPORTANTES - MODE RÉEL :
${realNodes}

CONSIGNE MODE HYBRIDE :
Tu joues principalement l'employée du café.
Si l'utilisateur répond comme un client, continue la scène.
Si l'utilisateur pose une question, réponds brièvement comme prof de coréen, puis reviens immédiatement à la scène.
Si l'utilisateur fait une erreur, corrige doucement, donne la phrase naturelle, puis continue la scène.
Si l'utilisateur est bloqué, propose 2 ou 3 réponses possibles.
Ne fais pas de longue leçon.
Garde les réponses courtes pour un avatar vidéo.
`.trim();
}

export const cafeScenarioContext = getCafeScenarioForPrompt();
