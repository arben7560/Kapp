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

// Identité Visuelle Premium
const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.55)";
const ACCENT = "#22D3EE";
const PINK = "#F472B6";
const CARD_BORDER = "rgba(255,255,255,0.12)";

// --- COMPOSANTS UI RÉUTILISABLES ---

const GlassCard = ({ children, style }: any) => (
  <View style={[styles.cardWrapper, style]}>
    <BlurView intensity={25} tint="dark" style={styles.glassContent}>
      <LinearGradient
        colors={["rgba(255,255,255,0.06)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </BlurView>
  </View>
);

const ActionButton = ({ label, onPress, tone = "neon" }: any) => {
  const isNeon = tone === "neon";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        isNeon ? styles.btnNeon : styles.btnGhost,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.btnText, !isNeon && { color: MUTED }]}>{label}</Text>
    </Pressable>
  );
};

export default function BatchimModule() {
  const [rate, setRate] = React.useState(0.85);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const haptic = async () => {
    try {
      await Haptics?.selectionAsync();
    } catch {}
  };

  const speakOne = async (text: string) => {
    await haptic();
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(text, {
      language: "ko-KR",
      rate,
      onDone: () => setIsSpeaking(false),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[BG_DEEP, "#0D0F1A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glows Ambiants */}
      <View
        style={[
          styles.ambientGlow,
          { top: -100, right: -80, backgroundColor: PINK, opacity: 0.08 },
        ]}
      />
      <View
        style={[
          styles.ambientGlow,
          { bottom: 100, left: -100, backgroundColor: ACCENT, opacity: 0.06 },
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
          <Text style={styles.pageTitle}>Batchim &{"\n"}Liaisons</Text>
        </View>

        {/* Audio Settings Card */}
        <GlassCard>
          <View style={styles.cardHeader}>
            <View style={[styles.statusDot, { backgroundColor: ACCENT }]} />
            <Text style={styles.cardHeaderLabel}>RÉGLAGES AUDIO</Text>
          </View>
          <View style={styles.pillsRow}>
            <Pressable
              onPress={() => setRate(rate === 0.85 ? 0.75 : 0.85)}
              style={styles.pill}
            >
              <Text style={styles.pillText}>VITESSE: {rate}</Text>
            </Pressable>
            <Pressable style={styles.pill}>
              <Text style={styles.pillText}>PAUSE: 320ms</Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* Mini-Cours Section */}
        <Text style={styles.subTitle}>Les 7 sons finaux</Text>
        <View style={styles.grid7}>
          {[
            { k: "ㄱ", d: "k coupé" },
            { k: "ㄴ", d: "n" },
            { k: "ㄷ", d: "t coupé" },
            { k: "ㄹ", d: "l" },
            { k: "ㅁ", d: "m" },
            { k: "ㅂ", d: "p coupé" },
            { k: "ㅇ", d: "ng" },
          ].map((item) => (
            <Pressable
              key={item.k}
              onPress={() => speakOne(item.k)}
              style={styles.miniTile}
            >
              <BlurView intensity={10} style={styles.miniTileInner}>
                <Text style={styles.tileChar}>{item.k}</Text>
                <Text style={styles.tileDesc}>{item.d}</Text>
              </BlurView>
            </Pressable>
          ))}
        </View>

        {/* Comparison Exercise */}
        <Text style={styles.subTitle}>Coupure vs Liaison</Text>
        <GlassCard>
          <View style={styles.pairRow}>
            <View>
              <Text style={styles.koreanBig}>
                옷 <Text style={styles.phonetic}>[ot̚]</Text>
              </Text>
              <Text style={styles.pairLabel}>Mot seul</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View>
              <Text style={styles.koreanBig}>
                옷이 <Text style={styles.phonetic}>[o-si]</Text>
              </Text>
              <Text style={styles.pairLabel}>+ Voyelle</Text>
            </View>
          </View>
          <Text style={styles.explanationText}>
            En finale, <Text style={{ color: ACCENT }}>ㅅ</Text> se neutralise
            en "t". S'il est suivi d'une voyelle, il "saute" et redevient "s".
          </Text>
          <View style={styles.btnRow}>
            <ActionButton label="🔊 Seul" onPress={() => speakOne("옷")} />
            <ActionButton label="🔊 Liaison" onPress={() => speakOne("옷이")} />
          </View>
        </GlassCard>

        {/* Footer Stop */}
        <Pressable style={styles.stopBtn} onPress={() => Speech.stop()}>
          <Text style={styles.stopText}>⏹ Stop Audio</Text>
        </Pressable>
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
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 48,
  },

  subTitle: {
    color: TXT,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 32,
    marginBottom: 20,
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
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  cardHeaderLabel: {
    color: MUTED,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },

  // Pills
  pillsRow: { flexDirection: "row", gap: 10 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillText: { color: ACCENT, fontSize: 11, fontWeight: "800" },

  // 7 Finals Grid
  grid7: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  miniTile: {
    width: (width - 68) / 3,
    height: 90,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  miniTileInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  tileChar: { color: TXT, fontSize: 24, fontWeight: "900" },
  tileDesc: { color: MUTED, fontSize: 10, fontWeight: "600", marginTop: 4 },

  // Pair Row
  pairRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  koreanBig: { color: TXT, fontSize: 28, fontWeight: "900" },
  phonetic: { color: ACCENT, fontSize: 16, fontWeight: "400" },
  arrow: { color: MUTED, fontSize: 20 },
  pairLabel: { color: MUTED, fontSize: 11, fontWeight: "700", marginTop: 4 },
  explanationText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Buttons
  btnRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  btnNeon: { backgroundColor: "rgba(34,211,238,0.1)", borderColor: ACCENT },
  btnGhost: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: CARD_BORDER,
  },
  btnText: { color: ACCENT, fontWeight: "800", fontSize: 14 },

  stopBtn: {
    marginTop: 24,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  stopText: { color: PINK, fontWeight: "800" },
});
