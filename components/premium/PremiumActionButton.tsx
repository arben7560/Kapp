import React from "react";
import { ActionButton, type ActionButtonProps } from "../ui/action-button";
import { useVocabularyText } from "../../lib/i18n/VocabularyTextContext";

/** Localize both the button copy and its screen-reader accessible name. */
export function PremiumActionButton(props: ActionButtonProps) {
  const translate = useVocabularyText();
  return (
    <ActionButton
      {...props}
      accessibilityLabel={translate(props.accessibilityLabel ?? props.label)}
    />
  );
}
