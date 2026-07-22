import { getContentLinksForConcept } from "./contentLinks.ts";
import {
  GRAMMAR_EDITORIAL,
  GRAMMAR_FORM_DISTRACTORS,
  GRAMMAR_PRACTICE_FOCUS_FORMS,
} from "./editorial.ts";
import type { GrammarConcept } from "./types";

function defineConcept(
  concept: Omit<GrammarConcept, "contentLinks" | "practice" | "rule">,
): GrammarConcept {
  return {
    ...concept,
    ...GRAMMAR_EDITORIAL[concept.id],
    practice: {
      ...GRAMMAR_EDITORIAL[concept.id].practice,
      focusForm: GRAMMAR_PRACTICE_FOCUS_FORMS[concept.id],
      formDistractors: GRAMMAR_FORM_DISTRACTORS[concept.id],
    },
    contentLinks: getContentLinksForConcept(concept.id),
  };
}

export const GRAMMAR_CONCEPTS = [
  defineConcept({
    id: "sentence-order",
    form: "prédicat final ; sujet souvent omis",
    shortFunction: "Organiser une phrase coréenne.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: [],
    examples: [
      {
        korean: "저는 커피를 마셔요.",
        french: "Moi, je bois du café.",
      },
      {
        korean: "집에 가요.",
        french: "Je rentre à la maison.",
        sourceRefId: "hangul:bridge",
      },
    ],
  }),
  defineConcept({
    id: "copula-ieyo-yeyo",
    form: "이에요/예요",
    shortFunction: "Dire ce qu’est une personne ou une chose.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: [],
    examples: [
      { korean: "학생이에요.", french: "Je suis étudiant.", note: "REGISTRE\nPoli courant" },
      { korean: "마크예요.", french: "C’est Marc.", note: "REGISTRE\nPoli courant" },
    ],
  }),
  defineConcept({
    id: "polite-style-yo",
    form: "-요",
    shortFunction: "Parler poliment au quotidien.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: [],
    examples: [
      {
        korean: "괜찮아요.",
        french: "Ça va.",
        note: "CONTEXTE\nUn proche s’inquiète pour toi.",
      },
      { korean: "맛있어요.", french: "Ce plat est délicieux." },
    ],
    advancedRecognitionForms: [
      {
        form: "-시죠, -나요, -네요",
        shortFunction: "Reconnaître des nuances polies fréquentes.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
      {
        form: "반말 et contractions de dialogue",
        shortFunction: "Reconnaître un registre familier sans le produire.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "copula-imnida",
    form: "입니다",
    shortFunction: "Reconnaître une présentation plus formelle.",
    level: "pre-a1",
    a1Usage: "receptive",
    prerequisiteIds: ["copula-ieyo-yeyo", "polite-style-yo"],
    examples: [
      { korean: "학생입니다.", french: "Je suis étudiant.", note: "REGISTRE\nFormel" },
      { korean: "회사원입니다.", french: "Je suis employé de bureau." },
    ],
  }),
  defineConcept({
    id: "topic-eun-neun",
    form: "은/는",
    shortFunction: "Indiquer ce dont on parle.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["copula-ieyo-yeyo"],
    examples: [
      { korean: "저는 프랑스 사람이에요.", french: "Moi, je suis français." },
      { korean: "오늘은 월요일이에요.", french: "Aujourd’hui, c’est lundi." },
    ],
  }),
  defineConcept({
    id: "demonstratives-i-geu-jeo",
    form: "이/그/저 ; 이거/그거/저거",
    shortFunction: "Montrer une chose selon sa distance.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["copula-ieyo-yeyo"],
    examples: [
      { korean: "이거 뭐예요?", french: "Qu’est-ce que cet objet-ci ?" },
      { korean: "저 가방이에요.", french: "C’est ce sac là-bas." },
    ],
  }),
  defineConcept({
    id: "question-mwo-nugu-myeot",
    form: "뭐/무엇, 누구, 몇",
    shortFunction: "Demander qui, quoi ou combien.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["copula-ieyo-yeyo", "demonstratives-i-geu-jeo"],
    examples: [
      { korean: "누구예요?", french: "Qui est cette personne ?", note: "REGISTRE\nPoli courant" },
      { korean: "몇 명이에요?", french: "Combien de personnes êtes-vous ?", sourceRefId: "listening:cafe-dictation-01", note: "REGISTRE\nPoli courant" },
    ],
  }),
  defineConcept({
    id: "subject-i-ga",
    form: "이/가",
    shortFunction: "Marquer ce qui est ou ce qui arrive.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["topic-eun-neun"],
    examples: [
      { korean: "시간이 없어요.", french: "Je n’ai pas le temps." },
      { korean: "화장실이 어디예요?", french: "Où sont les toilettes ?", sourceRefId: "listening:street-order-05" },
    ],
  }),
  defineConcept({
    id: "existence-isseoyo-eopseoyo",
    form: "있어요/없어요",
    shortFunction: "Dire qu’une chose existe ou manque.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["subject-i-ga"],
    examples: [
      { korean: "추천 메뉴가 있어요?", french: "Avez-vous un plat à recommander ?" },
      { korean: "시간이 없어요.", french: "Je n’ai pas le temps." },
    ],
  }),
  defineConcept({
    id: "location-e",
    form: "N에 있어요",
    shortFunction: "Situer une personne ou une chose.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["existence-isseoyo-eopseoyo"],
    examples: [
      { korean: "화장실은 2층에 있어요.", french: "Les toilettes sont au deuxième étage." },
      { korean: "카드가 가방에 있어요.", french: "La carte est dans le sac." },
    ],
  }),
  defineConcept({
    id: "present-a-eoyo",
    form: "-아/어요 ; 해요",
    shortFunction: "Parler d’une action présente ou habituelle.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["sentence-order", "polite-style-yo"],
    examples: [
      { korean: "매일 공부해요.", french: "J’étudie tous les jours." },
      { korean: "커피를 마셔요.", french: "Je bois du café." },
    ],
    advancedRecognitionForms: [
      {
        form: "-는 N, -(으)ㄴ N",
        shortFunction: "Reconnaître une proposition qui précise un nom.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "object-eul-reul",
    form: "을/를",
    shortFunction: "Marquer ce que l’action concerne.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["sentence-order", "present-a-eoyo"],
    examples: [
      { korean: "커피를 마셔요.", french: "Je bois du café." },
      { korean: "한국어를 공부해요.", french: "J’étudie le coréen." },
    ],
  }),
  defineConcept({
    id: "action-location-eseo",
    form: "에서",
    shortFunction: "Situer l’endroit où une action se déroule.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["location-e", "present-a-eoyo"],
    examples: [
      { korean: "카페에서 공부해요.", french: "J’étudie au café." },
      { korean: "홍대입구에서 내려요.", french: "Je descends à Hongdae.", sourceRefId: "listening:metro-gap-04" },
    ],
  }),
  defineConcept({
    id: "destination-time-e",
    form: "에 가요 ; 에 만나요",
    shortFunction: "Indiquer une destination ou un moment.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["location-e", "present-a-eoyo"],
    examples: [
      { korean: "세 시에 서울역에 가요.", french: "Je vais à la gare de Séoul à trois heures." },
      { korean: "집에 가요.", french: "Je rentre à la maison.", sourceRefId: "hangul:bridge" },
    ],
  }),
  defineConcept({
    id: "possession-ui-je-nae",
    form: "의 ; 제 ; 내",
    shortFunction: "Dire à qui une chose appartient.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["topic-eun-neun"],
    examples: [
      { korean: "제 이름은 마크예요.", french: "Mon nom est Marc." },
      { korean: "친구의 가방이에요.", french: "C’est le sac de mon ami." },
    ],
  }),
  defineConcept({
    id: "interrogatives-basic",
    form: "어디, 언제, 왜, 어떻게, 얼마, 얼마나, 무슨",
    shortFunction: "Demander une information simple.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["question-mwo-nugu-myeot", "present-a-eoyo"],
    examples: [
      { korean: "화장실이 어디예요?", french: "Où sont les toilettes ?", sourceRefId: "listening:street-order-05" },
      { korean: "이거 얼마예요?", french: "Combien coûte cet article-ci ?", sourceRefId: "listening:shop-dictation-04" },
    ],
  }),
  defineConcept({
    id: "negation-an",
    form: "안",
    shortFunction: "Dire qu’une action ou un état ne se réalise pas.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo"],
    examples: [
      { korean: "안 매워요.", french: "Ce n’est pas épicé." },
      { korean: "커피를 안 마셔요.", french: "Je ne bois pas de café." },
    ],
    advancedRecognitionForms: [
      {
        form: "밖에 … 안",
        shortFunction: "Reconnaître l’idée de « seulement » avec une négation.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "copula-negation-anieyo",
    form: "아니에요",
    shortFunction: "Corriger une identité ou une catégorie.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["copula-ieyo-yeyo"],
    examples: [
      { korean: "학생이 아니에요.", french: "Je ne suis pas étudiant." },
      { korean: "커피가 아니에요.", french: "Ce n’est pas du café." },
    ],
  }),
  defineConcept({
    id: "request-n-juseyo",
    form: "N 주세요",
    shortFunction: "Demander une chose simplement.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["polite-style-yo"],
    examples: [
      { korean: "물 좀 주세요.", french: "De l’eau, s’il vous plaît.", sourceRefId: "listening:restaurant-order-04", note: "NUANCE\nDemande adoucie avec 좀" },
      { korean: "아이스 아메리카노 주세요.", french: "Un americano glacé, s’il vous plaît.", sourceRefId: "listening:cafe-dictation-02" },
    ],
  }),
  defineConcept({
    id: "native-numbers",
    form: "하나/둘/셋/넷 → 한/두/세/네",
    shortFunction: "Compter des personnes et des objets.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: [],
    examples: [
      { korean: "두 명이에요.", french: "Nous sommes deux.", sourceRefId: "listening:bbq-situation-01" },
      { korean: "한 잔 주세요.", french: "Un verre, s’il vous plaît." },
    ],
  }),
  defineConcept({
    id: "classifiers-basic",
    form: "개, 명, 분, 잔, 장, 살, 인분",
    shortFunction: "Compter avec le mot adapté.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: ["native-numbers"],
    examples: [
      { korean: "아메리카노 한 잔 주세요.", french: "Un americano, s’il vous plaît." },
      { korean: "삼겹살 2인분 주세요.", french: "Deux portions de samgyeopsal, s’il vous plaît.", sourceRefId: "listening:restaurant-gap-01" },
    ],
    advancedRecognitionForms: [
      {
        form: "씩",
        shortFunction: "Reconnaître une répartition par quantité.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "sino-korean-numbers",
    form: "일, 이, 삼…",
    shortFunction: "Comprendre prix, minutes, dates et numéros.",
    level: "pre-a1",
    a1Usage: "productive",
    prerequisiteIds: [],
    examples: [
      { korean: "이거 만 원이에요.", french: "Cela coûte dix mille wons." },
      { korean: "2호선이에요.", french: "C’est la ligne 2." },
    ],
  }),
  defineConcept({
    id: "noun-link-hago-irang",
    form: "하고, (이)랑, 와/과",
    shortFunction: "Relier plusieurs personnes ou objets.",
    level: "a1",
    a1Usage: "productive",
    a1ReceptiveForms: ["와/과"],
    prerequisiteIds: ["request-n-juseyo"],
    examples: [
      { korean: "커피하고 케이크 주세요.", french: "Un café et un gâteau, s’il vous plaît." },
      { korean: "친구랑 가요.", french: "J’y vais avec un ami." },
    ],
  }),
  defineConcept({
    id: "alternative-ina-animyeon",
    form: "(이)나 ; 아니면",
    shortFunction: "Proposer ou choisir une alternative.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["noun-link-hago-irang"],
    examples: [
      { korean: "커피나 차 있어요?", french: "Avez-vous du café ou du thé ?" },
      { korean: "카드 아니면 현금이에요?", french: "Carte ou espèces ?" },
    ],
  }),
  defineConcept({
    id: "request-v-a-eo-juseyo",
    form: "V-아/어 주세요",
    shortFunction: "Demander à quelqu’un de faire une action.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "request-n-juseyo"],
    examples: [
      { korean: "다시 말해 주세요.", french: "Répétez, s’il vous plaît." },
      { korean: "포장해 주세요.", french: "Emballez cette commande pour l’emporter, s’il vous plaît." },
    ],
    advancedRecognitionForms: [
      {
        form: "-아/어 드리다",
        shortFunction: "Reconnaître une action faite humblement pour quelqu’un.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
      {
        form: "주시겠어요?, 주실래요?, 주실 수 있나요?",
        shortFunction: "Reconnaître des requêtes plus nuancées.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "polite-instruction-euseyo",
    form: "-(으)세요",
    shortFunction: "Comprendre ou donner une instruction polie.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "polite-style-yo"],
    examples: [
      { korean: "여기에서 내리세요.", french: "Descendez ici." },
      { korean: "이곳으로 가세요.", french: "Allez dans cette direction.", sourceRefId: "listening:metro-dictation-03" },
    ],
  }),
  defineConcept({
    id: "direction-means-ro-euro",
    form: "로/으로",
    shortFunction: "Indiquer une direction ou un moyen.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["destination-time-e"],
    examples: [
      { korean: "카드로 할게요.", french: "Ce sera par carte.", sourceRefId: "listening:shop-situation-04", note: "CONTEXTE\nOn te demande : « Carte ou espèces ? »" },
      {
        korean: "지하철로 가요.",
        french: "J’y vais en métro.",
        note: "CONTEXTE\nLa destination du trajet est déjà connue.",
      },
    ],
  }),
  defineConcept({
    id: "desire-go-sipeoyo",
    form: "-고 싶어요",
    shortFunction: "Dire ce que l’on souhaite faire.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "object-eul-reul"],
    examples: [
      { korean: "티머니 카드를 사고 싶어요.", french: "Je voudrais acheter une carte T-money." },
      { korean: "한국에 가고 싶어요.", french: "Je veux aller en Corée." },
    ],
  }),
  defineConcept({
    id: "ability-eul-su-isseoyo",
    form: "-(으)ㄹ 수 있어요/없어요",
    shortFunction: "Dire ce qui est possible ou impossible.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo"],
    examples: [
      {
        korean: "여기서 충전할 수 있어요?",
        french: "Est-il possible de recharger ma carte ici ?",
        note: "CONTEXTE\nTu es à un guichet T-money avec ta carte.",
      },
      { korean: "한국어를 읽을 수 있어요.", french: "Je sais lire le coréen." },
    ],
    advancedRecognitionForms: [
      {
        form: "-(으)ㄹ 수도 있어요",
        shortFunction: "Reconnaître une possibilité parmi d’autres.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "permission-a-eodo-dwaeyo",
    form: "-아/어도 돼요?",
    shortFunction: "Demander une permission simplement.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "negation-an"],
    examples: [
      { korean: "사진 찍어도 돼요?", french: "Puis-je prendre une photo ?", note: "INTENTION\nDemande d’autorisation" },
      { korean: "여기 앉아도 돼요?", french: "Puis-je m’asseoir ici ?", note: "INTENTION\nDemande d’autorisation" },
    ],
  }),
  defineConcept({
    id: "inability-mot",
    form: "못",
    shortFunction: "Dire que l’on ne peut pas faire quelque chose.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["negation-an", "ability-eul-su-isseoyo"],
    examples: [
      { korean: "잘 못 알아들어요.", french: "Je ne comprends pas bien." },
      { korean: "매운 음식을 못 먹어요.", french: "Je ne peux pas manger de plats épicés." },
    ],
  }),
  defineConcept({
    id: "additive-do",
    form: "도",
    shortFunction: "Ajouter une personne ou une chose.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["request-n-juseyo", "noun-link-hago-irang"],
    examples: [
      { korean: "물도 주세요.", french: "De l’eau aussi, s’il vous plaît." },
      { korean: "저도 가요.", french: "Moi aussi, j’y vais." },
    ],
  }),
  defineConcept({
    id: "restrictive-man",
    form: "만",
    shortFunction: "Limiter une demande ou une information.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["request-n-juseyo", "native-numbers"],
    examples: [
      { korean: "한 잔만 주세요.", french: "Un seul verre, s’il vous plaît." },
      { korean: "카드만 있어요.", french: "Je n’ai que ma carte." },
    ],
  }),
  defineConcept({
    id: "range-buteo-kkaji",
    form: "부터 ; 까지",
    shortFunction: "Donner un début, une fin ou une limite.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["destination-time-e", "sino-korean-numbers"],
    examples: [
      {
        korean: "아홉 시부터 다섯 시까지예요.",
        french: "Les horaires sont de neuf heures à cinq heures.",
        note: "CONTEXTE\nTu indiques les horaires d’ouverture d’un lieu.",
      },
      { korean: "서울역까지 가요.", french: "Je vais jusqu’à la gare de Séoul." },
    ],
    advancedRecognitionForms: [
      {
        form: "때마다",
        shortFunction: "Reconnaître l’idée de répétition à chaque occasion.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "past-ass-eosseoyo",
    form: "-았/었어요 ; 했어요",
    shortFunction: "Parler d’un événement terminé.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo"],
    examples: [
      { korean: "예약했어요.", french: "J’ai réservé.", sourceRefId: "listening:hotel-dictation-05" },
      { korean: "어제 먹었어요.", french: "J’ai mangé hier." },
    ],
  }),
  defineConcept({
    id: "future-eul-geoyeyo",
    form: "-(으)ㄹ 거예요",
    shortFunction: "Parler d’un projet simple.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo"],
    examples: [
      { korean: "내일 서울에 갈 거예요.", french: "Demain, j’irai à Séoul." },
      { korean: "주말에 친구를 만날 거예요.", french: "Je vais voir un ami ce week-end." },
    ],
  }),
  defineConcept({
    id: "intention-eulgeyo",
    form: "-(으)ㄹ게요",
    shortFunction: "Annoncer une décision ou une promesse.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["future-eul-geoyeyo"],
    examples: [
      { korean: "카드로 계산할게요.", french: "Je vais régler par carte.", sourceRefId: "listening:shop-gap-03", note: "NUANCE\nDécision prise maintenant" },
      {
        korean: "제가 할게요.",
        french: "Je m’en charge.",
        note: "CONTEXTE\nQuelqu’un demande qui accomplira l’action.",
      },
    ],
  }),
  defineConcept({
    id: "sequence-go",
    form: "-고",
    shortFunction: "Relier deux actions.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo"],
    examples: [
      {
        korean: "먹고 갈게요.",
        french: "Je vais manger ici avant de partir.",
        note: "CONTEXTE\nAu restaurant, on te demande : « Sur place ou à emporter ? »",
      },
      { korean: "지하철을 타고 갈아타요.", french: "Je prends le métro, puis je change de ligne." },
    ],
    advancedRecognitionForms: [
      {
        form: "-지 않고 ; -면서",
        shortFunction: "Reconnaître deux actions reliées avec une nuance.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
      {
        form: "-다고/-이라고",
        shortFunction: "Reconnaître une parole rapportée.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "reason-a-eoseo",
    form: "-아/어서",
    shortFunction: "Donner une raison simple.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "past-ass-eosseoyo"],
    examples: [
      { korean: "늦어서 죄송해요.", french: "Désolé d’être en retard." },
      { korean: "아파서 못 가요.", french: "Je ne peux pas y aller parce que je suis malade." },
    ],
  }),
  defineConcept({
    id: "contrast-jiman",
    form: "-지만",
    shortFunction: "Relier deux idées qui s’opposent.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo"],
    examples: [
      { korean: "맵지만 맛있어요.", french: "Ce plat est épicé, mais délicieux." },
      { korean: "비싸지만 좋아요.", french: "Cet article est cher, mais il me plaît." },
    ],
  }),
  defineConcept({
    id: "condition-eumyeon",
    form: "-(으)면 ; -(으)면 돼요",
    shortFunction: "Poser une condition simple.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "sequence-go"],
    examples: [
      {
        korean: "시간이 있으면 가요.",
        french: "J’y vais si j’ai le temps.",
        note: "CONTEXTE\nVous parlez d’une sortie déjà prévue.",
      },
      { korean: "여기에서 내리면 돼요.", french: "Il suffit de descendre ici." },
    ],
    advancedRecognitionForms: [
      {
        form: "-(으)려면 ; -다면",
        shortFunction: "Reconnaître une condition plus nuancée.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "obligation-a-eoya-haeyo",
    form: "-아/어야 해요 ; 필요해요",
    shortFunction: "Dire ce qui est nécessaire.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "condition-eumyeon"],
    examples: [
      { korean: "표를 사야 해요.", french: "Il faut acheter un billet." },
      { korean: "티머니 카드가 필요해요.", french: "J’ai besoin d’une carte T-money." },
    ],
    advancedRecognitionForms: [
      {
        form: "-아/어야겠네요",
        shortFunction: "Reconnaître une nécessité constatée sur le moment.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
  defineConcept({
    id: "comparison-boda-deo-jeil",
    form: "보다 ; 더 ; 제일",
    shortFunction: "Comparer simplement.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "subject-i-ga"],
    examples: [
      { korean: "버스보다 지하철이 빨라요.", french: "Le métro est plus rapide que le bus." },
      { korean: "이게 제일 싸요.", french: "Cet article-ci est le moins cher." },
    ],
  }),
  defineConcept({
    id: "suggestion-eulkkayo",
    form: "-(으)ㄹ까요?",
    shortFunction: "Faire une suggestion simple.",
    level: "a1",
    a1Usage: "productive",
    prerequisiteIds: ["present-a-eoyo", "future-eul-geoyeyo"],
    examples: [
      {
        korean: "같이 갈까요?",
        french: "On y va ensemble ?",
        note: "CONTEXTE\nLa destination du trajet est déjà connue.",
      },
      { korean: "커피를 마실까요?", french: "On prend un café ?" },
    ],
  }),
  defineConcept({
    id: "honorific-si",
    form: "-시- ; lexique honorifique et humble",
    shortFunction: "Reconnaître la déférence dans une interaction.",
    level: "early-a2-receptive",
    a1Usage: "receptive",
    prerequisiteIds: ["polite-style-yo"],
    examples: [
      { korean: "몇 분이세요?", french: "Combien de personnes êtes-vous ?", sourceRefId: "listening:cafe-dictation-01", note: "REGISTRE\nTrès respectueux" },
      { korean: "다시 한번 말씀해 주시겠어요?", french: "Pourriez-vous répéter, s’il vous plaît ?", sourceRefId: "shared:repeat-request", note: "REGISTRE\nTrès respectueux" },
    ],
    advancedRecognitionForms: [
      {
        form: "드시다, 계시다, 말씀, 성함, 저희, 드리다",
        shortFunction: "Reconnaître le vocabulaire honorifique et humble courant.",
        level: "early-a2-receptive",
        a1Usage: "receptive",
      },
    ],
  }),
] satisfies readonly GrammarConcept[];

export const GRAMMAR_CONCEPTS_BY_ID = Object.fromEntries(
  GRAMMAR_CONCEPTS.map((concept) => [concept.id, concept]),
) as Readonly<Record<GrammarConcept["id"], GrammarConcept>>;

export function getGrammarConcept(id: GrammarConcept["id"]) {
  return GRAMMAR_CONCEPTS_BY_ID[id];
}
