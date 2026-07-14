import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { MissionAccessBadge } from "../../components/immersion/MissionAccessBadge";
import { MissionLaunchModal } from "../../components/immersion/MissionLaunchModal";
import { ABSOLUTE_FILL } from "../../constants/layout";
import { AppFontFamily, SeoulMidnightGlass } from "../../constants/theme";
import {
  metroMissions,
  type MetroMission,
} from "../../data/lesson/metro/metroMissions";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const metroBackground = require("../../assets/images/metrobg.png");

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.66)";
const SOFT = "rgba(255,255,255,0.46)";
const LINE = "rgba(255,255,255,0.10)";
const CYAN = "#22D3EE";
const GOLD = SeoulMidnightGlass.colors.premiumGold;
const fonts = AppFontFamily.outfit;

function normalizeMode(rawMode: string | string[] | undefined) {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

export default function MetroMissionsScreen() {
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const { setTrack } = useStore();
  const { hasPremiumAccess } = usePaywall();
  const [selectedMission, setSelectedMission] =
    React.useState<MetroMission | null>(null);
  const completeMissions = metroMissions.filter(
    (mission) => mission.missionKind === "complete",
  );
  const miniMissions = metroMissions.filter(
    (mission) => mission.missionKind === "mini",
  );

  const openMission = (mission: MetroMission) => {
    if (!canOpenImmersionMission(mission, hasPremiumAccess)) {
      router.push("/premium");
      return;
    }
    setSelectedMission(mission);
  };

  const startSelectedMission = () => {
    if (!selectedMission) return;
    const mission = selectedMission;
    setSelectedMission(null);
    setTrack("metro_ia");
    router.push({
      pathname: "/lesson/metroIA",
      params: { mode, mission: mission.id },
    });
  };

  return (
    <ImageBackground source={metroBackground} style={styles.background}>
      <View pointerEvents="none" style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>x</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>{"MISSIONS D'IMMERSION"}</Text>
            <Text style={styles.title}>Métro</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>
            {
              "Lance un vrai trajet dans Séoul, ou entraîne une compétence précise avec une mini-mission."
            }
          </Text>

          <MissionSection
            title="Missions complètes"
            subtitle="Choisis ton trajet réel dans le métro de Séoul."
            missions={completeMissions}
            hasPremiumAccess={hasPremiumAccess}
            onOpenMission={openMission}
            featured
          />

          <MissionSection
            title="Mini-missions ciblées"
            subtitle="Des scènes courtes, chacune centrée sur une seule compétence."
            missions={miniMissions}
            hasPremiumAccess={hasPremiumAccess}
            onOpenMission={openMission}
            compact
          />
        </ScrollView>

        <MissionLaunchModal
          visible={!!selectedMission}
          mission={selectedMission}
          accent={CYAN}
          onCancel={() => setSelectedMission(null)}
          onStart={startSelectedMission}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

type MissionSectionProps = {
  title: string;
  subtitle: string;
  missions: MetroMission[];
  hasPremiumAccess: boolean;
  onOpenMission: (mission: MetroMission) => void;
  featured?: boolean;
  compact?: boolean;
};

function MissionSection({
  title,
  subtitle,
  missions,
  hasPremiumAccess,
  onOpenMission,
  featured = false,
  compact = false,
}: MissionSectionProps) {
  if (!missions.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.missionStack}>
        {missions.map((mission) => {
          const isPremium = mission.access === "premium";
          const isLocked = isPremium && !hasPremiumAccess;
          return (
            <Pressable
              key={mission.id}
              accessibilityRole="button"
              accessibilityLabel={`${mission.title}. ${
                isLocked
                  ? "Mission premium verrouillée"
                  : isPremium
                    ? "Mission premium incluse"
                    : "Mission gratuite"
              }. ${mission.subtitle}. ${
                isLocked ? "Ouvre l'écran Premium" : "Ouvre cette mission"
              }`}
              accessibilityHint={
                isLocked
                  ? "Ouvre l'offre Premium"
                  : "Prépare le lancement de cette mission"
              }
              hitSlop={6}
              onPress={() => onOpenMission(mission)}
              style={({ pressed }) => [
                styles.missionCard,
                featured && styles.featuredCard,
                compact && styles.compactCard,
                isPremium && styles.premiumCard,
                pressed && styles.pressedCard,
              ]}
            >
              <View style={styles.cardTop}>
                <MissionAccessBadge
                  access={mission.access}
                  accent={CYAN}
                  featured={featured}
                />
                <Text
                  style={[
                    styles.cardArrow,
                    isLocked && styles.cardArrowPremium,
                  ]}
                >
                  {isLocked ? "Premium" : "Ouvrir"}
                </Text>
              </View>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionSubtitle}>{mission.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG_DEEP, overflow: "hidden" },
  overlay: { ...ABSOLUTE_FILL, backgroundColor: "rgba(5,5,8,0.70)" },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  backText: { color: TXT, fontSize: 18, fontFamily: fonts.bold },
  headerCopy: { flex: 1 },
  kicker: {
    color: CYAN,
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 2.5,
  },
  title: { color: TXT, fontSize: 34, fontFamily: fonts.black, marginTop: 4 },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 42 },
  intro: {
    color: MUTED,
    fontSize: 15,
    fontFamily: fonts.medium,
    lineHeight: 22,
    marginBottom: 18,
  },
  section: { marginTop: 22 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: {
    color: TXT,
    fontSize: 20,
    fontFamily: fonts.bold,
    lineHeight: 26,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 13,
    fontFamily: fonts.medium,
    lineHeight: 19,
    marginTop: 4,
  },
  missionStack: { gap: 12 },
  missionCard: {
    minHeight: 126,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 18,
  },
  featuredCard: {
    minHeight: 146,
    borderColor: "rgba(34,211,238,0.42)",
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  compactCard: {
    minHeight: 112,
    padding: 16,
  },
  premiumCard: { borderColor: SeoulMidnightGlass.colors.premiumBorder },
  pressedCard: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardArrow: {
    color: SOFT,
    fontSize: SeoulMidnightGlass.cta.fontSize,
    fontFamily: fonts.bold,
    letterSpacing: SeoulMidnightGlass.cta.letterSpacing,
  },
  cardArrowPremium: { color: GOLD },
  missionTitle: {
    color: TXT,
    fontSize: 21,
    fontFamily: fonts.bold,
    lineHeight: 27,
  },
  missionSubtitle: {
    color: MUTED,
    fontSize: 14,
    fontFamily: fonts.medium,
    lineHeight: 20,
    marginTop: 7,
  },
});
