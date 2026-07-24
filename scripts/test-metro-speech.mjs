import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";

import {
  getMetroSpeechChoiceIntent,
  getMetroSpeechContextualStrings,
  matchMetroSpeechIntent,
} from "../lib/metroSpeechIntents.ts";
import {
  buildMetroConversationSummary,
  createMetroConversationMemory,
  recordMetroAudioReplay,
  recordMetroHelpRequest,
  recordMetroSpeechAttempt,
} from "../lib/metroConversationMemory.ts";

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      const isLocalExtensionlessImport =
        error?.code === "ERR_MODULE_NOT_FOUND" &&
        /^\.{1,2}\//.test(specifier) &&
        !/\.[a-z]+$/i.test(specifier);

      if (isLocalExtensionlessImport) {
        return nextResolve(`${specifier}.ts`, context);
      }

      throw error;
    }
  },
});

const { getMetroMissionById, getMetroMissionLesson, metroMissions } =
  await import("../data/lesson/metro/metroMissions.ts");

const direction = {
  id: "choose_hongik_direction",
  label: "Demander la direction de Gangnam",
  korean: "강남 방향은 어느 쪽이에요?",
  nextNodeId: "ask_direction_hongik_ia_platform_direction",
};
const repeat = {
  id: "repeat_platform",
  label: "Pouvez-vous répéter ?",
  korean: "다시 한번 말씀해 주실 수 있나요?",
  nextNodeId: "ask_direction_hongik_ia_repeat_platform_direction",
};
const thanks = {
  id: "thank_after_direction",
  label: "Merci",
  korean: "감사합니다, 다 이해했어요!",
  nextNodeId: "ask_direction_hongik_ia_end",
};
const duration = {
  id: "ask_trip",
  label: "Combien de temps dure le trajet ?",
  korean: "시간은 얼마나 걸리나요?",
  nextNodeId: "ask_direction_hongik_ia_trip_time",
};
const transfer = {
  id: "ask_transfer",
  label: "Est-ce qu'il y a un transfert ?",
  korean: "갈아타야 하나요?",
  nextNodeId: "ask_direction_hongik_ia_transfer_info",
};

const askDirectionLesson = getMetroMissionLesson(
  getMetroMissionById("ask-direction"),
);
const askDirectionSpeechNodes = (askDirectionLesson?.steps ?? [])
  .filter((step) => step.choices?.length)
  .map((step) => ({
    id: step.id === "start" ? "start" : `${step.id}_choices`,
    choices: step.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      korean: choice.korean,
      nextNodeId: choice.nextId,
    })),
  }));

const naturalVariantsByIntent = {
  direction: [
    "강남에 어떻게 가요?",
    "강남까지 어떻게 가요?",
    "강남 방향은 어느 쪽이에요?",
  ],
  repeat: ["다시요", "한 번 더요", "다시 말해 주세요"],
  duration: ["얼마나 걸려요?", "몇 분 걸려요?", "시간이 얼마나 걸려요?"],
  transfer: [
    "갈아타야 하나요?",
    "환승해야 해요?",
    "갈아타야 해요?",
    "환승 있어요?",
    "어디서 갈아타요?",
    "어디서 환승해요?",
  ],
  thanks: ["감사합니다", "알겠습니다", "이해했어요"],
};

const closeVariantsByIntent = {
  direction: ["강람 방향은 어느 쪽이에요?"],
  repeat: ["다씨 한번 말슴해 주세요"],
  duration: ["몇 뿐 걸려요?"],
  transfer: ["갈라타야 하나요", "갈라 타야 하나요", "가라타야 하나요"],
  thanks: ["감사함니다"],
};

test("les formulations naturelles vers Gangnam sont validées", () => {
  for (const transcript of [
    "강남에 어떻게 가요?",
    "강남까지 어떻게 가요?",
    "강남은 어떻게 가요?",
    "강남 가려면 어떻게 해요?",
    "강남 방향은 어느 쪽이에요?",
    "강남 가는 쪽이 어디예요?",
    "강남은 어느 쪽이에요?",
    "강남 쪽은 어디예요?",
    "강남 가려면 어디로 가야 해요?",
    "강남 가는 방향이 어디예요?",
    "강남역 가는 쪽이 어디예요?",
  ]) {
    const result = matchMetroSpeechIntent(transcript, [direction]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, direction.id, transcript);
  }
});

test("une formulation débutante est validée sans mot-clé imposé", () => {
  const result = matchMetroSpeechIntent("강남까지 어떻게 가요?", [direction]);

  assert.equal(result.reason, "matched");
  assert.equal(result.category, "natural");
  assert.equal(result.understoodWithCorrection, false);
  assert.match(result.feedback, /phrase est naturelle/i);
  assert.match(result.feedback, /강남 방향은 어느 쪽이에요/);
});

test("le premier tour couvre les formulations A1 et leurs petites erreurs", () => {
  for (const transcript of [
    "강남 가려면 어디로 가요?",
    "강남역 가는 길이 어디예요?",
    "2호선 어디서 타요?",
    "강남 가는 지하철 어디예요?",
  ]) {
    assert.equal(
      matchMetroSpeechIntent(transcript, [direction]).reason,
      "matched",
      transcript,
    );
  }

  for (const [transcript, category] of [
    ["강남 어떻게 가요?", "particle-imperfection"],
    ["강남을 어떻게 가요?", "particle-imperfection"],
    ["강남 어떻게 가?", "minor-imperfection"],
    ["강남에 어떻게 와요?", "go-come-confusion"],
    ["Gangnam 어떻게 가요?", "mixed-language"],
  ]) {
    const result = matchMetroSpeechIntent(transcript, [direction]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.category, category, transcript);
    assert.equal(result.understoodWithCorrection, true, transcript);
  }

  const corrected = matchMetroSpeechIntent(
    "이태원… 아니, 강남에 어떻게 가요?",
    [direction],
  );
  assert.equal(corrected.reason, "matched");
  assert.equal(corrected.category, "natural");

  const incomplete = matchMetroSpeechIntent("강남 가려면…", [direction]);
  assert.equal(incomplete.reason, "uncertain");
  assert.equal(incomplete.category, "incomplete");

  const trainVerb = matchMetroSpeechIntent("강남 어떻게 타요?", [direction]);
  assert.equal(trainVerb.reason, "matched");
  assert.equal(trainVerb.category, "minor-imperfection");
});

test("une phrase courte compréhensible passe avec une micro-correction", () => {
  const result = matchMetroSpeechIntent("강남 방향 어디예요?", [direction]);
  assert.equal(result.reason, "matched");
  assert.equal(result.category, "minor-imperfection");
  assert.equal(result.understoodWithCorrection, true);
  assert.match(result.feedback, /plus naturel/i);
});

test("les informations manquantes reçoivent un feedback ciblé", () => {
  const destinationOnly = matchMetroSpeechIntent("강남 어디예요?", [direction]);
  assert.equal(destinationOnly.category, "destination-only");
  assert.match(destinationOnly.feedback, /direction/i);

  const directionOnly = matchMetroSpeechIntent("어느 쪽이에요?", [direction]);
  assert.equal(directionOnly.category, "direction-only");
  assert.match(directionOnly.feedback, /destination/i);
});

test("les confusions de situation sont distinguées", () => {
  const cases = [
    ["몇 번 출구예요?", "exit-confusion"],
    ["강남에서 몇 번 출구예요?", "exit-confusion"],
    ["얼마나 걸려요?", "duration-confusion"],
    ["강남까지 얼마나 걸려요?", "duration-confusion"],
    ["어디서 환승해요?", "transfer-confusion"],
    ["이태원 방향은 어느 쪽이에요?", "wrong-destination"],
    ["bonjour", "french"],
    ["오늘 커피를 마셔요", "out-of-scope"],
  ];

  for (const [transcript, category] of cases) {
    assert.equal(
      matchMetroSpeechIntent(transcript, [direction]).category,
      category,
      transcript,
    );
  }
});

test("Gangnam seul, une destination absente et des intentions contradictoires restent bloquants", () => {
  assert.equal(
    matchMetroSpeechIntent("강남은 유명해요", [direction]).category,
    "destination-only",
  );
  assert.equal(
    matchMetroSpeechIntent("어떻게 가요?", [direction]).category,
    "direction-only",
  );
  assert.equal(
    matchMetroSpeechIntent("강남까지 어떻게 가요? 이태원 방향이에요?", [direction])
      .category,
    "wrong-destination",
  );
});

test("une réponse française comprise encourage une production coréenne", () => {
  const result = matchMetroSpeechIntent(
    "De quel côté est le métro pour Gangnam ?",
    [direction],
  );
  assert.equal(result.category, "french");
  assert.match(result.feedback, /demandes comment aller/i);
  assert.match(result.feedback, /강남/);
});

test("une transcription proche mais incertaine demande confirmation", () => {
  const result = matchMetroSpeechIntent("강람 방향", [direction]);
  assert.equal(result.reason, "uncertain");
  assert.equal(result.choice?.id, direction.id);
  assert.match(result.feedback, /Confirme ou réessaie/i);
});

test("l'aide devient progressivement plus explicite", () => {
  const first = matchMetroSpeechIntent("강남", [direction], 1);
  const second = matchMetroSpeechIntent("강남", [direction], 2);
  const third = matchMetroSpeechIntent("강남", [direction], 3);
  assert.doesNotMatch(first.feedback, /Mots utiles/);
  assert.match(second.feedback, /Mots utiles/);
  assert.match(third.feedback, /Phrase modèle/);
});

test("le deuxième tour reconnaît les demandes de répétition A1", () => {
  for (const transcript of [
    "다시요",
    "한 번 더요",
    "다시 말해 주세요",
    "천천히 말해 주세요",
    "못 들었어요",
  ]) {
    const result = matchMetroSpeechIntent(transcript, [repeat, thanks]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, repeat.id, transcript);
  }

  const informal = matchMetroSpeechIntent("다시 말해", [repeat, thanks]);
  assert.equal(informal.category, "repeat-informal");
  assert.equal(informal.understoodWithCorrection, true);
  assert.match(informal.feedback, /inconnu/i);

  const reversed = matchMetroSpeechIntent("말해 주세요 다시", [repeat, thanks]);
  assert.equal(reversed.category, "repeat-word-order");
  assert.equal(reversed.choice?.id, repeat.id);

  const otherQuestion = matchMetroSpeechIntent("몇 분 걸려요?", [repeat, thanks]);
  assert.equal(otherQuestion.category, "duration-confusion");
  assert.notEqual(otherQuestion.choice?.id, repeat.id);
});

test("la durée est reconnue sans formulation exacte quand sa branche est disponible", () => {
  for (const transcript of [
    "얼마나 걸려요?",
    "강남까지 얼마나 걸려요?",
    "몇 분 걸려요?",
    "시간이 얼마나 걸려요?",
  ]) {
    const result = matchMetroSpeechIntent(transcript, [
      repeat,
      duration,
      transfer,
      thanks,
    ]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.category, "duration", transcript);
    assert.equal(result.choice?.id, duration.id, transcript);
  }

  const short = matchMetroSpeechIntent("몇 분?", [
    repeat,
    duration,
    transfer,
    thanks,
  ]);
  assert.equal(short.category, "duration-imperfection");
  assert.equal(short.choice?.id, duration.id);
  assert.equal(short.understoodWithCorrection, true);
});

test("la correspondance est reconnue sans formulation exacte quand sa branche est disponible", () => {
  for (const transcript of [
    "환승해야 해요?",
    "갈아타야 해요?",
    "환승 있어요?",
    "어디서 환승해요?",
  ]) {
    const result = matchMetroSpeechIntent(transcript, [
      repeat,
      duration,
      transfer,
      thanks,
    ]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.category, "transfer", transcript);
    assert.equal(result.choice?.id, transfer.id, transcript);
  }

  const short = matchMetroSpeechIntent("환승?", [
    repeat,
    duration,
    transfer,
    thanks,
  ]);
  assert.equal(short.category, "transfer-imperfection");
  assert.equal(short.choice?.id, transfer.id);
  assert.equal(short.understoodWithCorrection, true);
});

test("le troisième tour reconnaît remerciement, compréhension et nouvelle répétition", () => {
  for (const transcript of [
    "감사합니다",
    "네, 감사합니다",
    "알겠습니다",
    "이해했어요",
    "감사합니다, 이해했어요",
  ]) {
    const result = matchMetroSpeechIntent(transcript, [repeat, thanks]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, thanks.id, transcript);
  }

  const informal = matchMetroSpeechIntent("고마워", [repeat, thanks]);
  assert.equal(informal.category, "thanks-informal");
  assert.equal(informal.choice?.id, thanks.id);
  assert.equal(informal.understoodWithCorrection, true);

  const yesOnly = matchMetroSpeechIntent("네", [repeat, thanks]);
  assert.equal(yesOnly.category, "ambiguous-acknowledgement");
  assert.equal(yesOnly.choice, null);

  const notUnderstood = matchMetroSpeechIntent(
    "아직 이해 못 했어요",
    [repeat, thanks],
  );
  assert.equal(notUnderstood.category, "not-understood");
  assert.equal(notUnderstood.choice?.id, repeat.id);

  assert.equal(
    matchMetroSpeechIntent("아니요", [repeat, thanks]).choice?.id,
    repeat.id,
  );

  const incomplete = matchMetroSpeechIntent("네, 알겠…", [repeat, thanks]);
  assert.equal(incomplete.reason, "uncertain");
  assert.equal(incomplete.category, "incomplete");
  assert.equal(incomplete.choice?.id, thanks.id);

  assert.equal(
    matchMetroSpeechIntent("다시요", [repeat, thanks]).choice?.id,
    repeat.id,
  );
});

test("les questions liées au contenu reçoivent une clarification contextualisée", () => {
  for (const transcript of [
    "2호선 맞아요?",
    "지하 2층이에요?",
    "합정 방향이에요?",
    "신도림 쪽이에요?",
    "외선순환이 뭐예요?",
    "B2가 어디예요?",
    "몇 호선이에요?",
  ]) {
    const result = matchMetroSpeechIntent(transcript, [repeat, thanks]);
    assert.equal(result.category, "relevant-question", transcript);
    assert.notEqual(result.category, "out-of-scope", transcript);
    assert.match(result.feedback, /question n’est pas disponible/i, transcript);
  }
});

test("le contexte vocal reste limité au nœud courant", () => {
  const context = getMetroSpeechContextualStrings([direction]);
  assert.ok(context.includes("강남"));
  assert.ok(context.includes("2호선"));
  assert.ok(!context.includes("이태원"));

  const closingContext = getMetroSpeechContextualStrings([repeat, thanks]);
  assert.ok(!closingContext.includes("강남까지 얼마나 걸려요?"));
  assert.ok(!closingContext.includes("환승해야 해요?"));

  const enrichedContext = getMetroSpeechContextualStrings([
    repeat,
    duration,
    transfer,
    thanks,
  ]);
  assert.ok(enrichedContext.includes("강남까지 얼마나 걸려요?"));
  assert.ok(enrichedContext.includes("환승해야 해요?"));
  assert.ok(enrichedContext.includes("갈아타야 하나요?"));
  assert.ok(enrichedContext.includes("어디서 갈아타요?"));
});

test("chaque réplique affichée de chaque nœud possède une intention et une transition valides", () => {
  assert.ok(askDirectionLesson);
  assert.deepEqual(
    askDirectionSpeechNodes.map(({ id }) => id),
    [
      "start",
      "ask_direction_hongik_ia_platform_direction_choices",
      "ask_direction_hongik_ia_repeat_platform_direction_choices",
      "ask_direction_hongik_ia_trip_time_choices",
      "ask_direction_hongik_ia_repeat_trip_time_choices",
      "ask_direction_hongik_ia_transfer_info_choices",
      "ask_direction_hongik_ia_repeat_transfer_info_choices",
    ],
  );

  const stepIds = new Set(askDirectionLesson.steps.map(({ id }) => id));

  for (const node of askDirectionSpeechNodes) {
    for (const choice of node.choices) {
      const intent = getMetroSpeechChoiceIntent(choice);
      assert.notEqual(intent, "unknown", `${node.id}.${choice.id}`);
      assert.ok(
        stepIds.has(choice.nextNodeId),
        `${node.id}.${choice.id} cible un nœud absent : ${choice.nextNodeId}`,
      );

      const result = matchMetroSpeechIntent(choice.korean, node.choices);
      assert.equal(result.reason, "matched", `${node.id}.${choice.id}`);
      assert.equal(result.choice?.id, choice.id, `${node.id}.${choice.id}`);
      assert.equal(
        result.choice?.nextNodeId,
        choice.nextNodeId,
        `${node.id}.${choice.id}`,
      );
    }
  }
});

test("chaque choix accepte ses formulations naturelles et ses transcriptions proches au bon nœud", () => {
  for (const node of askDirectionSpeechNodes) {
    for (const choice of node.choices) {
      const intent = getMetroSpeechChoiceIntent(choice);

      for (const transcript of naturalVariantsByIntent[intent]) {
        const result = matchMetroSpeechIntent(transcript, node.choices);
        assert.equal(result.reason, "matched", `${node.id}: ${transcript}`);
        assert.equal(result.choice?.id, choice.id, `${node.id}: ${transcript}`);
      }

      for (const transcript of closeVariantsByIntent[intent]) {
        const result = matchMetroSpeechIntent(transcript, node.choices);
        assert.equal(result.reason, "matched", `${node.id}: ${transcript}`);
        assert.equal(result.choice?.id, choice.id, `${node.id}: ${transcript}`);
        assert.equal(
          result.understoodWithCorrection,
          true,
          `${node.id}: ${transcript}`,
        );
      }
    }
  }
});

test("les feedbacks d’erreur énumèrent tous les choix réellement visibles", () => {
  for (const node of askDirectionSpeechNodes) {
    const result = matchMetroSpeechIntent("커피를 주문하고 싶어요", node.choices);
    assert.notEqual(result.reason, "matched", node.id);

    for (const choice of node.choices) {
      assert.ok(
        result.feedback.includes(`« ${choice.label} »`),
        `${node.id}: feedback incomplet pour ${choice.id}`,
      );
    }
  }
});

test("une intention absente du nœud courant ne peut jamais déclencher une autre branche", () => {
  const canonicalTranscriptByIntent = {
    direction: "강남 방향은 어느 쪽이에요?",
    repeat: "다시 말해 주세요",
    duration: "얼마나 걸려요?",
    transfer: "갈아타야 하나요?",
    thanks: "감사합니다",
  };

  for (const node of askDirectionSpeechNodes) {
    const availableIntents = new Set(
      node.choices.map((choice) => getMetroSpeechChoiceIntent(choice)),
    );

    for (const [intent, canonicalTranscript] of Object.entries(
      canonicalTranscriptByIntent,
    )) {
      if (availableIntents.has(intent)) continue;

      for (const transcript of [
        canonicalTranscript,
        ...closeVariantsByIntent[intent],
      ]) {
        const result = matchMetroSpeechIntent(transcript, node.choices);
        assert.notEqual(result.reason, "matched", `${node.id}: ${transcript}`);
        assert.equal(result.choice, null, `${node.id}: ${transcript}`);

        for (const choice of node.choices) {
          assert.ok(
            result.feedback.includes(`« ${choice.label} »`),
            `${node.id}: feedback incomplet après ${transcript}`,
          );
        }
      }
    }
  }
});

test("les erreurs phonétiques de correspondance sont récupérées sans bloquer la scène", () => {
  for (const transcript of closeVariantsByIntent.transfer) {
    const result = matchMetroSpeechIntent(transcript, [
      repeat,
      duration,
      transfer,
      thanks,
    ]);
    assert.equal(result.reason, "matched", transcript);
    assert.equal(result.choice?.id, transfer.id, transcript);
    assert.equal(result.category, "transfer-imperfection", transcript);
    assert.equal(result.understoodWithCorrection, true, transcript);
    assert.match(
      result.feedback,
      /Tu demandes s’il faut changer de ligne\./,
      transcript,
    );
    assert.match(result.feedback, /갈아타야 하나요\?/, transcript);
  }
});

test("la mission vocale réutilise ask-direction et conserve son accès premium", () => {
  const source = readFileSync(
    new URL("../data/lesson/metro/metroMissions.ts", import.meta.url),
    "utf8",
  );
  const missionBlock = source.match(
    /id: "ask-direction",[\s\S]*?missionKind: "mini",/,
  )?.[0];
  assert.ok(missionBlock);
  assert.match(missionBlock, /access: "premium"/);
  assert.match(missionBlock, /scenarioKey: "ask_direction"/);
  assert.match(source, /id: "choose_hongik_direction"/);
  assert.match(
    source,
    /stepId: "ia_repeat_platform_direction",[\s\S]*?"repeat_platform"[\s\S]*?"thank_after_direction_repeat"/,
  );
  assert.doesNotMatch(
    source.match(/function createAskDirectionLesson[\s\S]*?type MiniLessonConfig/)?.[0] ?? "",
    /choose_myeongdong_direction/,
  );
});

test("toutes les missions Métro actives conservent des transitions complètes", () => {
  for (const mission of metroMissions) {
    const lesson = getMetroMissionLesson(mission);
    assert.ok(lesson, `Le script de ${mission.id} doit exister`);
    assert.ok(lesson.steps.length > 1, `${mission.id} doit contenir un parcours`);

    const stepIds = new Set(lesson.steps.map(({ id }) => id));
    assert.equal(
      stepIds.size,
      lesson.steps.length,
      `${mission.id} ne doit pas contenir d’identifiant d’étape dupliqué`,
    );
    assert.ok(stepIds.has("start"), `${mission.id} doit commencer par start`);

    const reachableStepIds = new Set(["start"]);
    const pendingStepIds = ["start"];

    while (pendingStepIds.length) {
      const stepId = pendingStepIds.pop();
      const step = lesson.steps.find(({ id }) => id === stepId);

      for (const choice of step?.choices ?? []) {
        if (!reachableStepIds.has(choice.nextId)) {
          reachableStepIds.add(choice.nextId);
          pendingStepIds.push(choice.nextId);
        }
      }
    }

    for (const step of lesson.steps) {
      assert.ok(
        reachableStepIds.has(step.id),
        `${mission.id}: l’étape ${step.id} est inaccessible depuis start`,
      );

      for (const choice of step.choices ?? []) {
        assert.ok(
          stepIds.has(choice.nextId),
          `${mission.id}: ${step.id}.${choice.id} cible ${choice.nextId}, qui n’existe pas`,
        );
      }
    }

    assert.ok(
      [...reachableStepIds].some((stepId) => /(?:^|_)end$/.test(stepId)),
      `${mission.id} doit conserver une fin de parcours accessible`,
    );
  }
});

test("la branche Direction réutilise les réponses durée et correspondance sans transition impossible", () => {
  const missionsSource = readFileSync(
    new URL("../data/lesson/metro/metroMissions.ts", import.meta.url),
    "utf8",
  );
  const metroSource = readFileSync(
    new URL("../data/lesson/metro/metro.ts", import.meta.url),
    "utf8",
  );
  const branch = missionsSource.match(
    /function createAskDirectionLesson[\s\S]*?type MiniLessonConfig/,
  )?.[0];
  const hongikSource = metroSource.match(
    /export const hongikToGangnamLesson[\s\S]*?export const metroLessons/,
  )?.[0];
  assert.ok(branch);
  assert.ok(hongikSource);

  for (const stepId of [
    "ia_platform_direction",
    "ia_repeat_platform_direction",
    "ia_trip_time",
    "ia_repeat_trip_time",
    "ia_transfer_info",
    "ia_repeat_transfer_info",
    "ia_end",
  ]) {
    assert.match(branch, new RegExp(`stepId: "${stepId}"`), stepId);
  }

  for (const target of [
    "ask_direction_hongik_ia_trip_time",
    "ask_direction_hongik_ia_transfer_info",
    "ask_direction_hongik_ia_repeat_trip_time",
    "ask_direction_hongik_ia_end",
  ]) {
    assert.match(branch, new RegExp(`"${target}"`), target);
    const suffix = target.replace("ask_direction_hongik_", "");
    assert.match(
      branch,
      new RegExp(`stepId: "${suffix}"`),
      `${target} doit avoir un nœud cible`,
    );
  }

  for (const choiceId of [
    "ask_trip",
    "ask_transfer",
    "ask_transfer_from_trip",
    "repeat_trip",
    "repeat_transfer",
    "thank_after_trip",
    "thank_after_transfer",
  ]) {
    assert.match(branch, new RegExp(`"${choiceId}"`), choiceId);
  }

  assert.match(
    branch,
    /stepId: "ia_trip_time",[\s\S]*?keepChoiceIds: \["repeat_trip", "ask_transfer_from_trip"\],[\s\S]*?"thank_after_trip"/,
  );
  assert.match(
    branch,
    /stepId: "ia_repeat_trip_time",[\s\S]*?"ask_transfer_after_trip_repeat"[\s\S]*?"repeat_trip"[\s\S]*?"thank_after_trip_repeat"/,
  );
  assert.match(
    branch,
    /stepId: "ia_transfer_info",[\s\S]*?"repeat_transfer"[\s\S]*?"thank_after_transfer"[\s\S]*?"ask_trip"/,
  );
  assert.match(
    branch,
    /stepId: "ia_repeat_transfer_info",[\s\S]*?"repeat_transfer_again"[\s\S]*?"thank_after_transfer_repeat"[\s\S]*?"ask_trip"/,
  );

  const tripNode = hongikSource.match(
    /id: "ia_trip_time",[\s\S]*?id: "ia_repeat_trip_time"/,
  )?.[0];
  const transferNode = hongikSource.match(
    /id: "ia_transfer_info",[\s\S]*?id: "ia_repeat_transfer_info"/,
  )?.[0];
  assert.ok(tripNode);
  assert.ok(transferNode);
  assert.match(tripNode, /약 40분/);
  assert.match(tripNode, /environ 40 minutes/i);
  assert.match(transferNode, /안 갈아타셔도 돼요/);
  assert.match(transferNode, /2호선/);

  for (const video of [
    "ia_trip_time.mp4",
    "ia_repeat_trip_time.mp4",
    "ia_transfer_info.mp4",
    "ia_repeat_transfer_info.mp4",
  ]) {
    assert.ok(
      statSync(
        new URL(`../assets/ai/metro/Hongik-to-Gangnam/${video}`, import.meta.url),
      ).size > 0,
      video,
    );
  }
});

test("le runtime conserve et fige la même vidéo pendant le tour utilisateur", () => {
  const source = readFileSync(
    new URL("../app/lesson/metroIA.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /getScenarioInitialVideoSource/);
  assert.match(source, /player\.pause\(\);\s+player\.currentTime = Math\.max/);
  assert.doesNotMatch(source, /setDisplayedVideoSource\(null\)/);
  assert.doesNotMatch(source, /replaceAsync\(null\)/);
});

test("les vidéos nécessaires à la mission sont présentes", () => {
  for (const relativePath of [
    "../assets/ai/metro/Hongik-to-Gangnam/ia_platform_direction.mp4",
    "../assets/ai/metro/Hongik-to-Gangnam/ia_repeat_platform_direction.mp4",
    "../assets/ai/metro/Hongik-to-Gangnam/ia_end.mp4",
  ]) {
    assert.ok(statSync(new URL(relativePath, import.meta.url)).size > 0);
  }
});

test("le bilan Métro sépare réussite directe, correction, aide et répétition", () => {
  let memory = createMetroConversationMemory();
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "start",
    transcript: "강남 어디예요?",
    result: matchMetroSpeechIntent("강남 어디예요?", [direction]),
  });
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "start",
    transcript: "강남 방향 어디예요?",
    result: matchMetroSpeechIntent("강남 방향 어디예요?", [direction]),
  });
  memory = recordMetroHelpRequest(memory);
  memory = recordMetroAudioReplay(memory);

  const summary = buildMetroConversationSummary(memory);
  assert.equal(summary.speakingTurns, 2);
  assert.equal(summary.understoodWithCorrection, 1);
  assert.equal(summary.errorsCorrected, 1);
  assert.equal(summary.helpRequests, 1);
  assert.equal(summary.audioReplays, 1);
  assert.ok(summary.vocabularyToReview.includes("Direction : 강남 방향"));
  assert.ok(summary.achievements.includes("Demande vers Gangnam comprise"));
  assert.equal(memory.attempts[0].nodeId, "start");
  assert.match(memory.attempts[0].feedback, /Gangnam/i);
});

test("la mémoire et le bilan conservent les catégories du nœud conversationnel courant", () => {
  let memory = createMetroConversationMemory();
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "ask_direction_hongik_ia_platform_direction",
    transcript: "다시 말해",
    result: matchMetroSpeechIntent("다시 말해", [repeat, thanks]),
  });
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "ask_direction_hongik_ia_repeat_platform_direction",
    transcript: "고마워",
    result: matchMetroSpeechIntent("고마워", [repeat, thanks]),
  });

  assert.deepEqual(
    memory.attempts.map(({ nodeId }) => nodeId),
    [
      "ask_direction_hongik_ia_platform_direction",
      "ask_direction_hongik_ia_repeat_platform_direction",
    ],
  );
  assert.deepEqual(
    memory.attempts.map(({ category }) => category),
    ["repeat-informal", "thanks-informal"],
  );

  const summary = buildMetroConversationSummary(memory);
  assert.ok(summary.achievements.includes("Demande de répétition réussie"));
  assert.ok(summary.achievements.includes("Échange terminé naturellement"));
  assert.ok(summary.vocabularyToReview.includes("Politesse : 다시 말해 주세요"));
  assert.ok(
    summary.vocabularyToReview.includes(
      "Avec un inconnu : 감사합니다 / 알겠습니다",
    ),
  );
});

test("le bilan distingue les nouvelles intentions et leurs corrections A1", () => {
  let memory = createMetroConversationMemory();
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "ask_direction_hongik_ia_platform_direction_choices",
    transcript: "몇 분?",
    result: matchMetroSpeechIntent("몇 분?", [duration, transfer, repeat, thanks]),
  });
  memory = recordMetroSpeechAttempt(memory, {
    nodeId: "ask_direction_hongik_ia_trip_time_choices",
    transcript: "환승해야 해요?",
    result: matchMetroSpeechIntent("환승해야 해요?", [transfer, repeat, thanks]),
  });

  assert.deepEqual(
    memory.attempts.map(({ category }) => category),
    ["duration-imperfection", "transfer"],
  );
  assert.deepEqual(
    memory.attempts.map(({ nodeId }) => nodeId),
    [
      "ask_direction_hongik_ia_platform_direction_choices",
      "ask_direction_hongik_ia_trip_time_choices",
    ],
  );

  const summary = buildMetroConversationSummary(memory);
  assert.ok(summary.achievements.includes("Durée du trajet demandée"));
  assert.ok(summary.achievements.includes("Correspondance vérifiée"));
  assert.ok(summary.vocabularyToReview.includes("Durée : 얼마나 걸려요?"));
});
