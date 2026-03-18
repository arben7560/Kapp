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

console.log("ROOT LISTEN SCREEN");

const BG0 = "#060816";
const BG1 = "#090D1D";
const BG2 = "#0B1123";

const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.78)";
const SOFT = "rgba(255,255,255,0.56)";
const CARD = "rgba(255,255,255,0.065)";
const CARD_SOFT = "rgba(255,255,255,0.042)";
const CARD_DEEP = "#0D1224";
const LINE = "rgba(255,255,255,0.11)";
const LINE_STRONG = "rgba(255,255,255,0.16)";

const CYAN = "#22D3EE";
const CYAN_BG = "rgba(34,211,238,0.13)";
const PURPLE = "#8B5CF6";
const PURPLE_BG = "rgba(139,92,246,0.13)";
const PINK = "#F472B6";
const PINK_BG = "rgba(244,114,182,0.13)";
const TEAL = "#2DD4BF";
const TEAL_BG = "rgba(45,212,191,0.13)";
const ORANGE = "#FB923C";
const ORANGE_BG = "rgba(251,146,60,0.16)";

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
      return { color: PURPLE, bg: PURPLE_BG };
    case "cyan":
      return { color: CYAN, bg: CYAN_BG };
    case "pink":
      return { color: PINK, bg: PINK_BG };
    case "teal":
      return { color: TEAL, bg: TEAL_BG };
    case "orange":
      return { color: ORANGE, bg: ORANGE_BG };
    default:
      return { color: CYAN, bg: CYAN_BG };
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
}: {
  label: string;
  accent?: Accent;
  compact?: boolean;
  korean?: boolean;
}) {
  const { bg } = getAccent(accent);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: compact ? 11 : 13,
        paddingVertical: compact ? 7 : 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.11)",
        backgroundColor: bg,
      }}
    >
      <Text
        style={{
          color: TXT,
          fontSize: compact ? 11.5 : 12.5,
          fontFamily: korean ? fonts.krBold : fonts.extrabold,
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
        opacity: pressed ? 0.92 : 1,
        marginBottom: 8,
      })}
    >
      <Pill label={label} accent={accent} compact />
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
          color: SOFT,
          fontSize: 12,
          fontFamily: fonts.black,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </Text>

      <Text
        style={{
          color: TXT,
          fontSize: 20,
          fontFamily: fonts.black,
          lineHeight: 25,
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            color: MUTED,
            marginTop: 6,
            lineHeight: 20,
            fontSize: 14,
            fontFamily: fonts.medium,
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
            marginTop: 12,
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
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: CARD_DEEP,
        paddingTop: 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -28,
          right: -14,
          width: 104,
          height: 104,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.028)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -28,
          bottom: -38,
          width: 112,
          height: 112,
          borderRadius: 999,
          backgroundColor: "rgba(139,92,246,0.05)",
        }}
      />

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          height: 150,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 184,
            height: 160,
            borderRadius: 999,
            backgroundColor: "rgba(139,92,246,0.05)",
            transform: [
              { translateX: 8 },
              { translateY: -7 },
              { scaleX: 1.08 },
              { scaleY: 0.97 },
            ],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 132,
            height: 122,
            borderRadius: 999,
            backgroundColor: "rgba(34,211,238,0.042)",
            transform: [
              { translateX: -12 },
              { translateY: 11 },
              { scaleX: 0.94 },
              { scaleY: 1.02 },
            ],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 142,
            height: 138,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.02)",
            transform: [
              { translateX: 3 },
              { translateY: -2 },
              { scaleX: 1.03 },
            ],
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 84,
            height: 84,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.075)",
            transform: [{ translateX: 2 }, { translateY: -8 }],
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 210,
            height: 124,
          }}
        >
          {[
            { top: 10, left: 24, size: 2.8, opacity: 0.62 },
            { top: 16, right: 34, size: 2, opacity: 0.42 },
            { top: 26, left: 64, size: 1.4, opacity: 0.2 },
            { top: 34, left: 10, size: 1.8, opacity: 0.34 },
            { top: 40, right: 12, size: 2.8, opacity: 0.5 },
            { top: 50, right: 58, size: 1.3, opacity: 0.2 },
            { top: 60, left: 46, size: 1.8, opacity: 0.38 },
            { top: 72, right: 48, size: 1.9, opacity: 0.3 },
            { top: 84, left: 20, size: 2.6, opacity: 0.36 },
            { top: 90, right: 22, size: 1.8, opacity: 0.26 },
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
            width: 192,
            height: 192,
            marginTop: -6,
            marginRight: 2,
          }}
        />
      </View>

      <View style={{ alignItems: "center", marginTop: -2 }}>
        <Text
          style={{
            color: SOFT,
            fontSize: 11,
            fontFamily: fonts.black,
            letterSpacing: 1.4,
            marginBottom: 6,
            textTransform: "uppercase",
          }}
        >
          K-App
        </Text>

        <Text
          style={{
            color: TXT,
            fontSize: 17,
            fontFamily: fonts.black,
            textAlign: "center",
            lineHeight: 23,
            maxWidth: 250,
          }}
        >
          Apprends le coréen en immersion
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.82)",
            fontSize: 14,
            fontFamily: fonts.medium,
            textAlign: "center",
            lineHeight: 20,
            marginTop: 7,
            maxWidth: 240,
          }}
        >
          Dialogues réels, situations de Séoul.
        </Text>
      </View>

      <View
        style={{
          width: "100%",
          alignItems: "center",
          marginTop: 14,
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
            accent="pink"
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

function ProgressBar({
  value,
  accent = TEAL,
}: {
  value: number;
  accent?: string;
}) {
  return (
    <View
      style={{
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          borderRadius: 999,
          backgroundColor: accent,
        }}
      />
    </View>
  );
}

function DailyProgressCompact() {
  const done = 1;
  const total = 3;

  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: CARD_SOFT,
        padding: 14,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View>
          <Text
            style={{
              color: TXT,
              fontSize: 16,
              fontFamily: fonts.black,
            }}
          >
            Progression du jour
          </Text>

          <Text
            style={{
              color: MUTED,
              fontSize: 13,
              fontFamily: fonts.medium,
              marginTop: 4,
            }}
          >
            1/3 terminé
          </Text>
        </View>

        <Pill label="routine" accent="teal" compact />
      </View>

      <ProgressBar value={(1 / 3) * 100} accent={TEAL} />
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
        opacity: pressed ? 0.92 : 1,
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
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(139,92,246,0.62)",
        backgroundColor: "rgba(139,92,246,0.16)",
        paddingVertical: 13,
        paddingHorizontal: 14,
        opacity: pressed ? 0.94 : 1,
        marginTop: 12,
      })}
    >
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
            fontSize: 14,
            fontFamily: fonts.extrabold,
            marginRight: 8,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: TXT,
            fontSize: 17,
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
  onPress,
  onStartHangul,
  onStartDialogs,
  onStartImmersion,
}: {
  isNewUser: boolean;
  title: string;
  subtitle: string;
  trackLabel?: string;
  onPress: () => void;
  onStartHangul: () => void;
  onStartDialogs: () => void;
  onStartImmersion: () => void;
}) {
  const streak = 4;
  const minutesToday = 7;
  const missionsDone = 1;
  const missionsTotal = 3;
  const progressPercent = (missionsDone / missionsTotal) * 100;

  return (
    <View
      style={{
        borderRadius: 26,
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
          right: -24,
          top: -16,
          width: 110,
          height: 110,
          borderRadius: 999,
          backgroundColor: "rgba(139,92,246,0.08)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -30,
          bottom: -38,
          width: 118,
          height: 118,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.05)",
        }}
      />

      <SectionHeader
        eyebrow="Progression"
        title="Ta session"
        subtitle={
          isNewUser
            ? "Choisis un point de départ pour apprendre le coréen en immersion."
            : "Retrouve ta progression puis reprends exactement là où tu t’étais arrêté."
        }
      />

      {!isNewUser ? (
        <>
          <DailyProgressCompact />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <View style={{ marginRight: 8, marginBottom: 8 }}>
              <Pill label={`🔥 ${streak} jours`} accent="orange" compact />
            </View>
            <View style={{ marginRight: 8, marginBottom: 8 }}>
              <Pill
                label={`${minutesToday} min aujourd’hui`}
                accent="cyan"
                compact
              />
            </View>
            <View style={{ marginBottom: 8 }}>
              <Pill
                label={`${missionsDone}/${missionsTotal} missions`}
                accent="teal"
                compact
              />
            </View>
          </View>

          <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
              borderRadius: 18,
              borderWidth: 1,
              borderColor: LINE,
              backgroundColor: "rgba(255,255,255,0.038)",
              padding: 14,
              opacity: pressed ? 0.96 : 1,
            })}
          >
            <Text
              style={{
                color: SOFT,
                fontSize: 11,
                fontFamily: fonts.black,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Session active
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    color: TXT,
                    fontSize: 18,
                    fontFamily: fonts.black,
                    lineHeight: 24,
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
                  }}
                >
                  {subtitle}
                </Text>
              </View>

              <View
                pointerEvents="none"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: "rgba(139,92,246,0.58)",
                  backgroundColor: "rgba(139,92,246,0.22)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: TXT,
                    fontSize: 18,
                    fontFamily: fonts.black,
                    textAlign: "center",
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
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 13,
                  fontFamily: fonts.extrabold,
                }}
              >
                Reprendre
              </Text>

              <Text
                style={{
                  color: SOFT,
                  fontSize: 12,
                  fontFamily: fonts.extrabold,
                }}
              >
                {missionsDone}/{missionsTotal} missions
              </Text>
            </View>

            <ProgressBar value={progressPercent} accent={ORANGE} />
          </Pressable>

          <PrimaryInlineCTA label="Reprendre ma session" onPress={onPress} />
        </>
      ) : (
        <View
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: LINE,
            backgroundColor: CARD_SOFT,
            padding: 14,
          }}
        >
          <Text
            style={{
              color: SOFT,
              fontSize: 11,
              fontFamily: fonts.black,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Découverte
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  color: TXT,
                  fontSize: 18,
                  fontFamily: fonts.black,
                  lineHeight: 24,
                }}
              >
                Commencer
              </Text>

              <Text
                style={{
                  color: MUTED,
                  fontSize: 14,
                  fontFamily: fonts.medium,
                  marginTop: 6,
                  lineHeight: 19,
                }}
              >
                Choisis ton point de départ et installe ton rythme.
              </Text>
            </View>

            <View
              pointerEvents="none"
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: "rgba(139,92,246,0.58)",
                backgroundColor: "rgba(139,92,246,0.22)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: TXT,
                  fontSize: 18,
                  fontFamily: fonts.black,
                  textAlign: "center",
                  transform: [{ translateY: -1 }],
                }}
              >
                →
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: TXT,
              fontSize: 14,
              fontFamily: fonts.extrabold,
              marginTop: 14,
              marginBottom: 10,
            }}
          >
            Commencer par
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
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
  const { color, bg } = getAccent(accent);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "48.5%",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: LINE_STRONG,
        backgroundColor: "rgba(255,255,255,0.065)",
        padding: 14,
        marginBottom: 12,
        opacity: pressed ? 0.94 : 1,
      })}
    >
      <View
        style={{
          height: 78,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: color,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 999,
            backgroundColor: tint,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 48,
            height: 48,
            borderRadius: 999,
            backgroundColor: `${color}16`,
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
          fontSize: 18,
          fontFamily: fonts.black,
          marginTop: 12,
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
  onDialogs,
  onListen,
  onImmersion,
  onAllModules,
}: {
  onDialogs: () => void;
  onListen: () => void;
  onImmersion: () => void;
  onAllModules: () => void;
}) {
  return (
    <View
      style={{
        borderRadius: 26,
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
          right: -30,
          bottom: -30,
          width: 120,
          height: 120,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.05)",
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
          title="Dialogues"
          subtitle="Phrases utiles pour parler vite."
          accent="pink"
          icon="담"
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
    { label: string; subtitle: string; route: string }
  > = {
    hangul: {
      label: "Hangul",
      subtitle: "Lecture, syllabes et batchim.",
      route: "/hangul",
    },
    vocab: {
      label: "Vocabulaire",
      subtitle: "Mots utiles du quotidien.",
      route: "/places",
    },
    dialogs: {
      label: "Dialogues",
      subtitle: "Phrases utiles pour parler plus vite.",
      route: "/speak",
    },
    listen: {
      label: "Écoute",
      subtitle: "Session audio et coréen naturel.",
      route: "/listen",
    },
    immersion: {
      label: "Immersion Séoul",
      subtitle: "Retourne dans une scène réelle.",
      route: "/immersion",
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
              opacity: pressed ? 0.92 : 1,
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
