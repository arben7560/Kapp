import React from "react";
import { Text, View } from "react-native";

type Props = {
  role: "ai" | "user" | "system";
  text: string;
  subtext?: string;
  badge?: string;
};

export default function ChatBubble({ role, text, subtext, badge }: Props) {
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
          <Text
            style={{
              color: "rgba(255,255,255,0.58)",
              fontSize: 11,
              fontWeight: "800",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {badge}
          </Text>
        )}

        <Text
          style={{
            color: "rgba(255,255,255,0.95)",
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {text}
        </Text>

        {!!subtext && (
          <Text
            style={{
              color: "rgba(255,255,255,0.62)",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 6,
            }}
          >
            {subtext}
          </Text>
        )}
      </View>
    </View>
  );
}
