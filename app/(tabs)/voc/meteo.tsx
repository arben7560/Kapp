import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {}

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN TOKENS — même logique que consonant-basic
// ──────────────────────────────────────────────
const BG_DEEP = "#050508";
const BG_TOP = "#0A0D16";

const TXT = "rgba(255,255,255,0.96)";
const TXT_SOFT = "rgba(255,255,255,0.76)";
const MUTED = "rgba(255,255,255,0.58)";
const FAINT = "rgba(255,255,255,0.34)";
const LINE = "rgba(255,255,255,0.12)";
const CARD_BORDER = "rgba(255,255,255,0.10)";

const PINK = "#F472B6";
const CYAN = "#22D3EE";
const VIOLET = "#A78BFA";
const GREEN = "#10D399";

const ORB_PINK = "rgba(244,114,182,0.18)";
const ORB_CYAN = "rgba(34,211,238,0.16)";
const ORB_VIOLET = "rgba(167,139,250,0.14)";

const CARD_RADIUS = 34;
const INNER_RADIUS = 24;

const WORD_SIZE = width > 420 ? 112 : 96;

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────
type WordItem = {
  id: string;
  kr: string;
  roman: string;
  fr: string;
  say: string;
};

type ContrastItem = {
  id: string;
  leftKr: string;
  leftRoman: string;
  leftFr: string;
  leftSay: string;
  rightKr: string;
  rightRoman: string;
  rightFr: string;
  rightSay: string;
  hint: string;
};

type PhraseItem = {
  id: string;
  kr: string;
  fr: string;
  say: string;
};

type QuizItem = {
  id: string;
  prompt: string;
  say: string;
  choices: string[];
  correctIndex: number;
  explain: string;
};

const WORDS: WordItem[] = [
  { id: "1", kr: "날씨", roman: "nalssi", fr: "météo", say: "날씨" },
  { id: "2", kr: "맑아요", roman: "malgayo", fr: "ciel clair", say: "맑아요" },
  { id: "3", kr: "흐려요", roman: "heuryeoyo", fr: "nuageux", say: "흐려요" },
  { id: "4", kr: "비", roman: "bi", fr: "pluie", say: "비" },
  {
    id: "5",
    kr: "비가 와요",
    roman: "biga wayo",
    fr: "il pleut",
    say: "비가 와요",
  },
  { id: "6", kr: "눈", roman: "nun", fr: "neige", say: "눈" },
  {
    id: "7",
    kr: "눈이 와요",
    roman: "nuni wayo",
    fr: "il neige",
    say: "눈이 와요",
  },
  { id: "8", kr: "바람", roman: "baram", fr: "vent", say: "바람" },
  {
    id: "9",
    kr: "바람이 불어요",
    roman: "barami bureoyo",
    fr: "il y a du vent",
    say: "바람이 불어요",
  },
  {
    id: "10",
    kr: "더워요",
    roman: "deowoyo",
    fr: "il fait chaud",
    say: "더워요",
  },
  {
    id: "11",
    kr: "추워요",
    roman: "chuwoyo",
    fr: "il fait froid",
    say: "추워요",
  },
  { id: "12", kr: "우산", roman: "usan", fr: "parapluie", say: "우산" },
];

const CONTRASTS: ContrastItem[] = [
  {
    id: "c1",
    leftKr: "맑아요",
    leftRoman: "malgayo",
    leftFr: "clair",
    leftSay: "맑아요",
    rightKr: "흐려요",
    rightRoman: "heuryeoyo",
    rightFr: "nuageux",
    rightSay: "흐려요",
    hint: "맑아요 = ciel clair / 흐려요 = ciel couvert.",
  },
  {
    id: "c2",
    leftKr: "더워요",
    leftRoman: "deowoyo",
    leftFr: "chaud",
    leftSay: "더워요",
    rightKr: "추워요",
    rightRoman: "chuwoyo",
    rightFr: "froid",
    rightSay: "추워요",
    hint: "더워요 = chaud / 추워요 = froid.",
  },
  {
    id: "c3",
    leftKr: "비",
    leftRoman: "bi",
    leftFr: "pluie",
    leftSay: "비",
    rightKr: "눈",
    rightRoman: "nun",
    rightFr: "neige",
    rightSay: "눈",
    hint: "비 = pluie / 눈 = neige.",
  },
  {
    id: "c4",
    leftKr: "비가 와요",
    leftRoman: "biga wayo",
    leftFr: "il pleut",
    leftSay: "비가 와요",
    rightKr: "눈이 와요",
    rightRoman: "nuni wayo",
    rightFr: "il neige",
    rightSay: "눈이 와요",
    hint: "와요 = “ça vient / tombe”, ici pluie ou neige.",
  },
];

const PHRASES: PhraseItem[] = [
  {
    id: "p1",
    kr: "오늘 날씨 어때요?",
    fr: "Quel temps fait-il aujourd’hui ?",
    say: "오늘 날씨 어때요?",
  },
  {
    id: "p2",
    kr: "오늘은 맑아요.",
    fr: "Aujourd’hui il fait beau.",
    say: "오늘은 맑아요.",
  },
  {
    id: "p3",
    kr: "비 올 것 같아요.",
    fr: "Je crois qu’il va pleuvoir.",
    say: "비 올 것 같아요.",
  },
  {
    id: "p4",
    kr: "우산 있어요?",
    fr: "Tu as un parapluie ?",
    say: "우산 있어요?",
  },
  {
    id: "p5",
    kr: "내일은 더울까요?",
    fr: "Demain il fera chaud ?",
    say: "내일은 더울까요?",
  },
];

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: "q1",
    prompt: "Quelle phrase signifie “il pleut” ?",
    say: "비가 와요",
    choices: ["비가 와요", "추워요"],
    correctIndex: 0,
    explain: "비 = pluie ; 비가 와요 = il pleut.",
  },
  {
    id: "q2",
    prompt: "Quelle phrase signifie “il fait froid” ?",
    say: "추워요",
    choices: ["더워요", "추워요"],
    correctIndex: 1,
    explain: "더워요 = chaud ; 추워요 = froid.",
  },
  {
    id: "q3",
    prompt: "Quelle phrase signifie “Quel temps fait-il aujourd’hui ?”",
    say: "오늘 날씨 어때요?",
    choices: ["오늘 날씨 어때요?", "우산 있어요?"],
    correctIndex: 0,
    explain: "어때요? = comment c’est ? → “Quel temps fait-il ?”",
  },
];

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function speakKo(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1.0,
  });
}

function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.cardShell, style]}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.065)",
          "rgba(255,255,255,0.02)",
          "rgba(255,255,255,0.03)",
        ]}
        start={{ x: 0.02, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <BlurView intensity={28} tint="dark" style={styles.cardBlur} />
      <View style={styles.cardStroke} />
      {children}
    </View>
  );
}

function NavArrow({
  direction,
  onPress,
}: {
  direction: "left" | "right";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [
        styles.arrowBtn,
        { opacity: pressed ? 0.84 : 1 },
      ]}
    >
      <Text style={styles.arrowTxt}>{direction === "left" ? "‹" : "›"}</Text>
    </Pressable>
  );
}

function CapsuleButton({
  label,
  onPress,
  large = false,
}: {
  label: string;
  onPress: () => void;
  large?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.capsuleBtn,
        large && styles.capsuleBtnLarge,
        { opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.10)",
          "rgba(255,255,255,0.03)",
          "rgba(255,255,255,0.06)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Text
        style={[styles.capsuleBtnText, large && styles.capsuleBtnTextLarge]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ──────────────────────────────────────────────
// MAIN CARD
// ──────────────────────────────────────────────
function MainWordCard({ items }: { items: WordItem[] }) {
  const [index, setIndex] = useState(0);
  const pushAnim = useRef(new Animated.Value(0)).current;
  const current = items[index];

  const next = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const pulseWord = React.useCallback(() => {
    pushAnim.setValue(0);
    Animated.sequence([
      Animated.timing(pushAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pushAnim, {
        toValue: 0,
        duration: 230,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [pushAnim]);

  const playCurrent = () => {
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    pulseWord();
    speakKo(current.say);
  };

  const animatedWordStyle = {
    transform: [
      {
        scale: pushAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.035],
        }),
      },
      {
        translateY: pushAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2],
        }),
      },
    ],
  };

  return (
    <GlassCard>
      <View style={styles.orbTopLeftPink} />
      <View style={styles.orbBottomRightCyan} />
      <View style={styles.orbBottomMini} />

      <View style={styles.cardHeaderRow}>
        <View style={styles.liveRow}>
          <View style={[styles.liveDot, { backgroundColor: GREEN }]} />
          <Text style={styles.liveLabel}>LIVE VOICE</Text>
        </View>

        <CapsuleButton label="PLAY" onPress={playCurrent} />
      </View>

      <View style={styles.mainCenterRow}>
        <NavArrow direction="left" onPress={prev} />

        <View style={styles.wordCenter}>
          <Animated.Text style={[styles.bigWord, animatedWordStyle]}>
            {current.kr}
          </Animated.Text>
          <Text style={styles.mainRoman}>{current.roman}</Text>
          <Text style={styles.mainFrench}>{current.fr}</Text>
        </View>

        <NavArrow direction="right" onPress={next} />
      </View>

      <CapsuleButton label="Écoute et répète" onPress={playCurrent} large />
    </GlassCard>
  );
}

// ──────────────────────────────────────────────
// CONTRAST CARD
// ──────────────────────────────────────────────
function ContrastWordCard({ items }: { items: ContrastItem[] }) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + items.length) % items.length);

  const playContrast = () => {
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    Speech.stop();
    Speech.speak(`${current.leftSay}... ${current.rightSay}`, {
      language: "ko-KR",
      rate: 0.9,
      pitch: 1.0,
    });
  };

  return (
    <GlassCard>
      <View style={styles.orbTopLeftCyan} />
      <View style={styles.orbMidLeftSmall} />
      <View style={styles.orbMidRightViolet} />
      <View style={styles.orbBottomRightBlue} />

      <View style={styles.cardHeaderRow}>
        <View style={styles.liveRow}>
          <View style={[styles.liveDot, { backgroundColor: GREEN }]} />
          <Text style={styles.liveLabel}>LIVE CONTRAST</Text>
        </View>

        <Text style={styles.counterText}>
          {index + 1}/{items.length}
        </Text>
      </View>

      <View style={styles.dualRow}>
        <NavArrow direction="left" onPress={prev} />

        <View style={styles.dualCenterWrap}>
          <View style={[styles.dualWordCard, styles.dualWordCardCyan]}>
            <LinearGradient
              colors={["rgba(34,211,238,0.18)", "rgba(34,211,238,0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.dualKr}>{current.leftKr}</Text>
            <Text style={styles.dualRoman}>{current.leftRoman}</Text>
            <Text style={styles.dualFr}>{current.leftFr}</Text>
          </View>

          <Text style={styles.dualArrow}>→</Text>

          <View style={[styles.dualWordCard, styles.dualWordCardViolet]}>
            <LinearGradient
              colors={["rgba(167,139,250,0.18)", "rgba(167,139,250,0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.dualKr}>{current.rightKr}</Text>
            <Text style={styles.dualRoman}>{current.rightRoman}</Text>
            <Text style={styles.dualFr}>{current.rightFr}</Text>
          </View>
        </View>

        <NavArrow direction="right" onPress={next} />
      </View>

      <Pressable
        onPress={playContrast}
        style={({ pressed }) => [
          styles.contrastListenBtn,
          { opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.09)",
            "rgba(255,255,255,0.03)",
            "rgba(255,255,255,0.05)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.contrastListenText}>Écoute la différence</Text>
        <Text style={styles.contrastListenArrow}>›</Text>
      </Pressable>

      <View style={styles.romanCapsule}>
        <LinearGradient
          colors={[
            "rgba(34,211,238,0.18)",
            "rgba(34,211,238,0.06)",
            "rgba(34,211,238,0.12)",
          ]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.romanCapsuleText}>{current.hint}</Text>
      </View>
    </GlassCard>
  );
}

// ──────────────────────────────────────────────
// PHRASES CARD
// ──────────────────────────────────────────────
function PhrasesCard({ items }: { items: PhraseItem[] }) {
  return (
    <GlassCard style={{ paddingBottom: 16 }}>
      <View style={styles.smallGlowPink} />
      <View style={styles.smallGlowCyan} />

      <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
        <Text style={styles.innerCardTitle}>Phrases prêtes</Text>
        <Text style={styles.innerCardSubtitle}>
          Courtes, naturelles, faciles à rejouer.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 18, marginTop: 14 }}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => speakKo(item.say)}
            style={({ pressed }) => [
              styles.phraseRow,
              { opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <View style={styles.phraseTextWrap}>
              <Text style={styles.phraseKr}>{item.kr}</Text>
              <Text style={styles.phraseFr}>{item.fr}</Text>
            </View>
            <Text style={styles.phrasePlay}>›</Text>
          </Pressable>
        ))}

        <View style={{ height: 12 }} />

        <CapsuleButton label="Stop audio" onPress={() => Speech.stop()} large />
      </View>
    </GlassCard>
  );
}

// ──────────────────────────────────────────────
// QUIZ CARD
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
    <GlassCard style={{ paddingBottom: 16 }}>
      <View style={styles.smallGlowViolet} />
      <View style={styles.smallGlowCyanBottom} />

      <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
        <Text style={styles.innerCardTitle}>Mini-quiz écoute</Text>
        <Text style={styles.innerCardSubtitle}>
          Appuie sur lecture, puis choisis la bonne réponse.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 18, marginTop: 16 }}>
        <View style={styles.quizPromptBox}>
          <Text style={styles.quizPrompt}>{item.prompt}</Text>

          <View style={{ height: 12 }} />
          <CapsuleButton label="Écouter" onPress={() => speakKo(item.say)} />
        </View>

        {item.choices.map((choice, i) => {
          const isSelected = selected === i;
          const isCorrect = i === item.correctIndex;

          const borderColor =
            show && isCorrect
              ? "rgba(34,211,238,0.55)"
              : show && isSelected && !isCorrect
                ? "rgba(244,114,182,0.55)"
                : isSelected
                  ? "rgba(255,255,255,0.32)"
                  : LINE;

          const bgColor =
            show && isCorrect
              ? "rgba(34,211,238,0.10)"
              : show && isSelected && !isCorrect
                ? "rgba(244,114,182,0.10)"
                : "rgba(255,255,255,0.045)";

          return (
            <Pressable
              key={`${item.id}_${i}`}
              disabled={show}
              onPress={() => setSelected(i)}
              style={({ pressed }) => [
                styles.quizChoice,
                {
                  borderColor,
                  backgroundColor: bgColor,
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <Text style={styles.quizChoiceText}>{choice}</Text>
            </Pressable>
          );
        })}

        <View style={{ height: 12 }} />

        <CapsuleButton
          label={show ? "Réponse affichée" : "Vérifier"}
          onPress={() => {
            if (selected !== null && !show) setShow(true);
          }}
        />

        {show && (
          <>
            <View style={{ height: 12 }} />
            <View style={styles.quizExplainBox}>
              <Text style={styles.quizAnswer}>
                Réponse : {item.choices[item.correctIndex]}
              </Text>
              <Text style={styles.quizExplain}>{item.explain}</Text>
            </View>

            <View style={{ height: 12 }} />
            <CapsuleButton label="Suivant" onPress={next} />
          </>
        )}
      </View>
    </GlassCard>
  );
}

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function Meteo() {
  const allWordsSpeak = useMemo(() => WORDS.map((w) => w.say).join(" "), []);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: BG_DEEP }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={[BG_DEEP, BG_TOP, "#03040A"]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background orbs — même famille que consonant-basic */}
      <View style={styles.bgOrbPink} />
      <View style={styles.bgOrbCyan} />
      <View style={styles.bgOrbBottom} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top actions */}
          <View style={styles.topRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [
                styles.topIconBtn,
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text style={styles.topIconText}>‹</Text>
            </Pressable>

            <Pressable
              onPress={() => {}}
              hitSlop={12}
              style={({ pressed }) => [
                styles.topIconBtn,
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text style={styles.topIconText}>⚙</Text>
            </Pressable>
          </View>

          {/* Hero */}
          <View style={styles.heroWrap}>
            <Text style={styles.heroEyebrow}>SÉOUL IMMERSION</Text>
            <Text style={styles.heroTitle}>Météo</Text>
            <Text style={styles.heroSubtitle}>
              Mots et phrases utiles pour parler du temps naturellement.
            </Text>
          </View>

          <SectionTitle
            title="Mots essentiels"
            subtitle="Même logique de lecture rapide, une carte principale centrée sur le mot."
          />
          <MainWordCard items={WORDS} />

          <View style={{ height: 26 }} />

          <SectionTitle
            title="Contrastes météo"
            subtitle="Travaille les oppositions les plus fréquentes à l’oreille."
          />
          <ContrastWordCard items={CONTRASTS} />

          <View style={{ height: 26 }} />

          <SectionTitle
            title="Écoute globale"
            subtitle="Passe tous les mots à la suite pour renforcer le rythme."
          />
          <View style={{ marginBottom: 22 }}>
            <CapsuleButton
              label="Écouter tout"
              onPress={() => speakKo(allWordsSpeak)}
              large
            />
          </View>

          <SectionTitle
            title="Phrases météo"
            subtitle="Des phrases prêtes à rejouer pour le small talk."
          />
          <PhrasesCard items={PHRASES} />

          <View style={{ height: 26 }} />

          <SectionTitle
            title="Révision rapide"
            subtitle="Mini quiz audio dans le même esprit visuel."
          />
          <QuizCard items={QUIZ_ITEMS} />

          <View style={{ height: 42 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 140,
  },

  // Background
  bgOrbPink: {
    position: "absolute",
    top: -90,
    left: -140,
    width: 420,
    height: 420,
    borderRadius: 420,
    backgroundColor: ORB_PINK,
  },
  bgOrbCyan: {
    position: "absolute",
    top: 360,
    right: -120,
    width: 380,
    height: 380,
    borderRadius: 380,
    backgroundColor: ORB_CYAN,
  },
  bgOrbBottom: {
    position: "absolute",
    bottom: -180,
    left: -80,
    width: 420,
    height: 420,
    borderRadius: 420,
    backgroundColor: "rgba(34,211,238,0.08)",
  },

  // Top
  topRow: {
    marginTop: 4,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topIconBtn: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  topIconText: {
    color: TXT,
    fontSize: 28,
    fontWeight: "400",
  },

  // Hero
  heroWrap: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  heroEyebrow: {
    color: PINK,
    fontSize: 20,
    letterSpacing: 6,
    fontWeight: "500",
    marginBottom: 10,
  },
  heroTitle: {
    color: TXT,
    fontSize: 68,
    lineHeight: 72,
    fontWeight: "300",
    letterSpacing: -2.2,
  },
  heroSubtitle: {
    marginTop: 10,
    color: MUTED,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 340,
  },

  sectionTitle: {
    color: TXT,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "400",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 360,
  },

  // Cards
  cardShell: {
    position: "relative",
    overflow: "hidden",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 380,
  },
  cardBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  cardStroke: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },

  orbTopLeftPink: {
    position: "absolute",
    top: -40,
    left: -24,
    width: 185,
    height: 185,
    borderRadius: 999,
    backgroundColor: "rgba(244,114,182,0.22)",
  },
  orbBottomRightCyan: {
    position: "absolute",
    bottom: 36,
    right: -30,
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.10)",
  },
  orbBottomMini: {
    position: "absolute",
    bottom: -28,
    right: 54,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  orbTopLeftCyan: {
    position: "absolute",
    top: -34,
    left: -22,
    width: 185,
    height: 185,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.24)",
  },
  orbMidLeftSmall: {
    position: "absolute",
    top: 130,
    left: 86,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.13)",
  },
  orbMidRightViolet: {
    position: "absolute",
    top: 130,
    right: 84,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(167,139,250,0.16)",
  },
  orbBottomRightBlue: {
    position: "absolute",
    bottom: -60,
    right: -10,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.08)",
  },

  smallGlowPink: {
    position: "absolute",
    top: -30,
    left: -20,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(244,114,182,0.14)",
  },
  smallGlowCyan: {
    position: "absolute",
    bottom: -30,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  smallGlowViolet: {
    position: "absolute",
    top: -30,
    right: -10,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(167,139,250,0.12)",
  },
  smallGlowCyanBottom: {
    position: "absolute",
    bottom: -30,
    left: -10,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.08)",
  },

  cardHeaderRow: {
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveDot: {
    width: 14,
    height: 14,
    borderRadius: 99,
  },
  liveLabel: {
    color: TXT_SOFT,
    fontSize: 18,
    letterSpacing: 4,
    fontWeight: "500",
  },
  counterText: {
    color: TXT,
    fontSize: 22,
    fontWeight: "500",
  },

  // Main center
  mainCenterRow: {
    minHeight: 190,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  bigWord: {
    color: "rgba(255,255,255,0.98)",
    fontSize: WORD_SIZE,
    lineHeight: WORD_SIZE + 2,
    fontWeight: "300",
    letterSpacing: -2.5,
    textAlign: "center",
  },
  mainRoman: {
    marginTop: 10,
    color: TXT,
    fontSize: 22,
    fontWeight: "500",
  },
  mainFrench: {
    marginTop: 6,
    color: MUTED,
    fontSize: 18,
    textAlign: "center",
  },

  // Arrows
  arrowBtn: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowTxt: {
    color: TXT,
    fontSize: 52,
    lineHeight: 52,
    fontWeight: "300",
    marginTop: -4,
  },

  // Capsules
  capsuleBtn: {
    alignSelf: "flex-start",
    minWidth: 128,
    minHeight: 60,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  capsuleBtnLarge: {
    alignSelf: "center",
    width: width - 92,
    minHeight: 72,
    marginTop: 18,
  },
  capsuleBtnText: {
    color: TXT,
    fontSize: 24,
    letterSpacing: 1,
    fontWeight: "400",
  },
  capsuleBtnTextLarge: {
    fontSize: 22,
    letterSpacing: 0,
    fontWeight: "400",
  },

  // Contrast
  dualRow: {
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dualCenterWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dualWordCard: {
    width: width > 420 ? 150 : 132,
    minHeight: 210,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dualWordCardCyan: {
    backgroundColor: "rgba(34,211,238,0.06)",
  },
  dualWordCardViolet: {
    backgroundColor: "rgba(167,139,250,0.06)",
  },
  dualArrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 54,
    fontWeight: "300",
    marginHorizontal: 2,
  },
  dualKr: {
    color: TXT,
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "300",
    textAlign: "center",
  },
  dualRoman: {
    marginTop: 10,
    color: TXT,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  dualFr: {
    marginTop: 6,
    color: MUTED,
    fontSize: 15,
    textAlign: "center",
  },

  contrastListenBtn: {
    marginTop: 24,
    marginHorizontal: 18,
    height: 76,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contrastListenText: {
    color: TXT,
    fontSize: 20,
    fontWeight: "400",
  },
  contrastListenArrow: {
    color: TXT_SOFT,
    fontSize: 34,
    marginTop: -2,
  },

  romanCapsule: {
    marginTop: 18,
    alignSelf: "center",
    width: width - 130,
    minHeight: 72,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.28)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(34,211,238,0.05)",
  },
  romanCapsuleText: {
    color: TXT,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },

  // Generic inner cards
  innerCardTitle: {
    color: TXT,
    fontSize: 24,
    fontWeight: "400",
    letterSpacing: -0.4,
  },
  innerCardSubtitle: {
    marginTop: 6,
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
  },

  // Phrases
  phraseRow: {
    minHeight: 82,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phraseTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  phraseKr: {
    color: TXT,
    fontSize: 18,
    fontWeight: "500",
  },
  phraseFr: {
    marginTop: 5,
    color: MUTED,
    fontSize: 14,
    lineHeight: 19,
  },
  phrasePlay: {
    color: TXT_SOFT,
    fontSize: 34,
    marginTop: -2,
  },

  // Quiz
  quizPromptBox: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.045)",
    padding: 16,
    marginBottom: 10,
  },
  quizPrompt: {
    color: TXT,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "500",
  },
  quizChoice: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  quizChoiceText: {
    color: TXT,
    fontSize: 16,
    fontWeight: "500",
  },
  quizExplainBox: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.045)",
    padding: 14,
  },
  quizAnswer: {
    color: TXT,
    fontSize: 16,
    fontWeight: "700",
  },
  quizExplain: {
    marginTop: 6,
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
  },
});
