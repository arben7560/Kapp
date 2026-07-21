import { GUIDED_REPEAT_REQUEST } from "../sharedPhrases";

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

export type RestaurantLine = {
  speaker: "Serveur" | "Client";
  korean: string;
  french: string;
  romanization?: string;
};

// Vidéos IA à ajouter plus tard si besoin, comme dans cafe.ts
// Exemple :
// const welcomeRestaurantVideo = require("../../../../assets/ai/restaurant/welcomeRestaurant.mp4");
// const recommendationVideo = require("../../../../assets/ai/restaurant/recommendation.mp4");
// const confirmSamgyeopsalVideo = require("../../../../assets/ai/restaurant/confirmSamgyeopsal.mp4");
// const confirmGalbiVideo = require("../../../../assets/ai/restaurant/confirmGalbi.mp4");
// const grillChoiceVideo = require("../../../../assets/ai/restaurant/grillChoice.mp4");
// const sideDishVideo = require("../../../../assets/ai/restaurant/sideDish.mp4");
// const spicyVideo = require("../../../../assets/ai/restaurant/spicy.mp4");
// const extraVideo = require("../../../../assets/ai/restaurant/extra.mp4");
// const paymentVideo = require("../../../../assets/ai/restaurant/payment.mp4");
// const receiptVideo = require("../../../../assets/ai/restaurant/receipt.mp4");
// const goodbyeVideo = require("../../../../assets/ai/restaurant/goodbye.mp4");

export const restaurantDialogueData = {
  scenarioTitle: "Commande dans un BBQ à Séoul",
  scenarioDescription:
    "Commander dans un restaurant de BBQ coréen, choisir la viande, demander de l’aide pour la cuisson, ajouter des accompagnements et payer naturellement.",

  pedagogical: {
    startNodeId: "ped_welcome",
    nodes: {
      ped_welcome: {
        id: "ped_welcome",
        type: "ia",
        korean: "어서 오세요. 주문 도와드릴게요. 어떤 메뉴로 드시겠어요?",
        french:
          "Bienvenue. Je vais vous aider pour la commande. Quel menu souhaitez-vous prendre ?",
        romanization:
          "Eoseo oseyo. Jumun dowadeurilgeyo. Eotteon menyuro deusigesseoyo?",
        nextNodeId: "ped_meat_choice",
      },

      ped_meat_choice: {
        id: "ped_meat_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_order_samgyeopsal",
            label: "Commander du samgyeopsal pour deux personnes.",
            korean: "삼겹살 2인분 주세요.",
            romanization: "Samgyeopsal i-inbun juseyo.",
            nextNodeId: "ped_confirm_samgyeopsal",
          },
          {
            id: "ped_order_galbi",
            label: "Commander du galbi pour deux personnes.",
            korean: "갈비 2인분 주세요.",
            romanization: "Galbi i-inbun juseyo.",
            nextNodeId: "ped_confirm_galbi",
          },
          {
            id: "ped_order_recommendation",
            label: "Demander une recommandation.",
            korean: "추천 메뉴가 있어요?",
            romanization: "Chucheon menyuga isseoyo?",
            nextNodeId: "ped_recommendation",
          },
          {
            id: "repeat_ped_welcome",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_welcome",
          },
        ],
      },

      ped_recommendation: {
        id: "ped_recommendation",
        type: "ia",
        korean:
          "네, 처음 오셨다면 삼겹살이나 갈비를 추천드려요. 둘 다 인기 메뉴입니다.",
        french:
          "Oui, si c’est votre première fois, je vous recommande le samgyeopsal ou le galbi. Ce sont deux menus populaires.",
        romanization:
          "Ne, cheoeum osyeotdamyeon samgyeopsarina galbireul chucheondeuryeoyo. Dul da ingi menyuimnida.",
        nextNodeId: "ped_after_recommendation_choice",
      },

      ped_after_recommendation_choice: {
        id: "ped_after_recommendation_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_reco_samgyeopsal",
            label: "Choisir le samgyeopsal.",
            korean: "그럼 삼겹살 2인분 주세요.",
            romanization: "Geureom samgyeopsal i-inbun juseyo.",
            nextNodeId: "ped_confirm_samgyeopsal",
          },
          {
            id: "ped_reco_galbi",
            label: "Choisir le galbi.",
            korean: "그럼 갈비 2인분 주세요.",
            romanization: "Geureom galbi i-inbun juseyo.",
            nextNodeId: "ped_confirm_galbi",
          },
          {
            id: "repeat_ped_recommendation",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_recommendation",
          },
        ],
      },

      ped_confirm_samgyeopsal: {
        id: "ped_confirm_samgyeopsal",
        type: "ia",
        korean:
          "네, 확인해 드릴게요. 삼겹살 2인분 맞으시죠? 직원이 고기를 구워 드릴까요?",
        french:
          "Très bien, je vérifie. Deux portions de samgyeopsal, c’est bien ça ? Voulez-vous que le personnel fasse griller la viande pour vous ?",
        romanization:
          "Ne, hwaginhae deurilgeyo. Samgyeopsal i-inbun majeusijyo? Jigwoni gogireul guwo deurilkkayo?",
        nextNodeId: "ped_grill_choice_samgyeopsal",
      },

      ped_confirm_galbi: {
        id: "ped_confirm_galbi",
        type: "ia",
        korean:
          "네, 확인해 드릴게요. 갈비 2인분 맞으시죠? 직원이 고기를 구워 드릴까요?",
        french:
          "Très bien, je vérifie. Deux portions de galbi, c’est bien ça ? Voulez-vous que le personnel fasse griller la viande pour vous ?",
        romanization:
          "Ne, hwaginhae deurilgeyo. Galbi i-inbun majeusijyo? Jigwoni gogireul guwo deurilkkayo?",
        nextNodeId: "ped_grill_choice_galbi",
      },

      ped_grill_choice_samgyeopsal: {
        id: "ped_grill_choice_samgyeopsal",
        type: "user_choice",
        choices: [
          {
            id: "ped_staff_grill_samgyeopsal",
            label: "Oui, faites griller la viande pour nous.",
            korean: "네, 구워 주세요.",
            romanization: "Ne, guwo juseyo.",
            nextNodeId: "ped_side_prompt",
          },
          {
            id: "ped_self_grill_samgyeopsal",
            label: "Nous allons la griller nous-mêmes.",
            korean: "저희가 구울게요.",
            romanization: "Jeohuiga guulgeyo.",
            nextNodeId: "ped_side_prompt",
          },
          {
            id: "repeat_ped_confirm_samgyeopsal",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_confirm_samgyeopsal",
          },
        ],
      },

      ped_grill_choice_galbi: {
        id: "ped_grill_choice_galbi",
        type: "user_choice",
        choices: [
          {
            id: "ped_staff_grill_galbi",
            label: "Oui, faites griller la viande pour nous.",
            korean: "네, 구워 주세요.",
            romanization: "Ne, guwo juseyo.",
            nextNodeId: "ped_side_prompt",
          },
          {
            id: "ped_self_grill_galbi",
            label: "Nous allons la griller nous-mêmes.",
            korean: "저희가 구울게요.",
            romanization: "Jeohuiga guulgeyo.",
            nextNodeId: "ped_side_prompt",
          },
          {
            id: "repeat_ped_confirm_galbi",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_confirm_galbi",
          },
        ],
      },

      ped_side_prompt: {
        id: "ped_side_prompt",
        type: "ia",
        korean: "네, 알겠습니다. 된장찌개나 계란찜도 같이 드시겠어요?",
        french:
          "Très bien. Souhaitez-vous aussi prendre un doenjang jjigae ou des œufs vapeur avec ça ?",
        romanization:
          "Ne, algesseumnida. Doenjangjjigaena gyeranjjimdo gachi deusigesseoyo?",
        nextNodeId: "ped_side_choice",
      },

      ped_side_choice: {
        id: "ped_side_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_add_doenjang",
            label: "Ajouter un doenjang jjigae.",
            korean: "된장찌개 하나 주세요.",
            romanization: "Doenjangjjigae hana juseyo.",
            nextNodeId: "ped_spicy_prompt",
          },
          {
            id: "ped_add_egg",
            label: "Ajouter des œufs vapeur.",
            korean: "계란찜 하나 주세요.",
            romanization: "Gyeranjjim hana juseyo.",
            nextNodeId: "ped_extra_prompt",
          },
          {
            id: "ped_no_side",
            label: "Non, merci.",
            korean: "아니요, 괜찮아요.",
            romanization: "Aniyo, gwaenchanayo.",
            nextNodeId: "ped_extra_prompt",
          },
          {
            id: "repeat_ped_side",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_side_prompt",
          },
        ],
      },

      ped_spicy_prompt: {
        id: "ped_spicy_prompt",
        type: "ia",
        korean: "찌개는 맵게 해 드릴까요, 아니면 덜 맵게 해 드릴까요?",
        french: "Pour le ragoût, vous le voulez épicé ou moins épicé ?",
        romanization:
          "Jjigaeneun maepge hae deurilkkayo, animyeon deol maepge hae deurilkkayo?",
        nextNodeId: "ped_spicy_choice",
      },

      ped_spicy_choice: {
        id: "ped_spicy_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_spicy",
            label: "Épicé.",
            korean: "맵게 해 주세요.",
            romanization: "Maepge hae juseyo.",
            nextNodeId: "ped_extra_prompt",
          },
          {
            id: "ped_less_spicy",
            label: "Moins épicé.",
            korean: "덜 맵게 해 주세요.",
            romanization: "Deol maepge hae juseyo.",
            nextNodeId: "ped_extra_prompt",
          },
          {
            id: "ped_not_spicy",
            label: "Pas épicé.",
            korean: "안 맵게 해 주세요.",
            romanization: "An maepge hae juseyo.",
            nextNodeId: "ped_extra_prompt",
          },
          {
            id: "repeat_ped_spicy",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_spicy_prompt",
          },
        ],
      },

      ped_extra_prompt: {
        id: "ped_extra_prompt",
        type: "ia",
        korean:
          "네, 준비해 드리겠습니다. 상추나 반찬 더 필요하시면 말씀해 주세요.",
        french:
          "Très bien, je vais préparer ça. Dites-moi si vous avez besoin de plus de salade ou d’accompagnements.",
        romanization:
          "Ne, junbihae deurigesseumnida. Sangchuna banchan deo piryohasimyeon malsseumhae juseyo.",
        nextNodeId: "ped_extra_choice",
      },

      ped_extra_choice: {
        id: "ped_extra_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_more_lettuce",
            label: "Demander plus de salade.",
            korean: "상추 좀 더 주세요.",
            romanization: "Sangchu jom deo juseyo.",
            nextNodeId: "ped_extra_bring",
          },
          {
            id: "ped_more_banchan",
            label: "Demander plus d’accompagnements.",
            korean: "반찬 좀 더 주세요.",
            romanization: "Banchan jom deo juseyo.",
            nextNodeId: "ped_extra_bring",
          },
          {
            id: "ped_no_extra",
            label: "Dire que tout va bien.",
            korean: "괜찮아요.",
            romanization: "Gwaenchanayo.",
            nextNodeId: "ped_payment_prompt",
          },
          {
            id: "repeat_ped_extra",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_extra_prompt",
          },
        ],
      },

      ped_extra_bring: {
        id: "ped_extra_bring",
        type: "ia",
        korean: "네, 바로 가져다드릴게요.",
        french: "Bien sûr, je vous apporte ça tout de suite.",
        romanization: "Ne, baro gajyeodadeurilgeyo.",
        nextNodeId: "ped_payment_prompt",
      },

      ped_payment_prompt: {
        id: "ped_payment_prompt",
        type: "ia",
        korean:
          "식사 맛있게 하셨나요? 계산 도와드릴게요. 카드로 결제하시겠어요, 아니면 현금으로 하시겠어요?",
        french:
          "Le repas vous a plu ? Je vais vous aider pour le paiement. Vous souhaitez payer par carte ou en espèces ?",
        romanization:
          "Siksa masitge hasyeonnayo? Gyesan dowadeurilgeyo. Kadeuro gyeoljehasigesseoyo, animyeon hyeongeumeuro hasigesseoyo?",
        nextNodeId: "ped_payment_choice",
      },

      ped_payment_choice: {
        id: "ped_payment_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_pay_card",
            label: "Payer par carte.",
            korean: "카드로 할게요.",
            romanization: "Kadeuro halgeyo.",
            nextNodeId: "ped_receipt_card",
          },
          {
            id: "ped_pay_cash",
            label: "Payer en espèces.",
            korean: "현금으로 할게요.",
            romanization: "Hyeongeumeuro halgeyo.",
            nextNodeId: "ped_receipt_cash",
          },
          {
            id: "repeat_ped_payment",
            ...GUIDED_REPEAT_REQUEST,
            nextNodeId: "ped_payment_prompt",
          },
        ],
      },

      ped_receipt_card: {
        id: "ped_receipt_card",
        type: "ia",
        korean: "네, 카드 결제 도와드릴게요. 영수증 필요하세요?",
        french:
          "Très bien, je lance le paiement par carte. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, kadeu gyeolje dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        nextNodeId: "ped_receipt_choice",
      },

      ped_receipt_cash: {
        id: "ped_receipt_cash",
        type: "ia",
        korean: "네, 현금으로 도와드릴게요. 영수증 필요하세요?",
        french: "Très bien, en espèces. Avez-vous besoin du reçu ?",
        romanization:
          "Ne, hyeongeumeuro dowadeurilgeyo. Yeongsujeung piryohaseyo?",
        nextNodeId: "ped_receipt_choice",
      },

      ped_receipt_choice: {
        id: "ped_receipt_choice",
        type: "user_choice",
        choices: [
          {
            id: "ped_receipt_yes",
            label: "Oui, s’il vous plaît.",
            korean: "네, 주세요.",
            romanization: "Ne, juseyo.",
            nextNodeId: "ped_goodbye",
          },
          {
            id: "ped_receipt_no",
            label: "Non, merci.",
            korean: "아니요, 괜찮아요.",
            romanization: "Aniyo, gwaenchanayo.",
            nextNodeId: "ped_goodbye",
          },
        ],
      },

      ped_goodbye: {
        id: "ped_goodbye",
        type: "ia",
        korean: "감사합니다. 좋은 하루 보내세요.",
        french: "Merci. Passez une bonne journée.",
        romanization: "Gamsahamnida. Joeun haru bonaeseyo.",
        nextNodeId: null,
      },
    },
  } as DialogueScenario,

  serverLines: [
    {
      speaker: "Serveur",
      korean: "어서 오세요.",
      french: "Bienvenue.",
      romanization: "Eoseo oseyo.",
    },
    {
      speaker: "Serveur",
      korean: "주문 도와드릴게요.",
      french: "Je vais vous aider pour la commande.",
      romanization: "Jumun dowadeurilgeyo.",
    },
    {
      speaker: "Serveur",
      korean: "어떤 메뉴로 드시겠어요?",
      french: "Quel menu souhaitez-vous prendre ?",
      romanization: "Eotteon menyuro deusigesseoyo?",
    },
    {
      speaker: "Serveur",
      korean: "삼겹살이나 갈비를 추천드려요.",
      french: "Je vous recommande le samgyeopsal ou le galbi.",
      romanization: "Samgyeopsarina galbireul chucheondeuryeoyo.",
    },
    {
      speaker: "Serveur",
      korean: "직원이 고기를 구워 드릴까요?",
      french:
        "Voulez-vous que le personnel fasse griller la viande pour vous ?",
      romanization: "Jigwoni gogireul guwo deurilkkayo?",
    },
    {
      speaker: "Serveur",
      korean: "된장찌개나 계란찜도 같이 드시겠어요?",
      french: "Souhaitez-vous aussi un ragoût ou des œufs vapeur avec ça ?",
      romanization: "Doenjangjjigaena gyeranjjimdo gachi deusigesseoyo?",
    },
    {
      speaker: "Serveur",
      korean: "찌개는 맵게 해 드릴까요?",
      french: "Pour le ragoût, vous le voulez épicé ?",
      romanization: "Jjigaeneun maepge hae deurilkkayo?",
    },
    {
      speaker: "Serveur",
      korean: "상추나 반찬 더 필요하세요?",
      french: "Vous avez besoin de plus de salade ou d’accompagnements ?",
      romanization: "Sangchuna banchan deo piryohaseyo?",
    },
    {
      speaker: "Serveur",
      korean: "계산 도와드릴게요.",
      french: "Je vais vous aider pour le paiement.",
      romanization: "Gyesan dowadeurilgeyo.",
    },
    {
      speaker: "Serveur",
      korean: "영수증 필요하세요?",
      french: "Avez-vous besoin du reçu ?",
      romanization: "Yeongsujeung piryohaseyo?",
    },
    {
      speaker: "Serveur",
      korean: "감사합니다. 좋은 하루 보내세요.",
      french: "Merci. Passez une bonne journée.",
      romanization: "Gamsahamnida. Joeun haru bonaeseyo.",
    },
  ] satisfies RestaurantLine[],

  clientLines: [
    {
      speaker: "Client",
      korean: "삼겹살 2인분 주세요.",
      french: "Deux portions de samgyeopsal, s’il vous plaît.",
      romanization: "Samgyeopsal i-inbun juseyo.",
    },
    {
      speaker: "Client",
      korean: "갈비 2인분 주세요.",
      french: "Deux portions de galbi, s’il vous plaît.",
      romanization: "Galbi i-inbun juseyo.",
    },
    {
      speaker: "Client",
      korean: "추천 메뉴가 있어요?",
      french: "Vous avez un menu recommandé ?",
      romanization: "Chucheon menyuga isseoyo?",
    },
    {
      speaker: "Client",
      korean: "그럼 삼겹살 2인분 주세요.",
      french: "Alors deux portions de samgyeopsal, s’il vous plaît.",
      romanization: "Geureom samgyeopsal i-inbun juseyo.",
    },
    {
      speaker: "Client",
      korean: "그럼 갈비 2인분 주세요.",
      french: "Alors deux portions de galbi, s’il vous plaît.",
      romanization: "Geureom galbi i-inbun juseyo.",
    },
    {
      speaker: "Client",
      korean: "네, 구워 주세요.",
      french: "Oui, faites-la griller pour nous.",
      romanization: "Ne, guwo juseyo.",
    },
    {
      speaker: "Client",
      korean: "저희가 구울게요.",
      french: "Nous allons la griller nous-mêmes.",
      romanization: "Jeohuiga guulgeyo.",
    },
    {
      speaker: "Client",
      korean: "된장찌개 하나 주세요.",
      french: "Un doenjang jjigae, s’il vous plaît.",
      romanization: "Doenjangjjigae hana juseyo.",
    },
    {
      speaker: "Client",
      korean: "계란찜 하나 주세요.",
      french: "Des œufs vapeur, s’il vous plaît.",
      romanization: "Gyeranjjim hana juseyo.",
    },
    {
      speaker: "Client",
      korean: "맵게 해 주세요.",
      french: "Épicé, s’il vous plaît.",
      romanization: "Maepge hae juseyo.",
    },
    {
      speaker: "Client",
      korean: "덜 맵게 해 주세요.",
      french: "Moins épicé, s’il vous plaît.",
      romanization: "Deol maepge hae juseyo.",
    },
    {
      speaker: "Client",
      korean: "안 맵게 해 주세요.",
      french: "Pas épicé, s’il vous plaît.",
      romanization: "An maepge hae juseyo.",
    },
    {
      speaker: "Client",
      korean: "상추 좀 더 주세요.",
      french: "Un peu plus de salade, s’il vous plaît.",
      romanization: "Sangchu jom deo juseyo.",
    },
    {
      speaker: "Client",
      korean: "반찬 좀 더 주세요.",
      french: "Un peu plus d’accompagnements, s’il vous plaît.",
      romanization: "Banchan jom deo juseyo.",
    },
    {
      speaker: "Client",
      korean: "괜찮아요.",
      french: "Ça va / Non merci.",
      romanization: "Gwaenchanayo.",
    },
    {
      speaker: "Client",
      korean: "카드로 할게요.",
      french: "Je vais payer par carte.",
      romanization: "Kadeuro halgeyo.",
    },
    {
      speaker: "Client",
      korean: "현금으로 할게요.",
      french: "Je vais payer en espèces.",
      romanization: "Hyeongeumeuro halgeyo.",
    },
    {
      speaker: "Client",
      korean: "네, 주세요.",
      french: "Oui, s’il vous plaît.",
      romanization: "Ne, juseyo.",
    },
    {
      speaker: "Client",
      korean: "아니요, 괜찮아요.",
      french: "Non, merci.",
      romanization: "Aniyo, gwaenchanayo.",
    },
    {
      speaker: "Client",
      korean: "다시 한번 말씀해 주시겠어요?",
      french: "Pouvez-vous répéter, s’il vous plaît ?",
      romanization: "Dasi hanbeon malsseumhae jusigesseoyo?",
    },
  ] satisfies RestaurantLine[],

  miniDialogues: [
    {
      title: "Dialogue 1 - commander de la viande",
      lines: [
        {
          speaker: "Serveur",
          korean: "어서 오세요. 주문 도와드릴게요.",
          french: "Bienvenue. Je vais vous aider pour la commande.",
        },
        {
          speaker: "Serveur",
          korean: "어떤 메뉴로 드시겠어요?",
          french: "Quel menu souhaitez-vous prendre ?",
        },
        {
          speaker: "Client",
          korean: "삼겹살 2인분 주세요.",
          french: "Deux portions de samgyeopsal, s’il vous plaît.",
        },
        {
          speaker: "Serveur",
          korean: "네, 삼겹살 2인분 맞으시죠?",
          french: "Très bien, deux portions de samgyeopsal, c’est bien ça ?",
        },
      ] satisfies RestaurantLine[],
    },
    {
      title: "Dialogue 2 - demander une recommandation",
      lines: [
        {
          speaker: "Client",
          korean: "추천 메뉴가 있어요?",
          french: "Vous avez un menu recommandé ?",
        },
        {
          speaker: "Serveur",
          korean: "삼겹살이나 갈비를 추천드려요.",
          french: "Je vous recommande le samgyeopsal ou le galbi.",
        },
        {
          speaker: "Client",
          korean: "그럼 갈비 2인분 주세요.",
          french: "Alors deux portions de galbi, s’il vous plaît.",
        },
      ] satisfies RestaurantLine[],
    },
    {
      title: "Dialogue 3 - faire griller la viande",
      lines: [
        {
          speaker: "Serveur",
          korean: "직원이 고기를 구워 드릴까요?",
          french:
            "Voulez-vous que le personnel fasse griller la viande pour vous ?",
        },
        {
          speaker: "Client",
          korean: "네, 구워 주세요.",
          french: "Oui, faites-la griller pour nous.",
        },
        {
          speaker: "Serveur",
          korean: "네, 알겠습니다.",
          french: "Très bien, compris.",
        },
      ] satisfies RestaurantLine[],
    },
    {
      title: "Dialogue 4 - demander des accompagnements",
      lines: [
        {
          speaker: "Serveur",
          korean: "상추나 반찬 더 필요하세요?",
          french: "Vous avez besoin de plus de salade ou d’accompagnements ?",
        },
        {
          speaker: "Client",
          korean: "상추 좀 더 주세요.",
          french: "Un peu plus de salade, s’il vous plaît.",
        },
        {
          speaker: "Serveur",
          korean: "네, 바로 가져다드릴게요.",
          french: "Bien sûr, je vous apporte ça tout de suite.",
        },
      ] satisfies RestaurantLine[],
    },
    {
      title: "Dialogue 5 - payer",
      lines: [
        {
          speaker: "Serveur",
          korean: "계산 도와드릴게요.",
          french: "Je vais vous aider pour le paiement.",
        },
        {
          speaker: "Client",
          korean: "카드로 할게요.",
          french: "Je vais payer par carte.",
        },
        {
          speaker: "Serveur",
          korean: "네, 카드 결제 도와드릴게요. 영수증 필요하세요?",
          french:
            "Très bien, je lance le paiement par carte. Avez-vous besoin du reçu ?",
        },
        {
          speaker: "Client",
          korean: "아니요, 괜찮아요.",
          french: "Non, merci.",
        },
      ] satisfies RestaurantLine[],
    },
  ],
} as const;
