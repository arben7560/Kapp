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

// Haptics
let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {}

const { width } = Dimensions.get("window");

// Identité Visuelle "SÉOUL IMMERSION"
const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.55)";
const ACCENT = "#22D3EE"; // Cyan
const PINK = "#F472B6"; // Rose
const CARD_BORDER = "rgba(255,255,255,0.12)";

type Vowel = "ㅐ" | "ㅔ" | "ㅘ" | "ㅝ" | "ㅚ" | "ㅟ" | "ㅢ";
type Meta = { ex: string; roma: string; build: string; tip?: string };

// --- COMPOSANTS UI PREMIUM ---

function PremiumCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.cardContainer, style]}>
      <BlurView intensity={20} tint="dark" style={styles.blurCard}>
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </BlurView>
    </View>
  );
}

function PillButton({ label, active, onPress, disabled }: any) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function VowelsCompound() {
  const samples = React.useMemo(
    () => ["ㅐ", "ㅔ", "ㅘ", "ㅝ", "ㅚ", "ㅟ", "ㅢ"] as const,
    [],
  );
  const meta = React.useMemo<Record<Vowel, Meta>>(
    () => ({
      ㅐ: { ex: "애", roma: "ae", build: "ㅏ + ㅣ" },
      ㅔ: { ex: "에", roma: "e", build: "ㅓ + ㅣ" },
      ㅘ: { ex: "와", roma: "wa", build: "ㅗ + ㅏ" },
      ㅝ: { ex: "워", roma: "wo", build: "ㅜ + ㅓ" },
      ㅚ: { ex: "외", roma: "oe", build: "ㅗ + ㅣ" },
      ㅟ: { ex: "위", roma: "wi", build: "ㅜ + ㅣ" },
      ㅢ: { ex: "의", roma: "ui", build: "ㅡ + ㅣ" },
    }),
    [],
  );

  const [showRoman, setShowRoman] = React.useState(true);
  const [showBuild, setShowBuild] = React.useState(true);
  const [rate, setRate] = React.useState(0.85);
  const [gapMs, setGapMs] = React.useState(320);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<Vowel | null>(null);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const haptic = async () => {
    try {
      await Haptics?.selectionAsync();
    } catch {}
  };

  const playOne = async (v: Vowel) => {
    await haptic();
    setTouched((p) => ({ ...p, [v]: true }));
    setActiveKey(v);
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(meta[v].ex, {
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

      {/* Glows de fond identiques à Dialogues */}
      <View
        style={[
          styles.ambientGlow,
          { top: -100, left: -50, backgroundColor: ACCENT, opacity: 0.08 },
        ]}
      />
      <View
        style={[
          styles.ambientGlow,
          { bottom: 50, right: -100, backgroundColor: PINK, opacity: 0.06 },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Link href="/hangul" asChild>
            <Pressable hitSlop={20}>
              <Text style={styles.backText}>← Retour</Text>
            </Pressable>
          </Link>
          <Text style={styles.sectionLabel}>HANGUL FOUNDATION</Text>
          <Text style={styles.pageTitle}>Voyelles{"\n"}composées</Text>
        </View>

        {/* Tip Card (Le "💡 À retenir" retravaillé) */}
        <PremiumCard style={{ marginBottom: 30 }}>
          <View style={styles.statusHeader}>
            <View style={[styles.dot, { backgroundColor: PINK }]} />
            <Text style={styles.cardSmallTitle}>FORMATION AUDIO</Text>
          </View>
          <Text style={styles.cardMainText}>
            Les voyelles composées sont la fusion de 2 sons. Écoutez
            attentivement les contrastes subtils.
          </Text>

          <View style={styles.controlsRow}>
            <PillButton
              label={showRoman ? "ROMA: ON" : "ROMA: OFF"}
              active={showRoman}
              onPress={() => {
                haptic();
                setShowRoman(!showRoman);
              }}
            />
            <PillButton
              label={`VITESSE: ${rate}`}
              active
              onPress={() => {
                haptic();
                setRate(rate === 0.85 ? 0.75 : 0.85);
              }}
            />
          </View>
        </PremiumCard>

        {/* Grid des Voyelles */}
        <Text style={styles.subTitle}>Écoute rapide</Text>
        <View style={styles.vowelsGrid}>
          {samples.map((v) => (
            <Pressable
              key={v}
              onPress={() => playOne(v)}
              style={({ pressed }) => [
                styles.vowelTileContainer,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <BlurView
                intensity={activeKey === v ? 60 : 15}
                tint="dark"
                style={[
                  styles.vowelTile,
                  activeKey === v && { borderColor: ACCENT, borderWidth: 1.5 },
                ]}
              >
                <Text
                  style={[
                    styles.vowelSymbol,
                    activeKey === v && { color: ACCENT },
                  ]}
                >
                  {v}
                </Text>
                <Text style={styles.vowelEx}>{meta[v].ex}</Text>
                {showRoman && (
                  <Text style={styles.vowelRoma}>{meta[v].roma}</Text>
                )}
              </BlurView>
            </Pressable>
          ))}
        </View>

        {/* Footer Actions */}
        <Pressable style={styles.mainActionBtn} onPress={() => Speech.stop()}>
          <LinearGradient
            colors={[ACCENT, "#0891B2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.mainActionText}>⏹ Stop Audio</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DEEP },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  ambientGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },

  header: { marginTop: 20, marginBottom: 35 },
  backText: { color: MUTED, fontSize: 15, marginBottom: 20 },
  sectionLabel: {
    color: ACCENT,
    fontSize: 12,
    letterSpacing: 3.5,
    fontWeight: "800",
    marginBottom: 8,
  },
  pageTitle: {
    color: TXT,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 48,
  },

  subTitle: { color: TXT, fontSize: 20, fontWeight: "800", marginBottom: 20 },

  // Cards Glass
  cardContainer: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  blurCard: { padding: 20 },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  cardSmallTitle: {
    color: MUTED,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  cardMainText: { color: TXT, fontSize: 16, lineHeight: 24, marginBottom: 18 },

  // Controls
  controlsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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
  vowelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  vowelTileContainer: { width: (width - 60) / 2, marginBottom: 12 },
  vowelTile: {
    height: 160,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  vowelSymbol: { color: TXT, fontSize: 48, fontWeight: "900" },
  vowelEx: { color: MUTED, fontSize: 14, fontWeight: "700", marginTop: 4 },
  vowelRoma: { color: ACCENT, fontSize: 12, fontWeight: "800", marginTop: 2 },

  // Button
  mainActionBtn: {
    marginTop: 30,
    borderRadius: 20,
    overflow: "hidden",
    height: 60,
  },
  btnGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainActionText: { color: "#000", fontWeight: "900", fontSize: 16 },
});
