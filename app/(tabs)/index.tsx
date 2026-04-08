import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore, type LearningTrack } from "../../_store";

// ──────────────────────────────────────────────
// DESIGN SYSTEM
// ──────────────────────────────────────────────
const BG_DEEP = "#020205";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.60)";
const GHOST = "rgba(255,255,255,0.25)";
const FAINT = "rgba(255,255,255,0.42)";

const NEON = {
  purple: { core: "#E0BBFF", halo: "rgba(180, 100, 255, 0.35)" },
  cyan: { core: "#67E8F9", halo: "rgba(103, 232, 249, 0.40)" },
  pink: { core: "#FF9EDB", halo: "rgba(249, 158, 219, 0.35)" },
  orange: { core: "#FFBD7A", halo: "rgba(255, 189, 122, 0.35)" },
} as const;

const fonts = {
  medium: "Outfit_500Medium",
  bold: "Outfit_700Bold",
  black: "Outfit_900Black",
  krBold: "NotoSansKR_700Bold",
};

type ModuleItem = {
  step: string;
  title: string;
  icon: string;
  label: string;
  color: string;
  route: string;
  trackKey: LearningTrack;
};

const MODULES: ModuleItem[] = [
  {
    step: "",
    title: "Bases",
    icon: "한글",
    label: "Hangul",
    color: NEON.cyan.core,
    route: "/hangul",
    trackKey: "hangul",
  },
  {
    step: "",
    title: "Quotidien",
    icon: "어휘",
    label: "Vocabulaire",
    color: NEON.orange.core,
    route: "/voc",
    trackKey: "vocab",
  },
  {
    step: "",
    title: "Parler",
    icon: "회화",
    label: "Dialogue",
    color: NEON.pink.core,
    route: "/speak",
    trackKey: "dialogs",
  },
  {
    step: "",
    title: "Écoute",
    icon: "듣기",
    label: "Immersion",
    color: NEON.purple.core,
    route: "/listen",
    trackKey: "listen",
  },
];

// ──────────────────────────────────────────────
// COMPONENTS
// ──────────────────────────────────────────────
function CinematicBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[BG_DEEP, "#0D0F1A"]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.pageGlow,
          { top: -100, right: -100, backgroundColor: "rgba(34,211,238,0.08)" },
        ]}
      />
      <View
        style={[
          styles.pageGlow,
          {
            bottom: 100,
            left: -120,
            backgroundColor: "rgba(244,114,182,0.06)",
          },
        ]}
      />
    </View>
  );
}

function GlassPill({
  label,
  colorName = "cyan",
}: {
  label: string;
  colorName?: keyof typeof NEON;
}) {
  const neon = NEON[colorName];

  return (
    <View style={styles.pillWrap}>
      <BlurView intensity={20} tint="dark" style={styles.pillInner}>
        <Text
          style={[
            styles.pillText,
            {
              color: neon.core,
              textShadowColor: neon.halo,
              textShadowRadius: 8,
            },
          ]}
        >
          {label}
        </Text>
      </BlurView>
    </View>
  );
}

function ModuleCard({
  item,
  isActive,
  onPress,
}: {
  item: ModuleItem;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modulePressable,
        {
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <BlurView
        intensity={25}
        tint="dark"
        style={[
          styles.moduleCard,
          isActive ? styles.moduleCardActive : styles.moduleCardDefault,
        ]}
      >
        <LinearGradient
          colors={
            isActive
              ? ["rgba(255,255,255,0.06)", "rgba(103,232,249,0.03)"]
              : ["rgba(255,255,255,0.04)", "transparent"]
          }
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <Text
          style={[
            styles.moduleIcon,
            {
              color: item.color,
              textShadowColor: item.color,
              textShadowRadius: isActive ? 18 : 10,
            },
          ]}
        >
          {item.icon}
        </Text>

        <Text style={styles.moduleLabel}>{item.label}</Text>
        <Text style={styles.moduleSub}>{item.title}</Text>

        {isActive && <Text style={styles.badgeActive}>EN COURS</Text>}
      </BlurView>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// SCREEN
// ──────────────────────────────────────────────
export default function Home() {
  const { progress, setTrack } = useStore();

  const currentTrack = progress.learningTrack;

  const activeModule =
    MODULES.find((module) => module.trackKey === currentTrack) ?? MODULES[0];

  const handleContinue = () => {
    if (activeModule.trackKey) {
      setTrack(activeModule.trackKey);
    }
    router.push(activeModule.route as never);
  };

  const progressWidth =
    typeof progress.hangulLevel === "number"
      ? `${Math.max(8, Math.min((progress.hangulLevel / 4) * 100, 100))}%`
      : "45%";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <CinematicBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.topMetaRow}>
          <Text style={styles.topMetaText}>K-APP STUDIOS</Text>
          <View style={styles.topMetaDot} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroShell}>
          <BlurView intensity={35} tint="dark" style={styles.heroCard}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.12)",
                "transparent",
                "rgba(34,211,238,0.04)",
              ]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.heroLogoWrap}>
              <View style={styles.heroLogoHalo} />
              <View style={styles.heroLogoRow}>
                <Image
                  source={require("../../assets/images/gyeongbokgung-palace.png")}
                  style={styles.heroPalace}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.heroLingua}>Lingua</Text>
                  <Text style={styles.heroSeoul}>Seoul</Text>
                </View>
              </View>
            </View>

            <Text style={styles.heroEyebrow}>SEOUL NIGHT LEARNING</Text>
            <Text style={styles.heroKr}>Immersion Séoul</Text>
            <Text style={styles.heroLead}>
              Entrez dans Séoul. Écoutez,{"\n"}lisez, parlez.
            </Text>

            <View style={styles.heroPillsRow}>
              <GlassPill label="Café" colorName="purple" />
              <GlassPill label="Métro" colorName="cyan" />
              <GlassPill label="Nuit" colorName="pink" />
            </View>
          </BlurView>
        </View>

        <View style={{ height: 44 }} />

        {/* Session Track */}
        <Text style={styles.sectionTitle}>Ma Session</Text>
        <Text style={styles.sessionHint}>
          Continue exactement là où tu t’es arrêté
        </Text>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.trackPressable,
            { transform: [{ scale: pressed ? 0.985 : 1 }] },
          ]}
        >
          <BlurView intensity={45} tint="dark" style={styles.trackCard}>
            <LinearGradient
              colors={["rgba(255,255,255,0.08)", "transparent"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.trackRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTag}>CONTINUER</Text>
                <Text style={styles.trackTitle}>{activeModule.label}</Text>
                <Text style={styles.trackSubtitle}>
                  {activeModule.label === "Hangul"
                    ? "Maîtrisez l'alphabet"
                    : activeModule.title}
                </Text>
                <Text style={styles.streakText}>
                  🔥 {progress.streak} jours consécutifs
                </Text>
              </View>

              <View style={styles.trackArrowButton}>
                <Text style={styles.trackArrow}>→</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </BlurView>
        </Pressable>

        {/* Parcours */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
          Ton parcours
        </Text>
        <Text style={styles.sectionHint}>
          Explore librement les différents modules
        </Text>

        <View style={styles.modulesGrid}>
          {MODULES.map((item, idx) => (
            <ModuleCard
              key={idx}
              item={item}
              isActive={item.trackKey === currentTrack}
              onPress={() => {
                if (item.trackKey) {
                  setTrack(item.trackKey);
                }
                router.push(item.route as never);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DEEP },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 100,
  },

  pageGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },

  topMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },

  topMetaText: {
    color: GHOST,
    fontFamily: fonts.black,
    fontSize: 11,
    letterSpacing: 3.5,
  },

  topMetaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NEON.cyan.core,
    shadowColor: NEON.cyan.core,
    shadowRadius: 10,
    shadowOpacity: 1,
  },

  heroShell: {
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  heroCard: {
    padding: 34,
    alignItems: "center",
  },

  heroLogoWrap: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  heroLogoHalo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(192,132,252,0.1)",
    shadowColor: "#C084FC",
    shadowRadius: 40,
    shadowOpacity: 0.3,
  },

  heroLogoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroPalace: {
    width: 68,
    height: 68,
    marginRight: 12,
  },

  heroLingua: {
    color: "#FFF",
    fontSize: 28,
    fontFamily: fonts.black,
    letterSpacing: -1,
  },

  heroSeoul: {
    color: NEON.orange.core,
    fontSize: 28,
    fontFamily: fonts.black,
    marginTop: -6,
  },

  heroEyebrow: {
    color: GHOST,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 5,
    marginBottom: 18,
  },

  heroKr: {
    color: "#FFF",
    fontSize: 35,
    fontFamily: fonts.krBold,
    marginBottom: 12,
    letterSpacing: -1,
  },

  heroLead: {
    color: MUTED,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 26,
    fontFamily: fonts.medium,
    marginBottom: 30,
  },

  heroPillsRow: {
    flexDirection: "row",
    gap: 12,
  },

  pillWrap: {
    borderRadius: 99,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  pillInner: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  pillText: {
    fontSize: 11,
    fontFamily: fonts.black,
    letterSpacing: 1.5,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: fonts.black,
    letterSpacing: -0.5,
    marginBottom: 10,
  },

  sectionHint: {
    color: MUTED,
    fontSize: 13,
    fontFamily: fonts.medium,
    marginBottom: 18,
    lineHeight: 19,
  },

  sessionHint: {
    color: MUTED,
    fontSize: 13,
    fontFamily: fonts.medium,
    marginTop: -2,
    marginBottom: 14,
    lineHeight: 19,
  },

  trackPressable: {
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  trackCard: {
    padding: 24,
  },

  trackRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  trackTag: {
    color: NEON.cyan.core,
    fontSize: 11,
    fontFamily: fonts.black,
    letterSpacing: 2,
    marginBottom: 8,
  },

  trackTitle: {
    color: "#FFF",
    fontSize: 26,
    fontFamily: fonts.black,
  },

  trackSubtitle: {
    color: MUTED,
    fontSize: 14,
    fontFamily: fonts.medium,
    marginTop: 4,
  },

  streakText: {
    color: "#F59E0B",
    fontSize: 12,
    fontFamily: fonts.bold,
    marginTop: 8,
  },

  trackArrowButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  trackArrow: {
    color: "#FFF",
    fontSize: 22,
  },

  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginTop: 24,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: NEON.cyan.core,
    borderRadius: 2,
  },

  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  modulePressable: {
    width: "48%",
    marginBottom: 16,
  },

  moduleCard: {
    height: 176,
    borderRadius: 28,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },

  moduleCardActive: {
    borderColor: "rgba(103,232,249,0.22)",
  },

  moduleCardDefault: {
    borderColor: "rgba(255,255,255,0.08)",
  },

  moduleIcon: {
    fontSize: 44,
    fontFamily: fonts.krBold,
    marginBottom: 8,
  },

  moduleLabel: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: fonts.bold,
  },

  moduleSub: {
    color: MUTED,
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 4,
  },

  badgeActive: {
    marginTop: 8,
    fontSize: 10,
    color: NEON.cyan.core,
    fontFamily: fonts.bold,
    letterSpacing: 1,
  },
});
