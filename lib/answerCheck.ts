export function normalize(str: string) {
  return str.toLowerCase().trim().replace(/[?.!]/g, "");
}

export function isCorrect(user: string, correct: string | string[]) {
  const userNorm = normalize(user);

  if (Array.isArray(correct)) {
    return correct.some((c) => normalize(c) === userNorm);
  }

  return normalize(correct) === userNorm;
}
