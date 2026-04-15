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
const BG_TOP = "#0A0D16";
const TXT = "rgba(255,255,255,0.96)";
const TXT_SOFT = "rgba(255,255,255,0.76)";
const MUTED = "rgba(255,255,255,0.55)";
const CARD_BORDER = "rgba(255,255,255,0.12)";
const CARD_FILL = "rgba(255,255,255,0.035)";
const ACCENT = "#22D3EE";
const PINK = "#F472B6";

const tenseSet = [
  {
    id: "kk",
    letter: "ㄲ",
    syllable: "까",
    romanization: "kk / gg",
    nativeLabel: "Tendue",
    pairBase: { letter: "ㄱ", syllable: "가", label: "Soft" },
    pairAspirated: { letter: "ㅋ", syllable: "카", label: "Air" },
    title: "Soft / Air → Tense",
    desc: "La consonne double serre davantage le son. Elle n'ajoute pas d'air : elle le retient.",
  },
  {
    id: "tt",
    letter: "ㄸ",
    syllable: "따",
    romanization: "tt / dd",
    nativeLabel: "Tendue",
    pairBase: { letter: "ㄷ", syllable: "다", label: "Soft" },
    pairAspirated: { letter: "ㅌ", syllable: "타", label: "Air" },
    title: "Soft / Air → Tense",
    desc: "Le son tendu part plus net, plus comprimé. Il sonne sec, précis, sans souffle.",
  },
  {
    id: "pp",
    letter: "ㅃ",
    syllable: "빠",
    romanization: "pp / bb",
    nativeLabel: "Tendue",
    pairBase: { letter: "ㅂ", syllable: "바", label: "Soft" },
    pairAspirated: { letter: "ㅍ", syllable: "파", label: "Air" },
    title: "Soft / Air → Tense",
    desc: "La version double bloque légèrement l'air avant de relâcher un son plus dense.",
  },
  {
    id: "ss",
    letter: "ㅆ",
    syllable: "싸",
    romanization: "ss",
    nativeLabel: "Tendue",
    pairBase: { letter: "ㅅ", syllable: "사", label: "Soft" },
    pairAspirated: null,
    title: "Soft → Tense",
    desc: "Ici, la tension rend le son plus incisif. Ce n'est pas plus soufflé, mais plus serré.",
  },
  {
    id: "jj",
    letter: "ㅉ",
    syllable: "짜",
    romanization: "jj",
    nativeLabel: "Tendue",
    pairBase: { letter: "ㅈ", syllable: "자", label: "Soft" },
    pairAspirated: { letter: "ㅊ", syllable: "차", label: "Air" },
    title: "Soft / Air → Tense",
    desc: "Le son double coupe plus franchement. Il garde l'énergie à l'intérieur avant l'attaque.",
  },
];

const contrastGroups = [
  {
    id: "g",
    title: "Soft → Tense",
    small: "1/5",
    desc: "Le son simple part plus doucement. Le son double devient plus fermé, plus serré.",
    leftTone: "Soft",
    rightTone: "Tense",
    left: { letter: "ㄱ", syllable: "가" },
    right: { letter: "ㄲ", syllable: "까" },
  },
  {
    id: "k",
    title: "Air → Tense",
    small: "2/5",
    desc: "Le son aspiré ajoute du souffle. Le son double retire l'air et resserre l'attaque.",
    leftTone: "Air",
    rightTone: "Tense",
    left: { letter: "ㅋ", syllable: "카" },
    right: { letter: "ㄲ", syllable: "까" },
  },
  {
    id: "d",
    title: "Soft → Tense",
    small: "3/5",
    desc: "La consonne simple reste souple. La double serre le départ du son plus nettement.",
    leftTone: "Soft",
    rightTone: "Tense",
    left: { letter: "ㄷ", syllable: "다" },
    right: { letter: "ㄸ", syllable: "따" },
  },
  {
    id: "t",
    title: "Air → Tense",
    small: "4/5",
    desc: "L'aspiration souffle vers l'extérieur. La consonne double garde l'énergie comprimée.",
    leftTone: "Air",
    rightTone: "Tense",
    left: { letter: "ㅌ", syllable: "타" },
    right: { letter: "ㄸ", syllable: "따" },
  },
  {
    id: "b",
    title: "Soft → Tense",
    small: "5/5",
    desc: "La double part plus sèche et plus dense que la consonne de base.",
    leftTone: "Soft",
    rightTone: "Tense",
    left: { letter: "ㅂ", syllable: "바" },
    right: { letter: "ㅃ", syllable: "빠" },
  },
  {
    id: "p",
    title: "Air → Tense",
    small: "1/4",
    desc: "L'aspirée relâche un souffle net. La double retire ce souffle pour un son plus compact.",
    leftTone: "Air",
    rightTone: "Tense",
    left: { letter: "ㅍ", syllable: "파" },
    right: { letter: "ㅃ", syllable: "빠" },
  },
  {
    id: "s",
    title: "Soft → Tense",
    small: "2/4",
    desc: "Avec ㅆ, le son garde la même famille mais devient plus tendu et incisif.",
    leftTone: "Soft",
    rightTone: "Tense",
    left: { letter: "ㅅ", syllable: "사" },
    right: { letter: "ㅆ", syllable: "싸" },
  },
  {
    id: "j",
    title: "Soft → Tense",
    small: "3/4",
    desc: "La consonne double démarre plus fort intérieurement, sans devenir aspirée.",
    leftTone: "Soft",
    rightTone: "Tense",
    left: { letter: "ㅈ", syllable: "자" },
    right: { letter: "ㅉ", syllable: "짜" },
  },
  {
    id: "ch",
    title: "Air → Tense",
    small: "4/4",
    desc: "ㅊ laisse sortir davantage d'air. ㅉ resserre le geste et coupe plus sec.",
    leftTone: "Air",
    rightTone: "Tense",
    left: { letter: "ㅊ", syllable: "차" },
    right: { letter: "ㅉ", syllable: "짜" },
  },
];

function speakText(
  text: string,
  rate: number,
  onDone?: () => void,
  onStart?: () => void,
) {
  Speech.stop();
  onStart?.();
  Speech.speak(text, {
    language: "ko-KR",
    rate,
    onDone,
    onStopped: onDone,
    onError: onDone,
  });
}

export default function ConsonantsTense() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [contrastIndex, setContrastIndex] = React.useState(0);
  const [showRomanization, setShowRomanization] = React.useState(true);
  const [rate, setRate] = React.useState(0.86);
  const [speakingKey, setSpeakingKey] = React.useState<string | null>(null);

  const current = tenseSet[currentIndex];
  const currentContrast = contrastGroups[contrastIndex];

  const haptic = async () => {
    try {
      await Haptics?.selectionAsync();
    } catch {}
  };

  const goPrev = async () => {
    await haptic();
    setCurrentIndex((prev) => (prev - 1 + tenseSet.length) % tenseSet.length);
    Speech.stop();
    setSpeakingKey(null);
  };

  const goNext = async () => {
    await haptic();
    setCurrentIndex((prev) => (prev + 1) % tenseSet.length);
    Speech.stop();
    setSpeakingKey(null);
  };

  const goContrastPrev = async () => {
    await haptic();
    setContrastIndex(
      (prev) => (prev - 1 + contrastGroups.length) % contrastGroups.length,
    );
    Speech.stop();
    setSpeakingKey(null);
  };

  const goContrastNext = async () => {
    await haptic();
    setContrastIndex((prev) => (prev + 1) % contrastGroups.length);
    Speech.stop();
    setSpeakingKey(null);
  };

  const playMain = async () => {
    await haptic();
    const key = `main-${current.id}`;
    setSpeakingKey(key);

    speakText(current.syllable, rate, () => setSpeakingKey(null));
  };

  const playBaseVsTense = async () => {
    await haptic();
    const key = `base-${current.id}`;
    setSpeakingKey(key);

    Speech.stop();
    Speech.speak(current.pairBase.syllable, {
      language: "ko-KR",
      rate,
      onDone: () => {
        setTimeout(() => {
          Speech.speak(current.syllable, {
            language: "ko-KR",
            rate,
            onDone: () => setSpeakingKey(null),
            onStopped: () => setSpeakingKey(null),
            onError: () => setSpeakingKey(null),
          });
        }, 250);
      },
      onStopped: () => setSpeakingKey(null),
      onError: () => setSpeakingKey(null),
    });
  };

  const playAspiratedVsTense = async () => {
    if (!current.pairAspirated) return;
    await haptic();
    const key = `asp-${current.id}`;
    setSpeakingKey(key);

    Speech.stop();
    Speech.speak(current.pairAspirated.syllable, {
      language: "ko-KR",
      rate,
      onDone: () => {
        setTimeout(() => {
          Speech.speak(current.syllable, {
            language: "ko-KR",
            rate,
            onDone: () => setSpeakingKey(null),
            onStopped: () => setSpeakingKey(null),
            onError: () => setSpeakingKey(null),
          });
        }, 250);
      },
      onStopped: () => setSpeakingKey(null),
      onError: () => setSpeakingKey(null),
    });
  };

  const playContrastCard = async () => {
    await haptic();
    const key = `contrast-${currentContrast.id}`;
    setSpeakingKey(key);

    Speech.stop();
    Speech.speak(currentContrast.left.syllable, {
      language: "ko-KR",
      rate,
      onDone: () => {
        setTimeout(() => {
          Speech.speak(currentContrast.right.syllable, {
            language: "ko-KR",
            rate,
            onDone: () => setSpeakingKey(null),
            onStopped: () => setSpeakingKey(null),
            onError: () => setSpeakingKey(null),
          });
        }, 250);
      },
      onStopped: () => setSpeakingKey(null),
      onError: () => setSpeakingKey(null),
    });
  };

  const playContrastLeft = async () => {
    await haptic();
    const key = `contrast-left-${currentContrast.id}`;
    setSpeakingKey(key);

    Speech.stop();
    Speech.speak(currentContrast.left.syllable, {
      language: "ko-KR",
      rate,
      onDone: () => setSpeakingKey(null),
      onStopped: () => setSpeakingKey(null),
      onError: () => setSpeakingKey(null),
    });
  };

  const playContrastRight = async () => {
    await haptic();
    const key = `contrast-right-${currentContrast.id}`;
    setSpeakingKey(key);

    Speech.stop();
    Speech.speak(currentContrast.right.syllable, {
      language: "ko-KR",
      rate,
      onDone: () => setSpeakingKey(null),
      onStopped: () => setSpeakingKey(null),
      onError: () => setSpeakingKey(null),
    });
  };
  const playAllCycle = async () => {
    await haptic();
    Speech.stop();
    setSpeakingKey("cycle");

    const sequence = tenseSet.flatMap((item) => {
      const arr = [item.pairBase.syllable, item.syllable];
      if (item.pairAspirated) {
        arr.push(item.pairAspirated.syllable, item.syllable);
      }
      return arr;
    });

    let i = 0;
    const speakNext = () => {
      if (i >= sequence.length) {
        setSpeakingKey(null);
        return;
      }

      Speech.speak(sequence[i], {
        language: "ko-KR",
        rate,
        onDone: () => {
          i += 1;
          setTimeout(speakNext, 220);
        },
        onStopped: () => setSpeakingKey(null),
        onError: () => setSpeakingKey(null),
      });
    };

    speakNext();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[BG_DEEP, BG_TOP, "#070912"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.orb, styles.orbPinkTop]} />
      <View style={[styles.orb, styles.orbCyanLeft]} />
      <View style={[styles.orb, styles.orbPinkBottom]} />
      <View style={[styles.orb, styles.orbCyanBottom]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Link href="/hangul" asChild>
            <Pressable
              hitSlop={20}
              style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
            >
              <Text style={styles.backText}>← Retour</Text>
            </Pressable>
          </Link>

          <Text style={styles.sectionLabel}>SÉOUL IMMERSION</Text>
          <Text style={styles.pageTitle}>Consonnes{"\n"}tendues</Text>
        </View>

        {/* CARD PRINCIPALE */}
        <View style={styles.cardShell}>
          <BlurView intensity={26} tint="dark" style={styles.cardBlur}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.05)",
                "rgba(255,255,255,0.015)",
                "rgba(255,255,255,0.02)",
              ]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                "rgba(244,114,182,0.10)",
                "transparent",
                "rgba(34,211,238,0.07)",
              ]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.specTop} />
            <View style={styles.specSide} />

            <View style={styles.cardHeaderRow}>
              <View style={styles.liveLeft}>
                <View style={styles.statusDot} />
                <Text style={styles.liveLabel}>LIVE VOICE</Text>
              </View>

              <Pressable
                onPress={playMain}
                style={({ pressed }) => [
                  styles.playCircle,
                  speakingKey === `main-${current.id}` &&
                    styles.playCircleActive,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Text style={styles.playIcon}>▶</Text>
              </Pressable>
            </View>

            <View style={styles.mainCenterRow}>
              <Pressable
                onPress={goPrev}
                style={({ pressed }) => [
                  styles.navCircle,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.navArrow}>‹</Text>
              </Pressable>

              <View style={styles.mainGlyphWrap}>
                <View style={styles.mainGlowPlate} />
                <Text style={styles.mainGlyph}>{current.letter}</Text>
                <Text style={styles.mainSyllable}>{current.syllable}</Text>
                <Text style={styles.mainSub}>
                  {showRomanization
                    ? current.romanization
                    : current.nativeLabel}
                </Text>
              </View>

              <Pressable
                onPress={goNext}
                style={({ pressed }) => [
                  styles.navCircle,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.navArrow}>›</Text>
              </Pressable>
            </View>

            <View style={styles.bottomPillsRow}>
              <Pill
                label="Romanisation"
                active={showRomanization}
                onPress={() => setShowRomanization(true)}
              />
              <Pill
                label="Native"
                active={!showRomanization}
                onPress={() => setShowRomanization(false)}
              />
            </View>
          </BlurView>
        </View>

        {/* CARD CONTRASTE */}
        <View style={styles.cardShellSecondary}>
          <BlurView intensity={24} tint="dark" style={styles.cardBlur}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.045)",
                "rgba(255,255,255,0.015)",
                "rgba(255,255,255,0.02)",
              ]}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                "rgba(34,211,238,0.08)",
                "transparent",
                "rgba(167,139,250,0.08)",
              ]}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.cardHeaderBetween}>
              <View style={styles.liveLeft}>
                <View style={styles.statusDot} />
                <Text style={styles.liveLabel}>LIVE CONTRAST</Text>
              </View>
              <Text style={styles.counterText}>{currentContrast.small}</Text>
            </View>

            <View style={styles.contrastTopRow}>
              <Pressable
                onPress={goContrastPrev}
                style={({ pressed }) => [
                  styles.navCircle,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.navArrow}>‹</Text>
              </Pressable>

              <View style={styles.contrastTitleWrap}>
                <Text style={styles.contrastTitle}>
                  {currentContrast.title}
                </Text>
                <Text style={styles.contrastDesc}>{currentContrast.desc}</Text>
              </View>

              <Pressable
                onPress={goContrastNext}
                style={({ pressed }) => [
                  styles.navCircle,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.navArrow}>›</Text>
              </Pressable>
            </View>

            <View style={styles.compareCardsRow}>
              <MiniCompareCard
                tone={currentContrast.leftTone}
                letter={currentContrast.left.letter}
                syllable={currentContrast.left.syllable}
                active={speakingKey === `contrast-${currentContrast.id}`}
              />

              <View style={styles.middleArrowWrap}>
                <Text style={styles.middleArrow}>→</Text>
              </View>

              <MiniCompareCard
                tone={currentContrast.rightTone}
                letter={currentContrast.right.letter}
                syllable={currentContrast.right.syllable}
                active={speakingKey === `contrast-${currentContrast.id}`}
                highlight
              />
            </View>

            <View style={styles.actionsRow}>
              <Pill
                label="Écouter le contraste"
                active={speakingKey === `contrast-${currentContrast.id}`}
                onPress={playContrastCard}
              />
              {current.pairAspirated ? (
                <Pill
                  label="Aspirée → Double"
                  active={speakingKey === `asp-${current.id}`}
                  onPress={playAspiratedVsTense}
                />
              ) : (
                <View style={styles.disabledPill}>
                  <Text style={styles.disabledPillText}>Pas d’aspirée</Text>
                </View>
              )}
            </View>
          </BlurView>
        </View>
        <Pressable
          onPress={playAllCycle}
          style={({ pressed }) => [
            styles.ctaWrap,
            speakingKey === "cycle" && styles.ctaWrapActive,
            { opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.11)", "rgba(255,255,255,0.04)"]}
            style={styles.ctaInner}
          >
            <LinearGradient
              colors={["rgba(34,211,238,0.22)", "rgba(244,114,182,0.16)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.ctaText}>🔊 Écouter tout le cycle</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.tipBox}>
          <Text style={styles.tipLabel}>ASTUCE</Text>
          <Text style={styles.tipText}>
            Une consonne double n'est pas plus soufflée. Elle est plus serrée,
            plus compacte, comme une attaque tenue à l'intérieur avant d'être
            relâchée.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        { opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MiniCompareCard({
  tone,
  letter,
  syllable,
  active,
  highlight,
}: {
  tone: string;
  letter: string;
  syllable: string;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <View
      style={[styles.miniCardWrap, highlight && styles.miniCardWrapHighlight]}
    >
      <BlurView intensity={18} tint="dark" style={styles.miniCardInner}>
        <LinearGradient
          colors={
            highlight
              ? ["rgba(167,139,250,0.14)", "rgba(244,114,182,0.06)"]
              : ["rgba(34,211,238,0.08)", "rgba(255,255,255,0.02)"]
          }
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.miniTonePill,
            highlight && styles.miniTonePillHighlight,
          ]}
        >
          <Text
            style={[
              styles.miniToneText,
              highlight && styles.miniToneTextHighlight,
            ]}
          >
            {tone}
          </Text>
        </View>

        <Text
          style={[
            styles.miniLetter,
            active && highlight && { color: "#FFFFFF" },
          ]}
        >
          {letter}
        </Text>
        <Text style={styles.miniSyllable}>{syllable}</Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 64,
  },

  orb: {
    position: "absolute",
    borderRadius: 999,
  },

  orbPinkTop: {
    width: 320,
    height: 320,
    right: -70,
    top: -40,
    backgroundColor: "rgba(244,114,182,0.14)",
  },

  orbCyanLeft: {
    width: 270,
    height: 270,
    left: -130,
    top: 320,
    backgroundColor: "rgba(34,211,238,0.12)",
  },

  orbPinkBottom: {
    width: 260,
    height: 260,
    right: -90,
    bottom: 130,
    backgroundColor: "rgba(168,85,247,0.12)",
  },

  orbCyanBottom: {
    width: 240,
    height: 240,
    left: 10,
    bottom: -40,
    backgroundColor: "rgba(34,211,238,0.08)",
  },

  header: {
    marginTop: 8,
    marginBottom: 22,
  },

  backText: {
    color: MUTED,
    fontSize: 15,
    marginBottom: 26,
  },

  sectionLabel: {
    color: PINK,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 4.2,
    marginBottom: 10,
  },

  pageTitle: {
    color: TXT,
    fontSize: 46,
    lineHeight: 50,
    fontWeight: "300",
    letterSpacing: -1.8,
  },

  cardShell: {
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_FILL,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  cardShellSecondary: {
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_FILL,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  cardBlur: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    position: "relative",
  },

  specTop: {
    position: "absolute",
    top: 0,
    left: 22,
    right: 22,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  specSide: {
    position: "absolute",
    top: 30,
    bottom: 30,
    left: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  cardHeaderBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  liveLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#21E6C1",
    marginRight: 10,
  },

  liveLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3.5,
  },

  playCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  playCircleActive: {
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  playIcon: {
    color: TXT,
    fontSize: 18,
    marginLeft: 2,
  },

  mainCenterRow: {
    minHeight: 235,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  navCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  navArrow: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 30,
    fontWeight: "300",
    marginTop: -2,
  },

  mainGlyphWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  mainGlowPlate: {
    position: "absolute",
    width: 165,
    height: 108,
    borderRadius: 999,
    backgroundColor: "rgba(244,114,182,0.16)",
    top: 58,
  },

  mainGlyph: {
    color: "rgba(255,255,255,0.94)",
    fontSize: 118,
    lineHeight: 120,
    fontWeight: "700",
    marginBottom: 2,
  },

  mainSyllable: {
    color: TXT,
    fontSize: 24,
    fontWeight: "800",
    marginTop: -2,
  },

  mainSub: {
    color: TXT_SOFT,
    fontSize: 18,
    marginTop: 4,
    fontWeight: "600",
  },

  bottomPillsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },

  contrastTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  contrastTitleWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },

  contrastTitle: {
    color: TXT,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  contrastDesc: {
    color: TXT_SOFT,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    maxWidth: 260,
  },

  counterText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "700",
  },

  compareCardsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 6,
  },

  miniCardWrap: {
    flex: 1,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  miniCardWrapHighlight: {
    borderColor: "rgba(255,255,255,0.14)",
  },

  miniCardInner: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    position: "relative",
  },

  miniTonePill: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  miniTonePillHighlight: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
  },

  miniToneText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "700",
  },

  miniToneTextHighlight: {
    color: "rgba(255,255,255,0.90)",
  },

  miniLetter: {
    color: "#FFFFFF",
    fontSize: 72,
    lineHeight: 76,
    fontWeight: "800",
    marginBottom: 8,
  },

  miniSyllable: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 20,
    fontWeight: "500",
  },

  middleArrowWrap: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  middleArrow: {
    color: "rgba(255,255,255,0.30)",
    fontSize: 34,
    fontWeight: "300",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },

  pill: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  pillActive: {
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  pillText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontWeight: "700",
  },

  pillTextActive: {
    color: "#FFFFFF",
  },

  disabledPill: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },

  disabledPillText: {
    color: "rgba(255,255,255,0.34)",
    fontSize: 15,
    fontWeight: "700",
  },

  ctaWrap: {
    marginTop: 6,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  ctaWrapActive: {
    borderColor: "rgba(255,255,255,0.18)",
  },

  ctaInner: {
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  tipBox: {
    marginTop: 24,
    paddingHorizontal: 6,
  },

  tipLabel: {
    color: PINK,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.8,
    marginBottom: 8,
  },

  tipText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 22,
  },
});
