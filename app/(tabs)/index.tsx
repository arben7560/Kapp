import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";

const { width } = Dimensions.get("window");
const BACKGROUND_SOURCE = require("../../assets/images/seoul-hub-bg.jpg");
const HERO_CIRCLE = width * 0.76;

// ──────────────────────────────────────────────
// DESIGN TOKENS
// ──────────────────────────────────────────────
const BG_DEEP = "#020306";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.60)";
const SOFT = "rgba(255,255,255,0.45)";
const VIOLET = "#8B5CF6";
const PINK = "#F472B6";
const CYAN = "#22D3EE";
const AMBER = "#F59E0B";

const fonts = {
  medium: "Outfit_500Medium",
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  krBold: "NotoSansKR_700Bold",
};

const SEQUENCES: any[] = [
  {
    title: "L'alphabet Coréen",
    label: "Hangul",
    color: CYAN,
    route: "/hangul",
    trackKey: "hangul",
    place: "CENTRE D'APPRENTISSAGE",
    narrative: "Décrypte l'âme visuelle de la ville.",
    type: "pedagogical",
  },
  {
    title: "Scènes Guidées",
    label: "Restaurant",
    color: AMBER,
    route: "/voc",
    trackKey: "vocab",
    place: "ITAEWON • DINER",
    narrative: "Apprends le vocabulaire selon le contexte",
    type: "pedagogical",
  },
  {
    title: "Compter à Séoul",
    label: "Comptage",
    color: CYAN,
    route: "/comptage",
    trackKey: "numbers",
    place: "HONGDAE • QUANTITÉS",
    narrative: "Maîtrise les nombres dans le réel.",
    type: "pedagogical",
  },
  {
    title: "Compter le monde réel",
    label: "Classificateurs",
    color: "#34D399",
    route: "/classificateur",
    trackKey: "classifier",
    place: "MARCHÉ • QUANTITÉS",
    narrative: "Donne une forme aux objets et aux personnes.",
    type: "pedagogical",
  },
  {
    title: "Apprends en immersion",
    label: "Le Métro",
    color: PINK,
    route: "/speak",
    trackKey: "dialogs",
    place: "LIGNE 2 • SE DÉPLACER",
    narrative: "Navigue dans le flux de la capitale.",
    type: "immersion",
  },
  {
    title: "Développe ton écoute",
    label: "Listen",
    color: VIOLET,
    route: "/listen",
    trackKey: "listen",
    place: "LIGNE 2 • ÉCOUTER",
    narrative: "Affûte ton oreille au rythme de Séoul.",
    type: "immersion",
  },
];
export default function Home() {
  const { progress, setTrack } = useStore();
  const currentTrack = progress.learningTrack;
  const activeSeq =
    SEQUENCES.find((s) => s.trackKey === currentTrack) ?? SEQUENCES[0];

  const pedagogicalSequences = SEQUENCES.filter(
    (s) => s.type === "pedagogical",
  );

  const immersionSequences = SEQUENCES.filter((s) => s.type === "immersion");

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bgImage}>
        <View style={styles.vignetteOverlay} />
        <View style={styles.topFade} />
        <View style={styles.bottomFade} />

        <View style={[styles.globalGlowLeft, { backgroundColor: PINK }]} />
        <View style={[styles.globalGlowRight, { backgroundColor: CYAN }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <BlurView intensity={20} tint="dark" style={styles.statusBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>SÉOUL IMMERSION</Text>
            </BlurView>
            <Pressable style={styles.settingsBtn}>
              <View style={styles.settingsIconCircle} />
            </Pressable>
          </View>

          <View style={styles.heroBlock}>
            <View style={styles.heroVisualWrap}>
              <View
                style={[styles.heroCirclePink, { backgroundColor: PINK }]}
              />
              <View
                style={[styles.heroCircleCyan, { backgroundColor: CYAN }]}
              />

              <BlurView
                intensity={22}
                tint="dark"
                style={styles.heroCircleGlass}
              >
                <LinearGradient
                  colors={[
                    "rgba(255,255,255,0.06)",
                    "rgba(255,255,255,0.02)",
                    "rgba(255,255,255,0.01)",
                  ]}
                  start={{ x: 0.12, y: 0.08 }}
                  end={{ x: 0.88, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </BlurView>

              <View
                style={[
                  styles.heroLine,
                  { backgroundColor: "rgba(34,211,238,0.34)" },
                ]}
              />

              <Text style={styles.krMain}>서울</Text>
              <Text style={styles.heroSub}>
                L'expérience est ouverte.{"\n"}
                <Text style={{ color: TXT }}>
                  Où souhaites-tu te projeter ?
                </Text>
              </Text>
            </View>
          </View>

          {/* Animation Index 0 pour la carte principale */}
          <AnimatedFragment index={0}>
            <MainActionCard
              sequence={activeSeq}
              progress={0.45}
              onPress={() => {
                setTrack(activeSeq.trackKey);
                router.push(activeSeq.route);
              }}
            />
          </AnimatedFragment>

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>POINTS D'ENTRÉE</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.grid}>
            {pedagogicalSequences.map((seq, i) => (
              <AnimatedFragment key={seq.trackKey} index={i + 1}>
                <SequenceCard
                  item={seq}
                  isActive={seq.trackKey === currentTrack}
                  onPress={() => {
                    setTrack(seq.trackKey);
                    router.push(seq.route);
                  }}
                />
              </AnimatedFragment>
            ))}
          </View>

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>IMMERSION</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.grid}>
            {immersionSequences.map((seq, i) => (
              <AnimatedFragment
                key={seq.trackKey}
                index={i + 1 + pedagogicalSequences.length}
              >
                <SequenceCard
                  item={seq}
                  isActive={seq.trackKey === currentTrack}
                  onPress={() => {
                    setTrack(seq.trackKey);
                    router.push(seq.route);
                  }}
                />
              </AnimatedFragment>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// WRAPPER D'ANIMATION (L'âme de la fluidité)
// ──────────────────────────────────────────────
function AnimatedFragment({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrée en cascade
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: index * 180, // Décalage temporel entre chaque fragment
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        delay: index * 180,
        easing: Easing.out(Easing.back(1.2)), // Léger effet de rebond premium
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Lancement du flottement après l'entrée
      startFloating();
    });
  }, []);

  const startFloating = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000 + index * 400, // Rythme désynchronisé pour un aspect naturel
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000 + index * 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const translateY = Animated.add(
    slideAnim,
    floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -6], // Amplitude du flottement
    }),
  );

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ──────────────────────────────────────────────
// COMPONENTS (Inchangés mais stylisés)
// ──────────────────────────────────────────────

function MainActionCard({ sequence, progress, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={styles.mainCardWrap}>
      <BlurView intensity={60} tint="dark" style={styles.mainCard}>
        <LinearGradient
          colors={[`${sequence.color}30`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardKicker}>REPRENDRE LA SÉQUENCE</Text>
          <Text style={styles.cardTitle}>{sequence.label}</Text>
          <Text style={styles.cardNarrative}>{sequence.narrative}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: sequence.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}% d'immersion
            </Text>
          </View>
        </View>
      </BlurView>
    </Pressable>
  );
}

function SequenceCard({ item, isActive, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={styles.seqCard}>
      <BlurView intensity={30} tint="dark" style={styles.seqBlur}>
        <LinearGradient
          colors={[`${item.color}18`, "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.seqAccent, { backgroundColor: item.color }]} />

        <View style={styles.seqText}>
          <Text style={styles.seqTitle}>{item.title}</Text>
          <Text style={styles.seqSub}>{item.narrative}</Text>
        </View>

        <Text
          style={[
            styles.seqArrow,
            isActive && { color: item.color, opacity: 0.8 },
          ]}
        >
          ›
        </Text>
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// STYLES
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  bgImage: { flex: 1 },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.80)",
  },

  topFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.10)",
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: "rgba(2,3,6,0.24)",
  },

  globalGlowLeft: {
    position: "absolute",
    top: 140,
    left: -90,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.08,
  },

  globalGlowRight: {
    position: "absolute",
    top: 300,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.08,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK,
    marginRight: 8,
  },
  statusText: {
    color: TXT,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
  },
  heroBlock: {
    marginTop: 8,
    marginBottom: 18,
  },
  heroVisualWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 330,
    marginBottom: 8,
  },
  heroCirclePink: {
    position: "absolute",
    width: HERO_CIRCLE,
    height: HERO_CIRCLE,
    borderRadius: HERO_CIRCLE / 2,
    left: -20,
    top: 2,
    opacity: 0.12,
  },
  heroCircleCyan: {
    position: "absolute",
    width: HERO_CIRCLE,
    height: HERO_CIRCLE,
    borderRadius: HERO_CIRCLE / 2,
    right: -20,
    top: 2,
    opacity: 0.1,
  },
  heroCircleGlass: {
    position: "absolute",
    width: HERO_CIRCLE,
    height: HERO_CIRCLE,
    borderRadius: HERO_CIRCLE / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  heroLine: {
    position: "absolute",
    top: 84,
    left: 56,
    right: 56,
    height: 1,
  },
  krMain: {
    fontSize: 74,
    fontFamily: fonts.krBold,
    color: "rgba(245,252,255,0.98)",
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: MUTED,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 300,
  },
  mainCardWrap: {
    marginBottom: 32, // Réduit légèrement pour aérer la liste
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  mainCard: {
    padding: 24,
  },
  cardContent: {},
  cardKicker: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: SOFT,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: TXT,
    marginBottom: 8,
  },
  cardNarrative: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: MUTED,
    lineHeight: 22,
    marginBottom: 24,
  },
  progressContainer: {
    gap: 10,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: SOFT,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: SOFT,
    letterSpacing: 2,
  },
  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  grid: {
    gap: 12,
  },
  seqCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  seqBlur: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: 90,
  },
  seqAccent: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  seqText: {
    flex: 1,
    marginLeft: 10,
  },
  seqTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: TXT,
  },
  seqSub: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: MUTED,
    marginTop: 2,
  },
  seqArrow: {
    color: SOFT,
    fontSize: 22,
    opacity: 0.3,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  settingsIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: MUTED,
    opacity: 0.5,
  },
});
