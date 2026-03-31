import type { MetroLesson } from "./type";

const hongikToGangnamLesson: MetroLesson = {
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

const myeongdongToItaewonLesson: MetroLesson = {
  id: "myeongdong_to_itaewon",
  title: "Aller à Itaewon depuis Myeongdong",
  shortTitle: "Myeongdong → Itaewon",
  situation:
    "Vous êtes à Myeongdong station (명동역). Vous voulez aller à Itaewon et vous demandez votre chemin à un passant coréen.",
  objective:
    "Comprendre les indications essentielles : ligne, correspondance, direction, durée du trajet et sortie.",
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
            "Excusez-moi, comment je fais pour aller à Itaewon depuis Myeongdong ?",
          korean: "실례합니다, 명동에서 이태원까지 어떻게 가나요?",
          romanization:
            "Sillyehamnida, Myeongdong-eseo Itaewon-kkaji eotteoke ganayo?",
          nextId: "ia_intro_route",
        },
        {
          id: "ask2",
          label: "Itaewon, comment y aller depuis ici ?",
          korean: "이태원 어떻게 가요?",
          romanization: "Itaewon eotteoke gayo?",
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
      narrator: "Le passant vous répond d'abord de manière simple et claire.",
      text: "Oui, bien sûr. Depuis Myeongdong, prenez d'abord la ligne 4. Ensuite, changez pour la ligne 6 afin d'aller à Itaewon.",
      korean:
        "네, 물론이죠. 명동역에서는 먼저 4호선을 타세요. 그다음에 6호선으로 환승해서 이태원으로 가시면 돼요.",
      french:
        "Oui, bien sûr. Depuis Myeongdong, prenez d'abord la ligne 4. Ensuite, changez pour la ligne 6 afin d'aller à Itaewon.",
      romanization:
        "Ne, mullonijyo. Myeongdong-yeogeseoneun meonjeo sahoseoneul taseyo. Geudaeume yukhoseoneuro hwansunghaeseo Itaewon-euro gasimyeon dwaeyo.",
      choices: [
        {
          id: "repeat_intro",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_intro_route",
        },
        {
          id: "ask_transfer",
          label: "Où exactement je dois changer de ligne ?",
          korean: "환승은 어디서 하나요?",
          romanization: "Hwansung-eun eodiseo hanayo?",
          nextId: "ia_transfer_station",
        },
        {
          id: "ask_time_intro",
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
      text: "Bien sûr. Prenez d'abord la ligne 4, puis changez pour la ligne 6 pour aller à Itaewon.",
      korean:
        "물론이죠. 먼저 4호선을 타고, 그다음에 6호선으로 갈아타서 이태원으로 가세요.",
      french:
        "Bien sûr. Prenez d'abord la ligne 4, puis changez pour la ligne 6 pour aller à Itaewon.",
      romanization:
        "Mullonijyo. Meonjeo sahoseoneul tago, geudaeume yukhoseoneuro garataseo Itaewon-euro gaseyo.",
      choices: [
        {
          id: "repeat_intro_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_intro_route_short",
        },
        {
          id: "ask_transfer_after_repeat",
          label: "Où exactement je dois changer de ligne ?",
          korean: "환승은 어디서 하나요?",
          romanization: "Hwansung-eun eodiseo hanayo?",
          nextId: "ia_transfer_station",
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
      text: "Je répète plus simplement : ligne 4 d'abord, puis ligne 6 pour Itaewon.",
      korean:
        "더 간단히 말씀드리면, 먼저 4호선, 그다음 6호선으로 이태원에 가시면 돼요.",
      french:
        "Je répète plus simplement : ligne 4 d'abord, puis ligne 6 pour Itaewon.",
      romanization:
        "Deo gandanhi malsseumdeurimyeon, meonjeo sahoseon, geudaeum yukhoseoneuro Itaewon-e gaseyo.",
      choices: [
        {
          id: "go_transfer_after_short",
          label: "D'accord. Je change où exactement ?",
          korean: "알겠어요. 어디서 갈아타면 되나요?",
          romanization: "Algesseoyo. Eodiseo garatamyeon doenayo?",
          nextId: "ia_transfer_station",
        },
        {
          id: "go_time_after_short",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "go_exit_after_short",
          label: "Et quelle sortie prendre à Itaewon ?",
          korean: "그리고 이태원역에서는 몇 번 출구로 나가면 되나요?",
          romanization:
            "Geurigo Itaewon-yeogeseoneun myeot beon chulgu-ro nagamyeon doenayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_transfer_station",
      speaker: "ai",
      phase: "Direction",
      narrator:
        "Le passant vous donne maintenant le détail de la correspondance.",
      text: "Vous devez changer à Samgakji. Descendez de la ligne 4, suivez les panneaux pour la ligne 6, puis prenez la ligne 6 en direction d'Itaewon.",
      korean:
        "삼각지역에서 환승하시면 돼요. 4호선에서 내리신 다음 6호선 표지판을 따라가시고, 이태원 방향 6호선을 타세요.",
      french:
        "Vous devez changer à Samgakji. Descendez de la ligne 4, suivez les panneaux pour la ligne 6, puis prenez la ligne 6 en direction d'Itaewon.",
      romanization:
        "Samgakji-yeogeseo hwansunghasimyeon dwaeyo. Sahoseon-eseo naerisin daeum yukhoseon pyojipaneul ttaragashigo, Itaewon banghyang yukhoseoneul taseyo.",
      choices: [
        {
          id: "repeat_transfer_station",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_transfer_station",
        },
        {
          id: "ask_direction_after_transfer",
          label: "Comment savoir que je suis dans la bonne direction ?",
          korean: "방향은 어떻게 확인하나요?",
          romanization: "Banghyang-eun eotteoke hwaginhanayo?",
          nextId: "ia_platform_direction",
        },
        {
          id: "ask_exit_from_transfer",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_transfer_station",
      speaker: "ai",
      phase: "Direction",
      text: "Oui. Changez à Samgakji, puis prenez la ligne 6 en direction d'Itaewon.",
      korean: "네. 삼각지역에서 환승하시고, 이태원 방향 6호선을 타세요.",
      french:
        "Oui. Changez à Samgakji, puis prenez la ligne 6 en direction d'Itaewon.",
      romanization:
        "Ne. Samgakji-yeogeseo hwansunghasigo, Itaewon banghyang yukhoseoneul taseyo.",
      choices: [
        {
          id: "repeat_transfer_station_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_transfer_station_short",
        },
        {
          id: "ask_direction_after_transfer_repeat",
          label: "Comment savoir que je suis dans la bonne direction ?",
          korean: "방향은 어떻게 확인하나요?",
          romanization: "Banghyang-eun eotteoke hwaginhanayo?",
          nextId: "ia_platform_direction",
        },
        {
          id: "ask_time_after_transfer_repeat",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
      ],
    },

    {
      id: "ia_repeat_transfer_station_short",
      speaker: "ai",
      phase: "Direction",
      text: "Très simplement : changez à Samgakji, puis ligne 6 pour Itaewon.",
      korean:
        "아주 간단히 말씀드리면, 삼각지역에서 환승하고 6호선으로 이태원에 가시면 돼요.",
      french:
        "Très simplement : changez à Samgakji, puis ligne 6 pour Itaewon.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, Samgakji-yeogeseo hwansunghago yukhoseoneuro Itaewon-e gaseyo.",
      choices: [
        {
          id: "ask_direction_after_transfer_short",
          label: "Comment savoir que je suis dans la bonne direction ?",
          korean: "방향은 어떻게 확인하나요?",
          romanization: "Banghyang-eun eotteoke hwaginhanayo?",
          nextId: "ia_platform_direction",
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
      id: "ia_platform_direction",
      speaker: "ai",
      phase: "Direction",
      text: "Regardez les panneaux de la ligne 6 sur le quai. Si l'écran indique Itaewon, c'est la bonne direction.",
      korean:
        "6호선 플랫폼 표지판을 보세요. 전광판에 '이태원'이라고 나오면 그 방향이 맞아요.",
      french:
        "Regardez les panneaux de la ligne 6 sur le quai. Si l'écran indique Itaewon, c'est la bonne direction.",
      romanization:
        "Yukhoseon peullaetpom pyojipaneul boseyo. Jeon-gwangpane 'Itaewon' irago naomyeon geu banghyang-i majayo.",
      choices: [
        {
          id: "repeat_platform_direction",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_platform_direction",
        },
        {
          id: "ask_time_from_direction",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "ask_exit_from_direction",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_platform_direction",
      speaker: "ai",
      phase: "Direction",
      text: "Oui. Vérifiez l'écran du quai de la ligne 6. Si Itaewon est affiché, c'est le bon sens.",
      korean:
        "네. 6호선 플랫폼 전광판을 확인하세요. 이태원이 표시되면 그 방향이 맞아요.",
      french:
        "Oui. Vérifiez l'écran du quai de la ligne 6. Si Itaewon est affiché, c'est le bon sens.",
      romanization:
        "Ne. Yukhoseon peullaetpom jeon-gwangpaneul hwaginhaseyo. Itaewon-i pyosidoemyeon geu banghyang-i majayo.",
      choices: [
        {
          id: "repeat_platform_direction_2",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_repeat_platform_direction_short",
        },
        {
          id: "ask_time_after_direction_repeat",
          label: "Combien de temps dure le trajet ?",
          korean: "시간은 얼마나 걸리나요?",
          romanization: "Siganeun eolmana geollinayo?",
          nextId: "ia_trip_time",
        },
        {
          id: "ask_exit_after_direction_repeat",
          label: "Quelle sortie dois-je prendre à Itaewon ?",
          korean: "이태원역에서는 몇 번 출구로 나가야 하나요?",
          romanization:
            "Itaewon-yeogeseoneun myeot beon chulgu-ro nagaya hanayo?",
          nextId: "ia_exit_info",
        },
      ],
    },

    {
      id: "ia_repeat_platform_direction_short",
      speaker: "ai",
      phase: "Direction",
      text: "Très simplement : ligne 6, direction Itaewon.",
      korean: "아주 간단히 말씀드리면, 6호선 이태원 방향이에요.",
      french: "Très simplement : ligne 6, direction Itaewon.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, yukhoseon Itaewon banghyang-ieyo.",
      choices: [
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
        {
          id: "thank_after_direction_short",
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
      narrator: "Vous obtenez maintenant une précision sur la durée du trajet.",
      text: "Le trajet prend environ 18 à 22 minutes selon l'attente et la correspondance.",
      korean: "대기 시간과 환승 시간을 포함하면 약 18분에서 22분 정도 걸려요.",
      french:
        "Le trajet prend environ 18 à 22 minutes selon l'attente et la correspondance.",
      romanization:
        "Daegi sigan-gwa hwansung siganeul pohamhamyeon yak 18bun-eseo 22bun jeongdo geollyeoyo.",
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
      text: "Bien sûr. Comptez environ vingt minutes, parfois un peu plus selon la correspondance.",
      korean:
        "네. 보통 20분 정도 생각하시면 되고, 환승 상황에 따라 조금 더 걸릴 수도 있어요.",
      french:
        "Bien sûr. Comptez environ vingt minutes, parfois un peu plus selon la correspondance.",
      romanization:
        "Ne. Botong isipbun jeongdo saenggakhasimyeon doego, hwansung sanghwang-e ttara jogeum deo geollil sudo isseoyo.",
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
      text: "Comptez environ sept arrêts au total, selon le point exact où vous changez.",
      korean: "환승 구간을 포함해서 대략 7정거장 정도라고 생각하시면 돼요.",
      french:
        "Comptez environ sept arrêts au total, selon le point exact où vous changez.",
      romanization:
        "Hwansung gu-ganeul pohamhaeseo daeryak ilgop jeonggeojang jeongdo-rago saenggakhasimyeon dwaeyo.",
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
          id: "thank_after_station_count",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
      ],
    },

    {
      id: "ia_repeat_station_count",
      speaker: "ai",
      phase: "Trajet",
      text: "Oui. En tout, il y a environ sept arrêts.",
      korean: "네. 전체적으로는 약 7정거장 정도예요.",
      french: "Oui. En tout, il y a environ sept arrêts.",
      romanization:
        "Ne. Jeonchejeogeuro-neun yak ilgop jeonggeojang jeongdo-yeyo.",
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
      text: "Très simplement : environ sept arrêts.",
      korean: "아주 간단히 말씀드리면, 약 7정거장이에요.",
      french: "Très simplement : environ sept arrêts.",
      romanization:
        "Aju gandanhi malsseumdeurimyeon, yak ilgop jeonggeojang-ieyo.",
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
          id: "thank_after_station_short",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "ask_transfer_again_after_station_short",
          label: "Je change bien à Samgakji, c'est ça ?",
          korean: "삼각지역에서 환승하는 거 맞죠?",
          romanization: "Samgakji-yeogeseo hwansunghaneun geo matjyo?",
          nextId: "ia_repeat_transfer_station_short",
        },
      ],
    },

    {
      id: "ia_exit_info",
      speaker: "ai",
      phase: "Sortie",
      narrator:
        "Le passant vous explique maintenant comment sortir une fois arrivé à Itaewon.",
      text: "À Itaewon, prenez la sortie numéro 1. Vous arriverez directement vers la rue principale d'Itaewon.",
      korean:
        "이태원역에 도착하면 1번 출구로 나오세요. 그러면 바로 이태원 메인 거리 쪽으로 나가실 수 있어요.",
      french:
        "À Itaewon, prenez la sortie numéro 1. Vous arriverez directement vers la rue principale d'Itaewon.",
      romanization:
        "Itaewon-yeoge dochakhamyeon 1beon chulgu-ro naoseyo. Geureomyeon baro Itaewon mein geori jjogeuro nagasil su isseoyo.",
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
      text: "Oui. À Itaewon, prenez la sortie 1.",
      korean: "네. 이태원역에서는 1번 출구로 나오세요.",
      french: "Oui. À Itaewon, prenez la sortie 1.",
      romanization: "Ne. Itaewon-yeogeseoneun 1beon chulgu-ro naoseyo.",
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
      romanization: "Aju gandanhi malsseumdeurimyeon, 1beon chulgu-yeyo.",
      choices: [
        {
          id: "ask_landmark_after_exit_short",
          label: "C'est près des restaurants et de la rue principale ?",
          korean: "레스토랑이 많은 메인 거리랑 가까운가요?",
          romanization: "Reseutorang-i maneun mein geori-rang gakkaunga-yo?",
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
          label: "Je dois bien changer une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwansung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
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
        "Ne, gakkawoyo. 1beon chulgu-ro naosimyeon reseutorang-gwa kape-ga maneun mein geori-ro geumbang gasil su isseoyo.",
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
          label: "Je dois bien changer une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwansung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
        },
      ],
    },

    {
      id: "ia_repeat_exit_landmark_info",
      speaker: "ai",
      phase: "Sortie",
      text: "Oui. Sortez par la sortie 1, puis vous arriverez vite dans la rue principale d'Itaewon.",
      korean:
        "네. 1번 출구로 나오시면 곧바로 이태원 메인 거리 쪽으로 가실 수 있어요.",
      french:
        "Oui. Sortez par la sortie 1, puis vous arriverez vite dans la rue principale d'Itaewon.",
      romanization:
        "Ne. 1beon chulgu-ro naosimyeon gotbaro Itaewon mein geori jjogeuro gasil su isseoyo.",
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
          label: "Je dois bien changer une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwansung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
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
        "Jjalge malsseumdeurimyeon, 1beon chulgu-ro nawaseo Itaewon mein geori-ro gasimyeon dwaeyo.",
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
          label: "Je dois bien changer une seule fois ?",
          korean: "환승은 한 번만 하면 되죠?",
          romanization: "Hwansung-eun han beonman hamyeon doejyo?",
          nextId: "ia_transfer_count_info",
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
      id: "ia_transfer_count_info",
      speaker: "ai",
      phase: "Trajet",
      text: "Oui, une seule correspondance suffit : ligne 4 d'abord, puis ligne 6.",
      korean: "네, 환승은 한 번만 하시면 돼요. 먼저 4호선, 그다음 6호선이에요.",
      french:
        "Oui, une seule correspondance suffit : ligne 4 d'abord, puis ligne 6.",
      romanization:
        "Ne, hwansung-eun han beonman hasimyeon dwaeyo. Meonjeo sahoseon, geudaeum yukhoseon-ieyo.",
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
      text: "Oui. Une seule fois. Vous changez de la ligne 4 à la ligne 6.",
      korean:
        "네. 한 번만 환승하시면 돼요. 4호선에서 6호선으로 갈아타시면 됩니다.",
      french: "Oui. Une seule fois. Vous changez de la ligne 4 à la ligne 6.",
      romanization:
        "Ne. Han beonman hwansunghasimyeon dwaeyo. Sahoseon-eseo yukhoseoneuro garatasimyeon doemnida.",
      choices: [
        {
          id: "thank_after_transfer_count_repeat",
          label: "Merci beaucoup, j'ai tout compris !",
          korean: "감사합니다, 다 이해했어요!",
          romanization: "Gamsahamnida, da ihaehaesseoyo!",
          nextId: "ia_end",
        },
        {
          id: "repeat_transfer_count_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
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
      ],
    },

    {
      id: "ia_end_summary",
      speaker: "ai",
      phase: "Fin",
      text: "Je résume : prenez la ligne 4 à Myeongdong, changez à Samgakji pour la ligne 6, allez vers Itaewon, puis sortez par la sortie 1.",
      korean:
        "정리해 드리면, 명동역에서 4호선을 타고 삼각지역에서 6호선으로 환승하세요. 이태원으로 가신 다음 1번 출구로 나오시면 됩니다.",
      french:
        "Je résume : prenez la ligne 4 à Myeongdong, changez à Samgakji pour la ligne 6, allez vers Itaewon, puis sortez par la sortie 1.",
      romanization:
        "Jeongrihae deurimyeon, Myeongdong-yeogeseo sahoseoneul tago Samgakji-yeogeseo yukhoseoneuro hwansunghaseyo. Itaewon-euro gasin daeum 1beon chulgu-ro naosimyeon doemnida.",
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
        "Aju gandanhi malsseumdeurimyeon, sahoseon, Samgakji-yeok hwansung, yukhoseon, 1beon chulgu-yeyo.",
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
          id: "repeat_summary_short_again",
          label: "Pouvez-vous répéter ?",
          korean: "다시 한번 말씀해 주실 수 있나요?",
          romanization: "Dasi hanbeon malsseumhae jusil su innayo?",
          nextId: "ia_end",
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

export default myeongdongToItaewonLesson;
