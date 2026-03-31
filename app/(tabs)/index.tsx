import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";

const BG0 = "#060816";
const BG1 = "#090D1D";
const BG2 = "#0B1123";

const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.74)";
const SOFT = "rgba(255,255,255,0.54)";
const FAINT = "rgba(255,255,255,0.42)";
const CARD = "rgba(255,255,255,0.065)";
const CARD_SOFT = "rgba(255,255,255,0.042)";
const CARD_DEEP = "#0D1224";
const LINE = "rgba(255,255,255,0.11)";
const LINE_STRONG = "rgba(255,255,255,0.16)";

const CYAN = "#22D3EE";
const CYAN_BG = "rgba(34,211,238,0.13)";
const CYAN_GLOW = "rgba(34,211,238,0.26)";

const PURPLE = "#8B5CF6";
const PURPLE_BG = "rgba(139,92,246,0.13)";
const PURPLE_GLOW = "rgba(139,92,246,0.26)";

const PINK = "#F472B6";
const PINK_BG = "rgba(244,114,182,0.13)";
const PINK_GLOW = "rgba(244,114,182,0.24)";

const TEAL = "#2DD4BF";
const TEAL_BG = "rgba(45,212,191,0.13)";
const TEAL_GLOW = "rgba(45,212,191,0.23)";

const ORANGE = "#FB923C";
const ORANGE_BG = "rgba(251,146,60,0.16)";
const ORANGE_GLOW = "rgba(251,146,60,0.24)";

const LOGO: ImageSourcePropType = require("../../assets/logoKapp.png");

type Accent = "purple" | "cyan" | "pink" | "teal" | "orange";
type TrackKey = "hangul" | "vocab" | "dialogs" | "listen" | "immersion";

const fonts = {
  regular: "Outfit_400Regular",
  medium: "Outfit_500Medium",
  bold: "Outfit_700Bold",
  extrabold: "Outfit_800ExtraBold",
  black: "Outfit_900Black",

  krRegular: "NotoSansKR_400Regular",
  krMedium: "NotoSansKR_500Medium",
  krBold: "NotoSansKR_700Bold",
};

function getAccent(accent: Accent) {
  switch (accent) {
    case "purple":
      return { color: PURPLE, bg: PURPLE_BG, glow: PURPLE_GLOW };
    case "cyan":
      return { color: CYAN, bg: CYAN_BG, glow: CYAN_GLOW };
    case "pink":
      return { color: PINK, bg: PINK_BG, glow: PINK_GLOW };
    case "teal":
      return { color: TEAL, bg: TEAL_BG, glow: TEAL_GLOW };
    case "orange":
      return { color: ORANGE, bg: ORANGE_BG, glow: ORANGE_GLOW };
    default:
      return { color: CYAN, bg: CYAN_BG, glow: CYAN_GLOW };
  }
}

function goToTab(route: string) {
  requestAnimationFrame(() => {
    router.push(route as any);
  });
}

function goToScreen(route: string) {
  requestAnimationFrame(() => {
    router.push(route as any);
  });
}

function Pill({
  label,
  accent = "cyan",
  compact = false,
  korean = false,
  active = true,
}: {
  label: string;
  accent?: Accent;
  compact?: boolean;
  korean?: boolean;
  active?: boolean;
}) {
  const { color, bg, glow } = getAccent(accent);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: compact ? 14 : 16,
        paddingVertical: compact ? 8.5 : 9.5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? `${color}99` : "rgba(255,255,255,0.11)",
        backgroundColor: active ? bg : "rgba(255,255,255,0.04)",
        overflow: "hidden",
        shadowColor: color,
        shadowOpacity: active ? 0.16 : 0,
        shadowRadius: active ? 14 : 0,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: compact ? 48 : 58,
          height: compact ? 48 : 58,
          borderRadius: 999,
          right: -8,
          top: -10,
          backgroundColor: active ? glow : "rgba(255,255,255,0.02)",
          opacity: active ? 0.82 : 0.3,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 8,
          bottom: -18,
          width: compact ? 52 : 64,
          height: compact ? 52 : 64,
          borderRadius: 999,
          backgroundColor: active ? `${color}18` : "rgba(255,255,255,0.015)",
        }}
      />
      <Text
        style={{
          color: TXT,
          fontSize: compact ? 12.5 : 13,
          fontFamily: korean ? fonts.krBold : fonts.extrabold,
          letterSpacing: compact ? 0.2 : 0.25,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function HeroChip({
  label,
  accent,
  onPress,
}: {
  label: string;
  accent: Accent;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.94 : 1,
        marginBottom: 8,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <Pill label={label} accent={accent} compact active />
    </Pressable>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  withDivider = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  withDivider?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: FAINT,
          fontSize: 12,
          fontFamily: fonts.black,
          letterSpacing: 1.8,
          textTransform: "uppercase",
          marginBottom: 7,
        }}
      >
        {eyebrow}
      </Text>

      <Text
        style={{
          color: TXT,
          fontSize: 21,
          fontFamily: fonts.black,
          lineHeight: 27,
          letterSpacing: 0.2,
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            color: MUTED,
            marginTop: 7,
            lineHeight: 22,
            fontSize: 14,
            fontFamily: fonts.medium,
            maxWidth: 315,
          }}
        >
          {subtitle}
        </Text>
      ) : null}

      {withDivider ? (
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
            marginTop: 14,
          }}
        />
      ) : null}
    </View>
  );
}

function HeroCard() {
  return (
    <View
      style={{
        borderRadius: 30,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: CARD_DEEP,
        paddingTop: 18,
        paddingBottom: 24,
        paddingHorizontal: 16,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -44,
          right: -22,
          width: 138,
          height: 138,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.038)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -42,
          bottom: -50,
          width: 132,
          height: 132,
          borderRadius: 999,
          backgroundColor: "rgba(139,92,246,0.065)",
        }}
      />

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: 208,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 280,
            height: 220,
            borderRadius: 999,
            backgroundColor: "rgba(139,92,246,0.050)",
            transform: [
              { translateX: 16 },
              { translateY: -10 },
              { scaleX: 1.14 },
              { scaleY: 0.96 },
            ],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 210,
            height: 178,
            borderRadius: 999,
            backgroundColor: "rgba(34,211,238,0.048)",
            transform: [
              { translateX: -14 },
              { translateY: 12 },
              { scaleX: 0.96 },
              { scaleY: 1.04 },
            ],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 214,
            height: 196,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.022)",
            transform: [{ translateX: 4 }, { translateY: -4 }],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 136,
            height: 136,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.062)",
            transform: [{ translateX: 2 }, { translateY: 2 }],
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 132,
            height: 132,
            borderRadius: 999,
            backgroundColor: "rgba(139,92,246,0.11)",
            shadowColor: PURPLE,
            shadowOpacity: 0.44,
            shadowRadius: 34,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 98,
            height: 98,
            borderRadius: 999,
            backgroundColor: "rgba(34,211,238,0.095)",
            shadowColor: CYAN,
            shadowOpacity: 0.32,
            shadowRadius: 22,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 260,
            height: 146,
          }}
        >
          {[
            { top: 10, left: 26, size: 2.8, opacity: 0.62 },
            { top: 16, right: 36, size: 2, opacity: 0.42 },
            { top: 28, left: 68, size: 1.4, opacity: 0.2 },
            { top: 34, left: 12, size: 1.8, opacity: 0.34 },
            { top: 42, right: 16, size: 2.8, opacity: 0.5 },
            { top: 54, right: 66, size: 1.3, opacity: 0.2 },
            { top: 66, left: 48, size: 1.8, opacity: 0.38 },
            { top: 78, right: 56, size: 1.9, opacity: 0.3 },
            { top: 92, left: 18, size: 2.6, opacity: 0.36 },
            { top: 98, right: 24, size: 1.8, opacity: 0.26 },
          ].map((star, index) => (
            <View
              key={index}
              style={{
                position: "absolute",
                top: star.top as number,
                left: star.left as number | undefined,
                right: star.right as number | undefined,
                width: star.size,
                height: star.size,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.95)",
                opacity: star.opacity,
              }}
            />
          ))}
        </View>

        <Image
          source={LOGO}
          resizeMode="contain"
          style={{
            width: 322,
            height: 322,
            marginTop: 50,
            marginRight: 1,
          }}
        />
      </View>

      <View style={{ alignItems: "center", marginTop: -2 }}>
        <Text
          style={{
            color: FAINT,
            fontSize: 12,
            fontFamily: fonts.black,
            letterSpacing: 2.2,
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          K-App
        </Text>

        <Text
          style={{
            color: TXT,
            fontSize: 19.5,
            fontFamily: fonts.black,
            textAlign: "center",
            lineHeight: 27,
            maxWidth: 286,
            letterSpacing: 0.22,
          }}
        >
          Apprends le coréen en immersion
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: 14.5,
            fontFamily: fonts.medium,
            textAlign: "center",
            lineHeight: 21,
            marginTop: 9,
            maxWidth: 268,
          }}
        >
          Dialogues réels, situations de Séoul.
        </Text>
      </View>

      <View
        style={{
          width: "100%",
          alignItems: "center",
          marginTop: 17,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <HeroChip
            label="café"
            accent="purple"
            onPress={() => goToScreen("/lesson/cafeIA")}
          />
          <HeroChip
            label="métro"
            accent="cyan"
            onPress={() => goToTab("/immersion")}
          />
          <HeroChip
            label="restaurant"
            accent="orange"
            onPress={() => goToTab("/immersion")}
          />
          <HeroChip
            label="shopping"
            accent="teal"
            onPress={() => goToTab("/immersion")}
          />
        </View>
      </View>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  const width = `${Math.max(0, Math.min(100, value))}%`;

  return (
    <View
      style={{
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[ORANGE, PINK, PURPLE]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width,
          height: "100%",
          borderRadius: 999,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: "rgba(255,255,255,0.10)",
        }}
      />
    </View>
  );
}

function StartChoiceChip({
  label,
  accent,
  onPress,
}: {
  label: string;
  accent: Accent;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        marginRight: 8,
        marginBottom: 8,
        opacity: pressed ? 0.94 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <Pill label={label} accent={accent} compact />
    </Pressable>
  );
}

function PrimaryInlineCTA({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(139,92,246,0.56)",
        backgroundColor: "rgba(139,92,246,0.14)",
        paddingVertical: 12.5,
        paddingHorizontal: 14,
        opacity: pressed ? 0.95 : 1,
        marginTop: 10,
        overflow: "hidden",
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -14,
          top: -18,
          width: 84,
          height: 84,
          borderRadius: 999,
          backgroundColor: "rgba(139,92,246,0.14)",
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: TXT,
            fontSize: 15,
            fontFamily: fonts.extrabold,
            marginRight: 8,
            letterSpacing: 0.15,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: TXT,
            fontSize: 18,
            fontFamily: fonts.black,
            marginTop: -1,
          }}
        >
          →
        </Text>
      </View>
    </Pressable>
  );
}

function SessionCard({
  isNewUser,
  title,
  subtitle,
  trackLabel,
  trackAccent = "purple",
  onPress,
  onStartHangul,
  onStartDialogs,
  onStartImmersion,
}: {
  isNewUser: boolean;
  title: string;
  subtitle: string;
  trackLabel?: string;
  trackAccent?: Accent;
  onPress: () => void;
  onStartHangul: () => void;
  onStartDialogs: () => void;
  onStartImmersion: () => void;
}) {
  const minutesToday = 7;
  const missionsDone = 1;
  const missionsTotal = 3;
  const progressPercent = (missionsDone / missionsTotal) * 100;

  const accentMap: Record<Accent, { color: string; glow: string }> = {
    purple: { color: PURPLE, glow: PURPLE_GLOW },
    cyan: { color: CYAN, glow: CYAN_GLOW },
    pink: { color: PINK, glow: PINK_GLOW },
    teal: { color: TEAL, glow: TEAL_GLOW },
    orange: { color: ORANGE, glow: ORANGE_GLOW },
  };

  const accent = accentMap[trackAccent];

  return (
    <View
      style={{
        borderRadius: 28,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: CARD,
        padding: 16,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -40,
          top: -34,
          width: 146,
          height: 146,
          borderRadius: 999,
          backgroundColor: accent.glow,
          opacity: 0.42,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -34,
          bottom: -48,
          width: 128,
          height: 128,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.045)",
        }}
      />

      <Text
        style={{
          color: FAINT,
          fontSize: 12,
          fontFamily: fonts.black,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Progression
      </Text>

      <View
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.07)",
          marginBottom: 16,
        }}
      />

      {!isNewUser ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.035)",
            padding: 16,
            opacity: pressed ? 0.97 : 1,
            overflow: "hidden",
            transform: [{ scale: pressed ? 0.992 : 1 }],
          })}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -18,
              top: -22,
              width: 94,
              height: 94,
              borderRadius: 999,
              backgroundColor: accent.glow,
              opacity: 0.28,
            }}
          />

          <Text
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: 16,
              fontFamily: fonts.bold,
              lineHeight: 20,
              marginBottom: 8,
              letterSpacing: 0.12,
            }}
          >
            Reprendre
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  color: TXT,
                  fontSize: 22,
                  fontFamily: fonts.black,
                  lineHeight: 27,
                  letterSpacing: 0.15,
                }}
              >
                {trackLabel ? trackLabel : title}
              </Text>

              <Text
                style={{
                  color: MUTED,
                  fontSize: 14,
                  fontFamily: fonts.medium,
                  marginTop: 6,
                  lineHeight: 19,
                  maxWidth: 240,
                }}
              >
                {subtitle}
              </Text>
            </View>

            <View
              pointerEvents="none"
              style={{
                width: 60,
                height: 60,
                borderRadius: 19,
                borderWidth: 1,
                borderColor: `${accent.color}88`,
                backgroundColor: `${accent.color}20`,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: accent.color,
                shadowOpacity: 0.28,
                shadowRadius: 16,
              }}
            >
              <Text
                style={{
                  color: TXT,
                  fontSize: 22,
                  fontFamily: fonts.black,
                  transform: [{ translateY: -1 }],
                }}
              >
                →
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.88)",
                fontSize: 13,
                fontFamily: fonts.extrabold,
                letterSpacing: 0.1,
              }}
            >
              {missionsDone}/{missionsTotal} missions
            </Text>

            <Text
              style={{
                color: SOFT,
                fontSize: 13,
                fontFamily: fonts.medium,
              }}
            >
              {minutesToday} min aujourd’hui
            </Text>
          </View>

          <ProgressBar value={progressPercent} />
        </Pressable>
      ) : (
        <View
          style={{
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.035)",
            padding: 16,
            overflow: "hidden",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              right: -18,
              top: -24,
              width: 98,
              height: 98,
              borderRadius: 999,
              backgroundColor: "rgba(139,92,246,0.10)",
            }}
          />

          <Text
            style={{
              color: TXT,
              fontSize: 22,
              fontFamily: fonts.black,
              lineHeight: 27,
              marginBottom: 8,
              letterSpacing: 0.15,
            }}
          >
            Commencer
          </Text>

          <Text
            style={{
              color: MUTED,
              fontSize: 14,
              fontFamily: fonts.medium,
              lineHeight: 20,
              marginBottom: 14,
              maxWidth: 270,
            }}
          >
            Choisis ton point de départ et installe ton rythme.
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <StartChoiceChip
              label="Hangul"
              accent="cyan"
              onPress={onStartHangul}
            />
            <StartChoiceChip
              label="Dialogues"
              accent="pink"
              onPress={onStartDialogs}
            />
            <StartChoiceChip
              label="Immersion"
              accent="purple"
              onPress={onStartImmersion}
            />
          </View>

          <PrimaryInlineCTA label="Commencer maintenant" onPress={onPress} />
        </View>
      )}
    </View>
  );
}

function ModuleTile({
  title,
  subtitle,
  accent = "cyan",
  icon,
  onPress,
  koreanIcon = false,
  tint = "rgba(255,255,255,0.04)",
}: {
  title: string;
  subtitle: string;
  accent?: Accent;
  icon: string;
  onPress: () => void;
  koreanIcon?: boolean;
  tint?: string;
}) {
  const { color, bg, glow } = getAccent(accent);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "48.5%",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: LINE_STRONG,
        backgroundColor: "rgba(255,255,255,0.065)",
        padding: 14,
        marginBottom: 12,
        opacity: pressed ? 0.95 : 1,
        overflow: "hidden",
        transform: [{ scale: pressed ? 0.992 : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -18,
          right: -18,
          width: 94,
          height: 94,
          borderRadius: 999,
          backgroundColor: glow,
          opacity: 0.48,
        }}
      />

      <View
        style={{
          height: 86,
          borderRadius: 19,
          borderWidth: 1,
          borderColor: color,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          shadowColor: color,
          shadowOpacity: 0.22,
          shadowRadius: 16,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 86,
            height: 86,
            borderRadius: 999,
            backgroundColor: tint,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 58,
            height: 58,
            borderRadius: 999,
            backgroundColor: `${color}18`,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -12,
            right: -8,
            width: 46,
            height: 46,
            borderRadius: 999,
            backgroundColor: glow,
            opacity: 0.58,
          }}
        />
        <Text
          style={{
            color: TXT,
            fontSize: 26,
            fontFamily: koreanIcon ? fonts.krBold : fonts.black,
          }}
        >
          {icon}
        </Text>
      </View>

      <Text
        style={{
          color: TXT,
          fontSize: 18.5,
          fontFamily: fonts.black,
          marginTop: 12,
          letterSpacing: 0.15,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: MUTED,
          fontSize: 13,
          fontFamily: fonts.medium,
          lineHeight: 18,
          marginTop: 6,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

function ModulesGridCard({
  onHangul,
  onVocab,
  onDialogs,
  onListen,
  onImmersion,
  onAllModules,
}: {
  onHangul: () => void;
  onVocab: () => void;
  onDialogs: () => void;
  onListen: () => void;
  onImmersion: () => void;
  onAllModules: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: 28,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: CARD,
        padding: 16,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -36,
          bottom: -36,
          width: 140,
          height: 140,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.055)",
        }}
      />

      <SectionHeader
        eyebrow="Modules"
        title="Choisis ton apprentissage"
        subtitle="Retrouve les portes d’entrée essentielles dans une grille simple et rapide."
        withDivider
      />

      <View style={{ height: 4 }} />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <ModuleTile
          title="Hangul"
          subtitle="Lecture, voyelles, consonnes et batchim."
          accent="cyan"
          icon="한"
          koreanIcon
          tint="rgba(34,211,238,0.10)"
          onPress={onHangul}
        />

        <ModuleTile
          title="Vocabulaire"
          subtitle="Mots utiles du quotidien et thèmes pratiques."
          accent="orange"
          icon="어"
          koreanIcon
          tint="rgba(251,146,60,0.10)"
          onPress={onVocab}
        />

        <ModuleTile
          title="Dialogues"
          subtitle="Phrases utiles pour parler vite."
          accent="pink"
          icon="회"
          koreanIcon
          tint="rgba(244,114,182,0.10)"
          onPress={onDialogs}
        />

        <ModuleTile
          title="Écoute"
          subtitle="Session audio quotidienne."
          accent="teal"
          icon="듣"
          koreanIcon
          tint="rgba(45,212,191,0.10)"
          onPress={onListen}
        />

        <ModuleTile
          title="Immersion"
          subtitle="Entre dans des scènes réelles à Séoul."
          accent="purple"
          icon="밤"
          koreanIcon
          tint="rgba(139,92,246,0.11)"
          onPress={onImmersion}
        />

        <ModuleTile
          title="Tous les modules"
          subtitle="Retrouve tout le parcours d’apprentissage."
          accent="cyan"
          icon="문"
          koreanIcon
          tint="rgba(34,211,238,0.10)"
          onPress={onAllModules}
        />
      </View>
    </View>
  );
}

export default function Home() {
  const { progress, setTrack } = useStore();
  const track = progress.learningTrack;

  const trackMap: Record<
    TrackKey,
    { label: string; subtitle: string; route: string; accent: Accent }
  > = {
    hangul: {
      label: "Hangul",
      subtitle: "Lecture, syllabes et batchim.",
      route: "/hangul",
      accent: "cyan",
    },
    vocab: {
      label: "Vocabulaire",
      subtitle: "Mots utiles du quotidien.",
      route: "/voc",
      accent: "orange",
    },
    dialogs: {
      label: "Dialogues",
      subtitle: "Phrases utiles pour parler plus vite.",
      route: "/speak",
      accent: "pink",
    },
    listen: {
      label: "Écoute",
      subtitle: "Session audio et coréen naturel.",
      route: "/listen",
      accent: "teal",
    },
    immersion: {
      label: "Immersion Séoul",
      subtitle: "Retourne dans une scène réelle.",
      route: "/immersion",
      accent: "purple",
    },
  };

  const currentTrack =
    track && trackMap[track as TrackKey] ? trackMap[track as TrackKey] : null;

  const isNewUser = !currentTrack;

  const openTrack = (key: TrackKey) => {
    setTrack(key);
    goToTab(trackMap[key].route);
  };

  const openCurrentTrack = () => {
    if (!currentTrack) return;
    goToTab(currentTrack.route);
  };

  const openStart = () => {
    goToTab("/explore");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG0 }} edges={["top"]}>
      <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -120,
            left: -110,
            width: 220,
            height: 220,
            borderRadius: 999,
            backgroundColor: "rgba(139,92,246,0.10)",
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: -150,
            right: -120,
            width: 260,
            height: 260,
            borderRadius: 999,
            backgroundColor: "rgba(34,211,238,0.10)",
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 120,
          }}
        >
          <HeroCard />

          <View style={{ height: 16 }} />

          <SessionCard
            isNewUser={isNewUser}
            title={currentTrack ? currentTrack.label : "Commencer"}
            trackLabel={currentTrack?.label}
            trackAccent={currentTrack?.accent ?? "purple"}
            subtitle={
              currentTrack?.subtitle ??
              "Choisis un point de départ et installe ton rythme."
            }
            onPress={isNewUser ? openStart : openCurrentTrack}
            onStartHangul={() => openTrack("hangul")}
            onStartDialogs={() => openTrack("dialogs")}
            onStartImmersion={() => openTrack("immersion")}
          />

          <View style={{ height: 16 }} />

          <ModulesGridCard
            onHangul={() => openTrack("hangul")}
            onVocab={() => openTrack("vocab")}
            onDialogs={() => openTrack("dialogs")}
            onListen={() => openTrack("listen")}
            onImmersion={() => openTrack("immersion")}
            onAllModules={() => goToTab("/explore")}
          />

          <Pressable
            onPress={() => goToScreen("/test-audio")}
            style={({ pressed }) => ({
              marginTop: 20,
              alignSelf: "center",
              backgroundColor: "rgba(139,92,246,0.82)",
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              opacity: pressed ? 0.94 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <Text
              style={{
                color: "white",
                fontSize: 14,
                fontFamily: fonts.extrabold,
                letterSpacing: 0.3,
              }}
            >
              🔊 Tester le son (debug)
            </Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
