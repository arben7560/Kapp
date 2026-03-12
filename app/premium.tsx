import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.64)";
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

type Accent = "cyan" | "purple" | "pink" | "gold" | "neutral";

function Pill({
  label,
  accent = "neutral",
}: {
  label: string;
  accent?: Accent;
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
        paddingVertical: 8,
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

function SectionCard({
  children,
  premium = false,
}: {
  children: React.ReactNode;
  premium?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: premium ? "rgba(255,255,255,0.075)" : CARD,
        borderColor: premium ? "rgba(255,99,132,0.18)" : LINE,
        borderWidth: 1,
        borderRadius: 24,
        padding: 14,
      }}
    >
      {children}
    </View>
  );
}

function ThemeCard({
  emoji,
  title,
  desc,
  badge,
  badgeAccent,
  cta,
  ctaAccent,
  microBadges,
  onPress,
  premium = false,
}: {
  emoji: string;
  title: string;
  desc: string;
  badge: string;
  badgeAccent: Accent;
  cta: string;
  ctaAccent: "cyan" | "pink" | "gold" | "purple";
  microBadges?: string[];
  onPress: () => void;
  premium?: boolean;
}) {
  const ctaBorder =
    ctaAccent === "pink"
      ? PINK
      : ctaAccent === "gold"
        ? GOLD
        : ctaAccent === "purple"
          ? PURPLE
          : CYAN;

  const ctaBg =
    ctaAccent === "pink"
      ? PINK_BG
      : ctaAccent === "gold"
        ? GOLD_BG
        : ctaAccent === "purple"
          ? PURPLE_BG
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
        padding: 16,
        marginBottom: 14,
      })}
    >
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
              fontSize: 27,
              fontWeight: "900",
              lineHeight: 34,
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
          {cta}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function PlacesScreen() {
  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      {/* Glows */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -120,
          left: -90,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: "rgba(124,58,237,0.18)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -150,
          right: -110,
          width: 320,
          height: 320,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.14)",
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }}>
        {/* Header */}
        <Text
          style={{
            color: TXT,
            fontSize: 31,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          Vocabulaire — Thèmes
        </Text>

        <Text
          style={{
            color: MUTED,
            marginTop: 8,
            lineHeight: 22,
            fontSize: 15,
          }}
        >
          Choisis un thème général. Ici :{" "}
          <Text style={{ color: TXT, fontWeight: "900" }}>
            mots + exemples courts
          </Text>
          . Les dialogues et phrases plus longues sont dans{" "}
          <Text style={{ color: TXT, fontWeight: "900" }}>Parler</Text>.
        </Text>

        <View style={{ height: 18 }} />

        {/* Premium banner */}
        <SectionCard premium>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            💎 Premium utile à l’oral
          </Text>

          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Débloque les thèmes plus nuancés et plus “adultes” : personnalité,
            émotions, travail, messages courts…
          </Text>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Pill label="Premium" accent="pink" />
            <Pill label="TTS intégré" accent="purple" />
            <Pill label="Oral naturel" accent="gold" />
          </View>
        </SectionCard>

        <View style={{ height: 20 }} />

        {/* Free section */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            🟢 Essentiels gratuits
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Les grands thèmes concrets du quotidien pour construire ta base
            rapidement.
          </Text>
        </View>

        <ThemeCard
          emoji="🌦️"
          title="Météo"
          desc="Temps, saisons, température, phrases utiles"
          badge="Gratuit"
          badgeAccent="cyan"
          cta="Ouvrir le thème"
          ctaAccent="cyan"
          microBadges={["Quotidien", "Très utile"]}
          onPress={() => router.push("/voc/meteo" as any)}
        />

        <ThemeCard
          emoji="👜"
          title="Objets du quotidien"
          desc="Maison, bureau, sac, tech… (noms essentiels)"
          badge="Gratuit"
          badgeAccent="cyan"
          cta="Ouvrir le thème"
          ctaAccent="cyan"
          microBadges={["Noms essentiels", "Base utile"]}
          onPress={() => router.push("/voc/objets" as any)}
        />

        <ThemeCard
          emoji="✈️"
          title="Voyage"
          desc="Aéroport, hôtel, transports, imprévus"
          badge="Gratuit"
          badgeAccent="cyan"
          cta="Ouvrir le thème"
          ctaAccent="cyan"
          microBadges={["Voyage", "Survie réelle"]}
          onPress={() => router.push("/voc/voyage" as any)}
        />

        <ThemeCard
          emoji="🏢"
          title="Lieux & bâtiments"
          desc="Types de bâtiments, étages, direction"
          badge="Gratuit"
          badgeAccent="cyan"
          cta="Ouvrir le thème"
          ctaAccent="cyan"
          microBadges={["Repères", "Orientation"]}
          onPress={() => router.push("/voc/lieux" as any)}
        />

        <ThemeCard
          emoji="🩺"
          title="Santé & corps humain"
          desc="Parties du corps, symptômes simples, pharmacie"
          badge="Gratuit"
          badgeAccent="cyan"
          cta="Ouvrir le thème"
          ctaAccent="cyan"
          microBadges={["Urgence légère", "Corps"]}
          onPress={() => router.push("/voc/health" as any)}
        />

        <ThemeCard
          emoji="🐾"
          title="Animaux"
          desc="Animaux courants + vocab utile"
          badge="Gratuit"
          badgeAccent="cyan"
          cta="Ouvrir le thème"
          ctaAccent="cyan"
          microBadges={["Courant", "Bonus utile"]}
          onPress={() => router.push("/voc/animaux" as any)}
        />

        <View style={{ height: 8 }} />

        {/* Premium section */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: TXT, fontSize: 22, fontWeight: "900" }}>
            🌟 Expression naturelle Premium
          </Text>
          <Text style={{ color: MUTED, marginTop: 6, lineHeight: 20 }}>
            Les nuances qu’on n’apprend pas toujours dans les bases, mais qui
            changent vraiment ton naturel à l’oral.
          </Text>
        </View>

        <ThemeCard
          emoji="🎭"
          title="Émotions & personnalité"
          desc="Nuances très utiles à l’oral"
          badge="Premium"
          badgeAccent="pink"
          cta="Ouvrir le thème Premium"
          ctaAccent="pink"
          microBadges={["Nuances", "TTS", "Oral naturel"]}
          premium
          onPress={() => router.push("/voc/emotions")}
        />

        <ThemeCard
          emoji="💼"
          title="Travail & emails courts"
          desc="Vocab pro simple + formules"
          badge="Premium"
          badgeAccent="pink"
          cta="Ouvrir le thème Premium"
          ctaAccent="pink"
          microBadges={["Nuances", "TTS", "Oral naturel"]}
          premium
          onPress={() => router.push("/voc/work-email")}
        />

        <View style={{ height: 8 }} />

        {/* Bottom helper */}
        <SectionCard premium>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: "900" }}>
            🔓 Pourquoi ces thèmes sont Premium ?
          </Text>

          <Text style={{ color: MUTED, marginTop: 8, lineHeight: 20 }}>
            Parce qu’ils vont plus loin que le vocabulaire “manuel” : ils
            t’aident à sonner plus naturel, plus nuancé et plus crédible dans la
            vraie vie.
          </Text>

          <View style={{ height: 12 }} />

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Pill label="Nuances réelles" accent="pink" />
            <Pill label="TTS coréen" accent="purple" />
            <Pill label="Parler plus naturellement" accent="gold" />
          </View>
        </SectionCard>
      </ScrollView>
    </LinearGradient>
  );
}
