import React from "react";
import { View } from "react-native";

import type { AppTextScript } from "../../constants/theme";
import { AppText } from "../app-text";

type Props = {
  role: "ai" | "user" | "system";
  text: string;
  subtext?: string;
  badge?: string;
  script?: AppTextScript;
};

export default function ChatBubble({
  role,
  text,
  subtext,
  badge,
  script = "latin",
}: Props) {
  const isAI = role === "ai";
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <View
      style={{
        alignSelf: isSystem ? "center" : isUser ? "flex-end" : "flex-start",
        maxWidth: isSystem ? "94%" : "84%",
        marginBottom: 10,
      }}
    >
      <View
        style={{
          backgroundColor: isSystem
            ? "rgba(255,255,255,0.05)"
            : isAI
              ? "rgba(255,255,255,0.08)"
              : "rgba(168,85,247,0.20)",
          borderWidth: 1,
          borderColor: isSystem
            ? "rgba(255,255,255,0.07)"
            : isAI
              ? "rgba(255,255,255,0.10)"
              : "rgba(168,85,247,0.36)",
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        {!!badge && (
          <AppText
            variant="label"
            tone="muted"
            style={{
              marginBottom: 6,
            }}
          >
            {badge}
          </AppText>
        )}

        <AppText
          variant="body"
          tone="strong"
          script={script}
          accessibilityLanguage={script === "korean" ? "ko" : undefined}
        >
          {text}
        </AppText>

        {!!subtext && (
          <AppText
            variant="caption"
            tone="muted"
            style={{
              marginTop: 6,
            }}
          >
            {subtext}
          </AppText>
        )}
      </View>
    </View>
  );
}
