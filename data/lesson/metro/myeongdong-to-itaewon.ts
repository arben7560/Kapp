import type { MetroLesson } from "./type";

const myeongdongToItaewonLesson: MetroLesson = {
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
      korean: "아니에요! 이태원에서 즐거운 시간 보내세요!",
      french: "De rien ! Passez un bon moment à Itaewon !",
      romanization: "Aniyeyo! Itaewon-eseo jeulgeoun sigan bonaeseyo!",
    },
  ],
};

export default myeongdongToItaewonLesson;
