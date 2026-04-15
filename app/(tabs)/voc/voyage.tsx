import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ──────────────────────────────────────────────
// DESIGN SYSTEM — aligned with speak.tsx
// ──────────────────────────────────────────────
const { width } = Dimensions.get("window");

const BG_DEEP = "#050508";
const BG_NAVY = "#0A0D1A";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.68)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const GREEN = "#10B981";
const ORANGE = "#FB923C";

const CARD_WIDTH = Math.min(width - 40, 340);

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
type WordItem = {
  id: string;
  kr: string;
  roman: string;
  fr: string;
  say: string;
};

type PhraseItem = {
  id: string;
  kr: string;
  fr: string;
  say: string;
  icon: string;
  accent: string;
  gradient: [string, string, string];
};

type QuizItem = {
  id: string;
  prompt: string;
  say: string;
  choices: string[];
  correctIndex: number;
  explain: string;
};

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────
const ESSENTIALS: WordItem[] = [
  { id: "1", kr: "여행", roman: "yeohaeng", fr: "voyage", say: "여행" },
  { id: "2", kr: "공항", roman: "gonghang", fr: "aéroport", say: "공항" },
  { id: "3", kr: "비행기", roman: "bihaenggi", fr: "avion", say: "비행기" },
  { id: "4", kr: "여권", roman: "yeogwon", fr: "passeport", say: "여권" },
  { id: "5", kr: "짐", roman: "jim", fr: "bagages", say: "짐" },
  { id: "6", kr: "호텔", roman: "hotel", fr: "hôtel", say: "호텔" },
  { id: "7", kr: "예약", roman: "yeyak", fr: "réservation", say: "예약" },
  { id: "8", kr: "지도", roman: "jido", fr: "carte", say: "지도" },
  { id: "9", kr: "주소", roman: "juso", fr: "adresse", say: "주소" },
  {
    id: "10",
    kr: "화장실",
    roman: "hwajangsil",
    fr: "toilettes",
    say: "화장실",
  },
  { id: "11", kr: "표", roman: "pyo", fr: "billet", say: "표" },
  {
    id: "12",
    kr: "현금",
    roman: "hyeongeum",
    fr: "argent liquide",
    say: "현금",
  },
];

const PHRASES: PhraseItem[] = [
  {
    id: "p1",
    kr: "여권이 어디 있어요?",
    fr: "Où est mon passeport ?",
    say: "여권이 어디 있어요?",
    icon: "🛂",
    accent: PINK,
    gradient: [
      "rgba(244, 114, 182, 0.16)",
      "rgba(244, 114, 182, 0.06)",
      "transparent",
    ],
  },
  {
    id: "p2",
    kr: "예약했어요.",
    fr: "J’ai réservé.",
    say: "예약했어요.",
    icon: "🗓️",
    accent: CYAN,
    gradient: [
      "rgba(34, 211, 238, 0.18)",
      "rgba(34, 211, 238, 0.06)",
      "transparent",
    ],
  },
  {
    id: "p3",
    kr: "체크인 어디예요?",
    fr: "Où est le check-in ?",
    say: "체크인 어디예요?",
    icon: "🛄",
    accent: ORANGE,
    gradient: [
      "rgba(251, 146, 60, 0.18)",
      "rgba(251, 146, 60, 0.06)",
      "transparent",
    ],
  },
  {
    id: "p4",
    kr: "화장실 어디예요?",
    fr: "Où sont les toilettes ?",
    say: "화장실 어디예요?",
    icon: "🚻",
    accent: "#38BDF8",
    gradient: [
      "rgba(56, 189, 248, 0.18)",
      "rgba(56, 189, 248, 0.06)",
      "transparent",
    ],
  },
  {
    id: "p5",
    kr: "이 주소로 가 주세요.",
    fr: "S’il vous plaît, allez à cette adresse.",
    say: "이 주소로 가 주세요.",
    icon: "📍",
    accent: "#A855F7",
    gradient: [
      "rgba(168, 85, 247, 0.18)",
      "rgba(168, 85, 247, 0.06)",
      "transparent",
    ],
  },
];

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: "q1",
    prompt: "Quel mot veut dire “passeport” ?",
    say: "여권",
    choices: ["여권", "예약"],
    correctIndex: 0,
    explain: "여권 = passeport. 예약 = réservation.",
  },
  {
    id: "q2",
    prompt: "Quel mot veut dire “toilettes” ?",
    say: "화장실",
    choices: ["화장실", "지도"],
    correctIndex: 0,
    explain: "화장실 = toilettes. 지도 = carte.",
  },
  {
    id: "q3",
    prompt: "Quelle phrase signifie “J’ai réservé” ?",
    say: "예약했어요",
    choices: ["예약했어요", "표가 있어요"],
    correctIndex: 0,
    explain: "예약 = réservation ; 예약했어요 = j’ai réservé.",
  },
];

// ──────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────
const triggerHaptic = (style = Haptics.ImpactFeedbackStyle.Light) => {
  Haptics.impactAsync(style).catch(() => {});
};

const speakKo = (text: string) => {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1,
  });
};

function getWordSizing(text: string) {
  const len = text.length;

  if (len <= 1) {
    return {
      fontSize: width > 420 ? 40 : 36,
      lineHeight: width > 420 ? 46 : 42,
      letterSpacing: -0.8,
    };
  }

  if (len <= 2) {
    return {
      fontSize: width > 420 ? 39 : 35,
      lineHeight: width > 420 ? 45 : 41,
      letterSpacing: -0.9,
    };
  }

  if (len <= 3) {
    return {
      fontSize: width > 420 ? 37 : 33,
      lineHeight: width > 420 ? 43 : 39,
      letterSpacing: -1,
    };
  }

  if (len <= 4) {
    return {
      fontSize: width > 420 ? 35 : 31,
      lineHeight: width > 420 ? 41 : 37,
      letterSpacing: -0.95,
    };
  }

  return {
    fontSize: width > 420 ? 31 : 27,
    lineHeight: width > 420 ? 36 : 32,
    letterSpacing: -0.8,
  };
}

// ──────────────────────────────────────────────
// HERO WORD CARD
// ──────────────────────────────────────────────
function EssentialWordCard({ items }: { items: WordItem[] }) {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const current = items[index];
  const wordSizing = getWordSizing(current.kr);

  const animateChange = useCallback(
    (cb: () => void) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        cb();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const handleNext = () => {
    triggerHaptic();
    animateChange(() => setIndex((prev) => (prev + 1) % items.length));
  };

  const handlePrev = () => {
    triggerHaptic();
    animateChange(() =>
      setIndex((prev) => (prev - 1 + items.length) % items.length),
    );
  };

  const playCurrent = useCallback(() => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.04,
        duration: 180,
        easing: Easing.out(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.sin),
        useNativeDriver: true,
      }),
    ]).start();

    speakKo(current.say);
  }, [current, pulseAnim]);

  return (
    <BlurView intensity={88} tint="dark" style={styles.glassCard}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.09)",
          "transparent",
          "rgba(34,211,238,0.06)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.statusDot} />
          <Text style={styles.cardHeaderText}>LIVE VOICE</Text>
        </View>

        <Pressable
          onPress={playCurrent}
          style={({ pressed }) => [
            styles.playMiniTag,
            { opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <Text style={styles.playMiniTagText}>PLAY</Text>
        </Pressable>
      </View>

      <View style={styles.heroCardMain}>
        <Pressable
          onPress={handlePrev}
          style={({ pressed }) => [
            styles.navCircle,
            { opacity: pressed ? 0.78 : 1 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>

        <Animated.View style={[styles.wordContent, { opacity: fadeAnim }]}>
          <Animated.Text
            style={[
              styles.krBig,
              wordSizing,
              {
                transform: [{ scale: pulseAnim }],
                textShadowColor: "rgba(34, 211, 238, 0.18)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {current.kr}
          </Animated.Text>

          <Text style={styles.wordRoman}>{current.roman}</Text>
          <Text style={styles.wordFrench}>{current.fr}</Text>
        </Animated.View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.navCircle,
            { opacity: pressed ? 0.78 : 1 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.cardFooter}>
        <Pressable
          onPress={playCurrent}
          style={({ pressed }) => [
            styles.listenCapsule,
            { opacity: pressed ? 0.86 : 1 },
          ]}
        >
          <Text style={styles.listenCapsuleText}>Écoute et répète</Text>
        </Pressable>
      </View>
    </BlurView>
  );
}

// ──────────────────────────────────────────────
// VOCAB GRID
// ──────────────────────────────────────────────
function VocabGrid({ items }: { items: WordItem[] }) {
  return (
    <BlurView intensity={80} tint="dark" style={styles.blockCard}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.05)",
          "transparent",
          "rgba(255,255,255,0.015)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.blockTitle}>Essentiels</Text>
      <Text style={styles.blockSubtitle}>
        Les mots les plus utiles pour survivre dès le jour 1.
      </Text>

      <View style={styles.chipsWrap}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              triggerHaptic();
              speakKo(item.say);
            }}
            style={({ pressed }) => [
              styles.chip,
              { opacity: pressed ? 0.86 : 1 },
            ]}
          >
            <Text style={styles.chipKr}>{item.kr}</Text>
            <Text style={styles.chipFr}>{item.fr}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() =>
          speakKo("여행 공항 비행기 여권 짐 호텔 예약 지도 주소 화장실 표 현금")
        }
        style={({ pressed }) => [
          styles.secondaryCapsule,
          { opacity: pressed ? 0.86 : 1 },
        ]}
      >
        <Text style={styles.secondaryCapsuleText}>Écouter tout</Text>
      </Pressable>
    </BlurView>
  );
}

// ──────────────────────────────────────────────
// QUIZ
// ──────────────────────────────────────────────
function QuizCard({ items }: { items: QuizItem[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [show, setShow] = useState(false);

  const item = items[index];

  const next = () => {
    setSelected(null);
    setShow(false);
    setIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <BlurView intensity={80} tint="dark" style={styles.blockCard}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.05)",
          "transparent",
          "rgba(255,255,255,0.015)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.blockTitle}>Mini-quiz écoute</Text>
      <Text style={styles.blockSubtitle}>
        Appuie sur écouter, puis choisis la bonne réponse.
      </Text>

      <View style={styles.quizInner}>
        <Text style={styles.quizPrompt}>{item.prompt}</Text>

        <Pressable
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
            speakKo(item.say);
          }}
          style={({ pressed }) => [
            styles.secondaryCapsule,
            { opacity: pressed ? 0.86 : 1, marginTop: 14 },
          ]}
        >
          <Text style={styles.secondaryCapsuleText}>Écouter</Text>
        </Pressable>

        {item.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrect = i === item.correctIndex;

          const borderColor = show
            ? isCorrect
              ? "rgba(34,211,238,0.65)"
              : isSelected
                ? "rgba(244,114,182,0.65)"
                : "rgba(255,255,255,0.10)"
            : isSelected
              ? "rgba(255,255,255,0.28)"
              : "rgba(255,255,255,0.10)";

          const backgroundColor = show
            ? isCorrect
              ? "rgba(34,211,238,0.10)"
              : isSelected
                ? "rgba(244,114,182,0.10)"
                : "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.04)";

          return (
            <Pressable
              key={`${item.id}_${i}`}
              disabled={show}
              onPress={() => {
                triggerHaptic();
                setSelected(i);
              }}
              style={({ pressed }) => [
                styles.choiceCard,
                {
                  opacity: pressed ? 0.88 : 1,
                  borderColor,
                  backgroundColor,
                },
              ]}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </Pressable>
          );
        })}

        <Pressable
          disabled={selected === null || show}
          onPress={() => setShow(true)}
          style={({ pressed }) => [
            styles.secondaryCapsule,
            {
              opacity: selected === null || show ? 0.45 : pressed ? 0.86 : 1,
              marginTop: 14,
            },
          ]}
        >
          <Text style={styles.secondaryCapsuleText}>
            {show ? "Réponse affichée" : "Vérifier"}
          </Text>
        </Pressable>

        {show && (
          <>
            <View style={styles.quizAnswerBox}>
              <Text style={styles.quizAnswerTitle}>
                Réponse : {item.choices[item.correctIndex]}
              </Text>
              <Text style={styles.quizAnswerText}>{item.explain}</Text>
            </View>

            <Pressable
              onPress={next}
              style={({ pressed }) => [
                styles.listenCapsule,
                { opacity: pressed ? 0.86 : 1, marginTop: 14 },
              ]}
            >
              <Text style={styles.listenCapsuleText}>Suivant</Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => Speech.stop()}
          style={({ pressed }) => [
            styles.stopCapsule,
            { opacity: pressed ? 0.86 : 1 },
          ]}
        >
          <Text style={styles.stopCapsuleText}>Stop audio</Text>
        </Pressable>
      </View>
    </BlurView>
  );
}

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function Travel() {
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG_DEEP }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient colors={[BG_DEEP, BG_NAVY]} style={{ flex: 1 }}>
        <View
          style={[
            styles.pageGlow,
            { top: -140, left: -100, backgroundColor: "rgba(168,85,247,0.07)" },
          ]}
        />
        <View
          style={[
            styles.pageGlow,
            {
              bottom: 100,
              right: -90,
              backgroundColor: "rgba(34,211,238,0.05)",
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.topButton,
                { opacity: pressed ? 0.84 : 1 },
              ]}
            >
              <Text style={styles.topButtonText}>‹</Text>
            </Pressable>
          </View>

          <View style={styles.heroContainer}>
            <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
            <Text style={styles.heroTitle}>Voyage</Text>
          </View>

          <View style={styles.wordCardWrap}>
            <EssentialWordCard items={ESSENTIALS} />
          </View>

          <View style={{ height: 46 }} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Essentiels</Text>
          </View>

          <VocabGrid items={ESSENTIALS} />

          <View style={{ height: 28 }} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phrases courtes</Text>
          </View>

          {PHRASES.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                triggerHaptic();
                speakKo(item.say);
              }}
              style={({ pressed }) => [
                styles.themeCard,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <BlurView intensity={80} tint="dark" style={styles.themeCardBlur}>
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0.0, y: 0.5 }}
                  end={{ x: 1.0, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />

                <View
                  style={[
                    styles.cardAccentLine,
                    { backgroundColor: item.accent },
                  ]}
                />

                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: `${item.accent}22`,
                      borderColor: `${item.accent}50`,
                    },
                  ]}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.themeTitle}>{item.kr}</Text>
                  <Text style={styles.themeSub}>{item.fr}</Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </BlurView>
            </Pressable>
          ))}

          <View style={{ height: 28 }} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mini-quiz</Text>
          </View>

          <QuizCard items={QUIZ_ITEMS} />

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },

  pageGlow: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
  },

  topBar: {
    marginBottom: 14,
  },

  topButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  topButtonText: {
    color: TXT,
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
  },

  heroContainer: {
    alignItems: "flex-start",
  },

  heroEyebrow: {
    color: PINK,
    fontSize: 13.5,
    letterSpacing: 3.2,
    fontWeight: "700",
    marginBottom: 8,
  },

  heroTitle: {
    color: TXT,
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: -1.4,
    marginTop: 15,
    marginBottom: 28,
  },

  wordCardWrap: {
    alignItems: "center",
  },

  glassCard: {
    width: CARD_WIDTH,
    minHeight: 242,
    borderRadius: 34,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
    padding: 24,
    justifyContent: "space-between",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },

  cardHeaderText: {
    color: MUTED,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1.6,
  },

  playMiniTag: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },

  playMiniTagText: {
    color: TXT,
    fontSize: 11.5,
    fontWeight: "500",
  },

  heroCardMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },

  navCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  navArrow: {
    color: TXT,
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 34,
    marginTop: -2,
  },

  wordContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  krBig: {
    color: TXT,
    fontWeight: "700",
    marginBottom: 12,
    maxWidth: CARD_WIDTH - 150,
    textAlign: "center",
  },

  wordRoman: {
    color: TXT,
    fontSize: 15.5,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },

  wordFrench: {
    color: MUTED,
    fontSize: 14,
    textAlign: "center",
  },

  cardFooter: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  listenCapsule: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  listenCapsuleText: {
    color: TXT,
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryCapsule: {
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryCapsuleText: {
    color: TXT,
    fontSize: 15,
    fontWeight: "700",
  },

  stopCapsule: {
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.26)",
    backgroundColor: "rgba(244,114,182,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  stopCapsuleText: {
    color: TXT,
    fontSize: 15,
    fontWeight: "700",
  },

  section: {
    width: "100%",
  },

  sectionTitle: {
    color: TXT,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 20,
  },

  blockCard: {
    overflow: "hidden",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 18,
  },

  blockTitle: {
    color: TXT,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  blockSubtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    marginBottom: 14,
  },

  chip: {
    minWidth: 108,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  chipKr: {
    color: TXT,
    fontSize: 15,
    fontWeight: "800",
  },

  chipFr: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  themeCard: {
    marginBottom: 14,
    borderRadius: 26,
    overflow: "hidden",
  },

  themeCardBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    position: "relative",
  },

  cardAccentLine: {
    position: "absolute",
    left: 0,
    top: 18,
    bottom: 18,
    width: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    opacity: 0.9,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  icon: {
    fontSize: 28,
  },

  themeTitle: {
    color: TXT,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  themeSub: {
    color: MUTED,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },

  arrow: {
    color: MUTED,
    fontSize: 26,
    fontWeight: "300",
  },

  quizInner: {
    marginTop: 14,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  quizPrompt: {
    color: TXT,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },

  choiceCard: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },

  choiceText: {
    color: TXT,
    fontSize: 16,
    fontWeight: "800",
  },

  quizAnswerBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  quizAnswerTitle: {
    color: TXT,
    fontSize: 15,
    fontWeight: "800",
  },

  quizAnswerText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
});
