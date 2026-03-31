import type { MetroLesson } from "./types";

const seoulStationToJamsilLesson: MetroLesson = {
  id: "seoul_station_to_jamsil",
  title: "Aller à Jamsil depuis Seoul Station",
  shortTitle: "Seoul Station → Jamsil",
  situation:
    "Vous êtes à Seoul Station (서울역). Vous voulez aller à Jamsil et vous demandez votre chemin à un passant coréen.",
  objective:
    "Comprendre les indications essentielles : ligne, correspondance, direction, trajet et sortie.",
  steps: [
    {
      id: "start",
      speaker: "ai",
      phase: "Accueil",
      narrator:
        "Vous êtes à Seoul Station. Vous voulez aller à Jamsil et vous demandez votre chemin.",
      text: "Choisissez une manière de demander votre chemin vers Jamsil.",
      french: "Choisissez une manière de demander votre chemin vers Jamsil.",
      choices: [
        {
          id: "ask1",
          label:
            "Excusez-moi, comment je fais pour aller à Jamsil depuis ici ?",
          korean: "실례합니다, 여기서 잠실까지 어떻게 가나요?",
          romanization: "Sillyehamnida, yeogiseo Jamsil-kkaji eotteoke ganayo?",
          nextId: "ia_intro",
        },
        {
          id: "ask2",
          label: "Pouvez-vous me dire le chemin pour Jamsil ?",
          korean: "잠실 가는 길 좀 알려주실래요?",
          romanization: "Jamsil ganeun gil jom allyeojusillaeyo?",
          nextId: "ia_intro",
        },
        {
          id: "ask3",
          label: "Jamsil, comment y aller ?",
          korean: "잠실 어떻게 가요?",
          romanization: "Jamsil eotteoke gayo?",
          nextId: "ia_intro",
        },
      ],
    },

    {
      id: "ia_intro",
      speaker: "ai",
      phase: "Ligne",
      narrator: "Le passant vous donne d'abord une réponse simple.",
      text: "Depuis Seoul Station, prenez d'abord la ligne 4, puis changez pour la ligne 2 afin d'aller à Jamsil.",
      korean:
        "서울역에서는 먼저 4호선을 타고, 그다음에 2호선으로 환승해서 잠실로 가시면 돼요.",
      french:
        "Depuis Seoul Station, prenez d'abord la ligne 4, puis changez pour la ligne 2 afin d'aller à Jamsil.",
      romanization:
        "Seoul-yeogeseoneun meonjeo sahoseoneul tago, geudaeume ihoseoneuro hwansunghaeseo Jamsil-ro gasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_intro",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_intro_repeat",
        },
        {
          id: "ask_transfer",
          label: "Où dois-je changer de ligne ?",
          korean: "어디서 환승하나요?",
          romanization: "Eodiseo hwansunghanayo?",
          nextId: "ia_transfer",
        },
        {
          id: "ask_exit",
          label: "Quelle sortie dois-je prendre à Jamsil ?",
          korean: "잠실역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Jamsil-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit",
        },
      ],
    },

    {
      id: "ia_intro_repeat",
      speaker: "ai",
      phase: "Ligne",
      text: "Bien sûr. Ligne 4 d'abord, puis ligne 2 pour aller à Jamsil.",
      korean: "네. 먼저 4호선, 그다음에 잠실 가는 2호선이에요.",
      french: "Bien sûr. Ligne 4 d'abord, puis ligne 2 pour aller à Jamsil.",
      romanization:
        "Ne. Meonjeo sahoseon, geudaeume Jamsil ganeun ihoseon-ieyo.",
      choices: [
        {
          id: "ask_transfer_after_repeat",
          label: "Où dois-je changer de ligne ?",
          korean: "어디서 환승하나요?",
          romanization: "Eodiseo hwansunghanayo?",
          nextId: "ia_transfer",
        },
        {
          id: "ask_exit_after_repeat",
          label: "Quelle sortie dois-je prendre à Jamsil ?",
          korean: "잠실역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Jamsil-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit",
        },
        {
          id: "thank_after_repeat",
          label: "Merci beaucoup, j'ai compris.",
          korean: "감사합니다, 이해했어요.",
          romanization: "Gamsahamnida, ihaehaesseoyo.",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_transfer",
      speaker: "ai",
      phase: "Direction",
      text: "Changez à Dongdaemun History & Culture Park, puis prenez la ligne 2 en direction de Jamsil.",
      korean: "동대문역사문화공원역에서 환승하시고, 잠실 방향 2호선을 타세요.",
      french:
        "Changez à Dongdaemun History & Culture Park, puis prenez la ligne 2 en direction de Jamsil.",
      romanization:
        "Dongdaemun-yeoksamunhwagongwon-yeogeseo hwansunghasigo, Jamsil banghyang ihoseoneul taseyo.",
      choices: [
        {
          id: "repeat_transfer",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_transfer_repeat",
        },
        {
          id: "ask_exit_from_transfer",
          label: "Quelle sortie dois-je prendre à Jamsil ?",
          korean: "잠실역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Jamsil-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit",
        },
        {
          id: "ask_time_from_transfer",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_time",
        },
      ],
    },

    {
      id: "ia_transfer_repeat",
      speaker: "ai",
      phase: "Direction",
      text: "Oui. Changez à Dongdaemun History & Culture Park, puis ligne 2 vers Jamsil.",
      korean:
        "네. 동대문역사문화공원역에서 환승한 다음, 잠실 방향 2호선을 타세요.",
      french:
        "Oui. Changez à Dongdaemun History & Culture Park, puis ligne 2 vers Jamsil.",
      romanization:
        "Ne. Dongdaemun-yeoksamunhwagongwon-yeogeseo hwansunghan daeum, Jamsil banghyang ihoseoneul taseyo.",
      choices: [
        {
          id: "ask_exit_after_transfer_repeat",
          label: "Quelle sortie dois-je prendre à Jamsil ?",
          korean: "잠실역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Jamsil-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit",
        },
        {
          id: "ask_time_after_transfer_repeat",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_time",
        },
        {
          id: "thank_after_transfer_repeat",
          label: "Merci beaucoup, j'ai compris.",
          korean: "감사합니다, 이해했어요.",
          romanization: "Gamsahamnida, ihaehaesseoyo.",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_time",
      speaker: "ai",
      phase: "Trajet",
      text: "Le trajet dure environ 25 à 30 minutes selon l'attente et la correspondance.",
      korean: "대기 시간과 환승 시간을 포함하면 약 25분에서 30분 정도 걸려요.",
      french:
        "Le trajet dure environ 25 à 30 minutes selon l'attente et la correspondance.",
      romanization:
        "Daegi sigan-gwa hwansung siganeul pohamhamyeon yak isip-o-bun-eseo samsipbun jeongdo geollyeoyo.",
      choices: [
        {
          id: "repeat_time",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_time_repeat",
        },
        {
          id: "ask_exit_after_time",
          label: "Quelle sortie dois-je prendre à Jamsil ?",
          korean: "잠실역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Jamsil-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit",
        },
        {
          id: "thank_after_time",
          label: "Merci beaucoup, j'ai compris.",
          korean: "감사합니다, 이해했어요.",
          romanization: "Gamsahamnida, ihaehaesseoyo.",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_time_repeat",
      speaker: "ai",
      phase: "Trajet",
      text: "Oui. Comptez environ 25 à 30 minutes.",
      korean: "네. 약 25분에서 30분 정도 생각하시면 돼요.",
      french: "Oui. Comptez environ 25 à 30 minutes.",
      romanization:
        "Ne. Yak isip-o-bun-eseo samsipbun jeongdo saenggakhasimyeon dwaeyo.",
      choices: [
        {
          id: "ask_exit_after_time_repeat",
          label: "Quelle sortie dois-je prendre à Jamsil ?",
          korean: "잠실역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Jamsil-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit",
        },
        {
          id: "thank_after_time_repeat",
          label: "Merci beaucoup, j'ai compris.",
          korean: "감사합니다, 이해했어요.",
          romanization: "Gamsahamnida, ihaehaesseoyo.",
          nextId: "ia_end",
        },
        {
          id: "repeat_time_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end_summary",
        },
      ],
    },

    {
      id: "ia_exit",
      speaker: "ai",
      phase: "Sortie",
      text: "À Jamsil, prenez la sortie 4 si vous voulez rejoindre facilement la zone principale.",
      korean: "잠실역에 도착하면 메인 구역으로 가시려면 4번 출구로 나오세요.",
      french:
        "À Jamsil, prenez la sortie 4 si vous voulez rejoindre facilement la zone principale.",
      romanization:
        "Jamsil-yeoge dochakhamyeon mein guyeok-euro gasiryeomyeon 4beon chulgu-ro naoseyo.",
      choices: [
        {
          id: "repeat_exit",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_exit_repeat",
        },
        {
          id: "thank_after_exit",
          label: "Merci beaucoup, j'ai compris.",
          korean: "감사합니다, 이해했어요.",
          romanization: "Gamsahamnida, ihaehaesseoyo.",
          nextId: "ia_end",
        },
        {
          id: "ask_time_after_exit",
          label: "Combien de temps dure le trajet déjà ?",
          korean: "시간은 얼마나 걸린다고 하셨죠?",
          romanization: "Siganeun eolmana geollindago hasyeotjyo?",
          nextId: "ia_time",
        },
      ],
    },

    {
      id: "ia_exit_repeat",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui. À Jamsil, prenez la sortie 4.",
      korean: "네. 잠실역에서는 4번 출구로 나오세요.",
      french: "Oui. À Jamsil, prenez la sortie 4.",
      romanization: "Ne. Jamsil-yeogeseoneun 4beon chulgu-ro naoseyo.",
      choices: [
        {
          id: "thank_after_exit_repeat",
          label: "Merci beaucoup, j'ai compris.",
          korean: "감사합니다, 이해했어요.",
          romanization: "Gamsahamnida, ihaehaesseoyo.",
          nextId: "ia_end",
        },
        {
          id: "repeat_exit_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end_summary",
        },
        {
          id: "ask_time_after_exit_repeat",
          label: "Combien de temps dure le trajet déjà ?",
          korean: "시간은 얼마나 걸린다고 하셨죠?",
          romanization: "Siganeun eolmana geollindago hasyeotjyo?",
          nextId: "ia_time",
        },
      ],
    },

    {
      id: "ia_end_summary",
      speaker: "ai",
      phase: "Fin",
      text: "Je résume : ligne 4 depuis Seoul Station, changement à Dongdaemun History & Culture Park, puis ligne 2 vers Jamsil, sortie 4.",
      korean:
        "정리해 드리면, 서울역에서 4호선을 타고 동대문역사문화공원역에서 환승한 다음 잠실 방향 2호선을 타세요. 도착하면 4번 출구로 나오시면 됩니다.",
      french:
        "Je résume : ligne 4 depuis Seoul Station, changement à Dongdaemun History & Culture Park, puis ligne 2 vers Jamsil, sortie 4.",
      romanization:
        "Jeongrihae deurimyeon, Seoul-yeogeseo sahoseoneul tago Dongdaemun-yeoksamunhwagongwon-yeogeseo hwansunghan daeum Jamsil banghyang ihoseoneul taseyo. Dochakhamyeon 4beon chulgu-ro naosimyeon doemnida.",
      choices: [
        {
          id: "thank_after_summary",
          label: "Merci beaucoup, j'ai compris.",
          korean: "감사합니다, 이해했어요.",
          romanization: "Gamsahamnida, ihaehaesseoyo.",
          nextId: "ia_end",
        },
        {
          id: "repeat_summary",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end",
        },
        {
          id: "ask_exit_again",
          label: "Quelle sortie déjà ?",
          korean: "출구가 몇 번이라고 하셨죠?",
          romanization: "Chulgu-ga myeot beon-irago hasyeotjyo?",
          nextId: "ia_exit_repeat",
        },
      ],
    },

    {
      id: "ia_end",
      speaker: "ai",
      phase: "Fin",
      narrator: "La conversation se termine naturellement.",
      text: "De rien ! Bon trajet jusqu'à Jamsil !",
      korean: "천만에요! 잠실까지 조심해서 가세요!",
      french: "De rien ! Bon trajet jusqu'à Jamsil !",
      romanization: "Cheonmaneyo! Jamsilkkaji josimhaeseo gaseyo!",
    },
  ],
};

export default seoulStationToJamsilLesson;
