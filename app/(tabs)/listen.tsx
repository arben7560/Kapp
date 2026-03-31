import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG0 = "#060816";
const BG1 = "#090D1D";
const BG2 = "#0B1123";

const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.78)";
const SOFT = "rgba(255,255,255,0.56)";
const CARD = "rgba(255,255,255,0.065)";
const CARD_SOFT = "rgba(255,255,255,0.042)";
const LINE = "rgba(255,255,255,0.11)";
const LINE_STRONG = "rgba(255,255,255,0.16)";

const PINK = "#F472B6";
const PINK_BG = "rgba(244,114,182,0.14)";

const CYAN = "#22D3EE";
const CYAN_BG = "rgba(34,211,238,0.12)";

const ORANGE = "#FB923C";
const ORANGE_BG = "rgba(251,146,60,0.12)";

type ListenTheme = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  accentBg: string;
  route:
    | "/listen/CafeListen"
    | "/listen/MetroListen"
    | "/listen/RestaurantListen";
};

const THEMES: ListenTheme[] = [
  {
    id: "cafe",
    title: "Café",
    subtitle: "Commander et payer",
    icon: "☕",
    accent: PINK,
    accentBg: PINK_BG,
    route: "/listen/CafeListen",
  },
  {
    id: "metro",
    title: "Métro",
    subtitle: "Directions et sorties",
    icon: "🚇",
    accent: CYAN,
    accentBg: CYAN_BG,
    route: "/listen/MetroListen",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    subtitle: "Commander et interagir",
    icon: "🍽️",
    accent: ORANGE,
    accentBg: ORANGE_BG,
    route: "/listen/RestaurantListen",
  },
];

function ThemeRow({
  title,
  subtitle,
  icon,
  accent,
  accentBg,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  accentBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.94 : 1,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: LINE,
        backgroundColor: "rgba(255,255,255,0.04)",
        overflow: "hidden",
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: 88,
        }}
      >
        <View
          style={{
            width: 4,
            alignSelf: "stretch",
            backgroundColor: accent,
          }}
        />

        <View
          style={{
            width: 56,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 14,
            marginRight: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: accent,
              backgroundColor: accentBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>{icon}</Text>
          </View>
        </View>

        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            style={{
              color: TXT,
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: MUTED,
              fontSize: 14,
              marginTop: 4,
              lineHeight: 19,
            }}
          >
            {subtitle}
          </Text>
        </View>

        <View style={{ paddingRight: 16 }}>
          <Text
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            ›
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ListenIndexScreen() {
  return (
    <LinearGradient colors={[BG0, BG1, BG2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 8,
            }}
          >
            <View
              style={{
                borderRadius: 30,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: LINE,
                backgroundColor: CARD,
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(24,20,52,0.96)",
                  "rgba(10,18,40,0.94)",
                  "rgba(7,14,28,0.98)",
                ]}
                style={{
                  paddingHorizontal: 18,
                  paddingTop: 18,
                  paddingBottom: 22,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    width: 140,
                    height: 140,
                    borderRadius: 999,
                    backgroundColor: "rgba(244,114,182,0.10)",
                    top: -34,
                    left: -20,
                  }}
                />

                <View
                  style={{
                    position: "absolute",
                    width: 170,
                    height: 170,
                    borderRadius: 999,
                    backgroundColor: "rgba(34,211,238,0.11)",
                    bottom: -58,
                    right: -40,
                  }}
                />

                <View
                  style={{
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <View
                    style={{
                      width: 228,
                      height: 108,
                      borderRadius: 28,
                      borderWidth: 1.5,
                      borderColor: PINK,
                      backgroundColor: "rgba(244,114,182,0.08)",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        position: "absolute",
                        width: 112,
                        height: 112,
                        borderRadius: 999,
                        backgroundColor: "rgba(244,114,182,0.10)",
                      }}
                    />
                    <View
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 999,
                        backgroundColor: "rgba(244,114,182,0.16)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: TXT,
                          fontSize: 28,
                          fontWeight: "700",
                        }}
                      >
                        듣
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={{
                    color: SOFT,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1.6,
                    marginTop: 16,
                    textTransform: "uppercase",
                  }}
                >
                  Écoute réelle
                </Text>

                <Text
                  style={{
                    color: TXT,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: "900",
                    marginTop: 8,
                  }}
                >
                  Écoute
                </Text>

                <Text
                  style={{
                    color: MUTED,
                    textAlign: "center",
                    fontSize: 16,
                    lineHeight: 24,
                    marginTop: 10,
                    paddingHorizontal: 10,
                  }}
                >
                  Entraîne ton oreille avec des scènes concrètes et choisis le
                  thème que tu veux pratiquer.
                </Text>

                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <Pressable
                    onPress={() => router.push("/listen/CafeListen")}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.93 : 1,
                      borderRadius: 16,
                      overflow: "hidden",
                    })}
                  >
                    <LinearGradient
                      colors={["#7C3AED", "#38BDF8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        minWidth: 132,
                        height: 48,
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 18,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 15,
                          fontWeight: "800",
                        }}
                      >
                        ▶ Commencer
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 16,
              marginTop: 14,
            }}
          >
            <View
              style={{
                borderRadius: 28,
                borderWidth: 1,
                borderColor: LINE,
                backgroundColor: CARD_SOFT,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.02)", "rgba(255,255,255,0.01)"]}
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: SOFT,
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                  }}
                >
                  Thèmes
                </Text>

                <Text
                  style={{
                    color: TXT,
                    fontSize: 19,
                    fontWeight: "900",
                    marginTop: 8,
                  }}
                >
                  Choisis un thème
                </Text>

                <Text
                  style={{
                    color: MUTED,
                    fontSize: 15,
                    lineHeight: 22,
                    marginTop: 6,
                    marginBottom: 14,
                  }}
                >
                  Sélectionne directement la scène d’écoute que tu veux
                  travailler.
                </Text>

                <View style={{ gap: 12 }}>
                  {THEMES.map((theme) => (
                    <ThemeRow
                      key={theme.id}
                      title={theme.title}
                      subtitle={theme.subtitle}
                      icon={theme.icon}
                      accent={theme.accent}
                      accentBg={theme.accentBg}
                      onPress={() => router.push(theme.route)}
                    />
                  ))}
                </View>
              </LinearGradient>
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 16,
              marginTop: 14,
            }}
          >
            <View
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: LINE_STRONG,
                backgroundColor: "rgba(255,255,255,0.03)",
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: SOFT,
                  textAlign: "center",
                  lineHeight: 20,
                  fontWeight: "700",
                }}
              >
                Astuce : commence par un thème familier, puis refais la scène
                plusieurs fois pour habituer ton oreille au rythme naturel.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
