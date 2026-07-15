import CountingImmersionScreen from "../../../components/comptage/CountingImmersionScreen";

const COLORS = {
  techCyan: "#22D3EE",
  silver: "#CBD5E1",
  kakaoYellow: "#FDE047",
};

// ──────────────────────────────────────────────
// DESIGN SYSTEM — DIGITAL YEOUIDO EDITION
// ──────────────────────────────────────────────

type CountingAudioSet = {
  messages: number[];
  toolbox: (number | undefined)[];
};

const withSceneAudio = (scenes: any[], audioSets: CountingAudioSet[]) =>
  scenes.map((scene, sceneIndex) => {
    const audioSet = audioSets[sceneIndex];

    if (!audioSet) return scene;

    return {
      ...scene,
      dialogue: scene.dialogue.map((line: any, index: number) => ({
        ...line,
        ...(audioSet.messages[index] ? { audio: audioSet.messages[index] } : {}),
      })),
      expressions: scene.expressions.map((expression: any, index: number) => ({
        ...expression,
        ...(audioSet.toolbox[index] ? { audio: audioSet.toolbox[index] } : {}),
      })),
    };
  });

const ECHANGE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-1.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-2.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-3.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/echange-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/echange/toolbox/echange-toolbox-6.mp3"),
  ],
};

const TELEPHONE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-1.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-2.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-3.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/telephone-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/telephone/toolbox/telephone-toolbox-6.mp3"),
  ],
};

const MESSAGERIE_AUDIO = {
  messages: [
    require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-1.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-2.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-3.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/messagerie-bulle-4.mp3"),
  ],
  toolbox: [
    require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-1.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-2.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-3.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-4.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-5.mp3"),
    require("../../../assets/audio/comptage/telephone-contact/messagerie/toolbox/messagerie-toolbox-6.mp3"),
  ],
};

const SCENES = withSceneAudio([
  {
    id: "exchange",
    title: "L'Échange",
    koreanTitle: "연락처 교환 (Contact Exchange)",
    description: "Échanger son numéro lors d'une rencontre de networking.",
    accent: COLORS.techCyan,
    image:
      "https://images.unsplash.com/photo-1556740734-7f9a2b7a0f4d?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "번호 좀 알려주시겠어요?",
        fr: "Pourriez-vous me donner votre numéro ?",
      },
      {
        char: "Min-ho",
        kr: "네, 제 번호는 공일공-이삼사-오육칠팔이에요.",
        fr: "Oui, mon numéro est le 010-234-5678.",
      },
      {
        char: "Moi",
        kr: "다시 한번 천천히 말씀해 주시겠어요?",
        fr: "Pourriez-vous le redire lentement une fois ?",
      },
      {
        char: "Min-ho",
        kr: "공일공, 이삼사, 오육칠팔이에요.",
        fr: "C'est 010, 234, 5678.",
      },
    ],
    expressions: [
      {
        word: "번호",
        rom: "Beon-ho",
        mean: "Numéro",
        context: "Utilisé pour le numéro de téléphone, de chambre ou d'ordre.",
      },
      {
        word: "공일공",
        rom: "Gong-il-gong",
        mean: "010",
        context:
          "L'indicatif standard pour presque tous les portables en Corée.",
      },
      {
        word: "알려주다",
        rom: "Al-lyeo-juda",
        mean: "Faire savoir / Donner",
        context: "Forme polie pour demander une information.",
      },
      {
        word: "다시 한번",
        rom: "Dasi hanbeon",
        mean: "Encore une fois",
        context: "À utiliser quand un numéro a été dit trop vite.",
      },
      {
        word: "천천히",
        rom: "Cheoncheonhi",
        mean: "Lentement",
        context: "Indispensable pour demander une répétition plus claire.",
      },
      {
        word: "오육칠팔",
        rom: "O-yuk-chil-pal",
        mean: "5678",
        context: "Les numéros se prononcent chiffre par chiffre.",
      },
    ],
  },
  {
    id: "call",
    title: "Au Téléphone",
    koreanTitle: "전화 통화 (Phone Call)",
    description: "Répondre à un appel formel ou laisser un message.",
    accent: COLORS.silver,
    image:
      "https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Manager",
        kr: "여보세요, 김수현 씨 계십니까?",
        fr: "Allô, est-ce que M. Kim Su-hyeon est là ?",
      },
      {
        char: "Moi",
        kr: "네, 제가 김수현입니다. 누구세요?",
        fr: "Oui, c'est moi Kim Su-hyeon. Qui est à l'appareil ?",
      },
      {
        char: "Manager",
        kr: "회의 시간이 삼 시에서 네 시로 바뀌었어요.",
        fr: "L'heure de la réunion est passée de 3h à 4h.",
      },
      {
        char: "Moi",
        kr: "네, 네 시에 다시 전화드릴게요.",
        fr: "D'accord, je vous rappellerai à quatre heures.",
      },
    ],
    expressions: [
      {
        word: "여보세요",
        rom: "Yeo-bo-se-yo",
        mean: "Allô",
        context:
          "Uniquement utilisé au téléphone pour saluer ou vérifier la ligne.",
      },
      {
        word: "부재중",
        rom: "Bu-jae-jung",
        mean: "Absent / Manqué",
        context: "Apparaît sur votre écran pour les 'appels manqués'.",
      },
      {
        word: "통화 중",
        rom: "Tong-hwa jung",
        mean: "En ligne / Occupé",
        context: "Quand la personne est déjà en communication.",
      },
      {
        word: "누구세요?",
        rom: "Nuguseyo?",
        mean: "Qui est-ce ?",
        context: "Forme directe mais polie au téléphone.",
      },
      {
        word: "다시 전화드릴게요",
        rom: "Dasi jeonhwa-deurilgeyo",
        mean: "Je vous rappellerai",
        context: "Forme honorifique utile dans un appel professionnel.",
      },
      {
        word: "바뀌었어요",
        rom: "Bakkwieosseoyo",
        mean: "Ça a changé",
        context: "Pour signaler un changement d'horaire ou de plan.",
      },
    ],
  },
  {
    id: "messaging",
    title: "Messagerie",
    koreanTitle: "문자 / 카톡 (Texting)",
    description: "Codes de la messagerie instantanée coréenne.",
    accent: COLORS.kakaoYellow,
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "카톡 확인해봐! 이모티콘 보냈어.",
        fr: "Regarde ton KakaoTalk ! Je t'ai envoyé un emoji.",
      },
      {
        char: "Moi",
        kr: "답장이 늦어서 미안! 이따가 봐.",
        fr: "Désolé pour la réponse tardive ! On se voit tout à l'heure.",
      },
      {
        char: "Ami",
        kr: "괜찮아, 여덟 시 전에 답장만 해줘.",
        fr: "Pas grave, réponds-moi juste avant 8h.",
      },
      {
        char: "Moi",
        kr: "응, 일곱 시 반쯤 보낼게.",
        fr: "Oui, je l'enverrai vers 7h30.",
      },
    ],
    expressions: [
      {
        word: "카톡",
        rom: "Ka-tok",
        mean: "KakaoTalk",
        context: "Le verbe et nom universel pour le messaging en Corée.",
      },
      {
        word: "답장",
        rom: "Dap-jang",
        mean: "Réponse (écrite)",
        context: "Utilisé pour les SMS, mails ou chats.",
      },
      {
        word: "읽씹",
        rom: "Ik-ssip",
        mean: "Lu et ignoré",
        context: "Argot pour 'Vu' mais pas de réponse (très mal vu !).",
      },
      {
        word: "확인해봐",
        rom: "Hwagin-haebwa",
        mean: "Va vérifier",
        context: "Expression familière pour demander de regarder une appli.",
      },
      {
        word: "이따가",
        rom: "Ittaga",
        mean: "Tout à l'heure",
        context: "Très naturel pour parler d'un futur proche.",
      },
      {
        word: "일곱 시 반",
        rom: "Ilgop si ban",
        mean: "7h30",
        context: "Ban remplace souvent '30 minutes' à l'oral.",
      },
    ],
  },
], [ECHANGE_AUDIO, TELEPHONE_AUDIO, MESSAGERIE_AUDIO]);

export default function PhoneContactImmersion() {
  return (
    <CountingImmersionScreen
      scenes={SCENES}
      backLabel="SÉOUL CONNECTÉ"
      badgeLabel="5G ACTIVE"
      toolboxTitle="CONTACT TOOLBOX"
    />
  );
}
