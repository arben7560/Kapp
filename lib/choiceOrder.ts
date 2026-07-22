export type RandomSource = () => number;

/**
 * Returns a new, uniformly shuffled array without mutating the source.
 */
export function shuffleArray<T>(
  items: readonly T[],
  random: RandomSource = Math.random,
): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

/**
 * Shuffles index-based choices while keeping the correct answer attached to
 * its displayed value.
 */
export function shuffleIndexedChoices<T>(
  choices: readonly T[],
  correctIndex: number,
  random: RandomSource = Math.random,
): { choices: T[]; correctIndex: number } {
  const indexedChoices = choices.map((choice, sourceIndex) => ({
    choice,
    isCorrect: sourceIndex === correctIndex,
  }));
  const shuffled = shuffleArray(indexedChoices, random);

  return {
    choices: shuffled.map(({ choice }) => choice),
    correctIndex: shuffled.findIndex(({ isCorrect }) => isCorrect),
  };
}
