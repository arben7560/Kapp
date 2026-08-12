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
  RESTAURANT_SPEECH_MISSION_ID,
  restaurantMissions,
  type RestaurantMission,
} from "../../data/lesson/restaurant/restaurantMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const restaurantBackground = require("../../assets/images/restaurant.jpg");

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.66)";
const SOFT = "rgba(255,255,255,0.46)";
const LINE = "rgba(255,255,255,0.10)";
const ORANGE = "#FB923C";
const VOCAL_VIOLET = "#A78BFA";
const GOLD = SeoulMidnightGlass.colors.premiumGold;

function normalizeMode(rawMode: string | string[] | undefined) {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

export default function RestaurantMissionsScreen() {
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const { setTrack } = useStore();
  const { hasPremiumAccess } = usePaywall();
  const [selectedMission, setSelectedMission] =
    React.useState<RestaurantMission | null>(null);
  const responsive = useResponsiveLayout({ maxWidth: 860 });
  const missionColumns = responsive.getColumns({
    minColumnWidth: 320,
    maxColumns: 2,
    gap: responsive.gridGap,
  });
  const missionItemWidth = responsive.getGridItemWidth(
    missionColumns,
    responsive.gridGap,
  );
  const completeMissions = restaurantMissions.filter(
    (mission) => mission.missionKind === "complete",
  );
  const miniMissions = restaurantMissions.filter(
    (mission) => mission.missionKind === "mini",
  );

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }, []);

  const openMission = (mission: RestaurantMission) => {
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
    setTrack("restaurant_ia");
    router.push({
      pathname: "/lesson/restaurantIA",
      params: {
        mode:
          mission.id === RESTAURANT_SPEECH_MISSION_ID ? "guided" : mode,
        mission: mission.id,
      },
    });
  };

  return (
    <ImageBackground source={restaurantBackground} style={styles.background}>
      <View pointerEvents="none" style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
          <GuidedMissionsHeader
            accent={ORANGE}
            compact={responsive.isCompact}
            intro="Apprends à commander un menu en immersion"
            onBack={handleBack}
            title="Restaurant"
          />
          <MissionGrid
            missions={completeMissions}
            hasPremiumAccess={hasPremiumAccess}
            missionColumns={missionColumns}
            missionItemWidth={missionItemWidth}
            missionGap={responsive.gridGap}
            onOpenMission={openMission}
          />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="sectionTitle" style={styles.sectionTitle}>
                Mini-missions ciblées
              </AppText>
              <AppText
                variant="bodySecondary"
                tone="muted"
                style={styles.sectionSubtitle}
              >
                Des scènes courtes, chacune centrée sur une seule compétence.
              </AppText>
            </View>

            <MissionGrid
              missions={miniMissions}
              hasPremiumAccess={hasPremiumAccess}
              missionColumns={missionColumns}
              missionItemWidth={missionItemWidth}
              missionGap={responsive.gridGap}
              onOpenMission={openMission}
              compact
            />
          </View>
          </View>
        </ScrollView>

        <MissionLaunchModal
          visible={!!selectedMission}
          mission={selectedMission}
          accent={ORANGE}
          onCancel={() => setSelectedMission(null)}
          onStart={startSelectedMission}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

type MissionGridProps = {
  missions: RestaurantMission[];
  hasPremiumAccess: boolean;
  onOpenMission: (mission: RestaurantMission) => void;
  compact?: boolean;
  missionColumns: number;
  missionItemWidth: number | "100%";
  missionGap: number;
};

function MissionGrid({
  missions,
  hasPremiumAccess,
  onOpenMission,
  compact = false,
  missionColumns,
  missionItemWidth,
  missionGap,
}: MissionGridProps) {
  return (
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
        const isVocal = mission.id === RESTAURANT_SPEECH_MISSION_ID;

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
              missionColumns > 1 && { width: missionItemWidth },
              compact && styles.compactCard,
              isPremium && styles.premiumCard,
              pressed && styles.pressedCard,
            ]}
          >
            <View style={styles.cardTop}>
              <MissionAccessBadge
                access={mission.access}
                accent={isVocal ? VOCAL_VIOLET : ORANGE}
                variant={isVocal ? "vocal" : "access"}
              />
              <AppText
                variant="caption"
                lineContract="singleLine"
                style={[
                  styles.cardArrow,
                  isLocked && styles.cardArrowPremium,
                ]}
              >
                {isLocked ? "Premium" : "Ouvrir"}
              </AppText>
            </View>
            <AppText variant="cardTitle" style={styles.missionTitle}>
              {mission.title}
            </AppText>
            <AppText
              variant="bodySecondary"
              tone="muted"
              style={styles.missionSubtitle}
            >
              {mission.subtitle}
            </AppText>
          </Pressable>
        );
      })}
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
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: TXT },
  sectionSubtitle: { color: MUTED, marginTop: 4 },
  missionStack: { gap: 14 },
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
  },
  cardArrowPremium: { color: GOLD },
  missionTitle: {
    color: TXT,
  },
  missionSubtitle: {
    color: MUTED,
    marginTop: 7,
  },
});
