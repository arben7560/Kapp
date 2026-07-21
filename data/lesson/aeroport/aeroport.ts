// app/data/lesson/aeroport/aeroport.ts

import { GUIDED_REPEAT_REQUEST } from "../sharedPhrases";

export const aeroportDialogueData = {
  scenarioTitle: "Aéroport d'Incheon → Seoul Station",
  scenarioDescription:
    "Vous venez d'arriver au Terminal 1. Vous avez récupéré vos bagages et voulez rejoindre Seoul Station en train.",
  startNodeId: "user_start",

  nodes: {
    user_start: {
      id: "user_start",
      type: "user_choice",
      choices: [
        {
          id: "choice_ask_seoul_station",
          label: "Excusez-moi, comment aller à Seoul Station ?",
          korean: "실례합니다, 서울역까지 어떻게 가요?",
          romanization: "Sillyehamnida, Seoul-yeokkkaji eotteoke gayo?",
          nextNodeId: "ia_welcome",
        },
        {
          id: "choice_ask_arex",
          label: "Où puis-je prendre l’AREX pour Seoul Station ?",
          korean: "서울역 가는 공항철도는 어디에서 탈 수 있나요?",
          romanization:
            "Seoul-yeok ganeun gonghangcheoldo-neun eodieseo tal su innayo?",
          nextNodeId: "ia_welcome",
        },
        {
          id: "choice_want_seoul_station",
          label: "Je voudrais aller à Seoul Station.",
          korean: "서울역에 가고 싶어요.",
          romanization: "Seoul-yeoge gago sipeoyo.",
          nextNodeId: "ia_welcome",
        },
      ],
    },

    ia_welcome: {
      id: "ia_welcome",
      type: "ia",
      korean:
        "네, 서울역에 가시려면 AREX 공항철도를 이용하시면 됩니다. 지하 1층 교통센터로 가시면 돼요.",
      french:
        "Oui, pour aller à Seoul Station, vous pouvez prendre l’AREX. Allez au centre de transport au sous-sol 1.",
      romanization:
        "Ne, Seoul-yeoge gasiryeomyeon AREX gonghangcheoldoreul iyonghasimyeon doemnida. Jiha ilcheung gyotongsenteo-ro gasimyeon dwaeyo.",
      nextNodeId: "user_after_welcome",
    },

    user_after_welcome: {
      id: "user_after_welcome",
      type: "user_choice",
      choices: [
        {
          id: "choice_ready",
          label: "D’accord. Comment je fais ensuite ?",
          korean: "알겠어요. 그다음 어떻게 하면 돼요?",
          romanization: "Algesseoyo. Geuda-eum eotteoke hamyeon dwaeyo?",
          nextNodeId: "ia_transport",
        },
        {
          id: "choice_tmoney",
          label: "Je voudrais acheter une carte T-money.",
          korean: "티머니 카드를 사고 싶어요.",
          romanization: "T-money kadeureul sago sipeoyo.",
          nextNodeId: "ia_tmoney",
        },
        {
          id: "repeat_welcome",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_welcome_repeat",
        },
      ],
    },

    ia_welcome_repeat: {
      id: "ia_welcome_repeat",
      type: "ia",
      korean:
        "네. 서울역에 가려면 지하 1층 교통센터로 가서 Airport Railroad 표지판을 따라가세요.",
      french:
        "Oui. Pour aller à Seoul Station, allez au centre de transport au sous-sol 1 et suivez les panneaux Airport Railroad.",
      romanization:
        "Ne. Seoul-yeoge garyeomyeon jiha ilcheung gyotongsenteo-ro gaseo Airport Railroad pyojipaneul ttaragaseyo.",
      nextNodeId: "user_after_welcome",
    },

    ia_transport: {
      id: "ia_transport",
      type: "ia",
      korean:
        "지하 1층으로 내려가셔서 Airport Railroad 표지판을 따라가세요. 서울역 직통열차와 일반열차가 있어요.",
      french:
        "Descendez au sous-sol 1 et suivez les panneaux Airport Railroad. Il y a le train direct et le train avec arrêts pour Seoul Station.",
      romanization:
        "Jiha ilcheung-euro naeryeogasyeoseo Airport Railroad pyojipaneul ttaragaseyo. Seoul-yeok jiktongyeolcha-wa ilbanyeolcha-ga isseoyo.",
      nextNodeId: "user_after_transport",
    },

    user_after_transport: {
      id: "user_after_transport",
      type: "user_choice",
      choices: [
        {
          id: "choice_which_train",
          label: "Quel train est le mieux ?",
          korean: "어느 열차를 타는 게 좋을까요?",
          romanization: "Eoneu yeolchareul taneun ge joheulkkayo?",
          nextNodeId: "ia_recommend",
        },
        {
          id: "choice_platform",
          label: "Où se trouve le quai ?",
          korean: "플랫폼은 어디예요?",
          romanization: "Peullaetpom-eun eodiyeyo?",
          nextNodeId: "ia_platform",
        },
        {
          id: "repeat_transport",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_transport_repeat",
        },
      ],
    },

    ia_transport_repeat: {
      id: "ia_transport_repeat",
      type: "ia",
      korean:
        "네. 지하 1층으로 내려가서 Airport Railroad 표지판을 따라가시면 됩니다.",
      french:
        "Oui. Descendez au sous-sol 1 et suivez les panneaux Airport Railroad.",
      romanization:
        "Ne. Jiha ilcheung-euro naeryeogaseo Airport Railroad pyojipaneul ttaragasimyeon doemnida.",
      nextNodeId: "user_after_transport",
    },

    ia_tmoney: {
      id: "ia_tmoney",
      type: "ia",
      korean:
        "티머니 카드는 지하 1층 교통센터나 편의점에서 구매하실 수 있어요. 처음에는 1만 원 정도 충전하시면 충분합니다.",
      french:
        "Vous pouvez acheter une carte T-money au centre de transport au sous-sol 1 ou dans une supérette. Pour commencer, environ 10 000 wons suffisent.",
      romanization:
        "T-money kadeu-neun jiha ilcheung gyotongsenteo-na pyeonuijeom-eseo gumaehasil su isseoyo. Cheoeum-eneun man won jeongdo chungjeonhasimyeon chungbunhamnida.",
      nextNodeId: "user_after_tmoney",
    },

    user_after_tmoney: {
      id: "user_after_tmoney",
      type: "user_choice",
      choices: [
        {
          id: "choice_charge",
          label: "Comment je peux la recharger ?",
          korean: "어떻게 충전할 수 있어요?",
          romanization: "Eotteoke chungjeonhal su isseoyo?",
          nextNodeId: "ia_tmoney_charge",
        },
        {
          id: "choice_tmoney_arex",
          label: "Je peux prendre l’AREX avec la T-money ?",
          korean: "티머니로 공항철도를 탈 수 있어요?",
          romanization: "T-money-ro gonghangcheoldoreul tal su isseoyo?",
          nextNodeId: "ia_tmoney_arex",
        },
        {
          id: "repeat_tmoney",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_tmoney_repeat",
        },
      ],
    },

    ia_tmoney_repeat: {
      id: "ia_tmoney_repeat",
      type: "ia",
      korean:
        "네. 티머니 카드는 교통센터나 편의점에서 살 수 있고, 1만 원 정도 충전하시면 좋아요.",
      french:
        "Oui. Vous pouvez acheter une T-money au centre de transport ou dans une supérette, puis recharger environ 10 000 wons.",
      romanization:
        "Ne. T-money kadeu-neun gyotongsenteo-na pyeonuijeom-eseo sal su itgo, man won jeongdo chungjeonhasimyeon joayo.",
      nextNodeId: "user_after_tmoney",
    },

    ia_tmoney_charge: {
      id: "ia_tmoney_charge",
      type: "ia",
      korean:
        "편의점이나 충전기에서 충전할 수 있어요. 처음에는 1만 원 정도 넣으시면 충분합니다.",
      french:
        "Vous pouvez la recharger dans une supérette ou sur une machine de recharge. Pour commencer, environ 10 000 wons suffisent.",
      romanization:
        "Pyeonuijeom-ina chungjeongi-eseo chungjeonhal su isseoyo. Cheoeum-eneun man won jeongdo neoeusimyeon chungbunhamnida.",
      nextNodeId: "user_after_tmoney_charge",
    },

    user_after_tmoney_charge: {
      id: "user_after_tmoney_charge",
      type: "user_choice",
      choices: [
        {
          id: "choice_train_after_charge",
          label: "Et ensuite, quel train je dois prendre ?",
          korean: "그다음 어떤 열차를 타야 해요?",
          romanization: "Geuda-eum eotteon yeolchareul taya haeyo?",
          nextNodeId: "ia_recommend",
        },
        {
          id: "choice_platform_after_charge",
          label: "Où se trouve le quai ?",
          korean: "플랫폼은 어디예요?",
          romanization: "Peullaetpom-eun eodiyeyo?",
          nextNodeId: "ia_platform",
        },
        {
          id: "repeat_tmoney_charge",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_tmoney_charge_repeat",
        },
      ],
    },

    ia_tmoney_charge_repeat: {
      id: "ia_tmoney_charge_repeat",
      type: "ia",
      korean:
        "네. 편의점이나 충전기에서 충전하세요. 처음에는 1만 원 정도면 충분해요.",
      french:
        "Oui. Rechargez-la dans une supérette ou sur une machine. Pour commencer, 10 000 wons suffisent.",
      romanization:
        "Ne. Pyeonuijeom-ina chungjeongi-eseo chungjeonhaseyo. Cheoeum-eneun man won jeongdo-myeon chungbunhaeyo.",
      nextNodeId: "user_after_tmoney_charge",
    },

    ia_tmoney_arex: {
      id: "ia_tmoney_arex",
      type: "ia",
      korean:
        "네, 티머니로 일반열차를 이용하실 수 있어요. 하지만 직통열차는 별도 승차권이 필요합니다.",
      french:
        "Oui, vous pouvez prendre le train avec arrêts avec la T-money. Mais le train direct nécessite un billet séparé.",
      romanization:
        "Ne, T-money-ro ilbanyeolchareul iyonghasil su isseoyo. Hajiman jiktongyeolcha-neun byeoldo seungchagwon-i piryohamnida.",
      nextNodeId: "user_after_tmoney_arex",
    },

    user_after_tmoney_arex: {
      id: "user_after_tmoney_arex",
      type: "user_choice",
      choices: [
        {
          id: "choice_recommend_after_tmoney_arex",
          label: "Quel train me conseillez-vous ?",
          korean: "어느 열차를 추천하세요?",
          romanization: "Eoneu yeolchareul chucheonhaseyo?",
          nextNodeId: "ia_recommend",
        },
        {
          id: "choice_platform_after_tmoney_arex",
          label: "Où est le quai du train avec arrêts ?",
          korean: "일반열차 플랫폼은 어디예요?",
          romanization: "Ilbanyeolcha peullaetpom-eun eodiyeyo?",
          nextNodeId: "ia_platform",
        },
        {
          id: "repeat_tmoney_arex",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_tmoney_arex_repeat",
        },
      ],
    },

    ia_tmoney_arex_repeat: {
      id: "ia_tmoney_arex_repeat",
      type: "ia",
      korean:
        "네. 티머니로는 일반열차를 타시면 됩니다. 직통열차는 따로 표를 사야 해요.",
      french:
        "Oui. Avec la T-money, prenez le train avec arrêts. Pour le train direct, il faut acheter un billet séparé.",
      romanization:
        "Ne. T-money-ro-neun ilbanyeolchareul tasimyeon doemnida. Jiktongyeolcha-neun ttaro pyoreul saya haeyo.",
      nextNodeId: "user_after_tmoney_arex",
    },

    ia_recommend: {
      id: "ia_recommend",
      type: "ia",
      korean:
        "티머니를 사용하시면 일반열차를 추천드려요. 직통열차는 더 빠르지만 별도 표가 필요합니다.",
      french:
        "Si vous utilisez une T-money, je vous recommande le train avec arrêts. Le train direct est plus rapide, mais il nécessite un billet séparé.",
      romanization:
        "T-money-reul sayonghasimyeon ilbanyeolchareul chucheondeuryeoyo. Jiktongyeolcha-neun deo ppareujiman byeoldo pyo-ga piryohamnida.",
      nextNodeId: "user_after_recommend",
    },

    user_after_recommend: {
      id: "user_after_recommend",
      type: "user_choice",
      choices: [
        {
          id: "choice_platform_after_recommend",
          label: "Où se trouve le quai ?",
          korean: "플랫폼은 어디예요?",
          romanization: "Peullaetpom-eun eodiyeyo?",
          nextNodeId: "ia_platform",
        },
        {
          id: "choice_time_after_recommend",
          label: "Combien de temps jusqu’à Seoul Station ?",
          korean: "서울역까지 얼마나 걸려요?",
          romanization: "Seoul-yeokkkaji eolmana geollyeoyo?",
          nextNodeId: "ia_time",
        },
        {
          id: "repeat_recommend",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_recommend_repeat",
        },
      ],
    },

    ia_recommend_repeat: {
      id: "ia_recommend_repeat",
      type: "ia",
      korean:
        "네. 티머니가 있으면 일반열차를 타세요. 직통열차는 따로 표가 필요해요.",
      french:
        "Oui. Si vous avez une T-money, prenez le train avec arrêts. Le train direct nécessite un billet séparé.",
      romanization:
        "Ne. T-money-ga isseumyeon ilbanyeolchareul taseyo. Jiktongyeolcha-neun ttaro pyo-ga piryohaeyo.",
      nextNodeId: "user_after_recommend",
    },

    ia_platform: {
      id: "ia_platform",
      type: "ia",
      korean:
        "지하 1층에서 Airport Railroad 표지판을 따라가시면 됩니다. 플랫폼에 도착하면 서울역 방향인지 확인하세요.",
      french:
        "Au sous-sol 1, suivez les panneaux Airport Railroad. Une fois sur le quai, vérifiez que c’est bien la direction Seoul Station.",
      romanization:
        "Jiha ilcheung-eseo Airport Railroad pyojipaneul ttaragasimyeon doemnida. Peullaetpom-e dochakhamyeon Seoul-yeok banghyang-inji hwaginhaseyo.",
      nextNodeId: "user_after_platform",
    },

    user_after_platform: {
      id: "user_after_platform",
      type: "user_choice",
      choices: [
        {
          id: "choice_verify_train",
          label: "Comment vérifier que c’est le bon train ?",
          korean: "맞는 열차인지 어떻게 확인해요?",
          romanization: "Matneun yeolcha-inji eotteoke hwaginhaeyo?",
          nextNodeId: "ia_verify_train",
        },
        {
          id: "choice_time_after_platform",
          label: "Combien de temps jusqu’à Seoul Station ?",
          korean: "서울역까지 얼마나 걸려요?",
          romanization: "Seoul-yeokkkaji eolmana geollyeoyo?",
          nextNodeId: "ia_time",
        },
        {
          id: "repeat_platform",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_platform_repeat",
        },
      ],
    },

    ia_platform_repeat: {
      id: "ia_platform_repeat",
      type: "ia",
      korean:
        "네. 지하 1층에서 Airport Railroad 표지판을 따라가세요. 그리고 서울역 방향을 확인하세요.",
      french:
        "Oui. Au sous-sol 1, suivez les panneaux Airport Railroad. Puis vérifiez la direction Seoul Station.",
      romanization:
        "Ne. Jiha ilcheung-eseo Airport Railroad pyojipaneul ttaragaseyo. Geurigo Seoul-yeok banghyang-eul hwaginhaseyo.",
      nextNodeId: "user_after_platform",
    },

    ia_verify_train: {
      id: "ia_verify_train",
      type: "ia",
      korean:
        "플랫폼 전광판을 보세요. Seoul Station이나 서울역 방향이라고 나오면 맞는 방향이에요.",
      french:
        "Regardez l’écran du quai. Si vous voyez Seoul Station ou la direction 서울역, c’est le bon sens.",
      romanization:
        "Peullaetpom jeon-gwangpan-eul boseyo. Seoul Station-ina Seoul-yeok banghyang-irago naomyeon matneun banghyang-ieyo.",
      nextNodeId: "user_after_verify_train",
    },

    user_after_verify_train: {
      id: "user_after_verify_train",
      type: "user_choice",
      choices: [
        {
          id: "choice_time_after_verify",
          label: "Combien de temps jusqu’à Seoul Station ?",
          korean: "서울역까지 얼마나 걸려요?",
          romanization: "Seoul-yeokkkaji eolmana geollyeoyo?",
          nextNodeId: "ia_time",
        },
        {
          id: "choice_lost_after_verify",
          label: "Et si je me perds ?",
          korean: "길을 잃으면 어떻게 해요?",
          romanization: "Gireul ireumyeon eotteoke haeyo?",
          nextNodeId: "ia_lost",
        },
        {
          id: "repeat_verify_train",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_verify_train_repeat",
        },
      ],
    },

    ia_verify_train_repeat: {
      id: "ia_verify_train_repeat",
      type: "ia",
      korean:
        "네. 전광판에서 Seoul Station 또는 서울역 방향을 확인하시면 됩니다.",
      french:
        "Oui. Vérifiez simplement Seoul Station ou la direction 서울역 sur l’écran.",
      romanization:
        "Ne. Jeon-gwangpan-eseo Seoul Station ttoneun Seoul-yeok banghyang-eul hwaginhasimyeon doemnida.",
      nextNodeId: "user_after_verify_train",
    },

    ia_time: {
      id: "ia_time",
      type: "ia",
      korean: "일반열차는 약 한 시간, 직통열차는 43분 정도 걸립니다.",
      french:
        "Le train avec arrêts met environ une heure. Le train direct prend environ 43 minutes.",
      romanization:
        "Ilbanyeolcha-neun yak han sigan, jiktongyeolcha-neun sasipsam bun jeongdo geollimnida.",
      nextNodeId: "user_after_time",
    },

    user_after_time: {
      id: "user_after_time",
      type: "user_choice",
      choices: [
        {
          id: "choice_lost_after_time",
          label: "Et si je me perds ?",
          korean: "길을 잃으면 어떻게 해요?",
          romanization: "Gireul ireumyeon eotteoke haeyo?",
          nextNodeId: "ia_lost",
        },
        {
          id: "choice_summary_after_time",
          label: "Pouvez-vous résumer ?",
          korean: "간단히 정리해 주실 수 있나요?",
          romanization: "Gandanhi jeongnihae jusil su innayo?",
          nextNodeId: "ia_summary",
        },
        {
          id: "repeat_time",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_time_repeat",
        },
      ],
    },

    ia_time_repeat: {
      id: "ia_time_repeat",
      type: "ia",
      korean: "네. 일반열차는 약 한 시간 걸리고, 직통열차는 약 43분 걸립니다.",
      french:
        "Oui. Le train avec arrêts prend environ une heure, et le train direct environ 43 minutes.",
      romanization:
        "Ne. Ilbanyeolcha-neun yak han sigan geolligo, jiktongyeolcha-neun yak sasipsam bun geollimnida.",
      nextNodeId: "user_after_time",
    },

    ia_lost: {
      id: "ia_lost",
      type: "ia",
      korean:
        "길을 잃으시면 주변 직원에게 이렇게 말씀하세요 : 실례합니다, 서울역에 가고 싶어요. 어디로 가면 돼요?",
      french:
        "Si vous êtes perdu, dites ceci à un employé : Excusez-moi, je voudrais aller à Seoul Station. Où dois-je aller ?",
      romanization:
        "Gireul ireusimyeon jubyeon jigwon-ege ireoke malsseumhaseyo. Sillyehamnida, Seoul-yeoge gago sipeoyo. Eodiro gamyeon dwaeyo?",
      nextNodeId: "user_after_lost",
    },

    user_after_lost: {
      id: "user_after_lost",
      type: "user_choice",
      choices: [
        {
          id: "choice_summary_after_lost",
          label: "Pouvez-vous résumer ?",
          korean: "간단히 정리해 주실 수 있나요?",
          romanization: "Gandanhi jeongnihae jusil su innayo?",
          nextNodeId: "ia_summary",
        },
        {
          id: "choice_thanks_after_lost",
          label: "Merci beaucoup !",
          korean: "정말 감사합니다!",
          romanization: "Jeongmal gamsahamnida!",
          nextNodeId: "ia_end",
        },
        {
          id: "repeat_lost",
          ...GUIDED_REPEAT_REQUEST,
          nextNodeId: "ia_lost_repeat",
        },
      ],
    },

    ia_lost_repeat: {
      id: "ia_lost_repeat",
      type: "ia",
      korean:
        "네. 직원에게 이렇게 말하세요. 서울역에 가고 싶어요. 어디로 가면 돼요?",
      french:
        "Oui. Dites à un employé : je voudrais aller à Seoul Station. Où dois-je aller ?",
      romanization:
        "Ne. Jigwon-ege ireoke malhaseyo. Seoul-yeoge gago sipeoyo. Eodiro gamyeon dwaeyo?",
      nextNodeId: "user_after_lost",
    },

    ia_summary: {
      id: "ia_summary",
      type: "ia",
      korean:
        "정리해 드리면, 지하 1층으로 내려가서 Airport Railroad 표지판을 따라가세요. 서울역 방향 일반열차를 타시면 됩니다.",
      french:
        "Pour résumer : descendez au sous-sol 1, suivez les panneaux Airport Railroad, puis prenez le train avec arrêts direction Seoul Station.",
      romanization:
        "Jeongnihae deurimyeon, jiha ilcheung-euro naeryeogaseo Airport Railroad pyojipaneul ttaragaseyo. Seoul-yeok banghyang ilbanyeolchareul tasimyeon doemnida.",
      nextNodeId: "user_after_summary",
    },

    user_after_summary: {
      id: "user_after_summary",
      type: "user_choice",
      choices: [
        {
          id: "choice_thanks_after_summary",
          label: "Merci beaucoup, j’ai compris !",
          korean: "정말 감사합니다, 이해했어요!",
          romanization: "Jeongmal gamsahamnida, ihaehaesseoyo!",
          nextNodeId: "ia_end",
        },
        {
          id: "repeat_summary",
          label: "Pouvez-vous répéter plus simplement ?",
          korean: "더 간단히 말씀해 주시겠어요?",
          romanization: "Deo gandanhi malsseumhae jusigesseoyo?",
          nextNodeId: "ia_summary_short",
        },
        {
          id: "choice_time_after_summary",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸려요?",
          romanization: "Siganeun eolmana geollyeoyo?",
          nextNodeId: "ia_time",
        },
      ],
    },

    ia_summary_short: {
      id: "ia_summary_short",
      type: "ia",
      korean:
        "아주 간단히 말씀드리면, 지하 1층, Airport Railroad, 서울역 방향 일반열차예요.",
      french:
        "Très simplement : sous-sol 1, Airport Railroad, train avec arrêts direction Seoul Station.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, jiha ilcheung, Airport Railroad, Seoul-yeok banghyang ilbanyeolcha-yeyo.",
      nextNodeId: "user_after_summary_short",
    },

    user_after_summary_short: {
      id: "user_after_summary_short",
      type: "user_choice",
      choices: [
        {
          id: "choice_thanks_after_summary_short",
          label: "Merci beaucoup !",
          korean: "정말 감사합니다!",
          romanization: "Jeongmal gamsahamnida!",
          nextNodeId: "ia_end",
        },
        {
          id: "choice_lost_after_summary_short",
          label: "Et si je me perds ?",
          korean: "길을 잃으면 어떻게 해요?",
          romanization: "Gireul ireumyeon eotteoke haeyo?",
          nextNodeId: "ia_lost",
        },
        {
          id: "choice_platform_after_summary_short",
          label: "Où est le quai déjà ?",
          korean: "플랫폼이 어디라고 하셨죠?",
          romanization: "Peullaetpom-i eodirago hasyeotjyo?",
          nextNodeId: "ia_platform_repeat",
        },
      ],
    },

    ia_end: {
      id: "ia_end",
      type: "ia",
      korean: "네, 즐거운 서울 여행 되세요!",
      french: "Avec plaisir, bon séjour à Séoul !",
      romanization: "Ne, jeulgeoun Seoul yeohaeng doeseyo!",
      nextNodeId: null,
    },
  },
};
