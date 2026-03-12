import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, View } from "react-native";

const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.68)";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.06)";

const CYAN = "rgba(34,211,238,0.55)";
const CYAN_BG = "rgba(34,211,238,0.12)";
const PURPLE = "rgba(124,58,237,0.55)";
const PURPLE_BG = "rgba(124,58,237,0.12)";
const PINK = "rgba(255,99,132,0.42)";
const PINK_BG = "rgba(255,99,132,0.10)";
const GOLD = "rgba(251,191,36,0.38)";
const GOLD_BG = "rgba(251,191,36,0.10)";

export type ThemeAccent = "cyan" | "purple" | "pink" | "gold" | "neutral";

export type ThemeCardProps = {
  emoji: string;
  title: string;
  desc: string;
  badge: string;
  badgeAccent?: ThemeAccent;
  cta: string;
  ctaAccent?: "cyan" | "purple" | "pink" | "gold";
  microBadges?: string[];
  premium?: boolean;
  locked?: boolean;
  onPress: () => void;
  gradientColors?: [string, string];
};

function Pill({
  label,
  accent = "neutral",
}: {
  label: string;
  accent?: ThemeAccent;
}) {
  const borderColor =
    accent === "cyan"
      ? CYAN
      : accent === "purple"
        ? PURPLE
        : accent === "pink"
          ? PINK
          : accent === "gold"
            ? GOLD
            : "rgba(255,255,255,0.16)";

  const backgroundColor =
    accent === "cyan"
      ? CYAN_BG
      : accent === "purple"
        ? PURPLE_BG
        : accent === "pink"
          ? PINK_BG
          : accent === "gold"
            ? GOLD_BG
            : "rgba(255,255,255,0.05)";

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor,
        backgroundColor,
      }}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}

export default function ThemeCard({
  emoji,
  title,
  desc,
  badge,
  badgeAccent = "neutral",
  cta,
  ctaAccent = "cyan",
  microBadges,
  premium = false,
  locked = false,
  onPress,
  gradientColors = ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.02)"],
}: ThemeCardProps) {
  const ctaBorder =
    ctaAccent === "pink"
      ? PINK
      : ctaAccent === "purple"
        ? PURPLE
        : ctaAccent === "gold"
          ? GOLD
          : CYAN;

  const ctaBg =
    ctaAccent === "pink"
      ? PINK_BG
      : ctaAccent === "purple"
        ? PURPLE_BG
        : ctaAccent === "gold"
          ? GOLD_BG
          : CYAN_BG;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
        backgroundColor: premium ? "rgba(255,255,255,0.075)" : CARD,
        borderColor: premium ? "rgba(255,99,132,0.18)" : LINE,
        borderWidth: 1,
        borderRadius: 24,
        padding: 14,
        marginBottom: 14,
        overflow: "hidden",
      })}
    >
      <LinearGradient
        pointerEvents="none"
        colors={gradientColors}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 110,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: TXT,
              fontSize: 26,
              fontWeight: "900",
              lineHeight: 32,
            }}
          >
            {emoji} {title}
          </Text>

          <Text
            style={{
              color: MUTED,
              marginTop: 6,
              lineHeight: 20,
              fontSize: 14,
            }}
          >
            {desc}
          </Text>
        </View>

        <Pill label={badge} accent={badgeAccent} />
      </View>

      {!!microBadges?.length && (
        <>
          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {microBadges.map((item) => (
              <Pill
                key={item}
                label={item}
                accent={premium ? "pink" : "neutral"}
              />
            ))}
          </View>
        </>
      )}

      <View style={{ height: 14 }} />

      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.94 : 1,
          paddingVertical: 14,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: ctaBorder,
          backgroundColor: ctaBg,
          alignItems: "center",
        })}
      >
        <Text style={{ color: TXT, fontWeight: "900", fontSize: 16 }}>
          {locked ? `🔒 ${cta}` : cta}
        </Text>
      </Pressable>
    </Pressable>
  );
}
