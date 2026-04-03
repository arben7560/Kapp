import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const BG_DEEP = "#020204";
const BG_NAVY = "#0D0F1A";
const TXT = "rgba(255,255,255,0.95)";
const MUTED = "rgba(255,255,255,0.52)";
const FAINT = "rgba(255,255,255,0.40)";
const ACCENT = "#22D3EE";
const PINK = "#F472B6";

const fonts = {
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  medium: "Outfit_500Medium",
  kr: "NotoSansKR_700Bold",
};

const TILE_GAP = 12;
const SIDE_PADDING = 24;
const TILE_SIZE = (width - SIDE_PADDING * 2 - TILE_GAP) / 2;

const VOWELS = [
  { symbol: "ㅏ", roman: "아 • a", sound: "아" },
  { symbol: "ㅑ", roman: "야 • ya", sound: "야" },
  { symbol: "ㅓ", roman: "어 • eo", sound: "어" },
  { symbol: "ㅕ", roman: "여 • yeo", sound: "여" },
  { symbol: "ㅗ", roman: "오 • o", sound: "오" },
  { symbol: "ㅛ", roman: "요 • yo", sound: "요" },
] as const;

export default function HangulVowelsScreen() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Speech.stop();
    };
  }, []);

  const playVowel = async (sound: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    Speech.stop();

    Speech.speak(sound, {
      language: "ko-KR",
      rate: 0.92,
      pitch: 1.0,
      onError: () => {
        // évite tout crash silencieux côté UI
        if (!isMountedRef.current) return;
      },
    });
  };

  const playAllCycle = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    Speech.stop();

    const speakNext = (index: number) => {
      if (!isMountedRef.current || index >= VOWELS.length) return;

      Speech.speak(VOWELS[index].sound, {
        language: "ko-KR",
        rate: 0.92,
        pitch: 1.0,
        onDone: () => {
          setTimeout(() => speakNext(index + 1), 240);
        },
        onStopped: () => {},
        onError: () => {},
      });
    };

    speakNext(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[BG_DEEP, BG_NAVY]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.ambientGlow,
          { top: -72, right: -110, backgroundColor: "rgba(244,114,182,0.11)" },
        ]}
      />
      <View
        style={[
          styles.ambientGlow,
          { bottom: 120, left: -135, backgroundColor: "rgba(34,211,238,0.07)" },
        ]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>

          <Text style={styles.sectionLabel}>HANGUL FOUNDATION</Text>
          <Text style={styles.pageTitle}>Voyelles{"\n"}de base</Text>
        </View>

        {/* Main Card */}
        <View style={styles.cardWrapper}>
          <BlurView intensity={28} tint="dark" style={styles.mainCard}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.065)",
                "rgba(255,255,255,0.018)",
                "rgba(34,211,238,0.03)",
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.cardHeaderRow}>
              <View style={styles.statusDot} />
              <Text style={styles.cardHeaderText}>SOUND TRAINING</Text>
            </View>

            <Text style={styles.cardTitle}>
              Avance voyelle par voyelle pour stabiliser les sons.
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={[ACCENT, "#0891B2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: "35%" }]}
                />
              </View>
              <Text style={styles.progressText}>0/6</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>🎧 Casque conseillé</Text>
              <Text style={styles.infoText}>Mode écoute libre</Text>
            </View>
          </BlurView>
        </View>

        {/* Method Card */}
        <View style={styles.methodCardContainer}>
          <BlurView intensity={18} tint="dark" style={styles.methodCard}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.04)",
                "transparent",
                "rgba(34,211,238,0.025)",
              ]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <Text style={styles.methodTitle}>Méthode recommandée</Text>

            <Text style={styles.methodText}>
              1) Écoute le son.{"\n"}
              2) Répète à voix haute.{"\n"}
              3) Compare les contrastes comme{" "}
              <Text style={styles.methodAccent}>ㅏ / ㅑ</Text>.
            </Text>
          </BlurView>
        </View>

        {/* Grid Section */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Écoute rapide</Text>

          <View style={styles.vowelsGrid}>
            {VOWELS.map((item, index) => (
              <Pressable
                key={index}
                style={styles.vowelTile}
                onPress={() => playVowel(item.sound)}
              >
                <BlurView intensity={22} tint="dark" style={styles.tileBlur}>
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,0.05)",
                      "rgba(255,255,255,0.012)",
                    ]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.vowelSymbol}>{item.symbol}</Text>
                  <Text style={styles.vowelRoman}>{item.roman}</Text>
                </BlurView>
              </Pressable>
            ))}
          </View>

          {/* CTA */}
          <Pressable style={styles.listenAllButton} onPress={playAllCycle}>
            <LinearGradient
              colors={["rgba(34,211,238,0.95)", "rgba(6,182,212,0.86)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.listenAllText}>🔊 Écouter tout le cycle</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  scrollContent: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 10,
    paddingBottom: 72,
  },

  ambientGlow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.5,
  },

  // Header
  header: {
    marginTop: 12,
    marginBottom: 28,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
  },

  backText: {
    color: MUTED,
    fontSize: 15,
    fontFamily: fonts.medium,
  },

  sectionLabel: {
    color: PINK,
    fontSize: 12.5,
    fontFamily: fonts.bold,
    letterSpacing: 3.6,
    marginBottom: 10,
    opacity: 0.96,
  },

  pageTitle: {
    color: TXT,
    fontSize: 46,
    lineHeight: 48,
    fontFamily: fonts.black,
    letterSpacing: -1.8,
  },

  // Main Card
  cardWrapper: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  mainCard: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginRight: 10,
    shadowColor: ACCENT,
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },

  cardHeaderText: {
    color: MUTED,
    fontSize: 11.5,
    fontFamily: fonts.bold,
    letterSpacing: 2.2,
  },

  cardTitle: {
    color: TXT,
    fontSize: 17.5,
    lineHeight: 25,
    marginBottom: 22,
    fontFamily: fonts.medium,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    marginRight: 14,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  progressText: {
    color: MUTED,
    fontSize: 13,
    fontFamily: fonts.medium,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  infoText: {
    color: FAINT,
    fontSize: 12.5,
    fontFamily: fonts.medium,
  },

  // Method Card
  methodCardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    marginBottom: 32,
    backgroundColor: "rgba(255,255,255,0.018)",
  },

  methodCard: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },

  methodTitle: {
    color: TXT,
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 10,
    letterSpacing: -0.2,
  },

  methodText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
  },

  methodAccent: {
    color: ACCENT,
    fontFamily: fonts.bold,
  },

  // Section
  quickSection: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: TXT,
    fontSize: 23,
    fontFamily: fonts.black,
    letterSpacing: -0.8,
    marginBottom: 18,
  },

  vowelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: TILE_GAP,
  },

  vowelTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  tileBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  vowelSymbol: {
    fontSize: 48,
    lineHeight: 52,
    color: TXT,
    fontFamily: fonts.kr,
    marginBottom: 14,
  },

  vowelRoman: {
    color: ACCENT,
    fontSize: 15,
    fontFamily: fonts.bold,
    textAlign: "center",
  },

  // CTA
  listenAllButton: {
    marginTop: 22,
    height: 66,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.34)",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },

  listenAllText: {
    color: "#041018",
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
  },
});
