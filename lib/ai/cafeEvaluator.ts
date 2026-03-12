import { CafeChoice, CafeStep } from "./cafeScenario";

export type EvalResult = {
  ok: boolean;
  quality: "best" | "ok" | "wrong";
  feedbackFr: string;
  scoreDelta: number;
};

export function evaluateCafeChoice(
  step: CafeStep,
  choice: CafeChoice,
): EvalResult {
  const accepted = step.acceptedChoiceIds.includes(choice.id);

  if (!accepted) {
    return {
      ok: false,
      quality: "wrong",
      feedbackFr:
        "Ce n’est pas la réponse la plus adaptée dans cette situation.",
      scoreDelta: 0,
    };
  }

  if (choice.quality === "best") {
    return {
      ok: true,
      quality: "best",
      feedbackFr: "Très naturel dans un café coréen.",
      scoreDelta: 2,
    };
  }

  return {
    ok: true,
    quality: "ok",
    feedbackFr:
      "C’est correct, même si une réponse sonnait un peu plus naturelle.",
    scoreDelta: 1,
  };
}
