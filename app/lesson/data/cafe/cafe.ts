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
  videoSource?: any;
}

export interface DialogueScenario {
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

const welcomeCafeVideo = require("../../../../assets/ai/cafe/welcomeCafe.mp4");
const orderConfirmationJuiceVideo = require("../../../../assets/ai/cafe/orderConfirmationJuice.mp4");
const orderConfirmationCakeVideo = require("../../../../assets/ai/cafe/orderConfirmationCake.mp4");
const pricePaimentChooseVideo = require("../../../../assets/ai/cafe/pricePaimentChoose.mp4");
const byCardReceiptVideo = require("../../../../assets/ai/cafe/byCardReceipt.mp4");
const byCashReceiptVideo = require("../../../../assets/ai/cafe/byCashReceipt.mp4");
const jingdonbelVideo = require("../../../../assets/ai/cafe/jingdonbel.mp4");
const takeOutThanksVideo = require("../../../../assets/ai/cafe/takeOutThanks.mp4");

export const cafeDialogueData = {
  scenarioTitle: "Commande au café à Séoul",
  scenarioDescription: "Deux expériences différentes pour mieux apprendre.",

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
        videoSource: welcomeCafeVideo,
        nextNodeId: "ped_choice1",
      },

      ped_choice1: {
        id: "ped_choice1",
        type: "user_choice",
        choices: [
          {
            id: "ped_order1",
            label:
              "Je voudrais deux américanos glacés et un jus d’orange, s’il vous plaît.",
            korean: "아이스 아메리카노 두 잔이랑 오렌지 주스 한 잔 주세요.",
            romanization:
              "Aiseu amerikano du janirang orenji juseu han jan juseyo.",
            nextNodeId: "ped_confirm",
          },
          {
            id: "ped_order2",
            label: "Un latte glacé et un cheesecake, s’il vous plaît.",
            korean: "아이스 라떼 한 잔이랑 치즈케이크 한 조각 주세요.",
            romanization:
              "Aiseu ratte han janirang chijeu keikeu han jogak juseyo.",
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
          "Très bien, je vérifie. Deux américanos glacés et un jus d’orange, c’est bien ça ? Vous consommez sur place ou à emporter ?",
        romanization:
          "Ne, hwaginhae deurilgeyo. Aiseu amerikano du janirang orenji juseu han jan majeusijyo? Deusigo gaseyo, animyeon pojanghaseyo?",
        videoSource: orderConfirmationJuiceVideo,
        nextNodeId: "ped_choice2",
      },

      ped_confirm_alt: {
        id: "ped_confirm_alt",
        type: "ia",
        korean:
          "네, 확인해 드릴게요. 아이스 라떼 한 잔이랑 치즈케이크 한 조각 맞으시죠? 드시고 가세요, 아니면 포장하세요?",
        french:
          "Très bien, je vérifie. Un latte glacé et une part de cheesecake, c’est bien ça ? Vous consommez sur place ou à emporter ?",
        romanization:
          "Ne, hwaginhae deurilgeyo. Aiseu ratte han janirang chijeu keikeu han jogak majeusijyo? Deusigo gaseyo, animyeon pojanghaseyo?",
        videoSource: orderConfirmationCakeVideo,
        nextNodeId: "ped_choice2",
      },

      ped_choice2: {
        id: "ped_choice2",
        type: "user_choice",
        choices: [
          {
            id: "ped_here",
            label: "Sur place.",
            korean: "네, 먹고 갈게요.",
            romanization: "Ne, meokgo galgeyo.",
            nextNodeId: "ped_payment_here",
          },
          {
            id: "ped_takeout",
            label: "À emporter.",
            korean: "포장해 주세요.",
            romanization: "Pojanghae juseyo.",
            nextNodeId: "ped_payment_takeout",
          },
          {
            id: "repeat_ped2",
            label: "Pouvez-vous répéter ?",
            korean: "다시 한번 말씀해 주시겠어요?",
            romanization: "Dasi hanbeon malsseumhae jusigesseoyo?",
            nextNodeId: "ped_confirm",
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
        videoSource: pricePaimentChooseVideo,
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
        videoSource: pricePaimentChooseVideo,
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
        videoSource: byCardReceiptVideo,
        nextNodeId: "ped_receipt_choice_here",
      },

      ped_receipt_cash_here: {
        id: "ped_receipt_cash_here",
        type: "ia",
        korean: "네, 현금으로 도와드릴게요. 영수증 필요하세요?",
        french: "Très bien, en espèces. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, hyeongeumeuro dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        videoSource: byCashReceiptVideo,
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
        videoSource: byCardReceiptVideo,
        nextNodeId: "ped_receipt_choice_takeout",
      },

      ped_receipt_cash_takeout: {
        id: "ped_receipt_cash_takeout",
        type: "ia",
        korean: "네, 현금으로 도와드릴게요. 영수증 필요하세요?",
        french: "Très bien, en espèces. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, hyeongeumeuro dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        videoSource: byCashReceiptVideo,
        nextNodeId: "ped_receipt_choice_takeout",
      },

      ped_receipt_choice_here: {
        id: "ped_receipt_choice_here",
        type: "user_choice",
        choices: [
          {
            id: "ped_receipt_yes_here",
            label: "Oui, s’il vous plaît.",
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
            label: "Oui, s’il vous plaît.",
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
        korean:
          "진동벨 드릴게요. 편하신 자리에 앉아 계시면 됩니다. 준비되면 불러드릴게요.",
        french:
          "Voici le buzzer. Vous pouvez vous asseoir où vous voulez. Je vous appellerai quand ce sera prêt.",
        romanization:
          "Jindongbel deurilgeyo. Pyeonhasin jarie anja gyesimyeon doemnida. Junbidoemyeon bulleodeurilgeyo.",
        videoSource: jingdonbelVideo,
        nextNodeId: null,
      },

      ped_takeout_end: {
        id: "ped_takeout_end",
        type: "ia",
        korean:
          "포장 주문이 완료되었습니다. 준비되면 바로 드릴게요. 감사합니다.",
        french:
          "La commande à emporter est bien enregistrée. Je vous la donne dès qu’elle est prête. Merci.",
        romanization:
          "Pojang jumuni wallyodoeeotseumnida. Junbidoemyeon baro deurilgeyo. Gamsahamnida.",
        videoSource: takeOutThanksVideo,
        nextNodeId: null,
      },
    },
  } as DialogueScenario,

  real: {
    startNodeId: "real_welcome",
    nodes: {
      real_welcome: {
        id: "real_welcome",
        type: "ia",
        korean: "어서 오세요~ 뭐 드릴까요?",
        french: "Bienvenue ! Qu’est-ce que je vous sers ?",
        romanization: "Eoseo oseyo~ Mwo deurilkkayo?",
        nextNodeId: "real_choice1",
      },
      real_here_end: {
        id: "real_here_end",
        type: "ia",
        korean:
          "네, 영수증 여기 있습니다. 진동벨 드릴게요. 자리에서 기다려 주세요.",
        french:
          "Très bien, voici votre reçu. Je vous donne le buzzer. Attendez à votre place s’il vous plaît.",
        romanization:
          "Ne, yeongsujeung yeogi itseumnida. Jindongbel deurilgeyo. Jarieseo gidaryeo juseyo.",
        nextNodeId: null,
      },

      real_choice1: {
        id: "real_choice1",
        type: "user_choice",
        choices: [
          {
            id: "real_order1",
            label: "Deux américanos glacés et un jus d’orange.",
            korean: "아이스 아메리카노 두 잔이랑 오렌지 주스 하나 주세요.",
            romanization:
              "Aiseu amerikano du janirang orenji juseu hana juseyo.",
            nextNodeId: "real_confirm",
          },
          {
            id: "real_order2",
            label: "Un latte glacé et un cheesecake.",
            korean: "아이스 라떼 하나랑 치즈케이크 하나 주세요.",
            romanization: "Aiseu ratte hanarang chijeu keikeu hana juseyo.",
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
          "네, 아이스 아메리카노 두 잔이랑 오렌지 주스 하나요. 매장에서 드세요, 가져가세요?",
        french:
          "D’accord, deux américanos glacés et un jus d’orange. Sur place ou à emporter ?",
        romanization:
          "Ne, aiseu amerikano du janirang orenji juseu hanayo. Maejangeseo deuseyo, gajyeogaseyo?",
        nextNodeId: "real_choice2",
      },

      real_confirm_alt: {
        id: "real_confirm_alt",
        type: "ia",
        korean:
          "네, 아이스 라떼 하나랑 치즈케이크 하나요. 매장에서 드세요, 가져가세요?",
        french:
          "D’accord, un latte glacé et un cheesecake. Sur place ou à emporter ?",
        romanization:
          "Ne, aiseu ratte hanarang chijeu keikeu hanayo. Maejangeseo deuseyo, gajyeogaseyo?",
        nextNodeId: "real_choice2",
      },

      real_choice2: {
        id: "real_choice2",
        type: "user_choice",
        choices: [
          {
            id: "real_here",
            label: "Sur place.",
            korean: "매장에서 먹고 갈게요.",
            romanization: "Maejangeseo meokgo galgeyo.",
            nextNodeId: "real_payment_here",
          },
          {
            id: "real_takeout",
            label: "À emporter.",
            korean: "가져갈게요.",
            romanization: "Gajyeogalgeyo.",
            nextNodeId: "real_payment_takeout",
          },
          {
            id: "repeat_real2",
            label: "Pouvez-vous répéter ?",
            korean: "다시 말씀해 주실래요?",
            romanization: "Dasi malsseumhae jusillaeyo?",
            nextNodeId: "real_confirm",
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
            korean: "카드요.",
            romanization: "Kadeuyo.",
            nextNodeId: "real_card_done_here",
          },
          {
            id: "real_cash_here",
            label: "En espèces.",
            korean: "현금이요.",
            romanization: "Hyeongeumiyo.",
            nextNodeId: "real_cash_done_here",
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
            korean: "카드요.",
            romanization: "Kadeuyo.",
            nextNodeId: "real_card_done_takeout",
          },
          {
            id: "real_cash_takeout",
            label: "En espèces.",
            korean: "현금이요.",
            romanization: "Hyeongeumiyo.",
            nextNodeId: "real_cash_done_takeout",
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

      real_card_done_here: {
        id: "real_card_done_here",
        type: "ia",
        korean: "네, 카드 여기 꽂아 주세요. 영수증 드릴까요?",
        french: "Très bien, insérez votre carte ici. Vous voulez le reçu ?",
        romanization: "Ne, kadeu yeogi kkoja juseyo. Yeongsujeung deurilkkayo?",
        nextNodeId: "real_receipt_choice_here",
      },

      real_cash_done_here: {
        id: "real_cash_done_here",
        type: "ia",
        korean: "네, 현금이요. 영수증 드릴까요?",
        french: "Très bien, en espèces. Vous voulez le reçu ?",
        romanization: "Ne, hyeongeumiyo. Yeongsujeung deurilkkayo?",
        nextNodeId: "real_receipt_choice_here",
      },

      real_card_done_takeout: {
        id: "real_card_done_takeout",
        type: "ia",
        korean: "네, 카드 여기 꽂아 주세요. 영수증 드릴까요?",
        french: "Très bien, insérez votre carte ici. Vous voulez le reçu ?",
        romanization: "Ne, kadeu yeogi kkoja juseyo. Yeongsujeung deurilkkayo?",
        nextNodeId: "real_receipt_choice_takeout",
      },

      real_cash_done_takeout: {
        id: "real_cash_done_takeout",
        type: "ia",
        korean: "네, 현금이요. 영수증 드릴까요?",
        french: "Très bien, en espèces. Vous voulez le reçu ?",
        romanization: "Ne, hyeongeumiyo. Yeongsujeung deurilkkayo?",
        nextNodeId: "real_receipt_choice_takeout",
      },

      real_receipt_choice_here: {
        id: "real_receipt_choice_here",
        type: "user_choice",
        choices: [
          {
            id: "real_receipt_yes_here",
            label: "Oui, le reçu.",
            korean: "영수증 주세요.",
            romanization: "Yeongsujeung juseyo.",
            nextNodeId: "real_here_end",
          },
          {
            id: "real_receipt_no_here",
            label: "Non, merci.",
            korean: "괜찮아요.",
            romanization: "Gwaenchanayo.",
            nextNodeId: "real_here_end",
          },
        ],
      },

      real_takeout_end: {
        id: "real_takeout_end",
        type: "ia",
        korean: "감사합니다. 포장 준비되면 바로 드릴게요.",
        french:
          "Merci. Je vous donne la commande à emporter dès qu’elle est prête.",
        romanization: "Gamsahamnida. Pojang junbidoemyeon baro deurilgeyo.",
        nextNodeId: null,
      },

      real_receipt_choice_takeout: {
        id: "real_receipt_choice_takeout",
        type: "user_choice",
        choices: [
          {
            id: "real_receipt_yes_takeout",
            label: "Oui, le reçu.",
            korean: "영수증 주세요.",
            romanization: "Yeongsujeung juseyo.",
            nextNodeId: "real_takeout_end",
          },
          {
            id: "real_receipt_no_takeout",
            label: "Non, merci.",
            korean: "괜찮아요.",
            romanization: "Gwaenchanayo.",
            nextNodeId: "real_takeout_end",
          },
        ],
      },
    },
  } as DialogueScenario,
} as const;
