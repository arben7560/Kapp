import {
  EXERCISES_BY_KIND,
  TRAINING_ORDER,
  type ExerciseKind,
} from "../data/listen/activeExercises";

export type ListenTrainingSummary = Readonly<{
  title: string;
  achievement: string;
  learning: string;
}>;

export const LISTEN_TRAINING_SUMMARIES: Record<
  ExerciseKind,
  ListenTrainingSummary
> = {
  dictation: {
    title: "Orthographe",
    achievement:
      "Tu as reconnu les cinq phrases coréennes de cet entraînement.",
    learning:
      "Identifier des phrases courantes à l'oreille, distinguer des expressions proches et reconnaître leur écriture en hangul.",
  },
  situation: {
    title: "Situation",
    achievement:
      "Tu as compris cinq situations et choisi les réponses adaptées.",
    learning:
      "Comprendre des échanges du quotidien, repérer l'intention de la personne et choisir une réponse logique.",
  },
  gap: {
    title: "Mot manquant",
    achievement:
      "Tu as retrouvé les cinq mots manquants dans les phrases entendues.",
    learning:
      "Isoler un mot précis dans l'audio, reconnaître le vocabulaire utile et compléter une phrase en contexte.",
  },
  order: {
    title: "Ordre",
    achievement:
      "Tu as reconstruit cinq phrases coréennes dans le bon ordre.",
    learning:
      "Reconnaître les groupes de mots entendus et retrouver l'ordre naturel des phrases coréennes.",
  },
  reaction: {
    title: "Réaction",
    achievement:
      "Tu as choisi cinq réactions adaptées aux répliques entendues.",
    learning:
      "Comprendre l'intention d'une réplique et répondre naturellement dans une conversation du quotidien.",
  },
};

export function getListenTrainingNextAction(kind: ExerciseKind): {
  nextKind: ExerciseKind;
  label: string;
} {
  const currentIndex = TRAINING_ORDER.indexOf(kind);
  const nextKind = TRAINING_ORDER[(currentIndex + 1) % TRAINING_ORDER.length];

  return {
    nextKind,
    label:
      currentIndex === TRAINING_ORDER.length - 1
        ? "Revenir à Orthographe"
        : `Passer à ${LISTEN_TRAINING_SUMMARIES[nextKind].title}`,
  };
}

export function recordListenTrainingSuccess(
  kind: ExerciseKind,
  completedIds: ReadonlySet<string>,
  exerciseId: string,
): {
  ids: Set<string>;
  completedCount: number;
  justCompletedTraining: boolean;
} {
  const exercises = EXERCISES_BY_KIND[kind];
  const ids = new Set(completedIds);
  const wasCompleted = ids.has(exerciseId);

  if (exercises.some((exercise) => exercise.id === exerciseId)) {
    ids.add(exerciseId);
  }

  return {
    ids,
    completedCount: ids.size,
    justCompletedTraining:
      !wasCompleted &&
      ids.size === exercises.length &&
      exercises.some((exercise) => exercise.id === exerciseId),
  };
}
