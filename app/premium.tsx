import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <View style={[styles.pill, { borderColor, backgroundColor }]}>
      <Text style={styles.pillLabel}>{label}</Text>
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
    <View style={[styles.sectionCard, premium && styles.sectionCardPremium]}>
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
      style={({ pressed }) => [
        styles.themeCard,
        premium && styles.themeCardPremium,
        {
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
      ]}
    >
      <View style={styles.themeCardTop}>
        <View style={styles.themeCardText}>
          <Text style={styles.themeCardTitle}>
            {emoji} {title}
          </Text>
          <Text style={styles.themeCardDesc}>{desc}</Text>
        </View>
        <Pill label={badge} accent={badgeAccent} />
      </View>

      {!!microBadges?.length && (
        <View style={styles.microBadgeRow}>
          {microBadges.map((item) => (
            <Pill
              key={item}
              label={item}
              accent={premium ? "pink" : "neutral"}
            />
          ))}
        </View>
      )}

      <View style={styles.spacerSmall} />

      <View
        style={[
          styles.ctaButton,
          { borderColor: ctaBorder, backgroundColor: ctaBg },
        ]}
      >
        <Text style={styles.ctaLabel}>{cta}</Text>
      </View>
    </Pressable>
  );
}

export default function PlacesScreen() {
  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View pointerEvents="none" style={styles.glow} />
        <View pointerEvents="none" style={styles.glowAlt} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.pageTitle}>Vocabulaire — Thèmes</Text>

          <Text style={styles.pageSubtitle}>
            Choisis un thème général. Ici :{" "}
            <Text style={styles.boldText}>mots + exemples courts</Text>. Les
            dialogues et phrases plus longues sont dans{" "}
            <Text style={styles.boldText}>Parler</Text>.
          </Text>

          <View style={styles.spacerMedium} />

          <SectionCard premium>
            <Text style={styles.sectionTitle}>💎 Premium utile à l’oral</Text>
            <Text style={styles.sectionDescription}>
              Débloque les thèmes plus nuancés et plus “adultes” : personnalité,
              émotions, travail, messages courts…
            </Text>
            <View style={styles.spacerSmall} />
            <View style={styles.badgeRow}>
              <Pill label="Premium" accent="pink" />
              <Pill label="TTS intégré" accent="purple" />
              <Pill label="Oral naturel" accent="gold" />
            </View>
          </SectionCard>

          <View style={styles.spacerLarge} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>🟢 Essentiels gratuits</Text>
            <Text style={styles.sectionDescription}>
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

          <View style={styles.spacerSmall} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>
              🌟 Expression naturelle Premium
            </Text>
            <Text style={styles.sectionDescription}>
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

          <View style={styles.spacerMedium} />

          <SectionCard premium>
            <Text style={styles.sectionTitle}>
              🔓 Pourquoi ces thèmes sont Premium ?
            </Text>
            <Text style={styles.sectionDescription}>
              Parce qu’ils vont plus loin que le vocabulaire “manuel” : ils
              t’aident à sonner plus naturel, plus nuancé et plus crédible dans
              la vraie vie.
            </Text>
            <View style={styles.spacerSmall} />
            <View style={styles.badgeRow}>
              <Pill label="Nuances réelles" accent="pink" />
              <Pill label="TTS coréen" accent="purple" />
              <Pill label="Parler plus naturellement" accent="gold" />
            </View>
          </SectionCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 130 },
  glow: {
    position: "absolute",
    top: -120,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.18)",
  },
  glowAlt: {
    position: "absolute",
    bottom: -150,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.14)",
  },
  pageTitle: {
    color: TXT,
    fontSize: 31,
    fontWeight: "900",
    marginTop: 8,
  },
  pageSubtitle: {
    color: MUTED,
    marginTop: 8,
    lineHeight: 22,
    fontSize: 15,
  },
  boldText: {
    color: TXT,
    fontWeight: "900",
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeading: {
    color: TXT,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
  },
  sectionTitle: {
    color: TXT,
    fontSize: 22,
    fontWeight: "900",
  },
  sectionDescription: {
    color: MUTED,
    lineHeight: 20,
    marginTop: 6,
  },
  sectionCard: {
    backgroundColor: CARD,
    borderColor: LINE,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
  },
  sectionCardPremium: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,99,132,0.18)",
  },
  themeCard: {
    backgroundColor: CARD,
    borderColor: LINE,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  themeCardPremium: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderColor: "rgba(255,99,132,0.18)",
  },
  themeCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  themeCardText: { flex: 1 },
  themeCardTitle: {
    color: TXT,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
  },
  themeCardDesc: {
    color: MUTED,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillLabel: {
    color: TXT,
    fontWeight: "900",
    fontSize: 12,
  },
  microBadgeRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  ctaLabel: {
    color: TXT,
    fontWeight: "900",
    fontSize: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  spacerSmall: { height: 12 },
  spacerMedium: { height: 18 },
  spacerLarge: { height: 20 },
});
