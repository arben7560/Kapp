// data/immersionScenes.ts
export type Speaker = "narrator" | "npc" | "user";

export type Step =
  | { id: string; type: "line"; speaker: Speaker; kr: string; fr: string }
  | {
      id: string;
      type: "choice";
      promptKr: string;
      promptFr: string;
      options: {
        id: string;
        kr: string;
        fr: string;
        tone?: "naturel" | "poli" | "cool";
        goTo: string;
      }[];
    }
  | {
      id: string;
      type: "end";
      summaryKr: string;
      summaryFr: string;
      keyPhrases: { kr: string; fr: string }[];
    };
export type Scene = {
  id: string;
  title: string;
  place: "cafe" | "metro" | "shop" | "street" | "restaurant";
  level: "A0" | "A1" | "A2";
  vibe: string; // short flavor
  start: string; // step id
  steps: Step[];
};

const S1: Scene = {
  id: "cafe_smalltalk_order",
  title: "Café — commande + petite vibe naturelle",
  place: "cafe",
  level: "A1",
  vibe: "Tu commandes sans être “robot”, avec une micro interaction.",
  start: "n1",
  steps: [
    {
      id: "n1",
      type: "line",
      speaker: "narrator",
      kr: "홍대 근처 카페. 줄은 짧고, 음악이 좋아.",
      fr: "Un café près de Hongdae. Petite file, bonne musique.",
    },
    {
      id: "n2",
      type: "line",
      speaker: "npc",
      kr: "어서 오세요! 뭐 드릴까요?",
      fr: "Bienvenue ! Qu’est-ce que je te sers ?",
    },
    {
      id: "c1",
      type: "choice",
      promptKr: "너라면 어떻게 말할래?",
      promptFr: "Tu réponds comment ?",
      options: [
        {
          id: "o1",
          kr: "아메리카노 하나 주세요.",
          fr: "Un americano s’il vous plaît.",
          tone: "poli",
          goTo: "npc1",
        },
        {
          id: "o2",
          kr: "아메리카노요. 아이스로요!",
          fr: "Un americano. En iced !",
          tone: "naturel",
          goTo: "npc2",
        },
        {
          id: "o3",
          kr: "추천 뭐가 좋아요?",
          fr: "Vous recommandez quoi ?",
          tone: "naturel",
          goTo: "npc3",
        },
      ],
    },
    {
      id: "npc1",
      type: "line",
      speaker: "npc",
      kr: "네! 따뜻한 거요, 아이스요?",
      fr: "D’accord ! Chaud ou iced ?",
    },
    {
      id: "c2",
      type: "choice",
      promptKr: "골라봐.",
      promptFr: "Choisis.",
      options: [
        {
          id: "o1",
          kr: "아이스로 주세요.",
          fr: "Iced, s’il vous plaît.",
          tone: "poli",
          goTo: "pay1",
        },
        {
          id: "o2",
          kr: "아이스요. 감사합니다!",
          fr: "Iced. Merci !",
          tone: "naturel",
          goTo: "pay1",
        },
      ],
    },
    {
      id: "npc2",
      type: "line",
      speaker: "npc",
      kr: "좋아요. 사이즈는 뭐로 드릴까요?",
      fr: "Ok. Quelle taille ?",
    },
    {
      id: "c3",
      type: "choice",
      promptKr: "자연스럽게 말해봐.",
      promptFr: "Réponds naturellement.",
      options: [
        {
          id: "o1",
          kr: "미디엄으로요.",
          fr: "En medium.",
          tone: "naturel",
          goTo: "pay1",
        },
        {
          id: "o2",
          kr: "큰 걸로 주세요.",
          fr: "En grand, s’il vous plaît.",
          tone: "poli",
          goTo: "pay1",
        },
      ],
    },
    {
      id: "npc3",
      type: "line",
      speaker: "npc",
      kr: "오늘은 바닐라 라떼가 제일 잘 나가요.",
      fr: "Aujourd’hui le latte vanille marche très bien.",
    },
    {
      id: "c4",
      type: "choice",
      promptKr: "어떻게 받을래?",
      promptFr: "Tu prends quoi ?",
      options: [
        {
          id: "o1",
          kr: "그럼 바닐라 라떼로 주세요.",
          fr: "Alors un latte vanille, s’il vous plaît.",
          tone: "poli",
          goTo: "pay1",
        },
        {
          id: "o2",
          kr: "오케이! 그거 주세요.",
          fr: "Ok ! Je prends ça.",
          tone: "cool",
          goTo: "pay1",
        },
      ],
    },
    {
      id: "pay1",
      type: "line",
      speaker: "npc",
      kr: "매장에서 드세요, 가져가세요?",
      fr: "Sur place ou à emporter ?",
    },
    {
      id: "c5",
      type: "choice",
      promptKr: "대답!",
      promptFr: "Réponds !",
      options: [
        {
          id: "o1",
          kr: "여기서 마실게요.",
          fr: "Sur place.",
          tone: "naturel",
          goTo: "pay2",
        },
        {
          id: "o2",
          kr: "포장해 주세요.",
          fr: "À emporter, s’il vous plaît.",
          tone: "poli",
          goTo: "pay2",
        },
      ],
    },
    {
      id: "pay2",
      type: "line",
      speaker: "npc",
      kr: "카드예요, 현금이에요?",
      fr: "Carte ou espèces ?",
    },
    {
      id: "c6",
      type: "choice",
      promptKr: "너는?",
      promptFr: "Toi ?",
      options: [
        {
          id: "o1",
          kr: "카드로 할게요.",
          fr: "Je paie par carte.",
          tone: "naturel",
          goTo: "end",
        },
        {
          id: "o2",
          kr: "현금 있어요.",
          fr: "J’ai du cash.",
          tone: "naturel",
          goTo: "end",
        },
      ],
    },
    {
      id: "end",
      type: "end",
      summaryKr: "주문하고 결제까지 자연스럽게 완료!",
      summaryFr: "Commande + paiement faits naturellement !",
      keyPhrases: [
        { kr: "뭐 드릴까요?", fr: "Qu’est-ce que je te sers ?" },
        { kr: "매장에서 / 포장", fr: "Sur place / à emporter" },
        { kr: "카드로 할게요", fr: "Je paie par carte" },
      ],
    },
  ],
};

const S2: Scene = {
  id: "metro_help_line_transfer",
  title: "Métro — demander + gérer une info confuse",
  place: "metro",
  level: "A1",
  vibe: "Tu demandes ton chemin et tu clarifies sans paniquer.",
  start: "n1",
  steps: [
    {
      id: "n1",
      type: "line",
      speaker: "narrator",
      kr: "서울역. 사람 많아. 너는 2호선을 찾고 있어.",
      fr: "Seoul Station. Beaucoup de monde. Tu cherches la ligne 2.",
    },
    {
      id: "n2",
      type: "line",
      speaker: "npc",
      kr: "(어떤 사람이 빨리 걸어가고 있어)",
      fr: "(Quelqu’un marche vite)",
    },
    {
      id: "c1",
      type: "choice",
      promptKr: "어떻게 말을 걸까?",
      promptFr: "Tu l’abordes comment ?",
      options: [
        {
          id: "o1",
          kr: "실례합니다. 2호선 어디예요?",
          fr: "Excusez-moi. La ligne 2, c’est où ?",
          tone: "poli",
          goTo: "npc1",
        },
        {
          id: "o2",
          kr: "저기요! 2호선… 어디로 가요?",
          fr: "Euh ! La ligne 2… c’est par où ?",
          tone: "naturel",
          goTo: "npc1",
        },
      ],
    },
    {
      id: "npc1",
      type: "line",
      speaker: "npc",
      kr: "아… 2호선? 저쪽으로 가서 내려가면 돼요.",
      fr: "Ah… ligne 2 ? Par là, puis descends.",
    },
    {
      id: "npc2",
      type: "line",
      speaker: "npc",
      kr: "근데 지금 공사 중이라… 표지판 보고 가세요.",
      fr: "Mais il y a des travaux… suis les panneaux.",
    },
    {
      id: "c2",
      type: "choice",
      promptKr: "헷갈려. 한 번 더 확인할래?",
      promptFr: "C’est flou. Tu clarifies ?",
      options: [
        {
          id: "o1",
          kr: "죄송한데, ‘저쪽’이 어느 쪽이에요?",
          fr: "Désolé… ‘par là’, c’est quel côté ?",
          tone: "poli",
          goTo: "npc3",
        },
        {
          id: "o2",
          kr: "왼쪽이요? 오른쪽이요?",
          fr: "À gauche ? À droite ?",
          tone: "naturel",
          goTo: "npc3",
        },
        {
          id: "o3",
          kr: "아 네! 감사합니다.",
          fr: "Ah oui ! Merci.",
          tone: "poli",
          goTo: "end_fast",
        },
      ],
    },
    {
      id: "npc3",
      type: "line",
      speaker: "npc",
      kr: "저기 보이죠? 에스컬레이터. 그쪽으로!",
      fr: "Tu vois là-bas ? L’escalator. Par là !",
    },
    {
      id: "c3",
      type: "choice",
      promptKr: "마무리 한 마디?",
      promptFr: "Tu conclus comment ?",
      options: [
        {
          id: "o1",
          kr: "도와주셔서 감사합니다!",
          fr: "Merci pour votre aide !",
          tone: "poli",
          goTo: "end",
        },
        {
          id: "o2",
          kr: "아~ 오케이! 고마워요.",
          fr: "Ah ok ! Merci.",
          tone: "naturel",
          goTo: "end",
        },
      ],
    },
    {
      id: "end_fast",
      type: "end",
      summaryKr: "빠르게 넘어갔지만, 다음엔 확인 질문도 해보자!",
      summaryFr:
        "Tu as filé vite—la prochaine fois, ose une question de clarification !",
      keyPhrases: [
        { kr: "2호선 어디예요?", fr: "La ligne 2 c’est où ?" },
        { kr: "왼쪽이요? 오른쪽이요?", fr: "À gauche ? À droite ?" },
      ],
    },
    {
      id: "end",
      type: "end",
      summaryKr: "정보가 애매해도 ‘확인 질문’으로 해결!",
      summaryFr:
        "Même quand c’est vague, tu t’en sors avec une question de clarification.",
      keyPhrases: [
        { kr: "실례합니다", fr: "Excusez-moi" },
        { kr: "어느 쪽이에요?", fr: "C’est quel côté ?" },
        { kr: "에스컬레이터", fr: "Escalator" },
      ],
    },
  ],
};

const S3: Scene = {
  id: "shop_try_size_taxfree",
  title: "Magasin — essayer + taille + tax free (détaxe)",
  place: "shop",
  level: "A1",
  vibe: "Shopping mode : tu demandes naturellement sans phrase scolaire.",
  start: "n1",
  steps: [
    {
      id: "n1",
      type: "line",
      speaker: "narrator",
      kr: "명동. 옷가게에서 재킷을 보고 있어.",
      fr: "Myeongdong. Tu regardes une veste.",
    },
    {
      id: "n2",
      type: "line",
      speaker: "npc",
      kr: "찾으시는 거 있어요?",
      fr: "Vous cherchez quelque chose ?",
    },
    {
      id: "c1",
      type: "choice",
      promptKr: "너는 어떻게 말할래?",
      promptFr: "Tu réponds comment ?",
      options: [
        {
          id: "o1",
          kr: "이거… 입어봐도 돼요?",
          fr: "Je peux l’essayer ?",
          tone: "naturel",
          goTo: "npc1",
        },
        {
          id: "o2",
          kr: "재킷 좀 보고 있어요.",
          fr: "Je regarde des vestes.",
          tone: "naturel",
          goTo: "npc2",
        },
        {
          id: "o3",
          kr: "사이즈가 뭐가 있어요?",
          fr: "Quelles tailles vous avez ?",
          tone: "poli",
          goTo: "npc3",
        },
      ],
    },
    {
      id: "npc1",
      type: "line",
      speaker: "npc",
      kr: "네, 피팅룸 저쪽이에요.",
      fr: "Oui, les cabines sont par là.",
    },
    {
      id: "c2",
      type: "choice",
      promptKr: "사이즈도 물어볼까?",
      promptFr: "Tu demandes la taille ?",
      options: [
        {
          id: "o1",
          kr: "이거 M 있어요?",
          fr: "Vous avez du M ?",
          tone: "naturel",
          goTo: "npc_size",
        },
        {
          id: "o2",
          kr: "혹시 다른 색도 있어요?",
          fr: "Vous l’avez en autre couleur ?",
          tone: "poli",
          goTo: "npc_color",
        },
        {
          id: "o3",
          kr: "감사합니다!",
          fr: "Merci !",
          tone: "naturel",
          goTo: "taxfree_intro",
        },
      ],
    },
    {
      id: "npc2",
      type: "line",
      speaker: "npc",
      kr: "예쁘죠? 사이즈는 S, M, L 있어요.",
      fr: "C’est joli, hein ? Tailles S, M, L.",
    },
    {
      id: "npc3",
      type: "line",
      speaker: "npc",
      kr: "네. S, M, L 있어요. 어떤 거 찾으세요?",
      fr: "Oui, S, M, L. Vous cherchez laquelle ?",
    },
    {
      id: "c3",
      type: "choice",
      promptKr: "너는?",
      promptFr: "Toi ?",
      options: [
        {
          id: "o1",
          kr: "M이요.",
          fr: "Du M.",
          tone: "naturel",
          goTo: "taxfree_intro",
        },
        {
          id: "o2",
          kr: "L로 입어볼게요.",
          fr: "Je vais essayer du L.",
          tone: "naturel",
          goTo: "taxfree_intro",
        },
      ],
    },
    {
      id: "npc_size",
      type: "line",
      speaker: "npc",
      kr: "네, M 있어요. 가져다 드릴게요.",
      fr: "Oui, on a du M. Je vous l’apporte.",
    },
    {
      id: "npc_color",
      type: "line",
      speaker: "npc",
      kr: "검정이랑 베이지 있어요.",
      fr: "On l’a en noir et beige.",
    },
    {
      id: "taxfree_intro",
      type: "line",
      speaker: "npc",
      kr: "결제는 여기서 도와드릴게요.",
      fr: "Je vous aide au paiement ici.",
    },
    {
      id: "c4",
      type: "choice",
      promptKr: "세련되게 ‘détaxe’ 물어보기",
      promptFr: "Tu demandes la détaxe (tax free) ?",
      options: [
        {
          id: "o1",
          kr: "혹시 택스프리 돼요?",
          fr: "Tax free, c’est possible ?",
          tone: "naturel",
          goTo: "npc_tax",
        },
        {
          id: "o2",
          kr: "택스프리 가능해요?",
          fr: "C’est possible le tax free ?",
          tone: "poli",
          goTo: "npc_tax",
        },
        {
          id: "o3",
          kr: "아, 그냥 괜찮아요.",
          fr: "Ah non c’est bon.",
          tone: "cool",
          goTo: "end",
        },
      ],
    },
    {
      id: "npc_tax",
      type: "line",
      speaker: "npc",
      kr: "네 가능해요. 여권 있으세요?",
      fr: "Oui. Vous avez votre passeport ?",
    },
    {
      id: "c5",
      type: "choice",
      promptKr: "여권 관련 대답",
      promptFr: "Tu réponds quoi ?",
      options: [
        {
          id: "o1",
          kr: "네, 있어요. 잠깐만요.",
          fr: "Oui. Un instant.",
          tone: "naturel",
          goTo: "end",
        },
        {
          id: "o2",
          kr: "지금은 없는데… 괜찮아요.",
          fr: "Je ne l’ai pas sur moi… tant pis.",
          tone: "naturel",
          goTo: "end",
        },
      ],
    },
    {
      id: "end",
      type: "end",
      summaryKr: "쇼핑에서 자주 쓰는 문장들 완성!",
      summaryFr: "Tu as validé des phrases ultra fréquentes en shopping.",
      keyPhrases: [
        { kr: "입어봐도 돼요?", fr: "Je peux essayer ?" },
        { kr: "M 있어요?", fr: "Vous avez du M ?" },
        { kr: "택스프리 돼요?", fr: "Tax free possible ?" },
        { kr: "여권 있으세요?", fr: "Vous avez le passeport ?" },
      ],
    },
  ],
};

export const immersionScenes: Scene[] = [S1, S2, S3];

export function getScene(id: string) {
  return immersionScenes.find((s) => s.id === id) || null;
}
