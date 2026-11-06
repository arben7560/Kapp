import React from "react";

export type VocabularyTextResolver = (sourceText: string) => string;

export const VocabularyTextContext =
  React.createContext<VocabularyTextResolver | null>(null);

export function useVocabularyText(): VocabularyTextResolver {
  const resolver = React.useContext(VocabularyTextContext);
  return resolver ?? ((sourceText) => sourceText);
}
