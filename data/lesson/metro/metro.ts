import type { MetroLesson, MetroState, MetroStep } from "./type";

export type {
  MetroChoice,
  MetroLesson,
  MetroPhase,
  MetroState,
  MetroStep,
} from "./type";

export const seoulStationToJamsilLesson: MetroLesson = {
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

export const myeongdongToItaewonLesson: MetroLesson = {
  id: "myeongdong_to_itaewon",
  title: "Aller à Itaewon depuis Myeongdong",
  shortTitle: "Myeongdong → Itaewon",
  situation:
    "Vous êtes à Myeongdong station (명동역). Vous voulez aller à Itaewon et vous demandez votre chemin à un passant coréen.",
  objective:
    "Comprendre les indications essentielles : ligne, direction, correspondance, durée, nombre d'arrêts et sortie.",
  steps: [
    {
      id: "start",
      speaker: "ai",
      phase: "Accueil",
      narrator:
        "Vous êtes à Myeongdong station. Vous voulez aller à Itaewon et vous demandez votre chemin.",
      text: "Choisissez une manière de demander votre chemin vers Itaewon.",
      french: "Choisissez une manière de demander votre chemin vers Itaewon.",
      choices: [
        {
          id: "ask1",
          label:
            "Excusez-moi, comment je fais pour aller à Itaewon depuis ici ?",
          korean: "실례합니다, 여기서 이태원역까지 어떻게 가나요?",
          romanization:
            "Sillyehamnida, yeogiseo Itaewon-yeokkkaji eotteoke ganayo?",
          nextId: "ia_intro_route",
        },
        {
          id: "ask2",
          label: "Itaewon station, comment y aller ?",
          korean: "이태원역 어떻게 가야 해요?",
          romanization: "Itaewon-yeok eotteoke gaya haeyo?",
          nextId: "ia_intro_route",
        },
        {
          id: "ask3",
          label: "Pouvez-vous me dire le chemin pour Itaewon ?",
          korean: "이태원 가는 길 좀 알려주실래요?",
          romanization: "Itaewon ganeun gil jom allyeojusillaeyo?",
          nextId: "ia_intro_route",
        },
      ],
    },

    {
      id: "ia_intro_route",
      speaker: "ai",
      phase: "Ligne",
      narrator: "Le passant vous répond d'abord de manière claire et concise.",
      text: "Oui, bien sûr. Depuis Myeongdong, prenez d'abord la ligne 4. Descendez à Samgakji, puis changez pour la ligne 6 vers Itaewon.",
      korean:
        "네, 물론이죠. 명동역에서 먼저 4호선을 타세요. 삼각지역에서 내리신 다음 6호선으로 갈아타고 이태원역으로 가시면 돼요.",
      french:
        "Oui, bien sûr. Depuis Myeongdong, prenez d'abord la ligne 4. Descendez à Samgakji, puis changez pour la ligne 6 vers Itaewon.",
      romanization:
        "Ne, mullonijyo. Myeongdong-yeogeseo meonjeo sahoseoneul taseyo. Samgakji-yeogeseo naerisin daeum yukhoseoneuro garatago Itaewon-yeogeuro gasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_intro",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_intro_route",
        },
        {
          id: "ask_direction",
          label: "Dans quelle direction je dois prendre la ligne 4 ?",
          korean: "4호선은 어느 방향으로 타야 하나요?",
          romanization: "Sahoseoneun eoneu banghyang-euro taya hanayo?",
          nextId: "ia_line4_direction",
        },
        {
          id: "ask_transfer",
          label: "Où exactement je dois changer de ligne ?",
          korean: "환승은 어디서 하나요?",
          romanization: "Hwanseung-eun eodiseo hanayo?",
          nextId: "ia_transfer_station",
        },
      ],
    },

    {
      id: "ia_repeat_intro_route",
      speaker: "ai",
      phase: "Ligne",
      text: "Bien sûr. Prenez la ligne 4 à Myeongdong, descendez à Samgakji, puis prenez la ligne 6 jusqu'à Itaewon.",
      korean:
        "물론이죠. 명동역에서 4호선을 타고 삼각지역에서 내리세요. 거기서 6호선으로 갈아타고 이태원역까지 가시면 돼요.",
      french:
        "Bien sûr. Prenez la ligne 4 à Myeongdong, descendez à Samgakji, puis prenez la ligne 6 jusqu'à Itaewon.",
      romanization:
        "Mullonijyo. Myeongdong-yeogeseo sahoseoneul tago Samgakji-yeogeseo naeriseyo. Geogiseo yukhoseoneuro garatago Itaewon-yeokkkaji gasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_intro_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_intro_route_short",
        },
        {
          id: "ask_direction_after_repeat",
          label: "Dans quelle direction je dois prendre la ligne 4 ?",
          korean: "4호선은 어느 방향으로 타야 하나요?",
          romanization: "Sahoseoneun eoneu banghyang-euro taya hanayo?",
          nextId: "ia_line4_direction",
        },
        {
          id: "ask_time_after_repeat",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_repeat_intro_route_short",
      speaker: "ai",
      phase: "Ligne",
      text: "Je répète plus simplement : ligne 4 jusqu'à Samgakji, puis ligne 6 jusqu'à Itaewon.",
      korean:
        "더 간단히 말씀드리면, 4호선으로 삼각지역까지 가고, 거기서 6호선으로 이태원역까지 가시면 돼요.",
      french:
        "Je répète plus simplement : ligne 4 jusqu'à Samgakji, puis ligne 6 jusqu'à Itaewon.",
      romanization:
        "Deo gandanhi malsseumdeurimyeon, sahoseoneuro Samgakji-yeokkkaji gago, geogiseo yukhoseoneuro Itaewon-yeokkkaji gasimyeon dwaeyo.",
      choices: [
        {
          id: "go_direction_after_short",
          label: "D'accord. Quelle direction pour la ligne 4 ?",
          korean: "알겠어요. 4호선은 어느 방향이에요?",
          romanization: "Algesseoyo. Sahoseoneun eoneu banghyang-ieyo?",
          nextId: "ia_line4_direction",
        },
        {
          id: "go_transfer_after_short",
          label: "Je change bien à Samgakji ?",
          korean: "삼각지역에서 환승하는 거 맞죠?",
          romanization: "Samgakji-yeogeseo hwanseunghaneun geo matjyo?",
          nextId: "ia_transfer_station",
        },
        {
          id: "go_time_after_short",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_line4_direction",
      speaker: "ai",
      phase: "Direction",
      narrator:
        "Le passant vous donne maintenant le sens à prendre sur la ligne 4.",
      text: "Prenez la ligne 4 en direction de Sadang ou Oido. Descendez à Samgakji après environ quatre arrêts.",
      korean:
        "4호선 사당이나 오이도 방면 열차를 타세요. 약 네 정거장 후에 삼각지역에서 내리시면 됩니다.",
      french:
        "Prenez la ligne 4 en direction de Sadang ou Oido. Descendez à Samgakji après environ quatre arrêts.",
      romanization:
        "Sahoseon Sadang-ina Oido bangmyeon yeolchareul taseyo. Yak ne jeonggeojang hue Samgakji-yeogeseo naerisimyeon doemnida.",
      choices: [
        {
          id: "repeat_line4_direction",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_line4_direction",
        },
        {
          id: "ask_transfer_from_direction",
          label: "Et ensuite je change où ?",
          korean: "그다음 어디서 갈아타나요?",
          romanization: "Geudaeum eodiseo garatanayo?",
          nextId: "ia_transfer_station",
        },
        {
          id: "ask_station_count_from_direction",
          label: "Il y a combien d'arrêts en tout ?",
          korean: "총 몇 정거장인가요?",
          romanization: "Chong myeot jeonggeojang-ingayo?",
          nextId: "ia_station_count",
        },
      ],
    },

    {
      id: "ia_repeat_line4_direction",
      speaker: "ai",
      phase: "Direction",
      text: "Oui. Ligne 4, direction Sadang ou Oido. Descendez à Samgakji.",
      korean:
        "네. 4호선 사당이나 오이도 방면이에요. 삼각지역에서 내리시면 됩니다.",
      french: "Oui. Ligne 4, direction Sadang ou Oido. Descendez à Samgakji.",
      romanization:
        "Ne. Sahoseon Sadang-ina Oido bangmyeon-ieyo. Samgakji-yeogeseo naerisimyeon doemnida.",
      choices: [
        {
          id: "repeat_line4_direction_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_line4_direction_short",
        },
        {
          id: "ask_transfer_after_direction_repeat",
          label: "Et ensuite je change où ?",
          korean: "그다음 어디서 갈아타나요?",
          romanization: "Geudaeum eodiseo garatanayo?",
          nextId: "ia_transfer_station",
        },
        {
          id: "ask_time_after_direction_repeat",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_repeat_line4_direction_short",
      speaker: "ai",
      phase: "Direction",
      text: "Très simplement : ligne 4, direction Sadang ou Oido, descendez à Samgakji.",
      korean:
        "아주 간단히 말씀드리면, 4호선 사당이나 오이도 방면, 삼각지역에서 하차예요.",
      french:
        "Très simplement : ligne 4, direction Sadang ou Oido, descendez à Samgakji.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, sahoseon Sadang-ina Oido bangmyeon, Samgakji-yeogeseo hacha-yeyo.",
      choices: [
        {
          id: "ask_transfer_after_direction_short",
          label: "Je change bien à Samgakji ?",
          korean: "삼각지역에서 환승하는 거 맞죠?",
          romanization: "Samgakji-yeogeseo hwanseunghaneun geo matjyo?",
          nextId: "ia_transfer_station",
        },
        {
          id: "ask_time_after_direction_short",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "ask_exit_after_direction_short",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_transfer_station",
      speaker: "ai",
      phase: "Correspondance",
      narrator:
        "Le passant vous explique maintenant où et comment faire la correspondance.",
      text: "Vous changez à Samgakji. Descendez de la ligne 4, suivez les panneaux de la ligne 6, puis prenez la ligne 6 en direction d'Itaewon.",
      korean:
        "삼각지역에서 갈아타시면 돼요. 4호선에서 내리신 다음 6호선 표지판을 따라가세요. 그리고 이태원 방향 열차를 타시면 됩니다.",
      french:
        "Vous changez à Samgakji. Descendez de la ligne 4, suivez les panneaux de la ligne 6, puis prenez la ligne 6 en direction d'Itaewon.",
      romanization:
        "Samgakji-yeogeseo garatasimyeon dwaeyo. Sahoseon-eseo naerisin daeum yukhoseon pyojipaneul ttaragaseyo. Geurigo Itaewon banghyang yeolchareul tasimyeon doemnida.",
      choices: [
        {
          id: "repeat_transfer_station",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_transfer_station",
        },
        {
          id: "ask_line6_direction",
          label: "Comment savoir si c'est la bonne direction sur la ligne 6 ?",
          korean: "6호선 방향은 어떻게 확인하나요?",
          romanization: "Yukhoseon banghyang-eun eotteoke hwaginhanayo?",
          nextId: "ia_line6_direction",
        },
        {
          id: "ask_time_from_transfer",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_repeat_transfer_station",
      speaker: "ai",
      phase: "Correspondance",
      text: "Oui. Changez à Samgakji. Ensuite, prenez la ligne 6 vers Itaewon.",
      korean:
        "네. 삼각지역에서 갈아타세요. 그다음 6호선을 타고 이태원역으로 가시면 돼요.",
      french:
        "Oui. Changez à Samgakji. Ensuite, prenez la ligne 6 vers Itaewon.",
      romanization:
        "Ne. Samgakji-yeogeseo garataseyo. Geudaeum yukhoseoneul tago Itaewon-yeogeuro gasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_transfer_station_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_transfer_station_short",
        },
        {
          id: "ask_line6_after_transfer_repeat",
          label: "Quelle direction pour la ligne 6 ?",
          korean: "6호선은 어느 방향으로 타야 하나요?",
          romanization: "Yukhoseoneun eoneu banghyang-euro taya hanayo?",
          nextId: "ia_line6_direction",
        },
        {
          id: "ask_station_count_after_transfer_repeat",
          label: "Il y a combien d'arrêts en tout ?",
          korean: "총 몇 정거장인가요?",
          romanization: "Chong myeot jeonggeojang-ingayo?",
          nextId: "ia_station_count",
        },
      ],
    },

    {
      id: "ia_repeat_transfer_station_short",
      speaker: "ai",
      phase: "Correspondance",
      text: "Très simplement : changement à Samgakji, puis ligne 6 jusqu'à Itaewon.",
      korean:
        "아주 간단히 말씀드리면, 삼각지역에서 환승, 그다음 6호선으로 이태원역까지 가시면 돼요.",
      french:
        "Très simplement : changement à Samgakji, puis ligne 6 jusqu'à Itaewon.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, Samgakji-yeogeseo hwanseung, geudaeum yukhoseoneuro Itaewon-yeokkkaji gasimyeon dwaeyo.",
      choices: [
        {
          id: "ask_line6_after_transfer_short",
          label: "Quelle direction pour la ligne 6 ?",
          korean: "6호선은 어느 방향으로 타야 하나요?",
          romanization: "Yukhoseoneun eoneu banghyang-euro taya hanayo?",
          nextId: "ia_line6_direction",
        },
        {
          id: "ask_exit_after_transfer_short",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "ask_time_after_transfer_short",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_line6_direction",
      speaker: "ai",
      phase: "Direction",
      narrator:
        "Le passant vous explique maintenant comment vérifier le bon sens sur la ligne 6.",
      text: "Sur la ligne 6, prenez le train en direction de Bonghwasan ou Sinnae. Itaewon est seulement deux arrêts après Samgakji.",
      korean:
        "6호선에서는 봉화산이나 신내 방면 열차를 타시면 돼요. 삼각지역에서 이태원역까지는 두 정거장밖에 안 돼요.",
      french:
        "Sur la ligne 6, prenez le train en direction de Bonghwasan ou Sinnae. Itaewon est seulement deux arrêts après Samgakji.",
      romanization:
        "Yukhoseon-eseoneun Bonghwasan-ina Sinnae bangmyeon yeolchareul tasimyeon dwaeyo. Samgakji-yeogeseo Itaewon-yeokkkajineun du jeonggeojangbakke an dwaeyo.",
      choices: [
        {
          id: "repeat_line6_direction",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_line6_direction",
        },
        {
          id: "ask_station_count_from_line6",
          label: "Il y a combien d'arrêts en tout ?",
          korean: "총 몇 정거장인가요?",
          romanization: "Chong myeot jeonggeojang-ingayo?",
          nextId: "ia_station_count",
        },
        {
          id: "ask_exit_from_line6",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_line6_direction",
      speaker: "ai",
      phase: "Direction",
      text: "Oui. Ligne 6 direction Bonghwasan ou Sinnae. Après deux arrêts, descendez à Itaewon.",
      korean:
        "네. 6호선 봉화산이나 신내 방면이에요. 두 정거장 후에 이태원역에서 내리시면 됩니다.",
      french:
        "Oui. Ligne 6 direction Bonghwasan ou Sinnae. Après deux arrêts, descendez à Itaewon.",
      romanization:
        "Ne. Yukhoseon Bonghwasan-ina Sinnae bangmyeon-ieyo. Du jeonggeojang hue Itaewon-yeogeseo naerisimyeon doemnida.",
      choices: [
        {
          id: "repeat_line6_direction_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_line6_direction_short",
        },
        {
          id: "ask_time_after_line6_repeat",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "ask_exit_after_line6_repeat",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_line6_direction_short",
      speaker: "ai",
      phase: "Direction",
      text: "Très simplement : ligne 6 direction Bonghwasan ou Sinnae, deux arrêts jusqu'à Itaewon.",
      korean:
        "아주 간단히 말씀드리면, 6호선 봉화산이나 신내 방면, 이태원까지 두 정거장이에요.",
      french:
        "Très simplement : ligne 6 direction Bonghwasan ou Sinnae, deux arrêts jusqu'à Itaewon.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, yukhoseon Bonghwasan-ina Sinnae bangmyeon, Itaewon-kkaji du jeonggeojang-ieyo.",
      choices: [
        {
          id: "ask_time_after_line6_short",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "ask_exit_after_line6_short",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_line6_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_trip_time",
      speaker: "ai",
      phase: "Trajet",
      narrator:
        "Vous obtenez maintenant des précisions sur la durée et le rythme du trajet.",
      text: "Le trajet prend environ 18 à 22 minutes, selon l'attente et la correspondance à Samgakji.",
      korean:
        "대기 시간과 삼각지역 환승 시간을 포함하면 약 18분에서 22분 정도 걸려요.",
      french:
        "Le trajet prend environ 18 à 22 minutes, selon l'attente et la correspondance à Samgakji.",
      romanization:
        "Daegi sigan-gwa Samgakji-yeok hwanseung siganeul pohamhamyeon yak sip-palbun-eseo isip-ibun jeongdo geollyeoyo.",
      choices: [
        {
          id: "repeat_trip_time",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_trip_time",
        },
        {
          id: "ask_station_count",
          label: "Il y a combien d'arrêts en tout ?",
          korean: "총 몇 정거장인가요?",
          romanization: "Chong myeot jeonggeojang-ingayo?",
          nextId: "ia_station_count",
        },
        {
          id: "ask_exit_from_time",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_trip_time",
      speaker: "ai",
      phase: "Trajet",
      text: "Bien sûr. Comptez environ vingt minutes, parfois un peu plus selon le temps de correspondance.",
      korean:
        "네. 보통 20분 정도 생각하시면 되고, 환승 시간에 따라 조금 더 걸릴 수도 있어요.",
      french:
        "Bien sûr. Comptez environ vingt minutes, parfois un peu plus selon le temps de correspondance.",
      romanization:
        "Ne. Botong isipbun jeongdo saenggakhasimyeon doego, hwanseung sigane ttara jogeum deo geollil sudo isseoyo.",
      choices: [
        {
          id: "repeat_trip_time_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_trip_time_short",
        },
        {
          id: "ask_station_count_after_repeat",
          label: "Il y a combien d'arrêts en tout ?",
          korean: "총 몇 정거장인가요?",
          romanization: "Chong myeot jeonggeojang-ingayo?",
          nextId: "ia_station_count",
        },
        {
          id: "ask_exit_after_trip_repeat",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_trip_time_short",
      speaker: "ai",
      phase: "Trajet",
      text: "En résumé : environ vingt minutes.",
      korean: "정리해서 말씀드리면, 약 20분 정도예요.",
      french: "En résumé : environ vingt minutes.",
      romanization:
        "Jeongrihaeseo malsseumdeurimyeon, yak isipbun jeongdo-yeyo.",
      choices: [
        {
          id: "ask_station_count_after_short",
          label: "Il y a combien d'arrêts en tout ?",
          korean: "총 몇 정거장인가요?",
          romanization: "Chong myeot jeonggeojang-ingayo?",
          nextId: "ia_station_count",
        },
        {
          id: "ask_exit_after_trip_short",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_trip_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_station_count",
      speaker: "ai",
      phase: "Trajet",
      text: "Comptez environ six arrêts au total : quatre arrêts jusqu'à Samgakji, puis deux arrêts jusqu'à Itaewon.",
      korean:
        "전체적으로는 약 6정거장 정도예요. 삼각지역까지 4정거장, 그리고 이태원역까지 2정거장 더 가시면 됩니다.",
      french:
        "Comptez environ six arrêts au total : quatre arrêts jusqu'à Samgakji, puis deux arrêts jusqu'à Itaewon.",
      romanization:
        "Jeonchejeogeuro-neun yak yeoseot jeonggeojang jeongdo-yeyo. Samgakji-yeokkkaji ne jeonggeojang, geurigo Itaewon-yeokkkaji du jeonggeojang deo gasimyeon doemnida.",
      choices: [
        {
          id: "repeat_station_count",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_station_count",
        },
        {
          id: "ask_exit_after_station_count",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "ask_summary_after_station_count",
          label: "Pouvez-vous résumer tout le trajet ?",
          korean: "전체 경로를 다시 정리해 주실 수 있나요?",
          romanization: "Jeonche gyeongnoreul dasi jeongnihae jusil su innayo?",
          nextId: "ia_end_summary",
        },
      ],
    },

    {
      id: "ia_repeat_station_count",
      speaker: "ai",
      phase: "Trajet",
      text: "Oui. En tout, environ six arrêts : quatre sur la ligne 4, puis deux sur la ligne 6.",
      korean:
        "네. 전체적으로 약 6정거장이에요. 4호선에서 4정거장, 6호선에서 2정거장입니다.",
      french:
        "Oui. En tout, environ six arrêts : quatre sur la ligne 4, puis deux sur la ligne 6.",
      romanization:
        "Ne. Jeonchejeogeuro yak yeoseot jeonggeojang-ieyo. Sahoseon-eseo ne jeonggeojang, yukhoseon-eseo du jeonggeojang-imnida.",
      choices: [
        {
          id: "repeat_station_count_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_station_count_short",
        },
        {
          id: "ask_exit_after_station_repeat",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_station_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_station_count_short",
      speaker: "ai",
      phase: "Trajet",
      text: "Très simplement : environ six arrêts au total.",
      korean: "아주 간단히 말씀드리면, 전체 약 6정거장이에요.",
      french: "Très simplement : environ six arrêts au total.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, jeonche yak yeoseot jeonggeojang-ieyo.",
      choices: [
        {
          id: "ask_exit_after_station_short",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "ask_transfer_again_after_station_short",
          label: "Je change bien à Samgakji, c'est ça ?",
          korean: "삼각지역에서 환승하는 거 맞죠?",
          romanization: "Samgakji-yeogeseo hwanseunghaneun geo matjyo?",
          nextId: "ia_repeat_transfer_station_short",
        },
        {
          id: "thank_after_station_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_exit_info",
      speaker: "ai",
      phase: "Sortie",
      narrator:
        "Le passant vous explique maintenant quelle sortie prendre à Itaewon.",
      text: "Cela dépend de votre destination, mais pour aller vers la rue principale d'Itaewon, la sortie 1 est pratique.",
      korean:
        "목적지에 따라 다르지만, 이태원 메인 거리 쪽으로 가려면 1번 출구가 편해요.",
      french:
        "Cela dépend de votre destination, mais pour aller vers la rue principale d'Itaewon, la sortie 1 est pratique.",
      romanization:
        "Mokjeokjie ttara dareujiman, Itaewon mein geori jjogeuro garyeomyeon ilbeon chulguga pyeonhaeyo.",
      choices: [
        {
          id: "repeat_exit",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_info",
        },
        {
          id: "ask_landmark_exit",
          label: "C'est près des restaurants et de la rue principale ?",
          korean: "레스토랑이 많은 메인 거리랑 가까운가요?",
          romanization: "Reseutorang-i maneun mein geori-rang gakkaunga-yo?",
          nextId: "ia_exit_landmark_info",
        },
        {
          id: "ask_summary_from_exit",
          label: "Pouvez-vous résumer tout le trajet ?",
          korean: "전체 경로를 다시 정리해 주실 수 있나요?",
          romanization: "Jeonche gyeongnoreul dasi jeongnihae jusil su innayo?",
          nextId: "ia_end_summary",
        },
      ],
    },

    {
      id: "ia_repeat_exit_info",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui. Pour la rue principale d'Itaewon, prenez plutôt la sortie 1.",
      korean: "네. 이태원 메인 거리로 가시려면 1번 출구가 편해요.",
      french:
        "Oui. Pour la rue principale d'Itaewon, prenez plutôt la sortie 1.",
      romanization:
        "Ne. Itaewon mein geori-ro gasiryeomyeon ilbeon chulguga pyeonhaeyo.",
      choices: [
        {
          id: "repeat_exit_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_info_short",
        },
        {
          id: "ask_landmark_after_exit_repeat",
          label: "C'est près des restaurants et de la rue principale ?",
          korean: "레스토랑이 많은 메인 거리랑 가까운가요?",
          romanization: "Reseutorang-i maneun mein geori-rang gakkaunga-yo?",
          nextId: "ia_exit_landmark_info",
        },
        {
          id: "thank_after_exit_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_exit_info_short",
      speaker: "ai",
      phase: "Sortie",
      text: "Très simplement : sortie numéro 1.",
      korean: "아주 간단히 말씀드리면, 1번 출구예요.",
      french: "Très simplement : sortie numéro 1.",
      romanization: "Aju gandanhi malsseumdeurimyeon, ilbeon chulgu-yeyo.",
      choices: [
        {
          id: "ask_landmark_after_exit_short",
          label: "C'est près des restaurants et de la rue principale ?",
          korean: "레스토랑이 많은 메인 거리랑 가까운가요?",
          romanization: "Reseutorang-i maneun mein geori-rang gakkaunga-yo?",
          nextId: "ia_exit_landmark_info",
        },
        {
          id: "ask_transfer_again_from_exit_short",
          label: "Je dois bien changer une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwanseung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
        },
        {
          id: "thank_after_exit_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_exit_landmark_info",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui, c'est proche. En sortant par la sortie 1, vous rejoignez rapidement la rue principale avec beaucoup de restaurants et de cafés.",
      korean:
        "네, 가까워요. 1번 출구로 나오시면 레스토랑과 카페가 많은 메인 거리로 금방 가실 수 있어요.",
      french:
        "Oui, c'est proche. En sortant par la sortie 1, vous rejoignez rapidement la rue principale avec beaucoup de restaurants et de cafés.",
      romanization:
        "Ne, gakkawoyo. Ilbeon chulgu-ro naosimyeon reseutorang-gwa kape-ga maneun mein geori-ro geumbang gasil su isseoyo.",
      choices: [
        {
          id: "repeat_landmark",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_landmark_info",
        },
        {
          id: "ask_transfer_after_landmark",
          label: "Je dois bien changer une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwanseung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
        },
        {
          id: "thank_after_landmark",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_exit_landmark_info",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui. Sortez par la sortie 1, puis vous arriverez vite vers la rue principale d'Itaewon.",
      korean:
        "네. 1번 출구로 나오시면 곧바로 이태원 메인 거리 쪽으로 가실 수 있어요.",
      french:
        "Oui. Sortez par la sortie 1, puis vous arriverez vite vers la rue principale d'Itaewon.",
      romanization:
        "Ne. Ilbeon chulgu-ro naosimyeon gotbaro Itaewon mein geori jjogeuro gasil su isseoyo.",
      choices: [
        {
          id: "repeat_landmark_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_landmark_info_short",
        },
        {
          id: "ask_summary_after_landmark_repeat",
          label: "Pouvez-vous résumer tout le trajet ?",
          korean: "전체 경로를 다시 정리해 주실 수 있나요?",
          romanization: "Jeonche gyeongnoreul dasi jeongnihae jusil su innayo?",
          nextId: "ia_end_summary",
        },
        {
          id: "thank_after_landmark_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_exit_landmark_info_short",
      speaker: "ai",
      phase: "Sortie",
      text: "En bref : sortie 1, puis rue principale d'Itaewon.",
      korean:
        "짧게 말씀드리면, 1번 출구로 나와서 이태원 메인 거리로 가시면 돼요.",
      french: "En bref : sortie 1, puis rue principale d'Itaewon.",
      romanization:
        "Jjalge malsseumdeurimyeon, ilbeon chulgu-ro nawaseo Itaewon mein geori-ro gasimyeon dwaeyo.",
      choices: [
        {
          id: "ask_summary_after_landmark_short",
          label: "Pouvez-vous résumer tout le trajet ?",
          korean: "전체 경로를 다시 정리해 주실 수 있나요?",
          romanization: "Jeonche gyeongnoreul dasi jeongnihae jusil su innayo?",
          nextId: "ia_end_summary",
        },
        {
          id: "ask_transfer_after_landmark_short",
          label: "Je dois bien changer une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwanseung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
        },
        {
          id: "thank_after_landmark_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_transfer_count_info",
      speaker: "ai",
      phase: "Trajet",
      text: "Oui, une seule correspondance suffit. Vous prenez d'abord la ligne 4, puis vous changez pour la ligne 6 à Samgakji.",
      korean:
        "네, 환승은 한 번만 하시면 돼요. 먼저 4호선을 타고, 삼각지역에서 6호선으로 갈아타시면 됩니다.",
      french:
        "Oui, une seule correspondance suffit. Vous prenez d'abord la ligne 4, puis vous changez pour la ligne 6 à Samgakji.",
      romanization:
        "Ne, hwanseung-eun han beonman hasimyeon dwaeyo. Meonjeo sahoseoneul tago, Samgakji-yeogeseo yukhoseoneuro garatasimyeon doemnida.",
      choices: [
        {
          id: "repeat_transfer_count",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_transfer_count_info",
        },
        {
          id: "ask_exit_after_transfer_count",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_transfer_count",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_transfer_count_info",
      speaker: "ai",
      phase: "Trajet",
      text: "Oui. Une seule fois. Vous changez de la ligne 4 à la ligne 6 à Samgakji.",
      korean:
        "네. 한 번만 환승하시면 돼요. 삼각지역에서 4호선에서 6호선으로 갈아타시면 됩니다.",
      french:
        "Oui. Une seule fois. Vous changez de la ligne 4 à la ligne 6 à Samgakji.",
      romanization:
        "Ne. Han beonman hwanseunghasimyeon dwaeyo. Samgakji-yeogeseo sahoseon-eseo yukhoseoneuro garatasimyeon doemnida.",
      choices: [
        {
          id: "ask_summary_after_transfer_count_repeat",
          label: "Pouvez-vous résumer tout le trajet ?",
          korean: "전체 경로를 다시 정리해 주실 수 있나요?",
          romanization: "Jeonche gyeongnoreul dasi jeongnihae jusil su innayo?",
          nextId: "ia_end_summary",
        },
        {
          id: "ask_exit_after_transfer_count_repeat",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_transfer_count_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_end_summary",
      speaker: "ai",
      phase: "Fin",
      text: "Je résume : à Myeongdong, prenez la ligne 4 direction Sadang ou Oido. Descendez à Samgakji, changez pour la ligne 6 direction Bonghwasan ou Sinnae, puis descendez à Itaewon. Pour la rue principale, prenez la sortie 1.",
      korean:
        "정리해 드리면, 명동역에서 4호선 사당이나 오이도 방면 열차를 타세요. 삼각지역에서 내려서 6호선 봉화산이나 신내 방면으로 갈아타고, 이태원역에서 내리시면 됩니다. 메인 거리로 가시려면 1번 출구가 편해요.",
      french:
        "Je résume : à Myeongdong, prenez la ligne 4 direction Sadang ou Oido. Descendez à Samgakji, changez pour la ligne 6 direction Bonghwasan ou Sinnae, puis descendez à Itaewon. Pour la rue principale, prenez la sortie 1.",
      romanization:
        "Jeongrihae deurimyeon, Myeongdong-yeogeseo sahoseon Sadang-ina Oido bangmyeon yeolchareul taseyo. Samgakji-yeogeseo naeryeoseo yukhoseon Bonghwasan-ina Sinnae bangmyeoneuro garatago, Itaewon-yeogeseo naerisimyeon doemnida. Mein geori-ro gasiryeomyeon ilbeon chulguga pyeonhaeyo.",
      choices: [
        {
          id: "thank_after_summary",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "repeat_summary",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end_summary_short",
        },
        {
          id: "ask_exit_again_after_summary",
          label: "Quelle sortie déjà ?",
          korean: "출구가 몇 번이라고 하셨죠?",
          romanization: "Chulgu-ga myeot beon-irago hasyeotjyo?",
          nextId: "ia_repeat_exit_info_short",
        },
      ],
    },

    {
      id: "ia_end_summary_short",
      speaker: "ai",
      phase: "Fin",
      text: "Très simplement : ligne 4, changement à Samgakji, ligne 6, sortie 1.",
      korean:
        "아주 간단히 말씀드리면, 4호선, 삼각지역 환승, 6호선, 1번 출구예요.",
      french:
        "Très simplement : ligne 4, changement à Samgakji, ligne 6, sortie 1.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, sahoseon, Samgakji-yeok hwanseung, yukhoseon, ilbeon chulgu-yeyo.",
      choices: [
        {
          id: "thank_after_summary_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "ask_exit_again_after_summary_short",
          label: "Quelle sortie déjà ?",
          korean: "출구가 몇 번이라고 하셨죠?",
          romanization: "Chulgu-ga myeot beon-irago hasyeotjyo?",
          nextId: "ia_repeat_exit_info_short",
        },
        {
          id: "ask_transfer_again_after_summary_short",
          label: "Je change bien une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwanseung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
        },
      ],
    },

    {
      id: "ia_end",
      speaker: "ai",
      phase: "Fin",
      narrator: "La conversation se termine naturellement.",
      text: "De rien ! Passez un bon moment à Itaewon !",
      korean: "천만에요! 이태원에서 즐거운 시간 보내세요!",
      french: "De rien ! Passez un bon moment à Itaewon !",
      romanization: "Cheonmaneyo! Itaewon-eseo jeulgeoun sigan bonaeseyo!",
    },
  ],
};

export const hongikToGangnamLesson: MetroLesson = {
  id: "hongik_to_gangnam",
  title: "Aller à Gangnam depuis Hongik University",
  shortTitle: "Hongik → Gangnam",
  situation:
    "Vous êtes à Hongik University station (홍익대입구역). Vous voulez aller à Gangnam et vous demandez votre chemin à un passant coréen.",
  objective:
    "Comprendre les indications essentielles : ligne, direction, trajet, transfert éventuel et sortie.",
  steps: [
    {
      id: "start",
      speaker: "ai",
      phase: "Accueil",
      narrator:
        "Vous êtes à Hongik University station. Vous voulez aller à Gangnam et vous demandez votre chemin.",
      text: "Choisissez une manière de demander votre chemin vers Gangnam.",
      french: "Choisissez une manière de demander votre chemin vers Gangnam.",
      choices: [
        {
          id: "ask1",
          label:
            "Excusez-moi, comment je fais pour aller à Gangnam depuis ici ?",
          korean: "실례합니다, 여기서 강남역까지 어떻게 가나요?",
          romanization:
            "Sillyehamnida, yeogiseo Gangnam-yeokkkaji eotteoke ganayo?",
          nextId: "ia_intro_route",
        },
        {
          id: "ask2",
          label: "Gangnam station eotteoke gaya haeyo ?",
          korean: "강남역 어떻게 가야 해요?",
          romanization: "Gangnam-yeok eotteoke gaya haeyo?",
          nextId: "ia_intro_route",
        },
        {
          id: "ask3",
          label: "Pouvez-vous me dire le chemin pour Gangnam ?",
          korean: "강남 가는 길 좀 알려주실래요?",
          romanization: "Gangnam ganeun gil jom allyeojusillaeyo?",
          nextId: "ia_intro_route",
        },
      ],
    },

    {
      id: "ia_intro_route",
      speaker: "ai",
      phase: "Ligne",
      narrator: "Le passant vous répond d'abord de manière claire et concise.",
      text: "Oui, bien sûr. Depuis Hongik University, prenez la ligne 2. Suivez les panneaux de la ligne 2 et prenez le train en direction de Gangnam.",
      korean:
        "네, 물론이죠. 홍익대입구역에서 2호선을 타세요. 2호선 표지판을 따라가시고 강남 방향 열차를 타시면 돼요.",
      french:
        "Oui, bien sûr. Depuis Hongik University, prenez la ligne 2. Suivez les panneaux de la ligne 2 et prenez le train en direction de Gangnam.",
      romanization:
        "Ne, mullonijyo. Hongikdaeipgu-yeogeseo ihoseoneul taseyo. Ihoseon pyojipaneul ttaragashigo Gangnam banghyang yeolchareul tasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_intro",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_intro_route",
        },
        {
          id: "ask_platform",
          label: "Où est exactement le quai et dans quelle direction ?",
          korean: "플랫폼은 어디고 방향은 어떻게 되나요?",
          romanization: "Peullaetpomeun eodigo banghyang-eun eotteoke doenayo?",
          nextId: "ia_platform_direction",
        },
        {
          id: "ask_trip",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_repeat_intro_route",
      speaker: "ai",
      phase: "Ligne",
      text: "Bien sûr. Depuis ici, prenez la ligne 2 et montez dans le train en direction de Gangnam.",
      korean: "물론이죠. 여기서 2호선을 타시고 강남 방향 열차를 타시면 돼요.",
      french:
        "Bien sûr. Depuis ici, prenez la ligne 2 et montez dans le train en direction de Gangnam.",
      romanization:
        "Mullonijyo. Yeogiseo ihoseoneul tasigo Gangnam banghyang yeolchareul tasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_intro_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_intro_route_slow",
        },
        {
          id: "ask_platform_after_repeat",
          label: "Où est exactement le quai et dans quelle direction ?",
          korean: "플랫폼은 어디고 방향은 어떻게 되나요?",
          romanization: "Peullaetpomeun eodigo banghyang-eun eotteoke doenayo?",
          nextId: "ia_platform_direction",
        },
        {
          id: "ask_trip_after_repeat",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_repeat_intro_route_slow",
      speaker: "ai",
      phase: "Ligne",
      text: "Je répète plus simplement : ligne 2, direction Gangnam.",
      korean: "더 간단히 말씀드리면, 2호선, 강남 방향이에요.",
      french: "Je répète plus simplement : ligne 2, direction Gangnam.",
      romanization:
        "Deo gandanhi malsseumdeurimyeon, ihoseon, Gangnam banghyang-ieyo.",
      choices: [
        {
          id: "go_platform_after_slow",
          label: "D'accord. Où est le quai exactement ?",
          korean: "알겠어요. 플랫폼은 정확히 어디예요?",
          romanization: "Algesseoyo. Peullaetpomeun jeonghwakhi eodiyeyo?",
          nextId: "ia_platform_direction",
        },
        {
          id: "go_trip_after_slow",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "go_exit_after_slow",
          label: "Et quelle sortie prendre à Gangnam ?",
          korean: "그리고 강남역에서는 몇 번 출구로 나가면 되나요?",
          romanization:
            "Geurigo Gangnam-yeogeseoneun myeot beon chulgu-ro nagamyeon doenayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_platform_direction",
      speaker: "ai",
      phase: "Direction",
      narrator:
        "Le passant vous donne maintenant des détails plus précis sur le quai et le sens du trajet.",
      text: "Le train est au sous-sol 2, quai B. Regardez l'écran au-dessus du quai. Si la direction affichée correspond à Gangnam, c'est le bon quai.",
      korean:
        "열차는 지하 2층 B 플랫폼이에요. 플랫폼 위 전광판을 보시고 강남 방향이라고 나오면 그쪽이 맞아요.",
      french:
        "Le train est au sous-sol 2, quai B. Regardez l'écran au-dessus du quai. Si la direction affichée correspond à Gangnam, c'est le bon quai.",
      romanization:
        "Yeolchaneun jihah 2cheung B peullaetpom-ieyo. Peullaetpom wi jeon-gwangpaneul bosigo Gangnam banghyang-irago naomyeon geujjogi majayo.",
      choices: [
        {
          id: "repeat_platform",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_platform_direction",
        },
        {
          id: "ask_transfer",
          label: "Est-ce qu'il y a un transfert ?",
          korean: "환승은 있나요?",
          romanization: "Hwansung-eun innayo?",
          nextId: "ia_transfer_info",
        },
        {
          id: "ask_exit_from_platform",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_platform_direction",
      speaker: "ai",
      phase: "Direction",
      text: "Oui. Sous-sol 2, quai B. Vérifiez l'écran du quai et prenez le train en direction de Gangnam.",
      korean:
        "네. 지하 2층 B 플랫폼이에요. 전광판을 확인하시고 강남 방향 열차를 타세요.",
      french:
        "Oui. Sous-sol 2, quai B. Vérifiez l'écran du quai et prenez le train en direction de Gangnam.",
      romanization:
        "Ne. Jihah 2cheung B peullaetpom-ieyo. Jeon-gwangpaneul hwaginhashigo Gangnam banghyang yeolchareul taseyo.",
      choices: [
        {
          id: "repeat_platform_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_platform_direction_short",
        },
        {
          id: "ask_transfer_after_platform_repeat",
          label: "Est-ce qu'il y a un transfert ?",
          korean: "환승은 있나요?",
          romanization: "Hwansung-eun innayo?",
          nextId: "ia_transfer_info",
        },
        {
          id: "ask_exit_after_platform_repeat",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_platform_direction_short",
      speaker: "ai",
      phase: "Direction",
      text: "Je répète très simplement : quai B, sous-sol 2, direction Gangnam.",
      korean: "아주 간단히 말씀드리면, 지하 2층 B 플랫폼, 강남 방향이에요.",
      french:
        "Je répète très simplement : quai B, sous-sol 2, direction Gangnam.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, jihah 2cheung B peullaetpom, Gangnam banghyang-ieyo.",
      choices: [
        {
          id: "ask_transfer_after_short_platform",
          label: "Est-ce qu'il y a un transfert ?",
          korean: "환승은 있나요?",
          romanization: "Hwansung-eun innayo?",
          nextId: "ia_transfer_info",
        },
        {
          id: "ask_trip_after_short_platform",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "ask_exit_after_short_platform",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_trip_time",
      speaker: "ai",
      phase: "Trajet",
      narrator:
        "Vous obtenez maintenant des précisions sur la durée et le nombre d'arrêts.",
      text: "Le trajet dure environ 44 minutes et il y a à peu près 22 arrêts jusqu'à Gangnam.",
      korean: "강남역까지는 약 44분 정도 걸리고, 대략 22정거장 정도 지나가요.",
      french:
        "Le trajet dure environ 44 minutes et il y a à peu près 22 arrêts jusqu'à Gangnam.",
      romanization:
        "Gangnam-yeokkkajineun yak 44bun jeongdo geolligo, daeryak 22jeonggeojang jeongdo jinagayo.",
      choices: [
        {
          id: "repeat_trip",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_trip_time",
        },
        {
          id: "ask_transfer_from_trip",
          label: "Est-ce qu'il y a un transfert ?",
          korean: "환승은 있나요?",
          romanization: "Hwansung-eun innayo?",
          nextId: "ia_transfer_info",
        },
        {
          id: "ask_exit_from_trip",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_trip_time",
      speaker: "ai",
      phase: "Trajet",
      text: "Bien sûr. Comptez environ 44 minutes, soit à peu près 22 arrêts.",
      korean: "네. 약 44분 정도 걸리고, 대략 22정거장 정도예요.",
      french:
        "Bien sûr. Comptez environ 44 minutes, soit à peu près 22 arrêts.",
      romanization:
        "Ne. Yak 44bun jeongdo geolligo, daeryak 22jeonggeojang jeongdo-yeyo.",
      choices: [
        {
          id: "repeat_trip_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_trip_time_short",
        },
        {
          id: "ask_transfer_after_trip_repeat",
          label: "Est-ce qu'il y a un transfert ?",
          korean: "환승은 있나요?",
          romanization: "Hwansung-eun innayo?",
          nextId: "ia_transfer_info",
        },
        {
          id: "ask_exit_after_trip_repeat",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_trip_time_short",
      speaker: "ai",
      phase: "Trajet",
      text: "En résumé : environ 44 minutes, environ 22 arrêts.",
      korean: "정리해서 말씀드리면, 약 44분, 약 22정거장이에요.",
      french: "En résumé : environ 44 minutes, environ 22 arrêts.",
      romanization:
        "Jeongrihaeseo malsseumdeurimyeon, yak 44bun, yak 22jeonggeojang-ieyo.",
      choices: [
        {
          id: "ask_transfer_after_trip_short",
          label: "Est-ce qu'il y a un transfert ?",
          korean: "환승은 있나요?",
          romanization: "Hwansung-eun innayo?",
          nextId: "ia_transfer_info",
        },
        {
          id: "ask_exit_after_trip_short",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_trip_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_transfer_info",
      speaker: "ai",
      phase: "Trajet",
      text: "Non, il n'y a pas de transfert. Vous pouvez y aller directement en restant sur la ligne 2.",
      korean: "아니요, 환승은 없어요. 2호선으로 그대로 가시면 돼요.",
      french:
        "Non, il n'y a pas de transfert. Vous pouvez y aller directement en restant sur la ligne 2.",
      romanization:
        "Aniyo, hwansung-eun eopseoyo. Ihoseoneuro geudaero gasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_transfer",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_transfer_info",
        },
        {
          id: "ask_exit_after_transfer",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_transfer",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_transfer_info",
      speaker: "ai",
      phase: "Trajet",
      text: "Oui. C'est direct. Aucun transfert n'est nécessaire.",
      korean: "네. 직행이에요. 환승은 필요 없어요.",
      french: "Oui. C'est direct. Aucun transfert n'est nécessaire.",
      romanization: "Ne. Jikhaeng-ieyo. Hwansung-eun pilyo eopseoyo.",
      choices: [
        {
          id: "ask_exit_after_transfer_repeat",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_transfer_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "repeat_transfer_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_transfer_info_short",
        },
      ],
    },

    {
      id: "ia_repeat_transfer_info_short",
      speaker: "ai",
      phase: "Trajet",
      text: "Très simplement : pas de transfert, restez sur la ligne 2.",
      korean: "아주 간단히 말씀드리면, 환승 없이 2호선 그대로 가시면 돼요.",
      french: "Très simplement : pas de transfert, restez sur la ligne 2.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, hwansung eopsi ihoseon geudaero gasimyeon dwaeyo.",
      choices: [
        {
          id: "ask_exit_after_transfer_short",
          label: "Quelle sortie dois-je prendre à Gangnam ?",
          korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Gangnam-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
        {
          id: "thank_after_transfer_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "ask_trip_again_after_transfer_short",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_exit_info",
      speaker: "ai",
      phase: "Sortie",
      narrator:
        "Le passant vous explique maintenant comment sortir une fois arrivé à Gangnam.",
      text: "Une fois arrivé à Gangnam, prenez la sortie numéro 2. Vous arriverez directement vers Gangnam-daero.",
      korean:
        "강남역에 도착하면 2번 출구로 나오세요. 그러면 바로 강남대로 쪽으로 나가실 수 있어요.",
      french:
        "Une fois arrivé à Gangnam, prenez la sortie numéro 2. Vous arriverez directement vers Gangnam-daero.",
      romanization:
        "Gangnam-yeoge dochakhamyeon 2beon chulgu-ro naoseyo. Geureomyeon baro Gangnam-daero jjogeuro nagasil su isseoyo.",
      choices: [
        {
          id: "repeat_exit",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_info",
        },
        {
          id: "ask_more_exit",
          label: "Et le COEX ou Teheran-ro, c'est proche ?",
          korean: "COEX나 테헤란로도 가까운가요?",
          romanization: "COEX-na Teheran-ro-do gakkaunga-yo?",
          nextId: "ia_exit_landmark_info",
        },
        {
          id: "thank_final",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_exit_info",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui. À Gangnam, prenez la sortie 2.",
      korean: "네. 강남역에서는 2번 출구로 나오세요.",
      french: "Oui. À Gangnam, prenez la sortie 2.",
      romanization: "Ne. Gangnam-yeogeseoneun 2beon chulgu-ro naoseyo.",
      choices: [
        {
          id: "repeat_exit_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_info_short",
        },
        {
          id: "ask_landmark_after_exit_repeat",
          label: "Et le COEX ou Teheran-ro, c'est proche ?",
          korean: "COEX나 테헤란로도 가까운가요?",
          romanization: "COEX-na Teheran-ro-do gakkaunga-yo?",
          nextId: "ia_exit_landmark_info",
        },
        {
          id: "thank_after_exit_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_exit_info_short",
      speaker: "ai",
      phase: "Sortie",
      text: "Très simplement : sortie numéro 2.",
      korean: "아주 간단히 말씀드리면, 2번 출구예요.",
      french: "Très simplement : sortie numéro 2.",
      romanization: "Aju gandanhi malsseumdeurimyeon, 2beon chulgu-yeyo.",
      choices: [
        {
          id: "ask_landmark_after_exit_short",
          label: "Et le COEX ou Teheran-ro, c'est proche ?",
          korean: "COEX나 테헤란로도 가까운가요?",
          romanization: "COEX-na Teheran-ro-do gakkaunga-yo?",
          nextId: "ia_exit_landmark_info",
        },
        {
          id: "thank_after_exit_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "ask_transfer_again_from_exit_short",
          label: "Donc il n'y a vraiment pas de transfert ?",
          korean: "그럼 정말 환승은 없나요?",
          romanization: "Geureom jeongmal hwansung-eun eomnayo?",
          nextId: "ia_transfer_info",
        },
      ],
    },

    {
      id: "ia_exit_landmark_info",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui, c'est assez proche. En sortant par la sortie 2, vous rejoignez facilement Gangnam-daero, et vous pouvez ensuite continuer vers le COEX ou Teheran-ro.",
      korean:
        "네, 꽤 가까워요. 2번 출구로 나오시면 강남대로로 쉽게 가실 수 있고, 거기서 COEX나 테헤란로 쪽으로 계속 가시면 돼요.",
      french:
        "Oui, c'est assez proche. En sortant par la sortie 2, vous rejoignez facilement Gangnam-daero, et vous pouvez ensuite continuer vers le COEX ou Teheran-ro.",
      romanization:
        "Ne, kkwae gakkawoyo. 2beon chulgu-ro naosimyeon Gangnam-daero-ro swipge gasil su itgo, geogiseo COEX-na Teheran-ro jjogeuro gyesok gasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_landmark",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_landmark_info",
        },
        {
          id: "thank_after_landmark",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "ask_transfer_after_landmark",
          label: "Et il n'y a toujours pas de transfert ?",
          korean: "그리고 여전히 환승은 없나요?",
          romanization: "Geurigo yeojeonhi hwansung-eun eomnayo?",
          nextId: "ia_transfer_info",
        },
      ],
    },

    {
      id: "ia_repeat_exit_landmark_info",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui. Sortez par la sortie 2, puis continuez vers Gangnam-daero. Le COEX et Teheran-ro sont accessibles depuis là.",
      korean:
        "네. 2번 출구로 나오신 다음 강남대로 쪽으로 가세요. 거기서 COEX와 테헤란로로 이동하실 수 있어요.",
      french:
        "Oui. Sortez par la sortie 2, puis continuez vers Gangnam-daero. Le COEX et Teheran-ro sont accessibles depuis là.",
      romanization:
        "Ne. 2beon chulgu-ro naosin daeum Gangnam-daero jjogeuro gaseyo. Geogiseo COEX-wa Teheran-ro-ro idonghasil su isseoyo.",
      choices: [
        {
          id: "thank_after_landmark_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "repeat_landmark_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_exit_landmark_info_short",
        },
        {
          id: "ask_transfer_after_landmark_repeat",
          label: "Et il n'y a toujours pas de transfert ?",
          korean: "그리고 여전히 환승은 없나요?",
          romanization: "Geurigo yeojeonhi hwansung-eun eomnayo?",
          nextId: "ia_transfer_info",
        },
      ],
    },

    {
      id: "ia_repeat_exit_landmark_info_short",
      speaker: "ai",
      phase: "Sortie",
      text: "En bref : sortie 2, puis direction Gangnam-daero.",
      korean: "짧게 말씀드리면, 2번 출구, 그리고 강남대로 방향이에요.",
      french: "En bref : sortie 2, puis direction Gangnam-daero.",
      romanization:
        "Jjalge malsseumdeurimyeon, 2beon chulgu, geurigo Gangnam-daero banghyang-ieyo.",
      choices: [
        {
          id: "thank_after_landmark_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "ask_transfer_after_landmark_short",
          label: "Et il n'y a toujours pas de transfert ?",
          korean: "그리고 여전히 환승은 없나요?",
          romanization: "Geurigo yeojeonhi hwansung-eun eomnayo?",
          nextId: "ia_transfer_info",
        },
        {
          id: "repeat_landmark_short_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end_summary",
        },
      ],
    },

    {
      id: "ia_end_summary",
      speaker: "ai",
      phase: "Fin",
      text: "Je résume : prenez la ligne 2 à Hongik University, direction Gangnam, sans transfert, puis sortez par la sortie 2.",
      korean:
        "정리해 드리면, 홍익대입구역에서 2호선을 타고 강남 방향으로 가세요. 환승은 없고, 도착하면 2번 출구로 나오시면 됩니다.",
      french:
        "Je résume : prenez la ligne 2 à Hongik University, direction Gangnam, sans transfert, puis sortez par la sortie 2.",
      romanization:
        "Jeongrihae deurimyeon, Hongikdaeipgu-yeogeseo ihoseoneul tago Gangnam banghyang-euro gaseyo. Hwansung-eun eopgo, dochakhamyeon 2beon chulgu-ro naosimyeon doemnida.",
      choices: [
        {
          id: "thank_after_summary",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "repeat_summary",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end_summary_short",
        },
        {
          id: "ask_transfer_after_summary",
          label: "Donc il n'y a vraiment pas de transfert ?",
          korean: "그럼 정말 환승은 없나요?",
          romanization: "Geureom jeongmal hwansung-eun eomnayo?",
          nextId: "ia_transfer_info",
        },
      ],
    },

    {
      id: "ia_end_summary_short",
      speaker: "ai",
      phase: "Fin",
      text: "Très simplement : ligne 2, direction Gangnam, pas de transfert, sortie 2.",
      korean:
        "아주 간단히 말씀드리면, 2호선, 강남 방향, 환승 없음, 2번 출구예요.",
      french:
        "Très simplement : ligne 2, direction Gangnam, pas de transfert, sortie 2.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, ihoseon, Gangnam banghyang, hwansung eopseum, 2beon chulgu-yeyo.",
      choices: [
        {
          id: "thank_after_summary_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "repeat_summary_short_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end",
        },
        {
          id: "ask_exit_again_after_summary_short",
          label: "Quelle sortie déjà ?",
          korean: "출구가 몇 번이라고 하셨죠?",
          romanization: "Chulgu-ga myeot beon-irago hasyeotjyo?",
          nextId: "ia_repeat_exit_info_short",
        },
      ],
    },

    {
      id: "ia_end",
      speaker: "ai",
      phase: "Fin",
      narrator: "La conversation se termine naturellement.",
      text: "De rien ! Bon voyage et bonne journée !",
      korean: "천만에요! 안전하게 다녀오세요. 좋은 하루 되세요!",
      french: "De rien ! Bon voyage et bonne journée !",
      romanization: "Cheonmaneyo! Anjeonhage danyeooseyo. Joeun haru doeseyo!",
    },
  ],
};

export const metroLessons: MetroLesson[] = [
  hongikToGangnamLesson,
  myeongdongToItaewonLesson,
  seoulStationToJamsilLesson,
];

export const metroLessonsMap: Record<string, MetroLesson> = {
  [hongikToGangnamLesson.id]: hongikToGangnamLesson,
  [myeongdongToItaewonLesson.id]: myeongdongToItaewonLesson,
  [seoulStationToJamsilLesson.id]: seoulStationToJamsilLesson,
};

export function getMetroLessonById(id: string): MetroLesson | undefined {
  return metroLessonsMap[id];
}

export function getMetroStepById(
  lesson: MetroLesson,
  stepId: string,
): MetroStep | undefined {
  return lesson.steps.find((step) => step.id === stepId);
}

export function createInitialMetroState(lesson: MetroLesson): MetroState {
  const firstStep = getMetroStepById(lesson, "start");

  return {
    lessonId: lesson.id,
    currentStepId: "start",
    history: firstStep ? [firstStep] : [],
    finished: false,
  };
}

export function getNextMetroState(
  lesson: MetroLesson,
  currentState: MetroState,
  nextStepId: string,
): MetroState {
  const nextStep = getMetroStepById(lesson, nextStepId);

  if (!nextStep) {
    return currentState;
  }

  return {
    ...currentState,
    lessonId: lesson.id,
    currentStepId: nextStepId,
    history: [...currentState.history, nextStep],
    finished: nextStepId === "ia_end",
  };
}
