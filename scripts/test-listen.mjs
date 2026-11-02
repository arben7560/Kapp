import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ACTIVE_LISTEN_EXERCISES,
  EXERCISES_BY_KIND,
  TRAINING_ORDER,
} from "../data/listen/activeExercises.ts";
import { releaseAudioResources } from "../lib/audioPlayerLifecycle.ts";
import {
  createCafeListenProgress,
  recordCafeListenAnswer,
  startCafeListenRemediation,
} from "../lib/cafeListenProgress.ts";
import { shuffleListenChoices } from "../lib/listenExerciseChoices.ts";
import { canValidateListenAnswer } from "../lib/listenValidation.ts";
import {
  getListenTrainingNextAction,
  LISTEN_TRAINING_SUMMARIES,
  recordListenTrainingSuccess,
} from "../lib/listenTrainingCompletion.ts";
import {
  COMPLETION_XP,
  reserveCompletion,
} from "../lib/progressCompletion.ts";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function seededRandom(seed) {
  let state = Math.imul(seed, 2654435761) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function answerCurrent(progress, correct) {
  const exerciseId = progress.queue[progress.questionIndex];
  return recordCafeListenAnswer(progress, exerciseId, correct);
}

test("Café cannot complete the ten questions with a score of zero", () => {
  const ids = Array.from({ length: 10 }, (_, index) => `q${index + 1}`);
  let progress = createCafeListenProgress(ids, () => 0.99);

  for (let index = 0; index < ids.length; index += 1) {
    progress = answerCurrent(progress, false);
  }

  assert.equal(progress.status, "round-summary");
  assert.equal(progress.firstPassScore, 0);
  assert.deepEqual(progress.incorrectIds, ids);
});

test("Café remediation contains only missed questions and repeats until success", () => {
  let progress = createCafeListenProgress(["q1", "q2", "q3"], () => 0.99);
  progress = answerCurrent(progress, false);
  progress = answerCurrent(progress, true);
  progress = answerCurrent(progress, false);

  progress = startCafeListenRemediation(progress, () => 0.99);
  assert.deepEqual(progress.queue, ["q1", "q3"]);
  assert.equal(progress.remediationRound, 1);

  progress = answerCurrent(progress, true);
  progress = answerCurrent(progress, false);
  assert.equal(progress.status, "round-summary");
  assert.deepEqual(progress.incorrectIds, ["q3"]);

  progress = startCafeListenRemediation(progress, () => 0.99);
  assert.deepEqual(progress.queue, ["q3"]);
  progress = answerCurrent(progress, true);

  assert.equal(progress.status, "complete");
  assert.equal(progress.firstPassScore, 1);
  assert.deepEqual(progress.incorrectIds, []);
});

test("progress cannot validate before hydration and reserves 40 XP only once", () => {
  assert.equal(
    canValidateListenAnswer({
      hasAnswer: true,
      hasCompletedRequiredMedia: true,
      isHydrated: false,
      isLocked: false,
    }),
    false,
  );
  assert.equal(reserveCompletion({}, "listen_cafe_session", false), null);

  let completed = {};
  let xp = 0;
  const firstReservation = reserveCompletion(
    completed,
    "listen_cafe_session",
    true,
  );
  assert.ok(firstReservation);
  completed = firstReservation;
  xp += COMPLETION_XP;

  const duplicateReservation = reserveCompletion(
    completed,
    "listen_cafe_session",
    true,
  );
  if (duplicateReservation) xp += COMPLETION_XP;

  assert.equal(duplicateReservation, null);
  assert.equal(xp, 40);
});

test("Listen blocks validation and XP when required audio did not finish", () => {
  assert.equal(
    canValidateListenAnswer({
      hasAnswer: true,
      hasCompletedRequiredMedia: false,
      isHydrated: true,
      isLocked: false,
    }),
    false,
  );
  assert.equal(reserveCompletion({}, "listen_audio_failed", false), null);
});

test("cafe-reaction-01 asks for a command and has no bare ambiguous refusal", () => {
  const exercise = EXERCISES_BY_KIND.reaction.find(
    ({ id }) => id === "cafe-reaction-01",
  );

  assert.ok(exercise);
  assert.equal(
    exercise.audioAsset,
    "assets/audio/listen/mwo-deurilkkayo.mp3",
  );
  assert.match(exercise.instruction, /commande/u);
  assert.ok(!exercise.options.includes("괜찮아요."));
});

test("all 25 active exercises expose coherent answers and audio assets", () => {
  assert.equal(ACTIVE_LISTEN_EXERCISES.length, 25);
  assert.equal(
    new Set(ACTIVE_LISTEN_EXERCISES.map(({ id }) => id)).size,
    ACTIVE_LISTEN_EXERCISES.length,
  );

  for (const exercise of ACTIVE_LISTEN_EXERCISES) {
    assert.ok(exercise.id.trim(), "missing exercise id");
    assert.ok(exercise.audioAsset.trim(), `${exercise.id}: missing audio asset`);
    assert.ok(
      existsSync(resolve(projectRoot, exercise.audioAsset)),
      `${exercise.id}: asset does not exist`,
    );

    if (exercise.kind === "order") {
      assert.deepEqual(
        [...exercise.words].sort(),
        [...exercise.answer].sort(),
        `${exercise.id}: answer words do not match choices`,
      );
    } else if (exercise.kind === "gap") {
      assert.ok(
        exercise.options.includes(exercise.answer),
        `${exercise.id}: answer is absent from choices`,
      );
    } else {
      assert.ok(
        exercise.answer >= 0 && exercise.answer < exercise.options.length,
        `${exercise.id}: answer index is absent from choices`,
      );
    }
  }
});

test("the shared Listen exercise header collapses only in landscape", () => {
  const listenScreen = readFileSync(
    resolve(projectRoot, "app/(tabs)/listen.tsx"),
    "utf8",
  );

  assert.match(listenScreen, /const isLandscape = width > height/u);
  assert.match(listenScreen, /const isShortLandscape = isLandscape && height <= 430/u);
  assert.match(listenScreen, /const landscapeHeaderStyle = useMemo/u);
  assert.match(listenScreen, /if \(!isLandscape\) return undefined/u);
  assert.match(listenScreen, /<Animated\.View style=\{\[styles\.header, landscapeHeaderStyle\]\}>/u);
  assert.match(listenScreen, /<Animated\.ScrollView/u);
  assert.match(listenScreen, /scrollEventThrottle=\{isLandscape \? 16 : undefined\}/u);
  assert.match(listenScreen, /onScroll=\{handleScroll\}/u);
  assert.match(listenScreen, /useNativeDriver: false/u);
});

test("every Listen training completes after five distinct correct answers", () => {
  const order = [2, 0, 4, 1, 3];

  for (const kind of TRAINING_ORDER) {
    const exercises = EXERCISES_BY_KIND[kind];
    assert.equal(exercises.length, 5, kind);
    let completedIds = new Set();

    for (const [index, questionIndex] of order.entries()) {
      const result = recordListenTrainingSuccess(
        kind,
        completedIds,
        exercises[questionIndex].id,
      );
      completedIds = result.ids;
      assert.equal(result.completedCount, index + 1, kind);
      assert.equal(result.justCompletedTraining, index === 4, kind);
    }

    const duplicate = recordListenTrainingSuccess(
      kind,
      completedIds,
      exercises[0].id,
    );
    assert.equal(duplicate.completedCount, 5, kind);
    assert.equal(duplicate.justCompletedTraining, false, kind);

    const foreign = recordListenTrainingSuccess(
      kind,
      completedIds,
      "unknown-question-id",
    );
    assert.equal(foreign.completedCount, 5, kind);
    assert.equal(foreign.justCompletedTraining, false, kind);

    assert.ok(LISTEN_TRAINING_SUMMARIES[kind].achievement.trim());
    assert.ok(LISTEN_TRAINING_SUMMARIES[kind].learning.trim());
  }
});

test("Listen completion modal preserves immersive style and correct next actions", () => {
  const expected = [
    ["dictation", "situation", "Passer à Situation"],
    ["situation", "gap", "Passer à Mot manquant"],
    ["gap", "order", "Passer à Ordre"],
    ["order", "reaction", "Passer à Réaction"],
    ["reaction", "dictation", "Revenir à Orthographe"],
  ];

  for (const [kind, nextKind, label] of expected) {
    assert.deepEqual(getListenTrainingNextAction(kind), { nextKind, label });
  }

  const listenScreen = readFileSync(
    resolve(projectRoot, "app/(tabs)/listen.tsx"),
    "utf8",
  );
  const modal = readFileSync(
    resolve(projectRoot, "components/listen/ListenTrainingCompletionModal.tsx"),
    "utf8",
  );

  assert.match(listenScreen, /<ListenTrainingCompletionModal/u);
  assert.match(listenScreen, /recordListenTrainingSuccess\(/u);
  assert.match(listenScreen, /progress\.justCompletedTraining/u);
  assert.match(listenScreen, /onRestart=\{restartTraining\}/u);
  assert.match(listenScreen, /onNext=\{goToNextExercise\}/u);
  assert.match(listenScreen, /const isTrainingComplete = trainingCorrectCount === exercises\.length/u);
  assert.match(listenScreen, /onPress=\{\s*isLastExercise\s*\? \(\) => setIsTrainingSummaryOpen\(true\)/u);
  assert.match(modal, /Entraînement terminé/u);
  assert.match(modal, /\{summary\.achievement\}/u);
  assert.match(modal, /\{summary\.learning\}/u);
  assert.match(modal, /\{nextAction\.label\}/u);
  assert.match(modal, /Recommencer \{summary\.title\}/u);
});

test("Listen does not validate the daily streak on an incorrect answer", () => {
  const listenScreen = readFileSync(
    resolve(projectRoot, "app/(tabs)/listen.tsx"),
    "utf8",
  );
  const validateStart = listenScreen.indexOf("const handleValidate = () => {");
  const validateEnd = listenScreen.indexOf("const playAudio = () => {", validateStart);
  const validateHandler = listenScreen.slice(validateStart, validateEnd);

  assert.ok(validateStart >= 0 && validateEnd > validateStart);
  assert.match(
    validateHandler,
    /if \(correct\) \{[\s\S]*completeDailyActivity\("listen_exercise"\)/u,
  );
  assert.equal(
    (validateHandler.match(/completeDailyActivity\("listen_exercise"\)/gu) ?? []).length,
    1,
  );
  assert.doesNotMatch(validateHandler, /dailyActivityPromiseRef/u);
});

test("every situation and reaction has a non-empty Korean source text", () => {
  const contextualExercises = [
    ...EXERCISES_BY_KIND.situation,
    ...EXERCISES_BY_KIND.reaction,
  ];

  assert.equal(contextualExercises.length, 10);
  for (const exercise of contextualExercises) {
    assert.ok(exercise.id);
    assert.match(exercise.sourceText, /[\uac00-\ud7a3]/u, exercise.id);
    assert.ok(exercise.options[exercise.answer], exercise.id);
  }
});

test("active Listen shuffling is stable, non-mutating, and keeps answers", () => {
  for (const exercise of ACTIVE_LISTEN_EXERCISES) {
    const snapshot = structuredClone(exercise);
    const first = shuffleListenChoices(exercise, seededRandom(17));
    const second = shuffleListenChoices(exercise, seededRandom(17));

    assert.deepEqual(first, second, `${exercise.id}: unstable shuffle`);
    assert.deepEqual(exercise, snapshot, `${exercise.id}: source mutated`);

    if (
      exercise.kind === "dictation" ||
      exercise.kind === "situation" ||
      exercise.kind === "reaction"
    ) {
      assert.equal(
        first.options[first.answer],
        exercise.options[exercise.answer],
        `${exercise.id}: indexed answer changed`,
      );
    }
  }
});

test("audio resources are released even when listener removal and pause fail", () => {
  const calls = [];
  const listener = {
    remove() {
      calls.push("listener.remove");
      throw new Error("listener already removed");
    },
  };
  const player = {
    pause() {
      calls.push("player.pause");
      throw new Error("native playback failed");
    },
    remove() {
      calls.push("player.remove");
    },
  };

  assert.doesNotThrow(() => releaseAudioResources(player, listener));
  assert.deepEqual(calls, [
    "listener.remove",
    "player.pause",
    "player.remove",
  ]);
});
