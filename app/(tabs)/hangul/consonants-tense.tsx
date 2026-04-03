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

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.55)";
const ACCENT = "#22D3EE"; // Cyan
const PINK = "#F472B6"; // Rose
const CARD_BORDER = "rgba(255,255,255,0.12)";

// --- COMPOSANTS UI PREMIUM ---

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

export default function ConsonantsTense() {
  const tense = ["ㄲ", "ㄸ", "ㅃ", "ㅆ", "ㅉ"];
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [rate, setRate] = React.useState(0.85);

  const haptic = async () => {
    try {
      await Haptics?.selectionAsync();
    } catch {}
  };

  const playCompare = async (base: string, tense: string) => {
    await haptic();
    setActiveKey(tense);
    setIsSpeaking(true);
    Speech.stop();
    // Simulation simple de comparaison sonore
    Speech.speak(base + "ㅏ", {
      language: "ko-KR",
      rate,
      onDone: () => {
        setTimeout(
          () =>
            Speech.speak(tense + "ㅏ", {
              language: "ko-KR",
              rate,
              onDone: () => {
                setIsSpeaking(false);
                setActiveKey(null);
              },
            }),
          300,
        );
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[BG_DEEP, "#0D0F1A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glows ambiants identiques à Dialogues */}
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
          <Text style={styles.pageTitle}>Consonnes{"\n"}tendues</Text>
        </View>

        {/* Info Card - Style "Comment apprendre" */}
        <GlassCard>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.statusDot, { backgroundColor: ACCENT }]} />
            <Text style={styles.cardHeaderLabel}>DIDACTIQUE</Text>
          </View>
          <Text style={styles.instructionText}>
            Les consonnes tendues ne sont pas "plus fortes", mais{" "}
            <Text style={{ color: ACCENT }}>sans aspiration</Text> et plus
            sèches.
          </Text>

          <View style={styles.pillsRow}>
            <Pill
              label={`VITESSE: ${rate}`}
              active
              onPress={() => setRate(rate === 0.85 ? 0.75 : 0.85)}
            />
            <Pill label="MODE COMPARAISON" active />
          </View>
        </GlassCard>

        {/* Section Comparaison - La plus importante */}
        <Text style={styles.subTitle}>Exercice de contraste</Text>
        <View style={styles.comparisonGrid}>
          {[
            ["ㄱ", "ㄲ"],
            ["ㄷ", "ㄸ"],
            ["ㅂ", "ㅃ"],
            ["ㅅ", "ㅆ"],
            ["ㅈ", "ㅉ"],
          ].map(([p, t]) => (
            <Pressable
              key={t}
              onPress={() => playCompare(p, t)}
              style={({ pressed }) => [
                styles.compareTile,
                activeKey === t && { borderColor: ACCENT, borderWidth: 1.5 },
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <BlurView
                intensity={activeKey === t ? 40 : 10}
                tint="dark"
                style={styles.tileInner}
              >
                <Text style={styles.tileTextPlain}>{p}</Text>
                <Text style={styles.tileArrow}>↔</Text>
                <Text
                  style={[
                    styles.tileTextTense,
                    activeKey === t && { color: ACCENT },
                  ]}
                >
                  {t}
                </Text>
              </BlurView>
            </Pressable>
          ))}
        </View>

        {/* Action Button */}
        <Pressable style={styles.mainActionBtn} onPress={() => Speech.stop()}>
          <LinearGradient
            colors={[ACCENT, "#0891B2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>🔊 Écouter tout le cycle</Text>
          </LinearGradient>
        </Pressable>

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>ASTUCE</Text>
          <Text style={styles.footerText}>
            Imaginez bloquer votre respiration une fraction de seconde avant de
            relâcher le son.
          </Text>
        </View>
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
    marginBottom: 30,
  },
  glassContent: { padding: 24 },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
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
  pillsRow: { flexDirection: "row", gap: 10 },

  // Tiles
  subTitle: { color: TXT, fontSize: 22, fontWeight: "800", marginBottom: 20 },
  comparisonGrid: { gap: 12 },
  compareTile: {
    height: 90,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tileInner: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  tileTextPlain: { color: MUTED, fontSize: 32, fontWeight: "300" },
  tileArrow: { color: "rgba(255,255,255,0.2)", fontSize: 20 },
  tileTextTense: { color: TXT, fontSize: 42, fontWeight: "900" },

  // Pills
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

  // Main Button
  mainActionBtn: {
    marginTop: 30,
    borderRadius: 24,
    overflow: "hidden",
    height: 64,
  },
  btnGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  btnText: { color: "#000", fontWeight: "900", fontSize: 16 },

  // Footer
  footerInfo: { marginTop: 40, paddingHorizontal: 4 },
  footerLabel: {
    color: PINK,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },
  footerText: { color: MUTED, fontSize: 14, lineHeight: 22 },
});
