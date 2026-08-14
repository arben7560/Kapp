import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { GuidedMissionsHeader } from "../../components/immersion/GuidedMissionsHeader";
import { MissionAccessBadge } from "../../components/immersion/MissionAccessBadge";
import { MissionLaunchModal } from "../../components/immersion/MissionLaunchModal";
import { ABSOLUTE_FILL } from "../../constants/layout";
import { SeoulMidnightGlass } from "../../constants/theme";
import {
  metroMissions,
  type MetroMission,
} from "../../data/lesson/metro/metroMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const metroBackground = require("../../assets/images/metrobg.jpg");

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.66)";
const SOFT = "rgba(255,255,255,0.46)";
const LINE = "rgba(255,255,255,0.10)";
const CYAN = "#22D3EE";
const VOCAL_VIOLET = "#A78BFA";
const GOLD = SeoulMidnightGlass.colors.premiumGold;
const COMING_SOON_MISSION_IDS = new Set(["myeongdong-itaewon"]);

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
  const responsive = useResponsiveLayout({ maxWidth: 900 });
  const missionColumns = responsive.getColumns({
    minColumnWidth: 320,
    maxColumns: 2,
    gap: responsive.gridGap,
  });
  const missionItemWidth = responsive.getGridItemWidth(
    missionColumns,
    responsive.gridGap,
  );
  const completeMissions = metroMissions.filter(
    (mission) => mission.missionKind === "complete",
  );
  const miniMissions = metroMissions.filter(
    (mission) => mission.missionKind === "mini",
  );

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }, []);

  const openMission = (mission: MetroMission) => {
    if (COMING_SOON_MISSION_IDS.has(mission.id)) return;

    if (!canOpenImmersionMission(mission, hasPremiumAccess)) {
      router.push("/premium");
      return;
    }
    setSelectedMission(mission);
  };

  const startSelectedMission = () => {
    if (!selectedMission || COMING_SOON_MISSION_IDS.has(selectedMission.id)) {
      return;
    }
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
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View
            style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}
          >
            <GuidedMissionsHeader
              accent={CYAN}
              compact={responsive.isCompact}
              intro="Apprends à te déplacer en métro en immersion"
              onBack={handleBack}
              title="Métro"
            />

            <MissionSection
              title="Missions complètes"
              subtitle="Choisis ton trajet réel dans le métro de Séoul."
              missions={completeMissions}
              hasPremiumAccess={hasPremiumAccess}
              onOpenMission={openMission}
              missionColumns={missionColumns}
              missionItemWidth={missionItemWidth}
              missionGap={responsive.gridGap}
              featured
            />

            <MissionSection
              title="Mini-missions ciblées"
              subtitle="Des scènes courtes, chacune centrée sur une seule compétence."
              missions={miniMissions}
              hasPremiumAccess={hasPremiumAccess}
              onOpenMission={openMission}
              missionColumns={missionColumns}
              missionItemWidth={missionItemWidth}
              missionGap={responsive.gridGap}
              compact
            />
          </View>
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
  missionColumns: number;
  missionItemWidth: number | "100%";
  missionGap: number;
};

function MissionSection({
  title,
  subtitle,
  missions,
  hasPremiumAccess,
  onOpenMission,
  featured = false,
  compact = false,
  missionColumns,
  missionItemWidth,
  missionGap,
}: MissionSectionProps) {
  if (!missions.length) return null;

  return (
    <View style={[styles.section, featured && styles.firstSection]}>
      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          {title}
        </AppText>
        <AppText
          variant="bodySecondary"
          tone="muted"
          style={styles.sectionSubtitle}
        >
          {subtitle}
        </AppText>
      </View>

      <View
        style={[
          styles.missionStack,
          missionColumns > 1 && styles.missionGrid,
          { gap: missionGap },
        ]}
      >
        {missions.map((mission) => {
          const isPremium = mission.access === "premium";
          const isLocked = isPremium && !hasPremiumAccess;
          const isComingSoon = COMING_SOON_MISSION_IDS.has(mission.id);

          return (
            <Pressable
              key={mission.id}
              accessibilityRole="button"
              accessibilityLabel={`${mission.title}. ${
                isComingSoon
                  ? "Mission prochainement disponible"
                  : isLocked
                    ? "Mission premium verrouillée"
                    : isPremium
                      ? "Mission premium incluse"
                      : "Mission gratuite"
              }. ${mission.subtitle}. ${
                isComingSoon
                  ? "Accès temporairement désactivé"
                  : isLocked
                    ? "Ouvre l'écran Premium"
                    : "Ouvre cette mission"
              }`}
              accessibilityHint={
                isComingSoon
                  ? "Cette mission sera disponible prochainement"
                  : isLocked
                    ? "Ouvre l'offre Premium"
                    : "Prépare le lancement de cette mission"
              }
              accessibilityState={{ disabled: isComingSoon }}
              aria-disabled={isComingSoon}
              hitSlop={6}
              disabled={isComingSoon}
              onPress={() => onOpenMission(mission)}
              style={({ pressed }) => [
                styles.missionCard,
                missionColumns > 1 && { width: missionItemWidth },
                featured && styles.featuredCard,
                compact && styles.compactCard,
                isPremium && !isComingSoon && styles.premiumCard,
                isComingSoon && styles.comingSoonCard,
                pressed && !isComingSoon && styles.pressedCard,
              ]}
            >
              <View style={styles.cardTop}>
                {isComingSoon ? (
                  <View pointerEvents="none" style={styles.comingSoonBadge}>
                    <AppText
                      variant="caption"
                      lineContract="singleLine"
                      style={styles.comingSoonBadgeText}
                    >
                      PROCHAINEMENT !
                    </AppText>
                  </View>
                ) : (
                  <MissionAccessBadge
                    access={mission.access}
                    accent={
                      mission.id === "ask-direction" ? VOCAL_VIOLET : CYAN
                    }
                    featured={featured}
                    variant={
                      mission.id === "ask-direction" ? "vocal" : "access"
                    }
                  />
                )}

                <AppText
                  variant="caption"
                  lineContract="singleLine"
                  style={[
                    styles.cardArrow,
                    !isComingSoon && isLocked && styles.cardArrowPremium,
                    isComingSoon && styles.comingSoonStatus,
                  ]}
                >
                  {isComingSoon
                    ? "Indisponible"
                    : isLocked
                      ? "Premium"
                      : "Ouvrir"}
                </AppText>
              </View>

              <AppText
                variant="cardTitle"
                style={[
                  styles.missionTitle,
                  isComingSoon && styles.comingSoonContent,
                ]}
              >
                {mission.title}
              </AppText>
              <AppText
                variant="bodySecondary"
                tone="muted"
                style={[
                  styles.missionSubtitle,
                  isComingSoon && styles.comingSoonContent,
                ]}
              >
                {mission.subtitle}
              </AppText>
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
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },
  content: { paddingTop: 0, paddingBottom: 42 },
  section: { marginTop: 30 },
  firstSection: { marginTop: 0 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: {
    color: TXT,
  },
  sectionSubtitle: {
    color: MUTED,
    marginTop: 4,
  },
  missionStack: { gap: 12 },
  missionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  missionCard: {
    minHeight: 126,
    borderRadius: SeoulMidnightGlass.radii.missionCard,
    overflow: "hidden",
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
  premiumCard: {
    borderColor: SeoulMidnightGlass.colors.premiumBorder,
  },
  comingSoonCard: {
    opacity: 0.78,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(5,5,8,0.82)",
  },
  comingSoonContent: {
    opacity: 0.72,
  },
  pressedCard: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardArrow: {
    color: SOFT,
  },
  cardArrowPremium: {
    color: GOLD,
  },
  comingSoonBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    backgroundColor: "rgba(5,5,8,0.94)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  comingSoonBadgeText: {
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 1.1,
  },
  comingSoonStatus: {
    color: "rgba(255,255,255,0.50)",
  },
  missionTitle: {
    color: TXT,
  },
  missionSubtitle: {
    color: MUTED,
    marginTop: 7,
  },
});
