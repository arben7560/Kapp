import type { ListenExercise } from "../data/listen/activeExercises.ts";
import {
  shuffleArray,
  shuffleIndexedChoices,
  type RandomSource,
} from "./choiceOrder.ts";

export function shuffleListenChoices(
  exercise: ListenExercise,
  random: RandomSource = Math.random,
): ListenExercise {
  if (exercise.kind === "order") {
    return { ...exercise, words: shuffleArray(exercise.words, random) };
  }

  if (exercise.kind === "gap") {
    return { ...exercise, options: shuffleArray(exercise.options, random) };
  }

  const shuffled = shuffleIndexedChoices(
    exercise.options,
    exercise.answer,
    random,
  );

  return {
    ...exercise,
    options: shuffled.choices,
    answer: shuffled.correctIndex,
  };
}
