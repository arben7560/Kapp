import React from "react";
import { ActionButton, type ActionButtonProps } from "../ui/action-button";
import { useVocabularyText } from "../../lib/i18n/VocabularyTextContext";

/** The native Pressable label also needs translation for screen readers. */
export function AccountActionButton(props: ActionButtonProps) {
  const translate = useVocabularyText();
  return (
    <ActionButton
      {...props}
      accessibilityLabel={translate(props.accessibilityLabel ?? props.label)}
    />
  );
}
