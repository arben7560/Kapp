import { Pressable, View } from "react-native";

import { AppText } from "../app-text";

export type ChoiceItem = {
  id: string;
  label: string;
  korean?: string;
  correct?: boolean;
};

type Props = {
  choices: ChoiceItem[];
  disabled?: boolean;
  selectedId?: string | null;
  onSelect: (choice: ChoiceItem) => void;
};

export default function ChoiceChips({
  choices,
  disabled = false,
  selectedId = null,
  onSelect,
}: Props) {
  return (
    <View style={{ gap: 10 }}>
      {choices.map((choice) => {
        const selected = selectedId === choice.id;

        return (
          <Pressable
            key={choice.id}
            disabled={disabled}
            onPress={() => onSelect(choice)}
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: selected
                ? "rgba(168,85,247,0.50)"
                : "rgba(255,255,255,0.10)",
              backgroundColor: selected
                ? "rgba(168,85,247,0.18)"
                : "rgba(255,255,255,0.05)",
              paddingHorizontal: 14,
              paddingVertical: 14,
              opacity: disabled && !selected ? 0.65 : 1,
            }}
          >
            <AppText
              variant="bodyStrong"
              tone="strong"
              style={{
                marginBottom: choice.korean ? 4 : 0,
              }}
            >
              {choice.label}
            </AppText>

            {!!choice.korean && (
              <AppText
                variant="bodySecondary"
                tone="muted"
                script="korean"
                accessibilityLanguage="ko"
              >
                {choice.korean}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
