export type JapaneseHangulScene = {
  title: string;
  description: string;
  instruction: string;
  cards: Record<string, readonly [label: string, explanation: string]>;
  // Only manually authored questions are listed. The consonant/vowel
  // recognition pairs are constructed from the translated card copy.
  questions?: Record<string, readonly [prompt: string, explanation: string]>;
};
export type JapaneseHangulModule = {
  title: string;
  subtitle: string;
  eyebrow: string;
  nextLabel: string;
  scenes: Record<string, JapaneseHangulScene>;
};
