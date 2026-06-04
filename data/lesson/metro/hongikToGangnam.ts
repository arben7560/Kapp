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

export default hongikToGangnamLesson;
