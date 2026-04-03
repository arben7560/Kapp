import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {}

const { width } = Dimensions.get("window");

// Identité visuelle "SÉOUL IMMERSION"
const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.55)";
const ACCENT = "#22D3EE"; // Cyan
const PINK = "#F472B6"; // Rose
const CARD_BORDER = "rgba(255,255,255,0.12)";

// --- COMPOSANTS UI RÉUTILISABLES ---

const GlassCard = ({ children, style }: any) => (
  <View style={[styles.cardWrapper, style]}>
    <BlurView intensity={20} tint="dark" style={styles.glassContent}>
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </BlurView>
  </View>
);

const Pill = ({ label, active, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.pill,
      active && styles.pillActive,
      { opacity: pressed ? 0.7 : 1 },
    ]}
  >
    <Text style={[styles.pillText, active && styles.pillTextActive]}>
      {label}
    </Text>
  </Pressable>
);

export default function ConsonantsBasic() {
  const samples = React.useMemo(
    () => ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅎ"] as const,
    [],
  );

  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [showLabel, setShowLabel] = React.useState(true);
  const [rate, setRate] = React.useState(0.85);

  const haptic = async () => {
    try {
      await Haptics?.selectionAsync();
    } catch {}
  };

  const playConsonant = async (c: string) => {
    await haptic();
    setActiveKey(c);
    setIsSpeaking(true);
    Speech.stop();
    Speech.speak(c === "ㅇ" ? "아" : c + "ㅏ", {
      language: "ko-KR",
      rate,
      onDone: () => {
        setIsSpeaking(false);
        setActiveKey(null);
      },
      onStopped: () => {
        setIsSpeaking(false);
        setActiveKey(null);
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[BG_DEEP, "#0D0F1A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glows ambiants pour la profondeur */}
      <View
        style={[
          styles.ambientGlow,
          { top: -50, right: -100, backgroundColor: PINK, opacity: 0.08 },
        ]}
      />
      <View
        style={[
          styles.ambientGlow,
          { bottom: 100, left: -120, backgroundColor: ACCENT, opacity: 0.06 },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Link href="/hangul" asChild>
            <Pressable hitSlop={20}>
              <Text style={styles.backText}>← Retour</Text>
            </Pressable>
          </Link>
          <Text style={styles.sectionLabel}>HANGUL FOUNDATION</Text>
          <Text style={styles.pageTitle}>Consonnes{"\n"}de base</Text>
        </View>

        {/* Info Card */}
        <GlassCard>
          <View style={styles.cardHeader}>
            <View style={[styles.statusDot, { backgroundColor: ACCENT }]} />
            <Text style={styles.cardHeaderLabel}>SOUND TRAINING</Text>
          </View>
          <Text style={styles.instructionText}>
            Entraînez votre oreille à reconnaître les catégories de sons plutôt
            que des équivalents parfaits.
          </Text>

          <View style={styles.pillsRow}>
            <Pill
              label={showLabel ? "LABEL: ON" : "LABEL: OFF"}
              active={showLabel}
              onPress={() => {
                haptic();
                setShowLabel(!showLabel);
              }}
            />
            <Pill
              label={`VITESSE: ${rate}`}
              active
              onPress={() => {
                haptic();
                setRate(rate === 0.85 ? 0.75 : 0.85);
              }}
            />
          </View>
        </GlassCard>

        {/* Grille */}
        <Text style={styles.gridTitle}>Écoute rapide</Text>
        <View style={styles.grid}>
          {samples.map((c) => (
            <Pressable
              key={c}
              onPress={() => playConsonant(c)}
              style={({ pressed }) => [
                styles.tileWrapper,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <BlurView
                intensity={activeKey === c ? 60 : 15}
                tint="dark"
                style={[
                  styles.tile,
                  activeKey === c && { borderColor: ACCENT, borderWidth: 1.5 },
                ]}
              >
                <Text
                  style={[
                    styles.tileChar,
                    activeKey === c && { color: ACCENT },
                  ]}
                >
                  {c}
                </Text>
                {showLabel && (
                  <Text style={styles.tileLabel}>
                    {c === "ㅇ" ? "∅ / ng" : "g/k"}
                  </Text>
                )}
              </BlurView>
            </Pressable>
          ))}
        </View>

        {/* Action Button */}
        <Pressable style={styles.mainBtn} onPress={() => Speech.stop()}>
          <LinearGradient
            colors={[ACCENT, "#0891B2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>🔊 Écouter tout le cycle</Text>
          </LinearGradient>
        </Pressable>

        {/* Tip Card */}
        <GlassCard style={{ marginTop: 24 }}>
          <Text style={styles.tipTitle}>⚡ Conseil rapide</Text>
          <Text style={styles.tipText}>
            La consonne{" "}
            <Text style={{ color: ACCENT, fontWeight: "900" }}>ㅇ</Text> est
            totalement silencieuse lorsqu'elle est placée au début d'une
            syllabe.
          </Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DEEP },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60 },
  ambientGlow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
  },

  header: { marginTop: 20, marginBottom: 40 },
  backText: { color: MUTED, fontSize: 15, marginBottom: 20 },
  sectionLabel: {
    color: PINK,
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "800",
    marginBottom: 8,
  },
  pageTitle: {
    color: TXT,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 52,
  },

  // Glass Cards
  cardWrapper: {
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    marginBottom: 16,
  },
  glassContent: { padding: 24 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  cardHeaderLabel: {
    color: MUTED,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  instructionText: {
    color: TXT,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 20,
    fontWeight: "500",
  },

  // Pills
  pillsRow: { flexDirection: "row", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillActive: { backgroundColor: "rgba(34,211,238,0.15)", borderColor: ACCENT },
  pillText: { color: MUTED, fontSize: 11, fontWeight: "800" },
  pillTextActive: { color: ACCENT },

  // Grid
  gridTitle: {
    color: TXT,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tileWrapper: { width: (width - 60) / 2, marginBottom: 12 },
  tile: {
    height: 130,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tileChar: { color: TXT, fontSize: 42, fontWeight: "900" },
  tileLabel: { color: MUTED, fontSize: 13, fontWeight: "700", marginTop: 4 },

  // Buttons
  mainBtn: { marginTop: 20, borderRadius: 24, overflow: "hidden", height: 64 },
  btnGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  btnText: { color: "#000", fontWeight: "900", fontSize: 16 },

  // Tips
  tipTitle: { color: TXT, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  tipText: { color: MUTED, fontSize: 14, lineHeight: 22 },
});
