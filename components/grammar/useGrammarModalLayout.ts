import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { getGrammarModalLayout } from "./grammar-modal-layout";

export function useGrammarModalLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => getGrammarModalLayout(width, height),
    [height, width],
  );
}
