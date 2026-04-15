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

// ──────────────────────────────────────────────
// DESIGN TOKENS
// ──────────────────────────────────────────────
const BG_DEEP = "#020306";
const TXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.60)";
const SOFT = "rgba(255,255,255,0.45)";

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
    title: "Les Signes",
    label: "Hangul",
    color: CYAN,
    route: "/hangul",
    trackKey: "hangul",
    place: "CENTRE D'APPRENTISSAGE",
    narrative: "Décrypte l'âme visuelle de la ville.",
  },
  {
    title: "Échanges",
    label: "Restaurant",
    color: AMBER,
    route: "/voc",
    trackKey: "vocab",
    place: "ITAEWON • DINER",
    narrative: "Commence à exister dans la conversation.",
  },
  {
    title: "Mouvements",
    label: "Le Métro",
    color: PINK,
    route: "/speak",
    trackKey: "dialogs",
    place: "LIGNE 2 • SE DÉPLACER",
    narrative: "Navigue dans le flux de la capitale.",
  },
];

export default function Home() {
  const { progress, setTrack } = useStore();
  const currentTrack = progress.learningTrack;
  const activeSeq =
    SEQUENCES.find((s) => s.trackKey === currentTrack) ?? SEQUENCES[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bgImage}>
        <View style={styles.vignetteOverlay} />

        <View
          style={[
            styles.ambientGlow,
            { top: "10%", left: -50, backgroundColor: PINK, opacity: 0.12 },
          ]}
        />
        <View
          style={[
            styles.ambientGlow,
            { bottom: "20%", right: -50, backgroundColor: CYAN, opacity: 0.1 },
          ]}
        />

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

          <View style={styles.heroSection}>
            <Text style={styles.krMain}>서울</Text>
            <Text style={styles.heroSub}>
              L'expérience est ouverte.{"\n"}
              <Text style={{ color: TXT }}>Où souhaites-tu te projeter ?</Text>
            </Text>
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
            {SEQUENCES.map((seq, i) => (
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
      <BlurView
        intensity={isActive ? 80 : 30}
        tint="dark"
        style={styles.seqBlur}
      >
        <View
          style={[
            styles.seqAccent,
            { backgroundColor: item.color, opacity: isActive ? 1 : 0.3 },
          ]}
        />
        <Text style={[styles.seqPlace, { color: item.color }]}>
          {item.place}
        </Text>
        <Text style={styles.seqTitle}>{item.title}</Text>
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
    backgroundColor: "rgba(2,3,6,0.75)",
  },
  ambientGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
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
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  krMain: {
    fontSize: 64,
    fontFamily: fonts.krBold,
    color: "white",
    opacity: 0.15,
    position: "absolute",
    top: -20,
  },
  heroSub: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: MUTED,
    textAlign: "center",
    lineHeight: 26,
    marginTop: 20,
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  seqBlur: {
    padding: 16,
    flexDirection: "column",
  },
  seqAccent: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  seqPlace: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    marginBottom: 4,
    marginLeft: 8,
  },
  seqTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: TXT,
    marginLeft: 8,
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
