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
  restaurantMissions,
  type RestaurantMission,
} from "../../data/lesson/restaurant/restaurantMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const restaurantBackground = require("../../assets/images/restaurant.png");

const BG_DEEP = "#050508";
const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.66)";
const SOFT = "rgba(255,255,255,0.46)";
const LINE = "rgba(255,255,255,0.10)";
const ORANGE = "#FB923C";
const GOLD = SeoulMidnightGlass.colors.premiumGold;
const fonts = AppFontFamily.outfit;

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
      params: { mode, mission: mission.id },
    });
  };

  return (
    <ImageBackground source={restaurantBackground} style={styles.background}>
      <View pointerEvents="none" style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <View
          style={[
            styles.header,
            styles.contentFrame,
            {
              maxWidth: responsive.maxWidth,
              paddingHorizontal: responsive.horizontalPadding,
            },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>x</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>{"MISSIONS D'IMMERSION"}</Text>
            <Text style={styles.title}>Restaurant</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
          <Text style={styles.intro}>
            Choisis une mission complète. Le paywall apparaît avant la scène.
          </Text>
          <View
            style={[
              styles.missionStack,
              missionColumns > 1 && styles.missionGrid,
              { gap: responsive.gridGap },
            ]}
          >
            {restaurantMissions.map((mission) => {
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
                  onPress={() => openMission(mission)}
                  style={({ pressed }) => [
                    styles.missionCard,
                    missionColumns > 1 && { width: missionItemWidth },
                    isPremium && styles.premiumCard,
                    pressed && styles.pressedCard,
                  ]}
                >
                  <View style={styles.cardTop}>
                    <MissionAccessBadge
                      access={mission.access}
                      accent={ORANGE}
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

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: BG_DEEP, overflow: "hidden" },
  overlay: { ...ABSOLUTE_FILL, backgroundColor: "rgba(5,5,8,0.70)" },
  safe: { flex: 1 },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },
  header: {
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
    color: ORANGE,
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 2.5,
  },
  title: { color: TXT, fontSize: 34, fontFamily: fonts.bold, marginTop: 4 },
  content: { paddingTop: 14, paddingBottom: 42 },
  intro: {
    color: MUTED,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 22,
    marginBottom: 18,
  },
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
    fontFamily: fonts.medium,
    letterSpacing: SeoulMidnightGlass.cta.letterSpacing,
  },
  cardArrowPremium: { color: GOLD },
  missionTitle: {
    color: TXT,
    fontSize: 21,
    fontFamily: fonts.medium,
    lineHeight: 27,
  },
  missionSubtitle: {
    color: MUTED,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
    marginTop: 7,
  },
});
