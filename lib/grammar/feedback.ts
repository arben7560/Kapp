import type {
  GrammarPracticeAnswer,
  GrammarPracticeQuestion,
} from "../../data/grammar/types";

function answerLabel(answer: GrammarPracticeAnswer): string {
  return typeof answer === "string" ? answer : answer.join(" ");
}

function quoted(answer: string) {
  return `« ${answer} »`;
}

function connectorRole(answer: string) {
  if (/지만/u.test(answer)) return "un contraste";
  if (/(?:으)?면/u.test(answer)) return "une condition";
  if (/서/u.test(answer) || /니까/u.test(answer)) return "une cause";
  if (/고/u.test(answer)) return "un simple enchaînement";
  return undefined;
}

function isPolitePast(answer: string) {
  return /(?:았|었|했|갔|봤|왔|셨|렸)어요\.?$/u.test(answer);
}

const interrogativeMeanings: Readonly<Record<string, string>> = {
  "뭐": "sert à demander « quoi »",
  "누구": "sert à demander « qui »",
  "몇": "sert à demander combien, devant un compteur",
  "얼마": "sert notamment à demander un prix",
  "어디": "sert à demander où",
  "언제": "sert à demander quand",
  "왜": "sert à demander pourquoi",
  "어떻게": "sert à demander comment",
  "무슨": "signifie « quel » et se place devant un nom",
};

const interrogativeNeeds: Readonly<Record<string, string>> = {
  what: "ce qu’est la chose, donc il faut 뭐",
  who: "qui est la personne, donc il faut 누구",
  "how-many": "combien il y en a, donc il faut 몇",
  where: "le lieu, donc il faut 어디",
  when: "le moment, donc il faut 언제",
  why: "la raison, donc il faut 왜",
  how: "la manière de faire, donc il faut 어떻게",
  "how-much": "le prix, donc il faut 얼마",
};

const particleRoles: Readonly<Record<string, string>> = {
  "은": "marque un thème après un nom avec 받침",
  "는": "marque un thème après un nom sans 받침",
  "이": "marque un sujet après un nom avec 받침",
  "가": "marque un sujet après un nom sans 받침",
  "을": "marque un objet direct après un nom avec 받침",
  "를": "marque un objet direct après un nom sans 받침",
  "에": "marque un lieu statique, une destination ou un moment précis",
  "에서": "marque le lieu d’une action ou un point de départ",
  "로": "marque une direction ou un moyen après une voyelle ou ㄹ",
  "으로": "marque une direction ou un moyen après un 받침 autre que ㄹ",
  "부터": "marque le point de départ d’une période",
  "까지": "marque une limite ou le point final d’une période",
  "동안": "indique la durée pendant laquelle une situation se poursuit",
  "도": "signifie « aussi » et ajoute un élément",
  "만": "signifie « seulement » et limite les possibilités",
  "하고": "coordonne des noms avec le sens « et »",
  "이나": "relie des noms avec le sens « ou » après un 받침",
  "나": "relie des noms avec le sens « ou » après une voyelle",
  "이랑": "relie des noms avec le sens « et / avec » après un 받침",
  "랑": "relie des noms avec le sens « et / avec » après une voyelle",
};

function selectedSpecificFallback(
  question: GrammarPracticeQuestion,
  selected: string,
  expected: string,
): string | undefined {
  const conceptId = question.conceptIds[0];
  const aspect = question.ruleAspect ?? "";
  const choice = quoted(selected);
  const expectedBare = expected.replace(/[.?!]+$/u, "");

  if (conceptId === "sentence-order") {
    if (aspect === "predicate-final") {
      return `Avec ${choice}, le verbe n’est plus à la fin. En coréen, garde-le en dernier : ${expected}`;
    }
    if (aspect === "subject-omission") {
      if (selected.includes("저는")) {
        return `Dans ${choice}, tu répètes « moi », alors que la question le rend déjà évident. La réponse la plus naturelle est simplement ${expected}`;
      }
      return `Dans ${choice}, un complément arrive après le verbe. Ici, on ne répète pas le sujet et on garde le verbe à la fin : ${expected}`;
    }
  }

  if (conceptId === "copula-ieyo-yeyo") {
    if (selected === "예요") {
      return `${choice} s’emploie après une voyelle. Ici, le nom finit par un 받침 : il prend ${expected}.`;
    }
    if (selected === "이에요") {
      return `${choice} s’emploie après un 받침. Ici, le nom finit par une voyelle : il prend ${expected}.`;
    }
  }

  if (
    conceptId === "alternative-ina-animyeon" &&
    aspect === "clause-alternative"
  ) {
    if (selected === "지만") {
      return `${choice} veut dire « mais ». Ici, tu proposes deux possibilités avec « ou sinon », donc il faut ${expected}.`;
    }
    if (selected === "이나") {
      return `${choice} s’attache à un nom pour dire « ou ». Ici, tu relies deux phrases complètes avec « ou sinon » : ${expected}.`;
    }
  }

  if (
    conceptId === "question-mwo-nugu-myeot" ||
    conceptId === "interrogatives-basic"
  ) {
    const meaning = interrogativeMeanings[selected];
    const need = interrogativeNeeds[aspect];
    if (meaning && need) {
      return `${choice} ${meaning}. Ici, tu demandes ${need}.`;
    }
  }

  if (conceptId === "demonstratives-i-geu-jeo") {
    const meanings: Readonly<Record<string, string>> = {
      "이": "s’emploie devant un nom proche de toi",
      "그": "s’emploie devant un nom proche de l’autre personne ou déjà évoqué",
      "저": "s’emploie devant un nom loin de vous deux",
      "이거": "désigne un objet proche de toi",
      "그거": "désigne un objet proche de l’autre personne ou déjà évoqué",
      "저거": "désigne un objet loin de vous deux",
      "거기": "désigne un lieu proche de l’autre personne, pas un objet",
      "저기": "désigne un lieu éloigné, pas un objet ni un nom placé derrière",
    };
    const expectedContext = aspect === "near-speaker"
        ? "l’objet est proche de toi"
      : aspect === "near-listener"
        ? "l’objet est proche de l’autre personne"
        : "l’objet est loin de vous deux";
    return `${choice} ${meanings[selected]}. Ici, ${expectedContext} : il faut ${expected}.`;
  }

  if (conceptId === "topic-eun-neun" && ["은", "는"].includes(selected)) {
    const ending = aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
    return `${choice} marque bien le thème, mais pas après ${ending}. Ici, on met ${expected}.`;
  }

  if (conceptId === "subject-i-ga") {
    if (["이", "가"].includes(selected)) {
      const ending = aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
      return `${choice} marque bien le sujet, mais pas après ${ending}. Ici, on met ${expected}.`;
    }
    if (["을", "를"].includes(selected)) {
      return `${choice} marque l’objet. Ici, ce nom est le sujet, donc il prend ${expected}.`;
    }
  }

  if (conceptId === "object-eul-reul") {
    if (["을", "를"].includes(selected)) {
      const ending = aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
      return `${choice} marque bien l’objet, mais pas après ${ending}. Ici, on met ${expected}.`;
    }
    if (["이", "가"].includes(selected)) {
      return `${choice} marque le sujet. Ici, l’action porte sur ce nom : c’est l’objet, donc il prend ${expected}.`;
    }
  }

  if (conceptId === "existence-isseoyo-eopseoyo") {
    const meanings: Readonly<Record<string, string>> = {
      "있어요": "dit que quelque chose existe ou est disponible",
      "없어요": "dit que quelque chose est absent ou indisponible",
      "아니에요": "sert à dire « ce n’est pas », pas « il n’y en a pas »",
      "해요": "veut dire « faire », pas « il y a »",
      "안 해요": "veut dire « ne pas faire », pas « il n’y a pas »",
      "가 없어요": "dirait que le café est absent",
      "가 있어요": "dirait que le café est présent",
      "를 안 해요": "nie une action avec 안, alors qu’il n’y a pas d’action ici",
    };
    const need = aspect === "existence"
      ? "on dit que la chose est disponible, ou on le vérifie"
      : aspect === "absence"
        ? "on dit que la chose est absente"
        : "la boisson existe bien, mais on dit que ce n’est pas celle-ci";
    return `${choice} ${meanings[selected]}. Ici, ${need}, donc il faut ${expected}.`;
  }

  if (
    [
      "location-e",
      "action-location-eseo",
      "destination-time-e",
      "direction-means-ro-euro",
      "additive-do",
      "restrictive-man",
      "range-buteo-kkaji",
      "noun-link-hago-irang",
      "alternative-ina-animyeon",
    ].includes(conceptId)
  ) {
    if (["은", "는", "이", "가", "을", "를", "로", "으로", "에", "에서", "부터", "까지", "동안", "도", "만", "하고", "이나", "나", "이랑", "랑"].includes(selected)) {
      if (
        conceptId === "direction-means-ro-euro" &&
        ((selected === "으로" && expected === "로") ||
          (selected === "로" && expected === "으로"))
      ) {
        const ending = expected === "로"
          ? aspect === "means-rieul"
            ? "ㄹ, qui suit exceptionnellement la variante 로"
            : "une voyelle, sans 받침, qui prend 로"
          : "un 받침 autre que ㄹ, qui prend 으로";
        return `${choice} donne bien la direction ou le moyen, mais pas avec cette fin de mot. Le nom finit par ${ending}.`;
      }
      if (
        conceptId === "noun-link-hago-irang" &&
        ((selected === "이랑" && expected === "랑") ||
          (selected === "랑" && expected === "이랑"))
      ) {
        const ending = expected === "랑" ? "une voyelle, sans 받침" : "un 받침";
        return `${choice} veut bien dire « et / avec », mais pas après ${ending}. Ici, on met ${expected}.`;
      }
      if (
        conceptId === "alternative-ina-animyeon" &&
        ((selected === "이나" && expected === "나") ||
          (selected === "나" && expected === "이나"))
      ) {
        const ending = expected === "나" ? "une voyelle, sans 받침" : "un 받침";
        return `${choice} veut bien dire « ou » entre deux noms, mais pas après ${ending}. Ici, on met ${expected}.`;
      }
      let need = `ici, on utilise ${expected}`;
      if (conceptId === "location-e") need = `avec 있어요, le lieu prend ${expected}`;
      if (conceptId === "action-location-eseo") need = `l’action se passe dans ce lieu, donc il prend ${expected}`;
      if (conceptId === "destination-time-e") need = aspect === "time"
        ? `c’est une heure précise, donc il faut ${expected}`
        : `c’est le point d’arrivée, donc il faut ${expected}`;
      if (conceptId === "direction-means-ro-euro") need = `tu indiques une direction ou un moyen, donc il faut ${expected}`;
      if (conceptId === "additive-do") need = `cet élément s’ajoute à un autre, donc il faut ${expected}`;
      if (conceptId === "restrictive-man") need = `tu exclus tout le reste, donc il faut ${expected}`;
      if (conceptId === "range-buteo-kkaji") need = aspect === "range-start"
        ? `c’est le début de la période, donc il faut ${expected}`
        : `c’est la fin de la période, donc il faut ${expected}`;
      if (conceptId === "noun-link-hago-irang") need = `tu réunis les deux noms avec « et / avec », donc il faut ${expected}`;
      if (conceptId === "alternative-ina-animyeon") need = `tu choisis entre deux options, donc il faut ${expected}`;
      return `${choice} ${particleRoles[selected]}. Mais ${need}.`;
    }
  }

  if (conceptId === "present-a-eoyo") {
    const reasons: Readonly<Record<string, string>> = {
      "먹아요": "ajoute -아요, mais la dernière voyelle de 먹- appelle -어요",
      "가어요": "ne fait pas la contraction de 가- + -아요, qui donne 가요",
      "마시요": "omet -어- : ㅅㅣ + 어 se contracte en 셔",
      "공부하요": "ne fait pas la contraction de 하다, dont le présent poli est 해요",
      "읽아요": "ajoute -아요, mais la dernière voyelle de 읽- appelle -어요",
    };
    if (reasons[selected]) return `${choice} ${reasons[selected]}. On obtient donc ${expected}.`;
  }

  if (conceptId === "possession-ui-je-nae" && aspect === "possession-ui") {
    if (selected === "제") {
      return `${choice} signifie « mon » en registre poli. Mais ici, le sac est celui de l’ami : on relie 친구 à 가방 avec 의.`;
    }
    if (selected === "내") {
      return `${choice} signifie « mon » en registre familier. Mais ici, le sac est celui de l’ami : on relie 친구 à 가방 avec 의.`;
    }
    if (selected === "가") {
      return `${choice} marque le sujet. Ici, on veut dire « le sac de l’ami », donc il faut 의 entre 친구 et 가방.`;
    }
  }

  if (conceptId === "copula-negation-anieyo") {
    if (selected.includes("없어요")) {
      return `${choice} dit qu’une chose n’existe pas ou qu’on ne l’a pas. Ici, elle existe : on dit simplement que ce n’est pas la bonne avec ${expectedBare}.`;
    }
    if (selected.includes("안 ")) {
      return `${choice} utilise 안 comme avec un verbe d’action. Pour dire « ce n’est pas », on met le nom devant 이/가 아니에요 : ${expectedBare}.`;
    }
    if (selected.includes("못 ")) {
      return `${choice} veut dire qu’on ne peut pas faire une action. Ici, on dit que ce n’est pas ce sac : ${expectedBare}.`;
    }
    if (selected === "이 아니에요" || selected === "가 아니에요") {
      const ending = aspect === "batchim" ? "un 받침" : "une voyelle, sans 받침";
      return `${choice} veut bien dire « ce n’est pas », mais la particule ne va pas après ${ending}. Ici, on met ${expected}.`;
    }
  }

  if (conceptId === "request-n-juseyo") {
    if (aspect === "item-vs-action" && selected === "있어요") {
      return `${choice} demande si la porte existe, ou dit qu’elle existe. Ici, tu veux que l’employé l’ouvre : ${expected}.`;
    }
    if (selected === "있어요") {
      return `${choice} demande si l’objet existe, ou dit qu’il existe. Ici, tu veux qu’on te le donne : nom + 주세요.`;
    }
    if (selected !== "주세요" && /주세요$/u.test(selected)) {
      return `${choice} demande à l’autre personne de faire une action. Ici, tu commandes directement l’objet : ${expected}.`;
    }
    if (/세요$/u.test(selected)) {
      return `${choice} donne une instruction polie. Ici, tu veux recevoir l’objet, donc tu demandes ${expected}.`;
    }
  }

  if (conceptId === "native-numbers") {
    if (["하나", "둘", "셋", "넷"].includes(selected)) {
      const isStandalone = aspect === "standalone-native-number";
      return isStandalone
        ? `${choice} s’emploie seul, mais ici on demande le nombre trois : il faut ${expected}.`
        : `${choice} s’emploie seul. Devant un compteur, on le raccourcit en ${expected}.`;
    }
    if (["한", "두", "세", "네"].includes(selected)) {
      return `${choice} s’emploie devant un compteur. Ici, il n’y en a pas : on garde la forme complète ${expected}.`;
    }
    if (["일", "이", "삼", "사"].includes(selected)) {
      return `${choice} est un nombre sino-coréen. Pour compter ici, on utilise le nombre coréen natif ${expected}.`;
    }
    if (/[첫째번째]$/u.test(selected) || selected.includes(" 번째")) {
      return `${choice} indique un rang, comme « premier » ou « deuxième ». Ici, on demande combien il y en a : ${expected}.`;
    }
  }

  if (conceptId === "classifiers-basic") {
    const meanings: Readonly<Record<string, string>> = {
      "개": "compte des objets ou unités de façon générique",
      "명": "compte des personnes dans le registre courant",
      "잔": "compte des tasses ou verres de boisson",
      "장": "compte des objets plats, comme des feuilles ou des billets",
      "인분": "compte des portions prévues pour un nombre de personnes",
    };
    return `${choice} ${meanings[selected]}. Ici, tu comptes autre chose, donc il faut ${expected}.`;
  }

  if (conceptId === "sino-korean-numbers") {
    const reasons: Readonly<Record<string, string>> = {
      "오백 원": "signifie 500 wons, pas 5 000",
      "오만 원": "signifie 50 000 wons, pas 5 000",
      "다섯 천 원": "mélange le nombre natif 다섯 avec l’unité sino-coréenne 천",
      "천 원": "signifie 1 000 wons, pas 10 000",
      "십만 원": "signifie 100 000 wons, pas 10 000",
      "열 천 원": "mélange le nombre natif 열 avec l’unité sino-coréenne 천",
      "두 호선": "emploie le nombre natif attributif 두 ; une ligne de métro se numérote en sino-coréen",
      "이 개": "signifie « deux objets/unités » avec le classificateur 개, pas « ligne 2 »",
      "2명": "signifie « deux personnes » avec le classificateur 명, pas « ligne 2 »",
      "세 월": "emploie le nombre natif 세 ; les mois du calendrier prennent un numéro sino-coréen",
      "삼 개월": "signifie une durée de trois mois, pas le mois de mars",
      "3일": "désigne le troisième jour du mois, pas le mois de mars",
      "영십영": "regroupe les chiffres autour de 십 au lieu de les lire séparément",
      "하나열하나": "emploie les nombres natifs et ne lit pas les chiffres du téléphone séparément",
      "공하나공": "mélange 공 avec le nombre natif 하나 ; les chiffres se lisent dans un seul système",
    };
    return `${choice} ${reasons[selected]}. Ici, on dit ${expected}.`;
  }

  if (conceptId === "polite-instruction-euseyo") {
    if (/주세요$/u.test(selected)) {
      return `${choice} est possible pour demander un service. Ici, tu donnes plutôt une instruction ou une invitation polie : ${expected}.`;
    }
    if (/^[앉읽].*세요$/u.test(selected) && !selected.includes("으")) {
      return `${choice} omet 으 après un radical avec 받침. L’instruction polie se forme ici avec ${expected}.`;
    }
    if (/^가으|오으/u.test(selected)) {
      return `${choice} ajoute 으 après un radical terminé par une voyelle. Dans ce cas, -세요 s’attache directement : ${expected}.`;
    }
    if (/까요$/u.test(selected)) {
      return `${choice} propose de faire quelque chose ensemble. Ici, tu donnes une instruction ou une invitation : ${expected}.`;
    }
    if (/요$/u.test(selected)) {
      return `${choice} est poli, mais ne donne pas vraiment d’instruction. Le professeur dira ${expected}.`;
    }
  }

  if (conceptId === "range-buteo-kkaji" && aspect === "limit-only") {
    const role = particleRoles[selected];
    return `${choice} ${role}. Ici, la gare est la limite finale du trajet, « jusqu’à la gare » : il faut ${expected}.`;
  }

  if (conceptId === "past-ass-eosseoyo") {
    const reasons: Readonly<Record<string, string>> = {
      "먹았어요": "emploie -았어요, mais la voyelle de 먹- appelle -었어요",
      "가었어요": "ne contracte pas 가- + -았어요 en 갔어요",
      "공부하었어요": "ne contracte pas 하었어요 en 했어요",
      "마샀어요": "forme incorrectement le passé de 마시다 ; 마셔요 devient 마셨어요",
    };
    if (reasons[selected]) return `${choice} ${reasons[selected]}. On dit donc ${expected}.`;
  }

  if (conceptId === "condition-eumyeon" && aspect === "sufficiency") {
    if (selected.includes("면 가요")) {
      return `${choice} veut simplement dire « si…, aller ». Pour dire « il suffit de… », on utilise -(으)면 돼요 : ${expected}.`;
    }
    if (selected.includes("서 돼요")) {
      return `${choice} utilise -아/어서, qui donne une raison. Ici, tu veux dire « il suffit de… » avec -(으)면 돼요 : ${expected}.`;
    }
    if (selected.includes("지만 돼요")) {
      return `${choice} utilise « mais ». Ici, tu veux dire « il suffit de… » avec -(으)면 돼요 : ${expected}.`;
    }
  }

  if (conceptId === "obligation-a-eoya-haeyo" && aspect === "nominal-need") {
    if (selected.includes("야 해요")) {
      return `${choice} dit qu’il faut montrer quelque chose. Ici, on dit simplement que le passeport est nécessaire : 필요해요.`;
    }
    if (selected.includes("도 돼요")) {
      return `${choice} dit que c’est permis. Ici, on dit que le passeport est nécessaire : ${expected}.`;
    }
    if (selected.includes("수 있어요")) {
      return `${choice} dit qu’on peut faire quelque chose. Ici, on dit que le passeport est nécessaire : ${expected}.`;
    }
  }

  if (conceptId === "obligation-a-eoya-haeyo" && selected === "필요해요") {
    return `${choice} dit qu’une chose est nécessaire. Ici, l’agent te dit ce que tu dois faire : montrer le passeport, donc ${expected}.`;
  }

  if (conceptId === "comparison-boda-deo-jeil") {
    const meanings: Readonly<Record<string, string>> = {
      "보다": "suit l’élément de référence d’une comparaison",
      "더": "forme un comparatif, « plus / davantage »",
      "제일": "forme un superlatif dans un groupe, « le plus »",
      "만": "signifie « seulement » et exprime une restriction",
      "도": "signifie « aussi » et exprime une addition",
      "에": "marque notamment un lieu, une destination ou un moment",
    };
    const need = aspect === "superlative"
      ? `tu compares au moins trois éléments, donc il faut le superlatif ${expected}`
      : expected === "더"
        ? `tu compares seulement deux éléments, donc il faut ${expected}`
        : `ce nom sert de point de comparaison et prend ${expected}`;
    return `${choice} ${meanings[selected]}. Ici, ${need}.`;
  }

  if (conceptId === "honorific-si" && aspect === "honorific-lexicon") {
    if (selected === "개" || selected === "잔") {
      const referent = selected === "개" ? "des objets génériques" : "des tasses ou verres";
      return `${choice} compte ${referent}, pas des personnes. Pour compter respectueusement les clients, il faut 분.`;
    }
    if (selected === "말씀") {
      return `${choice} est le mot honorifique pour les paroles de quelqu’un. Ici, tu demandes son nom : on dit 성함.`;
    }
    if (selected === "나이") {
      return `${choice} signifie « âge ». Ici, la question porte sur le nom du client : on emploie 성함.`;
    }
  }

  return undefined;
}

/**
 * Builds the first sentence shown after an incorrect grammar answer.
 * The exercise explanation is the safe fallback because it names the exact
 * rule being assessed. A few high-confusion contrasts use the selected answer
 * when its grammatical value can be identified without ambiguity.
 */
export function getGrammarIncorrectFeedback(
  question: GrammarPracticeQuestion,
  answer: GrammarPracticeAnswer,
) {
  const selected = answerLabel(answer);
  const expected = answerLabel(question.answer);
  const expectedBare = expected.replace(/[.?!]+$/u, "");
  const conceptId = question.conceptIds[0];

  if (conceptId === "topic-eun-neun") {
    if (
      question.id.includes("drill-topic-eun-neun-je-vowel") &&
      selected === "가"
    ) {
      return "가 mettrait l’accent sur 저, par exemple pour répondre à « qui ? ». Ici, tu parles simplement de toi, donc 저는 est plus naturel : « moi, je suis étudiant ».";
    }
    if (
      question.id.includes("drill-topic-eun-neun-coffee-vowel") &&
      selected === "를"
    ) {
      return "를 est une particule d’objet et donne ici une phrase correcte : (저는) 커피를 안 마셔요, « je ne bois pas de café ». Mais elle n’apporte pas le contraste demandé avec les autres boissons ; pour cela, on dit 커피는.";
    }
    if (["이", "가"].includes(selected)) {
      return `${quoted(selected)} met l’accent sur le sujet et peut être correct dans une autre situation. Ici, ce nom est le thème dont tu parles, donc on met ${expected}.`;
    }
    if (["을", "를"].includes(selected)) {
      return `${quoted(selected)} marque l’objet et peut donner une phrase correcte avec un verbe d’action. Ici, tu poses ce nom comme thème ou tu le mets en contraste, donc on met ${expected}.`;
    }
  }

  if (question.id.includes("drill-question-mwo-nugu-myeot-what-object")) {
    if (selected === "누구") {
      return "누구 sert à demander qui est une personne. Ici, tu demandes ce qu’est un objet, donc on utilise 뭐.";
    }
    if (selected === "어디") {
      return "어디 sert à demander où se trouve quelque chose. Ici, tu demandes ce qu’est l’objet, donc on utilise 뭐.";
    }
    if (selected === "몇") {
      return "몇 sert à demander combien. Ici, tu demandes ce qu’est l’objet, donc on utilise 뭐.";
    }
  }

  if (question.id.includes("drill-question-mwo-nugu-myeot-who-person")) {
    if (selected === "몇") {
      return "몇 sert à demander combien. Ici, tu demandes qui est la personne, donc on utilise 누구.";
    }
    if (selected === "뭐") {
      return "뭐 sert à demander ce qu’est une chose. Ici, tu demandes qui est cette personne, donc on utilise 누구.";
    }
    if (selected === "어디") {
      return "어디 sert à demander où. Ici, tu demandes qui est la personne, pas où elle se trouve, donc on utilise 누구.";
    }
  }

  if (conceptId === "subject-i-ga" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} est possible si tu veux parler de ce nom comme thème ou le mettre en contraste. Ici, tu présentes simplement le sujet, donc on met ${expected}.`;
  }

  if (conceptId === "object-eul-reul" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} est possible si tu veux mettre l’objet en contraste. Ici, tu le présentes simplement comme l’objet de l’action, donc on met ${expected}.`;
  }

  if (conceptId === "copula-ieyo-yeyo" && selected === "아니에요") {
    return `${quoted(selected)} veut dire « ce n’est pas ». Ici, tu confirmes au contraire ce qu’est la personne ou l’objet, donc il faut ${expected}.`;
  }

  if (conceptId === "alternative-ina-animyeon" && selected === "하고") {
    if (question.ruleAspect === "clause-alternative") {
      return `${quoted(selected)} relie des noms avec le sens « et ». Ici, tu relies deux phrases avec « ou sinon », donc on emploie ${expected}.`;
    }
    return `${quoted(selected)} relie correctement les deux noms, mais avec le sens « et ». Ici, tu veux dire « ou », donc il faut ${expected}.`;
  }

  if (conceptId === "noun-link-hago-irang" && ["이나", "나"].includes(selected)) {
    return `${quoted(selected)} conviendrait pour dire « ou ». Ici, tu réunis les deux éléments avec « et », donc il faut ${expected}.`;
  }

  if (
    conceptId === "native-numbers" &&
    question.ruleAspect === "attributive-native-number" &&
    selected === "첫"
  ) {
    return "첫 잔 veut dire « la première tasse » d’une série. Ici, tu demandes simplement une tasse : on dit 한 잔.";
  }

  if (
    ["drink-classifier", "flat-classifier", "portion-classifier"].includes(
      question.ruleAspect ?? "",
    ) &&
    selected === "개"
  ) {
    return `${quoted(selected)} est un compteur général. Ici, il existe un compteur plus précis : ${expected}.`;
  }

  if (question.ruleAspect === "short-negation") {
    if (selected.endsWith("지 않아요")) {
      return `${quoted(selected)} est correct, mais c’est la forme longue. Ici, on veut la forme courte avec 안 : ${expected}.`;
    }
    if (selected.startsWith("못 ")) {
      if (expected.includes("매워요")) {
        return `${quoted(selected)} sert normalement à dire qu’on ne peut pas faire une action. 맵다 décrit le plat : pour dire qu’il n’est pas épicé, on dit 안 매워요.`;
      }
      return `${quoted(selected)} veut dire que la personne ne peut pas agir. Ici, elle choisit de ne pas le faire, donc on utilise 안.`;
    }
    if (selected === "아니에요") {
      return "아니에요 sert à dire « ce n’est pas ». Ici, tu nies directement le verbe ou l’adjectif avec 안.";
    }
  }

  if (question.ruleAspect === "daily-polite") {
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, tu parles au présent et dans le style poli courant en -요 : ${expectedBare}.`;
    }
    if (/니다\.?$/u.test(selected)) {
      return `${quoted(selected)} est au registre formel. Dans cette conversation quotidienne, le style poli courant en -요 est plus naturel.`;
    }
    if (!/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est familier. Ici, garde le ton poli avec une forme en -요.`;
    }
  }

  if (["present-eoyo", "present-ayo", "present-haeyo"].includes(question.ruleAspect ?? "")) {
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, l’action est au présent, dans le style poli courant.`;
    }
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce une action future. Ici, tu parles de ce qui se passe maintenant, au présent poli.`;
    }
  }

  if (question.ruleAspect?.startsWith("past-")) {
    if (selected === "마샀어요") {
      return `${quoted(selected)} n’est pas le passé de 마시다. À partir de 마셔요, on forme 마셨어요.`;
    }
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} place l’action dans le futur. Mais elle est déjà terminée, donc il faut le passé en -았/었어요.`;
    }
    if (/요\.?$/u.test(selected) && !isPolitePast(selected)) {
      return `${quoted(selected)} est au présent. L’action est déjà terminée, donc il faut le passé en -았/었어요.`;
    }
  }

  if (question.ruleAspect === "future-batchim" || question.ruleAspect === "future-no-batchim") {
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce à l’autre personne ce que tu décides de faire. Ici, le projet est déjà prévu, donc on utilise -(으)ㄹ 거예요.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, tu annonces un projet futur.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est au présent. Pour parler de ce projet futur, utilise -(으)ㄹ 거예요.`;
    }
  }

  if (question.ruleAspect === "polite-my" && selected === "내") {
    return "내 est la façon familière de dire « mon ». Ici, tu parles poliment, donc utilise 제.";
  }
  if (question.ruleAspect === "polite-my" && selected === "저") {
    return "저 signifie « je » dans un registre humble, mais pas « mon ». Pour dire « mon » poliment, utilise 제.";
  }
  if (question.ruleAspect === "polite-my" && selected === "제가") {
    return "제가 veut dire « je » avec la particule 가. Devant ce qui t’appartient, il faut 제 pour dire « mon ».";
  }
  if (question.ruleAspect === "casual-my" && selected === "제") {
    return "제 est poli et humble. Entre amis proches, avec une phrase familière en -이야, on dit 내.";
  }
  if (question.ruleAspect === "casual-my" && (selected === "나" || selected === "제가")) {
    return `${quoted(selected)} veut dire « je », pas « mon ». Pour dire « mon » familièrement, on emploie 내.`;
  }

  if (selected === "입니다" && (question.ruleAspect === "batchim" || question.ruleAspect === "no-batchim")) {
    return "입니다 est correct, mais plus formel. Ici, utilise le style poli courant : 이에요 après une consonne et 예요 après une voyelle.";
  }
  if (selected === "이예요") {
    return "이예요 n’est pas la forme standard. Après une consonne, on dit 이에요 ; après une voyelle, 예요.";
  }

  if (question.ruleAspect === "honorific-present") {
    if (selected === "와요") {
      return "와요 est poli avec la personne à qui tu parles, mais n’honore pas le professeur. Pour parler de lui avec respect, ajoute -시- : 오세요.";
    }
    if (selected === "오셨어요") {
      return "오셨어요 est honorifique, mais au passé. L’arrivée a lieu maintenant : il faut le présent 오세요.";
    }
    if (selected === "오실 거예요") {
      return "오실 거예요 est honorifique, mais annonce une arrivée future. Ici, le professeur arrive maintenant : 오세요.";
    }
  }
  if (question.ruleAspect === "honorific-lexicon") {
    if (selected === "명") {
      return "명 est le compteur courant pour les personnes. Ici, on parle respectueusement aux clients, donc on choisit 분.";
    }
    if (selected === "있어요") {
      return "있어요 est poli, mais ne montre pas de respect particulier envers le professeur. Pour dire qu’il est là, on emploie 계세요.";
    }
    if (selected === "계셨어요" || selected === "계실 거예요") {
      return `${quoted(selected)} honore bien le professeur, mais le temps ne convient pas. Comme il est là maintenant, on dit 계세요.`;
    }
    if (selected === "이름") {
      return "이름 est le mot courant pour « nom ». Dans cette demande respectueuse, le terme honorifique est 성함.";
    }
  }
  if (question.ruleAspect === "honorific-request") {
    if (selected === "말해요") {
      return "말해요 est trop direct pour cette demande très respectueuse. Pour demander poliment de répéter, dis 말씀해 주시겠어요?";
    }
    if (selected === "말씀하세요") {
      return "말씀하세요 reste une instruction assez directe. Pour demander plus doucement de répéter, dis 말씀해 주시겠어요?";
    }
    if (selected === "말할까요") {
      return "말할까요? veut dire « est-ce que je parle ? ». Pour demander à l’autre de répéter avec respect, dis 말씀해 주시겠어요?";
    }
  }

  if (question.ruleAspect === "location" && selected === "에서") {
    return "에서 s’utilise quand une action se passe dans un lieu. Ici, 있어요 décrit une position statique, donc on met 에.";
  }
  if (question.ruleAspect === "action-location" && selected === "에") {
    return "에 indique notamment où se trouve une chose ou où l’on va. Ici, une action se passe dans ce lieu, donc il faut 에서.";
  }
  if (question.ruleAspect === "destination" && selected === "에서") {
    return "에서 donnerait une phrase grammaticale, mais ferait de ce lieu le point de départ. Ici, c’est la destination, donc on met 에.";
  }
  if (question.ruleAspect === "time") {
    if (selected === "부터") {
      return "부터 marque le début d’une période. Ici, tu donnes simplement une heure précise, donc on met 에.";
    }
    if (selected === "에서") {
      return "에서 s’emploie pour le lieu d’une action, pas pour cette heure précise. Le repère temporel prend 에.";
    }
  }

  if (question.ruleAspect === "additive-vs-restrictive" && selected === "만") {
    return "만 signifie « seulement » et limiterait la commande au pain. Ici, tu ajoutes le pain à ce qui est déjà commandé, donc il faut 도.";
  }
  if (conceptId === "additive-do" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} peut marquer un thème ou un contraste. Ici, tu veux dire « aussi », donc il faut 도.`;
  }
  if (
    conceptId === "additive-do" &&
    ["을", "를"].includes(selected) &&
    question.display?.includes("커피")
  ) {
    return `${quoted(selected)} n’est pas faux : le café serait simplement l’objet du verbe. Mais ici, tu ajoutes le café au thé déjà mentionné, donc il faut 도 pour dire « aussi ».`;
  }
  if (question.ruleAspect === "restrictive-vs-additive" && selected === "도") {
    return "도 signifie « aussi » et ajouterait le pain à autre chose. Ici, tu ne veux que du pain, donc il faut 만.";
  }
  if (
    conceptId === "restrictive-man" &&
    question.ruleAspect === "restrictive" &&
    ["은", "는"].includes(selected)
  ) {
    return `${quoted(selected)} peut mettre cet élément en contraste avec d’autres. Ici, tu veux dire « seulement », donc il faut 만.`;
  }

  if (question.ruleAspect === "direction-batchim" && selected === "에") {
    return "오른쪽에 가세요 peut présenter la droite comme le lieu où aller. Ici, tu indiques la direction à suivre : 오른쪽으로 가세요.";
  }

  if (question.ruleAspect === "range-start") {
    if (selected === "에서") {
      return `${quoted(selected)} peut parfois marquer un point de départ. Ici, pour dire clairement « à partir de », on utilise 부터.`;
    }
    if (selected === "에") {
      return `${quoted(selected)} indique un moment précis. Ici, tu donnes le début d’une période, donc il faut 부터.`;
    }
  }
  if (question.ruleAspect === "range-end" && selected === "에") {
    return `${quoted(selected)} indique un moment précis. Ici, tu donnes la fin de la période commencée avec 부터, donc il faut 까지.`;
  }

  if (question.ruleAspect === "comparison" && selected === "제일") {
    return "제일 convient pour dire « le plus » dans un groupe. Ici, tu compares seulement deux éléments avec 보다, donc on emploie 더.";
  }

  if (
    question.ruleAspect === "ability" ||
    question.ruleAspect === "ability-vs-permission"
  ) {
    if (/도 돼요\??$/u.test(selected)) {
      return `${quoted(selected)} demande une autorisation. Ici, tu vérifies sa capacité réelle à faire l’action, donc utilise -(으)ㄹ 수 있어요.`;
    }
    if (/고 싶어요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit ce qu’on a envie de faire, pas ce qu’on peut faire. Pour parler d’une capacité, utilise -(으)ㄹ 수 있어요.`;
    }
    if (/야 해요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit qu’il faut faire l’action. Ici, tu demandes simplement si elle est possible.`;
    }
    if (/^못 /u.test(selected)) {
      return `${quoted(selected)} dit qu’on ne peut pas faire l’action. Ici, tu veux au contraire dire qu’elle est possible.`;
    }
  }

  if (
    question.ruleAspect === "permission" ||
    question.ruleAspect === "permission-vs-ability"
  ) {
    if (/수 있어요\??$/u.test(selected)) {
      return `${quoted(selected)} demande si l’action est possible. Ici, tu demandes si tu as le droit de la faire, donc utilise -아/어도 돼요.`;
    }
    if (/세요\??$/u.test(selected)) {
      return `${quoted(selected)} dit à l’autre personne quoi faire. Ici, tu lui demandes si toi, tu as le droit d’agir.`;
    }
    if (/야 해요\??$/u.test(selected)) {
      return `${quoted(selected)} dit que l’action est obligatoire. Ici, tu veux demander si elle est autorisée.`;
    }
  }

  if (question.ruleAspect === "inability-vs-choice") {
    if (/^안 /u.test(selected) || /지 않아요\.?$/u.test(selected)) {
      return `${quoted(selected)} laisse entendre qu’on choisit de ne pas faire l’action. Ici, on en est empêché, donc on emploie 못.`;
    }
    if (selected === "아니에요") {
      return "아니에요 sert à dire « ce n’est pas », pas à nier une action. Ici, 못 indique qu’on ne peut pas agir.";
    }
  }

  if (question.ruleAspect === "desire") {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce un projet. Ici, tu dis ce que tu as envie de faire, donc utilise -고 싶어요.`;
    }
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce une décision ou une promesse à l’autre personne. Ici, tu exprimes simplement une envie.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} propose de faire quelque chose ensemble. Ici, tu dis simplement ce que tu veux faire.`;
    }
  }

  if (question.ruleAspect === "future-vs-intention") {
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce à l’autre personne ce que tu décides de faire. Ici, le projet est déjà prévu, donc on emploie -(으)ㄹ 거예요.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} place l’action dans le passé. Mais le projet annoncé est futur.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est au présent. Pour annoncer ce projet futur, utilise -(으)ㄹ 거예요.`;
    }
  }

  if (question.ruleAspect === "intention-vs-future") {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} parle d’un projet déjà prévu. Ici, tu décides sur le moment en réponse à l’autre personne, donc on emploie -(으)ㄹ게요.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} demande l’avis de l’autre. Ici, tu annonces que tu vas t’en charger.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, tu prends une décision ou tu fais une promesse pour la suite.`;
    }
  }

  if (
    question.ruleAspect === "suggestion" ||
    question.ruleAspect === "suggestion-vs-intention"
  ) {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce un projet sans demander l’avis de l’autre. Pour proposer de faire quelque chose ensemble, utilise -(으)ㄹ까요?`;
    }
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce ce que tu décides de faire. Ici, tu veux proposer une action à faire ensemble.`;
    }
    if (/도 돼요\??$/u.test(selected)) {
      return `${quoted(selected)} demande une autorisation. Ici, tu proposes plutôt de faire l’action ensemble avec -(으)ㄹ까요?`;
    }
  }

  if (question.ruleAspect === "action-request") {
    if (selected === "주세요") {
      return "주세요 après un nom sert à demander cet objet. Ici, 문을 est déjà l’objet : précise l’action avec 열어 주세요.";
    }
    if (selected === "열고 싶어요") {
      return "열고 싶어요 veut dire que toi, tu veux ouvrir. Ici, tu demandes à l’employé de le faire pour toi : 열어 주세요.";
    }
    if (selected === "보이세요") {
      return "보이세요 parle de ce qui est visible ou du fait de voir. Pour demander à l’employé de montrer le menu, dis 보여 주세요.";
    }
    if (selected === "보여요") {
      return "보여요 veut dire que quelque chose est visible. Ici, tu demandes à l’employé de te montrer le menu : 보여 주세요.";
    }
    if (selected === "보일까요") {
      return "보일까요 demande si quelque chose sera visible. Pour demander à l’employé d’agir, dis 보여 주세요.";
    }
    if (["말하세요", "기다리세요", "여세요"].includes(selected)) {
      return `${quoted(selected)} donne une instruction ou une invitation. Ici, tu demandes un service à l’autre personne, donc utilise -아/어 주세요.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} propose de faire quelque chose ensemble. Ici, tu demandes directement à l’autre personne d’agir.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} ne demande pas clairement un service. Pour demander à l’autre personne d’agir, utilise -아/어 주세요.`;
    }
  }
  if (question.ruleAspect === "item-vs-action" && selected === "주세요") {
    return "주세요 après un nom demande l’objet lui-même. Comme 문을 est déjà l’objet, précise l’action : 열어 주세요.";
  }
  if (question.ruleAspect === "instruction" && /주세요\.?$/u.test(selected)) {
    return `${quoted(selected)} sert à demander un service. Ici, le professeur s’adresse à toute la classe avec une instruction en -(으)세요.`;
  }
  if (question.ruleAspect === "item-vs-action" && /세요\.?$/u.test(selected)) {
    return `${quoted(selected)} donne une instruction. Ici, tu demandes à l’employé de faire l’action pour toi, donc utilise -아/어 주세요.`;
  }

  if (question.ruleAspect === "verbal-obligation") {
    if (/도 돼요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit que l’action est permise. Ici, elle est obligatoire, donc il faut -아/어야 해요.`;
    }
    if (/수 있어요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit qu’on peut faire l’action. Ici, on doit la faire.`;
    }
    if (/세요\.?$/u.test(selected)) {
      return `${quoted(selected)} dit directement à l’autre quoi faire. Ici, tu exprimes une obligation avec -아/어야 해요.`;
    }
  }

  if (["sequence", "sequence-vs-reason", "reason", "contrast", "condition"].includes(question.ruleAspect ?? "")) {
    const role = connectorRole(selected);
    if (role) {
      const expectedRole = question.ruleAspect?.startsWith("sequence")
        ? "un simple enchaînement"
        : question.ruleAspect === "reason"
          ? "une cause"
          : question.ruleAspect === "contrast"
            ? "un contraste"
            : "une condition";
      return `${quoted(selected)} donne ${role}, mais ici il faut ${expectedRole}. ${question.explanation}`;
    }
  }

  if (question.ruleAspect === "predicate-final" && Array.isArray(question.answer)) {
    const finalVerb = question.answer.at(-1);
    return `En coréen, garde le verbe ${finalVerb} à la fin. L’ordre naturel est ${quoted(expected)}.`;
  }

  return selectedSpecificFallback(question, selected, expected) ?? question.explanation;
}
