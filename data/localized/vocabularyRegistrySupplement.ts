import type { LocalizedModule } from "./types.ts";
import { vocabularyCopyId } from "./vocabularyRegistry.ts";

const COPY = {
  [vocabularyCopyId("work", "Le message")]: { fr: "Le message", ja: "メッセージ" },
} as const;

function build(locale: "fr" | "ja"): LocalizedModule {
  return Object.fromEntries(
    Object.entries(COPY).map(([id, values]) => [id, { text: values[locale] }]),
  );
}

export const frenchVocabularySupplementContent = build("fr");
export const japaneseVocabularySupplementContent = build("ja");
