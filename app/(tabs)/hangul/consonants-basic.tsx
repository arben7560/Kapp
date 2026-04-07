import {
  preload,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {}

const { width } = Dimensions.get("window");

const BG_DEEP = "#050508";
const BG_TOP = "#0A0C14";
const TXT = "rgba(255,255,255,0.96)";
const TXT_SOFT = "rgba(255,255,255,0.74)";
const MUTED = "rgba(255,255,255,0.52)";
const ACCENT = "#22D3EE";
const PINK = "#F472B6";
const VIOLET = "#8B5CF6";

const TILE_GAP = 16;
const TILE_SIZE = (width - 48 - TILE_GAP) / 2;

// Audio assets (tes assets existants)
const audioGa = require("../../../assets/audio/hangul/consonants-basic/가.mp3");
const audioNa = require("../../../assets/audio/hangul/consonants-basic/나.mp3");
const audioDa = require("../../../assets/audio/hangul/consonants-basic/다.mp3");
const audioRa = require("../../../assets/audio/hangul/consonants-basic/라.mp3");
const audioMa = require("../../../assets/audio/hangul/consonants-basic/마.mp3");
const audioBa = require("../../../assets/audio/hangul/consonants-basic/바.mp3");
const audioSa = require("../../../assets/audio/hangul/consonants-basic/사.mp3");
const audioA = require("../../../assets/audio/hangul/consonants-basic/아.mp3");
const audioJa = require("../../../assets/audio/hangul/consonants-basic/자.mp3");
const audioHa = require("../../../assets/audio/hangul/consonants-basic/하.mp3");

const audioKa = require("../../../assets/audio/hangul/consonants-basic/카.mp3");
const audioTa = require("../../../assets/audio/hangul/consonants-basic/타.mp3");
const audioPa = require("../../../assets/audio/hangul/consonants-basic/파.mp3");
const audioCha = require("../../../assets/audio/hangul/consonants-basic/차.mp3");

preload(audioGa);
preload(audioNa);
preload(audioDa);
preload(audioRa);
preload(audioMa);
preload(audioBa);
preload(audioSa);
preload(audioA);
preload(audioJa);
preload(audioHa);
preload(audioKa);
preload(audioTa);
preload(audioPa);
preload(audioCha);

const BASE_CONSONANTS = [
  { char: "ㄱ", label: "g / k", syllable: "가", audio: audioGa, tone: "base" },
  { char: "ㄴ", label: "n", syllable: "나", audio: audioNa, tone: "base" },
  { char: "ㄷ", label: "d / t", syllable: "다", audio: audioDa, tone: "base" },
  { char: "ㄹ", label: "r / l", syllable: "라", audio: audioRa, tone: "base" },
  { char: "ㅁ", label: "m", syllable: "마", audio: audioMa, tone: "base" },
  { char: "ㅂ", label: "b / p", syllable: "바", audio: audioBa, tone: "base" },
  { char: "ㅅ", label: "s", syllable: "사", audio: audioSa, tone: "base" },
  { char: "ㅇ", label: "∅ / ng", syllable: "아", audio: audioA, tone: "base" },
  { char: "ㅈ", label: "j", syllable: "자", audio: audioJa, tone: "base" },
  { char: "ㅎ", label: "h", syllable: "하", audio: audioHa, tone: "base" },
] as const;

const ASPIRATED_CONSONANTS = [
  { char: "ㅋ", label: "kʰ", syllable: "카", audio: audioKa, tone: "air" },
  { char: "ㅌ", label: "tʰ", syllable: "타", audio: audioTa, tone: "air" },
  { char: "ㅍ", label: "pʰ", syllable: "파", audio: audioPa, tone: "air" },
  { char: "ㅊ", label: "chʰ", syllable: "차", audio: audioCha, tone: "air" },
] as const;

const ALL_CONSONANTS = [...BASE_CONSONANTS, ...ASPIRATED_CONSONANTS] as const;
type ConsonantItem = (typeof ALL_CONSONANTS)[number];

// ==================== COMPOSANT HERO ====================
function HeroCard({
  featured,
  showLabel,
  rate,
  onToggleLabel,
  onToggleRate,
  onPlay,
  isSpeaking,
}: {
  featured: ConsonantItem;
  showLabel: boolean;
  rate: number;
  onToggleLabel: () => void;
  onToggleRate: () => void;
  onPlay: () => void;
  isSpeaking: boolean;
}) {
  return (
    <View style={styles.heroShell}>
      <BlurView intensity={32} tint="dark" style={styles.heroCard}>
        <LinearGradient
          colors={["rgba(34,211,238,0.18)", "rgba(139,92,246,0.06)"]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.heroTopRow}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE PRONUNCIATION</Text>
          </View>

          <Pressable onPress={onPlay} hitSlop={12}>
            <Text style={styles.heroPlay}>{isSpeaking ? "■" : "▶"}</Text>
          </Pressable>
        </View>

        <View style={styles.heroCenter}>
          <Text style={styles.heroChar}>{featured.char}</Text>
          <Text style={styles.heroSyllable}>{featured.syllable}</Text>
          {showLabel && <Text style={styles.heroLabel}>{featured.label}</Text>}
        </View>

        <View style={styles.heroPillsRow}>
          <Pressable
            style={[styles.pill, showLabel && styles.pillActive]}
            onPress={onToggleLabel}
          >
            <Text style={[styles.pillText, showLabel && styles.pillTextActive]}>
              {showLabel ? "Romanisation ON" : "Romanisation OFF"}
            </Text>
          </Pressable>

          <Pressable style={styles.pill} onPress={onToggleRate}>
            <Text style={styles.pillText}>
              Vitesse {rate === 1 ? "native" : "x0.85"}
            </Text>
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

// ==================== COMPOSANT SECTION ====================
function MinimalSection({
  eyebrow,
  title,
  items,
  activeKey,
  showLabel,
  onPressItem,
}: {
  eyebrow: string;
  title: string;
  items: readonly ConsonantItem[];
  activeKey: string | null;
  showLabel: boolean;
  onPressItem: (item: ConsonantItem) => void;
}) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <ConsonantTile
            key={item.char}
            item={item}
            active={activeKey === item.char}
            showLabel={showLabel}
            onPress={() => onPressItem(item)}
          />
        ))}
      </View>
    </View>
  );
}

// ==================== COMPOSANT TILE ====================
function ConsonantTile({
  item,
  active,
  showLabel,
  onPress,
}: {
  item: ConsonantItem;
  active: boolean;
  showLabel: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tileWrap}>
      <BlurView
        intensity={active ? 65 : 25}
        tint="dark"
        style={styles.tileBlur}
      >
        <LinearGradient
          colors={
            item.tone === "air"
              ? ["rgba(139,92,246,0.18)", "rgba(139,92,246,0.05)"]
              : ["rgba(34,211,238,0.12)", "rgba(244,114,182,0.05)"]
          }
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.tileCenter}>
          <Text style={[styles.tileChar, active && { color: ACCENT }]}>
            {item.char}
          </Text>
          <Text style={styles.tileSyllable}>{item.syllable}</Text>
          {showLabel && <Text style={styles.tileLabel}>{item.label}</Text>}
        </View>
      </BlurView>
    </Pressable>
  );
}

export default function ConsonantsBasic() {
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [showLabel, setShowLabel] = React.useState(true);
  const [rate, setRate] = React.useState(1);

  const cycleQueueRef = React.useRef<ConsonantItem[] | null>(null);
  const cycleIndexRef = React.useRef(0);
  const activeModeRef = React.useRef<"single" | "cycle" | null>(null);

  const player = useAudioPlayer(null, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);

  React.useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    }).catch(() => {});
  }, []);

  const haptic = async () => {
    try {
      await Haptics?.selectionAsync();
    } catch {}
  };

  const stopInternal = React.useCallback(async () => {
    cycleQueueRef.current = null;
    cycleIndexRef.current = 0;
    activeModeRef.current = null;
    setIsSpeaking(false);
    setActiveKey(null);

    try {
      player.pause();
      await player.seekTo(0);
    } catch {}
  }, [player]);

  const playItemInternal = React.useCallback(
    async (item: ConsonantItem) => {
      setActiveKey(item.char);
      setIsSpeaking(true);

      try {
        player.pause();
        player.replace(item.audio);
        player.setPlaybackRate(rate);
        await player.seekTo(0);
        player.play();
      } catch {
        setIsSpeaking(false);
        setActiveKey(null);
      }
    },
    [player, rate],
  );

  React.useEffect(() => {
    if (!status?.isLoaded || !status.didJustFinish) return;

    if (activeModeRef.current === "single") {
      setActiveKey(null);
      setIsSpeaking(false);
      activeModeRef.current = null;
      return;
    }

    if (activeModeRef.current === "cycle" && cycleQueueRef.current) {
      const nextIndex = cycleIndexRef.current + 1;
      if (nextIndex >= cycleQueueRef.current.length) {
        stopInternal();
        return;
      }
      cycleIndexRef.current = nextIndex;
      playItemInternal(cycleQueueRef.current[nextIndex]);
    }
  }, [status?.didJustFinish, status?.isLoaded, playItemInternal, stopInternal]);

  const playConsonant = React.useCallback(
    async (item: ConsonantItem) => {
      await haptic();
      cycleQueueRef.current = null;
      cycleIndexRef.current = 0;
      activeModeRef.current = "single";
      playItemInternal(item);
    },
    [playItemInternal],
  );

  const playCycle = React.useCallback(async () => {
    await haptic();
    cycleQueueRef.current = [...ALL_CONSONANTS];
    cycleIndexRef.current = 0;
    activeModeRef.current = "cycle";
    playItemInternal(ALL_CONSONANTS[0]);
  }, [playItemInternal]);

  const featuredItem =
    ALL_CONSONANTS.find((item) => item.char === activeKey) ??
    BASE_CONSONANTS[0];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[BG_DEEP, BG_TOP]}
        style={StyleSheet.absoluteFillObject}
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
          <Text style={styles.eyebrow}>SÉOUL IMMERSION</Text>
          <Text style={styles.pageTitle}>Consonnes</Text>
        </View>

        {/* Hero Card */}
        <HeroCard
          featured={featuredItem}
          showLabel={showLabel}
          rate={rate}
          onToggleLabel={() => setShowLabel(!showLabel)}
          onToggleRate={() => setRate(rate === 1 ? 0.85 : 1)}
          onPlay={isSpeaking ? stopInternal : playCycle}
          isSpeaking={isSpeaking}
        />

        {/* Sets */}
        <MinimalSection
          eyebrow="SET 01"
          title="Base"
          items={BASE_CONSONANTS}
          activeKey={activeKey}
          showLabel={showLabel}
          onPressItem={playConsonant}
        />

        <MinimalSection
          eyebrow="SET 02"
          title="Aspirées"
          items={ASPIRATED_CONSONANTS}
          activeKey={activeKey}
          showLabel={showLabel}
          onPressItem={playConsonant}
        />

        {/* Bouton principal */}
        <Pressable
          onPress={isSpeaking ? stopInternal : playCycle}
          style={styles.bottomCtaWrap}
        >
          <BlurView intensity={30} tint="dark" style={styles.bottomCta}>
            <Text style={styles.bottomCtaText}>
              {isSpeaking ? "Arrêter l’écoute" : "Écouter tout le set"}
            </Text>
          </BlurView>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DEEP },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
  },

  header: { marginTop: 20, marginBottom: 28 },
  backText: { color: MUTED, fontSize: 16, fontWeight: "600" },
  eyebrow: {
    color: PINK,
    fontSize: 12.5,
    letterSpacing: 4,
    fontWeight: "800",
    marginBottom: 8,
  },
  pageTitle: { color: TXT, fontSize: 42, fontWeight: "900", lineHeight: 46 },

  // Hero Card
  heroShell: {
    marginBottom: 36,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(34,211,238,0.25)",
  },
  heroCard: {
    borderRadius: 32,
    padding: 22,
    overflow: "hidden",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#14D3A6",
  },
  liveText: {
    color: "#aaa",
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 2.5,
  },
  heroPlay: { color: "#fff", fontSize: 22 },

  heroCenter: { alignItems: "center", marginVertical: 12 },
  heroChar: { fontSize: 96, fontWeight: "900", color: TXT, lineHeight: 96 },
  heroSyllable: {
    fontSize: 26,
    fontWeight: "700",
    color: TXT_SOFT,
    marginTop: 4,
  },
  heroLabel: { fontSize: 18, color: TXT_SOFT, marginTop: 8 },

  heroPillsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 12,
  },

  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillActive: { backgroundColor: "rgba(34,211,238,0.18)", borderColor: ACCENT },

  pillText: { color: TXT_SOFT, fontSize: 12, fontWeight: "700" },
  pillTextActive: { color: TXT },

  // Section
  sectionWrap: { marginBottom: 36 },
  sectionEyebrow: {
    color: MUTED,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitle: {
    color: TXT,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: TILE_GAP,
  },

  tileWrap: {
    width: TILE_SIZE,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },

  tileBlur: {
    padding: 16,
    alignItems: "center",
    minHeight: 180,
  },

  tileChar: { fontSize: 64, fontWeight: "900", color: TXT },
  tileSyllable: { fontSize: 20, color: TXT_SOFT, marginTop: 6 },
  tileLabel: { fontSize: 15, color: ACCENT, marginTop: 4 },

  // Bottom CTA
  bottomCtaWrap: { marginTop: 20 },
  bottomCta: {
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.3)",
  },
  bottomCtaText: { color: TXT, fontSize: 17, fontWeight: "800" },
});
