import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.94)";
const MUTED = "rgba(255,255,255,0.66)";
const MUTED_SOFT = "rgba(255,255,255,0.56)";
const LINE = "rgba(255,255,255,0.10)";
const CARD = "rgba(255,255,255,0.06)";
const CARD_SOFT = "rgba(255,255,255,0.035)";
const WHITE_SOFT = "rgba(255,255,255,0.05)";

const CYAN = "rgba(34,211,238,0.60)";
const CYAN_BG = "rgba(34,211,238,0.13)";

const PURPLE = "rgba(124,58,237,0.58)";
const PURPLE_BG = "rgba(124,58,237,0.11)";

const PINK = "rgba(255,99,132,0.44)";
const PINK_BG = "rgba(255,99,132,0.10)";

const GOLD = "rgba(251,191,36,0.40)";
const GOLD_BG = "rgba(251,191,36,0.10)";

const ORANGE = "rgba(251,146,60,0.46)";
const ORANGE_BG = "rgba(251,146,60,0.10)";

type AccessTab = "free" | "premium";
type ThemeTab =
  | "all"
  | "cafe"
  | "metro"
  | "restaurant"
  | "airport"
  | "hotel"
  | "help"
  | "health";

type Accent = "cyan" | "purple" | "pink" | "gold" | "orange" | "neutral";

type ModuleItem = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  shortHint: string;
  access: "free" | "premium";
  theme: ThemeTab;
  accent: Accent;
  badge: string;
  tags: string[];
  learnLabel: string;
  iaLabel?: string;
  learnRoute: string;
  iaRoute?: string;
};

function getAccentColors(accent: Accent) {
  if (accent === "purple") {
    return {
      border: PURPLE,
      bg: PURPLE_BG,
      soft: "rgba(124,58,237,0.08)",
      glow: "rgba(124,58,237,0.14)",
      text: "rgba(216,180,255,0.96)",
    };
  }

  if (accent === "pink") {
    return {
      border: PINK,
      bg: PINK_BG,
      soft: "rgba(255,99,132,0.08)",
      glow: "rgba(255,99,132,0.12)",
      text: "rgba(255,200,215,0.96)",
    };
  }

  if (accent === "gold") {
    return {
      border: GOLD,
      bg: GOLD_BG,
      soft: "rgba(251,191,36,0.08)",
      glow: "rgba(251,191,36,0.12)",
      text: "rgba(255,231,172,0.98)",
    };
  }

  if (accent === "orange") {
    return {
      border: ORANGE,
      bg: ORANGE_BG,
      soft: "rgba(251,146,60,0.08)",
      glow: "rgba(251,146,60,0.12)",
      text: "rgba(255,210,176,0.98)",
    };
  }

  if (accent === "neutral") {
    return {
      border: "rgba(255,255,255,0.16)",
      bg: "rgba(255,255,255,0.05)",
      soft: "rgba(255,255,255,0.04)",
      glow: "rgba(255,255,255,0.06)",
      text: "rgba(255,255,255,0.92)",
    };
  }

  return {
    border: CYAN,
    bg: CYAN_BG,
    soft: "rgba(34,211,238,0.08)",
    glow: "rgba(34,211,238,0.13)",
    text: "rgba(190,246,255,0.98)",
  };
}

function GlassCard({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: compact ? 22 : 26,
        padding: compact ? 13 : 16,
      }}
    >
      {children}
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View
      style={{
        height: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${value}%`,
          height: "100%",
          backgroundColor: "rgba(34,211,238,0.82)",
        }}
      />
    </View>
  );
}

function TopChip({
  label,
  accent = "neutral",
}: {
  label: string;
  accent?: Accent;
}) {
  const colors = getAccentColors(accent);

  return (
    <View
      style={{
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

function FilterPill({
  label,
  active,
  onPress,
  accent = "neutral",
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: Accent;
}) {
  const colors = getAccentColors(accent);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.border : LINE,
        backgroundColor: active ? colors.bg : "rgba(255,255,255,0.04)",
      })}
    >
      <Text
        style={{
          color: TXT,
          fontWeight: "900",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StatStep({
  index,
  label,
  active = false,
}: {
  index: string;
  label: string;
  active?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 88,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: active ? CYAN : LINE,
        backgroundColor: active ? CYAN_BG : CARD_SOFT,
        paddingHorizontal: 12,
        paddingVertical: 11,
      }}
    >
      <Text
        style={{
          color: active ? "rgba(220,251,255,0.96)" : MUTED_SOFT,
          fontWeight: "900",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {index}
      </Text>
      <Text
        style={{
          color: TXT,
          fontWeight: "900",
          fontSize: 14,
          marginTop: 5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SmallBadge({
  label,
  accent = "neutral",
}: {
  label: string;
  accent?: Accent;
}) {
  const colors = getAccentColors(accent);

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <Text
        style={{
          color: TXT,
          fontWeight: "900",
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ModuleTag({ label, accent }: { label: string; accent: Accent }) {
  const colors = getAccentColors(accent);

  return (
    <View
      style={{
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.soft,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontWeight: "800",
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function PrimaryCTA({
  label,
  onPress,
  accent = "cyan",
}: {
  label: string;
  onPress: () => void;
  accent?: Accent;
}) {
  const colors = getAccentColors(accent);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.94 : 1,
        paddingVertical: 13,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        alignItems: "center",
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SecondaryCTA({
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
        opacity: pressed ? 0.94 : 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: PURPLE,
        backgroundColor: "rgba(124,58,237,0.08)",
        paddingVertical: 10,
        alignItems: "center",
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 14 }}>
        {label}
      </Text>
      <Text
        style={{
          color: "rgba(255,255,255,0.54)",
          fontSize: 11,
          marginTop: 3,
          fontWeight: "700",
        }}
      >
        voix • choix • simulation
      </Text>
    </Pressable>
  );
}

function PremiumCTA({
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
        opacity: pressed ? 0.94 : 1,
        paddingVertical: 13,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: GOLD,
        backgroundColor: GOLD_BG,
        alignItems: "center",
      })}
    >
      <Text style={{ color: TXT, fontWeight: "900", fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ModuleCard({ item }: { item: ModuleItem }) {
  const colors = getAccentColors(item.accent);

  return (
    <View
      style={{
        backgroundColor: CARD,
        borderColor: LINE,
        borderWidth: 1,
        borderRadius: 26,
        padding: 15,
        marginBottom: 15,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -28,
          left: -18,
          width: 108,
          height: 108,
          borderRadius: 999,
          backgroundColor: colors.glow,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -52,
          right: -38,
          width: 130,
          height: 130,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.03)",
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
              fontSize: 22,
              fontWeight: "900",
              lineHeight: 28,
            }}
          >
            {item.emoji} {item.title}
          </Text>

          <Text
            style={{
              color: MUTED,
              marginTop: 6,
              lineHeight: 20,
              fontSize: 14,
            }}
          >
            {item.desc}
          </Text>
        </View>

        <SmallBadge
          label={item.badge}
          accent={item.access === "premium" ? "gold" : "neutral"}
        />
      </View>

      <View style={{ height: 11 }} />

      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {item.tags.map((tag) => (
          <ModuleTag
            key={`${item.id}_${tag}`}
            label={tag}
            accent={item.accent}
          />
        ))}
      </View>

      <View style={{ height: 12 }} />

      <View
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.07)",
          backgroundColor: WHITE_SOFT,
          paddingHorizontal: 12,
          paddingVertical: 11,
        }}
      >
        <Text
          style={{
            color: "rgba(255,255,255,0.82)",
            lineHeight: 20,
            fontWeight: "700",
          }}
        >
          {item.shortHint}
        </Text>
      </View>

      <View style={{ height: 12 }} />

      <View style={{ gap: 9 }}>
        {item.access === "premium" ? (
          <PremiumCTA
            label={item.learnLabel}
            onPress={() => router.push(item.learnRoute as any)}
          />
        ) : (
          <PrimaryCTA
            label={item.learnLabel}
            onPress={() => router.push(item.learnRoute as any)}
            accent={item.accent}
          />
        )}

        {!!item.iaRoute && !!item.iaLabel && (
          <SecondaryCTA
            label={item.iaLabel}
            onPress={() => router.push(item.iaRoute as any)}
          />
        )}
      </View>
    </View>
  );
}

export default function SpeakScreen() {
  const [accessTab, setAccessTab] = useState<AccessTab>("free");
  const [themeTab, setThemeTab] = useState<ThemeTab>("all");

  const modules = useMemo<ModuleItem[]>(
    () => [
      {
        id: "cafe",
        emoji: "☕",
        title: "Café — Commander & payer",
        desc: "Commande et paiement dans un café coréen.",
        shortHint: "Commander, préciser sur place / à emporter, puis payer.",
        access: "free",
        theme: "cafe",
        accent: "cyan",
        badge: "Gratuit",
        tags: ["commande", "à emporter", "paiement"],
        learnLabel: "Apprendre les bases",
        iaLabel: "🤖 Pratiquer avec l’IA",
        learnRoute: "/lesson/cafe",
        iaRoute: "/lesson/cafeIA",
      },
      {
        id: "metro",
        emoji: "🚇",
        title: "Métro — Directions & sorties",
        desc: "Se repérer dans le métro de Séoul.",
        shortHint:
          "Demander une ligne, vérifier la direction, trouver la bonne sortie.",
        access: "free",
        theme: "metro",
        accent: "purple",
        badge: "Gratuit",
        tags: ["direction", "correspondance", "sortie"],
        learnLabel: "Apprendre les bases",
        iaLabel: "🤖 Pratiquer avec l’IA",
        learnRoute: "/lesson/metro",
        iaRoute: "/lesson/metroIA",
      },
      {
        id: "restaurant",
        emoji: "🍜",
        title: "Restaurant — Commander un plat",
        desc: "Manger plus naturellement en Corée.",
        shortHint: "Commander, demander non épicé, de l’eau et l’addition.",
        access: "free",
        theme: "restaurant",
        accent: "orange",
        badge: "Gratuit",
        tags: ["plat", "eau", "addition"],
        learnLabel: "Apprendre les bases",
        iaLabel: "🤖 Pratiquer avec l’IA",
        learnRoute: "/lesson/restaurant",
        iaRoute: "/lesson/restaurantIA",
      },
      {
        id: "airport",
        emoji: "✈️",
        title: "Aéroport — Vols & bagages",
        desc: "S’orienter et gérer un imprévu.",
        shortHint: "Check-in, comptoir, porte et bagages.",
        access: "premium",
        theme: "airport",
        accent: "gold",
        badge: "Premium",
        tags: ["check-in", "porte", "bagages"],
        learnLabel: "Débloquer le module",
        learnRoute: "/lesson/airport",
      },
      {
        id: "hotel",
        emoji: "🏨",
        title: "Hôtel — Check-in & services",
        desc: "Gérer l’arrivée et le séjour.",
        shortHint: "Réception, wifi, serviettes et check-out.",
        access: "premium",
        theme: "hotel",
        accent: "pink",
        badge: "Premium",
        tags: ["réception", "wifi", "check-out"],
        learnLabel: "Débloquer le module",
        learnRoute: "/lesson/hotel",
      },
      {
        id: "help",
        emoji: "🧭",
        title: "Aide — Demander un renseignement",
        desc: "Quand tu es perdu ou hésitant.",
        shortHint: "Demander son chemin, faire répéter, mieux comprendre.",
        access: "premium",
        theme: "help",
        accent: "pink",
        badge: "Premium",
        tags: ["chemin", "répéter", "comprendre"],
        learnLabel: "Débloquer le module",
        learnRoute: "/lesson/help",
      },
      {
        id: "health",
        emoji: "🏥",
        title: "Santé — Pharmacie & aide rapide",
        desc: "Réagir vite si tu ne te sens pas bien.",
        shortHint: "Décrire un symptôme simple et demander de l’aide.",
        access: "premium",
        theme: "health",
        accent: "pink",
        badge: "Premium",
        tags: ["symptômes", "pharmacie", "urgence légère"],
        learnLabel: "Débloquer le module",
        learnRoute: "/lesson/health",
      },
    ],
    [],
  );

  const filteredModules = useMemo(() => {
    return modules.filter((item) => {
      const accessMatch =
        accessTab === "free"
          ? item.access === "free"
          : item.access === "premium";

      const themeMatch = themeTab === "all" ? true : item.theme === themeTab;
      return accessMatch && themeMatch;
    });
  }, [accessTab, themeTab, modules]);

  const freeCount = modules.filter((m) => m.access === "free").length;
  const premiumCount = modules.filter((m) => m.access === "premium").length;

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -100,
          left: -70,
          width: 210,
          height: 210,
          borderRadius: 999,
          backgroundColor: "rgba(124,58,237,0.12)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -120,
          right: -80,
          width: 250,
          height: 250,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.08)",
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
        <View
          style={{
            borderRadius: 28,
            padding: 18,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -30,
              right: -18,
              width: 120,
              height: 120,
              borderRadius: 999,
              backgroundColor: "rgba(124,58,237,0.10)",
            }}
          />

          <Text
            style={{
              color: TXT,
              fontSize: 31,
              fontWeight: "900",
              lineHeight: 38,
            }}
          >
            🌍 Dialogues de voyage
          </Text>

          <Text
            style={{
              color: MUTED,
              marginTop: 8,
              lineHeight: 22,
              fontSize: 15,
            }}
          >
            Apprends les bases, puis pratique avec l’IA dans des situations
            réelles.
          </Text>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <TopChip label="Bases utiles" accent="cyan" />
            <TopChip label="Simulations IA" accent="purple" />
            <TopChip label="Voyage réel" accent="gold" />
          </View>

          <View style={{ height: 16 }} />

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <StatStep index="01" label="Bases" active />
            <StatStep index="02" label="IA" />
            <StatStep index="03" label="Révision" />
          </View>

          <View style={{ height: 12 }} />
          <ProgressBar value={45} />
        </View>

        <View style={{ height: 14 }} />

        <GlassCard compact>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
                ✨ Explorer les modules
              </Text>
              <Text style={{ color: MUTED, marginTop: 5, lineHeight: 19 }}>
                Choisis un accès puis un thème.
              </Text>
            </View>

            <SmallBadge
              label={`${filteredModules.length} affiché${filteredModules.length > 1 ? "s" : ""}`}
              accent="neutral"
            />
          </View>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <FilterPill
              label={`Gratuit (${freeCount})`}
              active={accessTab === "free"}
              onPress={() => setAccessTab("free")}
              accent="cyan"
            />
            <FilterPill
              label={`Premium (${premiumCount})`}
              active={accessTab === "premium"}
              onPress={() => setAccessTab("premium")}
              accent="gold"
            />
          </View>

          <View style={{ height: 10 }} />

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <FilterPill
              label="Tous"
              active={themeTab === "all"}
              onPress={() => setThemeTab("all")}
              accent="neutral"
            />
            <FilterPill
              label="Café"
              active={themeTab === "cafe"}
              onPress={() => setThemeTab("cafe")}
              accent="cyan"
            />
            <FilterPill
              label="Métro"
              active={themeTab === "metro"}
              onPress={() => setThemeTab("metro")}
              accent="purple"
            />
            <FilterPill
              label="Restaurant"
              active={themeTab === "restaurant"}
              onPress={() => setThemeTab("restaurant")}
              accent="orange"
            />
            <FilterPill
              label="Aéroport"
              active={themeTab === "airport"}
              onPress={() => setThemeTab("airport")}
              accent="gold"
            />
            <FilterPill
              label="Hôtel"
              active={themeTab === "hotel"}
              onPress={() => setThemeTab("hotel")}
              accent="pink"
            />
            <FilterPill
              label="Aide"
              active={themeTab === "help"}
              onPress={() => setThemeTab("help")}
              accent="pink"
            />
            <FilterPill
              label="Santé"
              active={themeTab === "health"}
              onPress={() => setThemeTab("health")}
              accent="pink"
            />
          </View>
        </GlassCard>

        <View style={{ height: 14 }} />

        {filteredModules.length > 0 ? (
          filteredModules.map((item) => (
            <ModuleCard key={item.id} item={item} />
          ))
        ) : (
          <GlassCard compact>
            <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
              Aucun module affiché
            </Text>
            <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
              Change le filtre pour afficher d’autres situations.
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
