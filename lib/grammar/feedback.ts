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
  return /(?:았|었|했|갔|봤|왔|셨)어요\.?$/u.test(answer);
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
  const conceptId = question.conceptIds[0];

  if (conceptId === "topic-eun-neun") {
    if (["이", "가"].includes(selected)) {
      return `${quoted(selected)} sert à focaliser le sujet. Une phrase ainsi formée peut être grammaticale, mais la consigne demande ici de poser le nom comme thème avec 은/는 : ${expected}.`;
    }
    if (["을", "를"].includes(selected)) {
      return `${quoted(selected)} est une particule d’objet. Elle peut produire une phrase correcte avec un verbe d’action, mais n’exprime pas le thème ou le contraste demandé ici : ${expected}.`;
    }
  }

  if (conceptId === "subject-i-ga" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} donnerait une phrase grammaticale avec une nuance de thème ou de contraste. Ici, la consigne demande de focaliser le sujet avec 이/가 : ${expected}.`;
  }

  if (conceptId === "object-eul-reul" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} donnerait une phrase grammaticale en mettant l’objet en thème ou en contraste. Ici, la consigne demande l’objet direct neutre avec 을/를 : ${expected}.`;
  }

  if (conceptId === "copula-ieyo-yeyo" && selected === "아니에요") {
    return `${quoted(selected)} est une négation correcte de l’identité. Le contexte confirme au contraire l’identité de la personne ou de l’objet : il faut ${expected}.`;
  }

  if (conceptId === "alternative-ina-animyeon" && selected === "하고") {
    return `${quoted(selected)} relie correctement les deux noms avec le sens « et ». Ici, une seule option suffit : la consigne demande l’alternative « ou » avec ${expected}.`;
  }

  if (conceptId === "noun-link-hago-irang" && ["이나", "나"].includes(selected)) {
    return `${quoted(selected)} serait correct pour proposer un choix avec le sens « ou ». Ici, les deux éléments sont réunis : la consigne demande « et » avec ${expected}.`;
  }

  if (
    conceptId === "native-numbers" &&
    question.ruleAspect === "attributive-native-number" &&
    selected === "첫"
  ) {
    return "첫 잔 signifie correctement « la première tasse » d’une série. Ici, la quantité demandée est une seule tasse : on emploie 한 잔.";
  }

  if (
    ["drink-classifier", "flat-classifier", "portion-classifier"].includes(
      question.ruleAspect ?? "",
    ) &&
    selected === "개"
  ) {
    return `${quoted(selected)} peut compter une unité générique. Le contexte demande un classificateur plus précis : ${expected}.`;
  }

  if (question.ruleAspect === "short-negation") {
    if (selected.endsWith("지 않아요")) {
      return `${quoted(selected)} est une négation longue correcte, mais l’exercice demande la forme courte 안 + prédicat : ${expected}.`;
    }
    if (selected.startsWith("못 ")) {
      return `${quoted(selected)} exprime une impossibilité ou une contrainte. Ici, la personne choisit de ne pas agir : il faut la négation courte avec 안.`;
    }
    if (selected === "아니에요") {
      return "아니에요 nie un nom ou une identité. Ici, il faut nier directement le prédicat avec 안.";
    }
  }

  if (question.ruleAspect === "daily-polite") {
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. La situation demande le présent dans le style poli courant en -요 : ${expected}.`;
    }
    if (/(?:습|입)니다\.?$/u.test(selected)) {
      return `${quoted(selected)} appartient au registre formel. Dans cette conversation quotidienne, on attend le style poli courant en -요.`;
    }
    if (!/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est une forme familière. Il faut ici conserver le registre poli en -요.`;
    }
  }

  if (["present-eoyo", "present-ayo", "present-haeyo"].includes(question.ruleAspect ?? "")) {
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. Ici, il faut conjuguer le verbe au présent poli courant.`;
    }
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce une action future. La consigne demande le présent poli courant.`;
    }
  }

  if (question.ruleAspect?.startsWith("past-")) {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} situe l’action dans le futur. Ici, l’action est terminée : il faut la forme passée en -았/었어요.`;
    }
    if (/요\.?$/u.test(selected) && !isPolitePast(selected)) {
      return `${quoted(selected)} est au présent. L’action étant terminée, il faut la forme passée en -았/었어요.`;
    }
  }

  if (question.ruleAspect === "future-batchim" || question.ruleAspect === "future-no-batchim") {
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce une décision adressée à l’interlocuteur. Ici, on décrit un projet prévu avec -(으)ㄹ 거예요.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. La consigne demande d’annoncer un projet futur.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est au présent. Pour ce projet futur, il faut -(으)ㄹ 거예요.`;
    }
  }

  if (question.ruleAspect === "polite-my" && selected === "내") {
    return "내 est la forme familière de « mon ». Face à cette personne, le registre poli demande 제.";
  }
  if (question.ruleAspect === "polite-my" && selected === "저") {
    return "저 signifie « je » en registre humble, mais ce n’est pas le possessif. Pour dire « mon » poliment, on emploie 제.";
  }
  if (question.ruleAspect === "polite-my" && selected === "제가") {
    return "제가 est le pronom « je » suivi de la particule de sujet 가. Devant le nom possédé, il faut le possessif 제.";
  }
  if (question.ruleAspect === "casual-my" && selected === "제") {
    return "제 est la forme humble employée en registre poli. Entre amis proches, la phrase familière en -이야 appelle 내.";
  }
  if (question.ruleAspect === "casual-my" && (selected === "나" || selected === "제가")) {
    return `${quoted(selected)} est un pronom sujet, pas la forme possessive. Pour dire « mon » familièrement, on emploie 내.`;
  }

  if (selected === "입니다" && (question.ruleAspect === "batchim" || question.ruleAspect === "no-batchim")) {
    return "입니다 est une copule formelle correcte, mais la situation demande le style poli courant : 이에요 après une consonne, 예요 après une voyelle.";
  }
  if (selected === "이예요") {
    return "이예요 n’est pas la forme standard. On emploie 이에요 après une consonne et 예요 après une voyelle.";
  }

  if (question.ruleAspect === "honorific-present") {
    if (selected === "와요") {
      return "와요 est poli envers l’interlocuteur, mais n’honore pas le sujet. Pour le professeur, il faut ajouter -시- : 오세요.";
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
      return "명 est le classificateur courant des personnes. En s’adressant respectueusement aux clients, on choisit 분.";
    }
    if (selected === "있어요") {
      return "있어요 est poli, mais n’honore pas la personne dont on parle. Pour la présence du professeur, on emploie 계세요.";
    }
    if (selected === "계셨어요" || selected === "계실 거예요") {
      return `${quoted(selected)} est honorifique, mais le temps ne convient pas : la présence actuelle du professeur se dit 계세요.`;
    }
    if (selected === "이름") {
      return "이름 est le mot courant pour « nom ». Dans cette demande respectueuse, le terme honorifique est 성함.";
    }
  }
  if (question.ruleAspect === "honorific-request") {
    if (selected === "말해요") {
      return "말해요 n’exprime pas la demande très respectueuse attendue. 말씀해 주시겠어요? sollicite poliment une répétition.";
    }
    if (selected === "말씀하세요") {
      return "말씀하세요 est une instruction honorifique plus directe. Ici, la demande de répétition s’adoucit avec 말씀해 주시겠어요?";
    }
    if (selected === "말할까요") {
      return "말할까요? propose que le locuteur parle lui-même. Pour demander à l’autre de répéter respectueusement, on dit 말씀해 주시겠어요?";
    }
  }

  if (question.ruleAspect === "location" && selected === "에서") {
    return "에서 marque le lieu où se déroule une action. Ici, 있어요 décrit une position statique : le lieu prend 에.";
  }
  if (question.ruleAspect === "action-location" && selected === "에") {
    return "에 localise un état ou marque une destination. Comme l’action se déroule dans ce lieu, il faut 에서.";
  }
  if (question.ruleAspect === "destination" && selected === "에서") {
    return "에서 formerait une phrase grammaticale en faisant du lieu le point de départ. Ici, ce lieu est explicitement la destination : le point d’arrivée prend 에.";
  }
  if (question.ruleAspect === "time") {
    if (selected === "부터") {
      return "부터 marque le début d’une période. Ici, il s’agit d’un moment précis, qui se marque avec 에.";
    }
    if (selected === "에서") {
      return "에서 s’emploie pour le lieu d’une action, pas pour cette heure précise. Le repère temporel prend 에.";
    }
  }

  if (question.ruleAspect === "additive-vs-restrictive" && selected === "만") {
    return "만 signifie « seulement » et exclurait le reste de la commande. Ici, le pain s’ajoute à ce qui est déjà commandé : il faut 도.";
  }
  if (conceptId === "additive-do" && ["은", "는"].includes(selected)) {
    return `${quoted(selected)} peut former un thème ou un contraste grammatical. Ici, la consigne demande d’encoder explicitement l’addition « aussi » avec 도.`;
  }
  if (
    conceptId === "additive-do" &&
    ["을", "를"].includes(selected) &&
    question.display?.includes("커피")
  ) {
    return `${quoted(selected)} formerait un objet direct neutre correct. Ici, le café s’ajoute au thé déjà mentionné : il faut encoder « aussi » avec 도.`;
  }
  if (question.ruleAspect === "restrictive-vs-additive" && selected === "도") {
    return "도 signifie « aussi » et ajouterait le pain à autre chose. Ici, la commande se limite au pain : il faut 만.";
  }
  if (
    conceptId === "restrictive-man" &&
    question.ruleAspect === "restrictive" &&
    ["은", "는"].includes(selected)
  ) {
    return `${quoted(selected)} peut créer un contraste grammatical avec d’autres éléments. Ici, la consigne demande d’encoder explicitement la restriction « seulement » avec 만.`;
  }

  if (question.ruleAspect === "direction-batchim" && selected === "에") {
    return "오른쪽에 가세요 peut désigner la droite comme lieu d’arrivée. Ici, la consigne porte sur la direction du mouvement : 오른쪽으로 가세요.";
  }

  if (question.ruleAspect === "range-start") {
    if (selected === "에서") {
      return `${quoted(selected)} peut aussi introduire une plage dans certains usages. Ici, la consigne demande de marquer explicitement sa borne de départ avec 부터.`;
    }
    if (selected === "에") {
      return `${quoted(selected)} marque un moment ponctuel. Ici, il faut ouvrir explicitement une plage continue avec 부터.`;
    }
  }
  if (question.ruleAspect === "range-end" && selected === "에") {
    return `${quoted(selected)} marque un moment ponctuel. Ici, il faut fermer la plage continue commencée avec 부터 : la borne finale prend 까지.`;
  }

  if (question.ruleAspect === "comparison" && selected === "제일") {
    return "제일 forme correctement un superlatif dans un groupe. Ici, seuls deux éléments sont comparés avec 보다 : on emploie le comparatif 더.";
  }

  if (
    question.ruleAspect === "ability" ||
    question.ruleAspect === "ability-vs-permission"
  ) {
    if (/도 돼요\??$/u.test(selected)) {
      return `${quoted(selected)} demande une autorisation. Ici, on vérifie une capacité ou une possibilité réelle avec -(으)ㄹ 수 있어요.`;
    }
    if (/고 싶어요\.?$/u.test(selected)) {
      return `${quoted(selected)} exprime une envie, pas une capacité. La capacité se construit avec -(으)ㄹ 수 있어요.`;
    }
    if (/야 해요\.?$/u.test(selected)) {
      return `${quoted(selected)} exprime une obligation. Ici, la question porte sur ce qu’il est possible de faire.`;
    }
    if (/^못 /u.test(selected)) {
      return `${quoted(selected)} nie la capacité. La consigne demande au contraire d’exprimer que l’action est possible.`;
    }
  }

  if (
    question.ruleAspect === "permission" ||
    question.ruleAspect === "permission-vs-ability"
  ) {
    if (/수 있어요\??$/u.test(selected)) {
      return `${quoted(selected)} interroge sur une capacité ou une possibilité. Ici, tu demandes l’autorisation avec -아/어도 돼요.`;
    }
    if (/세요\??$/u.test(selected)) {
      return `${quoted(selected)} donne une instruction à l’interlocuteur. La situation demande si toi, tu as le droit d’agir.`;
    }
    if (/야 해요\??$/u.test(selected)) {
      return `${quoted(selected)} exprime une obligation. Ici, il faut demander si l’action est autorisée.`;
    }
  }

  if (question.ruleAspect === "inability-vs-choice") {
    if (/^안 /u.test(selected) || /지 않아요\.?$/u.test(selected)) {
      return `${quoted(selected)} présente l’action comme un choix de ne pas faire. Ici, une contrainte l’empêche : on emploie 못.`;
    }
    if (selected === "아니에요") {
      return "아니에요 sert à nier une identité, pas une action. L’impossibilité d’agir se marque ici avec 못.";
    }
  }

  if (question.ruleAspect === "desire") {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce un projet. Ici, il faut exprimer une envie avec -고 싶어요.`;
    }
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce une décision ou une promesse à l’interlocuteur. La consigne porte sur un souhait.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} propose une action commune. Ici, le locuteur exprime ce qu’il souhaite faire.`;
    }
  }

  if (question.ruleAspect === "future-vs-intention") {
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} exprime une décision adressée à l’interlocuteur. Ce projet est déjà prévu : on emploie -(으)ㄹ 거예요.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} situe l’action dans le passé. Le projet annoncé est futur.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} est une forme du présent. Pour annoncer ce projet futur, il faut -(으)ㄹ 거예요.`;
    }
  }

  if (question.ruleAspect === "intention-vs-future") {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce un projet prévu. Ici, la décision se prend en réaction à l’interlocuteur : on emploie -(으)ㄹ게요.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} demande l’avis de l’autre. Ici, le locuteur annonce qu’il s’en charge.`;
    }
    if (isPolitePast(selected)) {
      return `${quoted(selected)} est au passé. La situation appelle une décision ou une promesse pour la suite.`;
    }
  }

  if (
    question.ruleAspect === "suggestion" ||
    question.ruleAspect === "suggestion-vs-intention"
  ) {
    if (/거예요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce un projet, sans solliciter l’autre personne. Une proposition commune se forme avec -(으)ㄹ까요?`;
    }
    if (/게요\.?$/u.test(selected)) {
      return `${quoted(selected)} annonce la décision du locuteur. Ici, il faut proposer une action à faire ensemble.`;
    }
    if (/도 돼요\??$/u.test(selected)) {
      return `${quoted(selected)} demande une autorisation. La situation appelle une suggestion commune avec -(으)ㄹ까요?`;
    }
  }

  if (question.ruleAspect === "action-request") {
    if (["말하세요", "기다리세요", "여세요"].includes(selected)) {
      return `${quoted(selected)} donne une instruction ou une invitation. Ici, tu demandes à l’interlocuteur de rendre un service avec -아/어 주세요.`;
    }
    if (/까요\??$/u.test(selected)) {
      return `${quoted(selected)} formule une suggestion. La situation demande explicitement une action à l’interlocuteur.`;
    }
    if (/요\.?$/u.test(selected)) {
      return `${quoted(selected)} n’explicite pas la demande de service. Pour solliciter l’interlocuteur, il faut -아/어 주세요.`;
    }
  }
  if (question.ruleAspect === "instruction" && /주세요\.?$/u.test(selected)) {
    return `${quoted(selected)} demande un service personnel. Ici, le professeur donne une consigne à la classe avec -(으)세요.`;
  }
  if (question.ruleAspect === "item-vs-action" && selected === "주세요") {
    return "주세요 après un nom demande l’objet lui-même. Comme 문을 est déjà l’objet, il faut préciser l’action 열어 주세요.";
  }
  if (question.ruleAspect === "item-vs-action" && /세요\.?$/u.test(selected)) {
    return `${quoted(selected)} donne une instruction. Ici, tu demandes à l’employé d’effectuer l’action pour toi avec -아/어 주세요.`;
  }

  if (question.ruleAspect === "verbal-obligation") {
    if (/도 돼요\.?$/u.test(selected)) {
      return `${quoted(selected)} exprime une permission. Ici, l’action est obligatoire : il faut -아/어야 해요.`;
    }
    if (/수 있어요\.?$/u.test(selected)) {
      return `${quoted(selected)} exprime une capacité ou une possibilité. La situation impose l’action.`;
    }
    if (/세요\.?$/u.test(selected)) {
      return `${quoted(selected)} donne une instruction à l’interlocuteur. Ici, on exprime une obligation avec -아/어야 해요.`;
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
      return `${quoted(selected)} exprime ${role}, alors que le contexte demande ${expectedRole}. ${question.explanation}`;
    }
  }

  if (question.ruleAspect === "predicate-final" && Array.isArray(question.answer)) {
    const finalVerb = question.answer.at(-1);
    return `Le verbe ${finalVerb} doit rester à la fin de la phrase coréenne. L’ordre attendu est ${quoted(expected)}.`;
  }

  return question.explanation;
}
