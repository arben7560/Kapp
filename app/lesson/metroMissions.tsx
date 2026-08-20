import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { GuidedMissionsHeader } from "../../components/immersion/GuidedMissionsHeader";
import {
  MissionCollectionCard,
  MissionCollectionSectionHeader,
} from "../../components/immersion/MissionCollectionCard";
import { MissionLaunchModal } from "../../components/immersion/MissionLaunchModal";
import {
  metroMissions,
  type MetroMission,
} from "../../data/lesson/metro/metroMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const metroBackground = require("../../assets/images/metrobg.jpg");
const metroCardBackground = require("../../assets/images/metroIA.jpg");

const BG_DEEP = "#050508";
const CYAN = "#22D3EE";
const METRO_VOCAL_MISSION_ID = "ask-direction";
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

  const startSelectedMission = async () => {
    if (!selectedMission || COMING_SOON_MISSION_IDS.has(selectedMission.id)) {
      return;
    }

    const mission = selectedMission;
    setSelectedMission(null);

    try {
      await Promise.all([
        setTrack("metro_ia"),
        saveHomeResumeContext({
          track: "metro_ia",
          title: mission.title,
          detail: mode === "real" ? "Simulation réelle" : "Simulation guidée",
          route: "/lesson/metroIA",
          routeParams: { mode, mission: mission.id },
        }),
      ]);
    } finally {
      router.push({
        pathname: "/lesson/metroIA",
        params: { mode, mission: mission.id },
      });
    }
  };

  const renderMissionCard = (mission: MetroMission, compact = false) => {
    const order = metroMissions.findIndex((item) => item.id === mission.id) + 1;

    return (
      <MissionCollectionCard
        key={mission.id}
        mission={mission}
        order={order}
        hasPremiumAccess={hasPremiumAccess}
        accent={CYAN}
        background={metroCardBackground}
        compact={compact}
        isVocal={mission.id === METRO_VOCAL_MISSION_ID}
        isComingSoon={COMING_SOON_MISSION_IDS.has(mission.id)}
        onPress={() => openMission(mission)}
        style={missionColumns > 1 ? { width: missionItemWidth } : undefined}
      />
    );
  };

  return (
    <ImageBackground source={metroBackground} style={styles.background}>
      <BlurView
        intensity={22}
        tint="dark"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["rgba(2,3,6,0.42)", "rgba(2,3,6,0.64)", "rgba(2,3,6,0.92)"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.ambientGlow, { backgroundColor: `${CYAN}0E` }]} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
            <GuidedMissionsHeader
              accent={CYAN}
              compact={responsive.isCompact}
              intro="Apprends à te déplacer en métro en immersion"
              onBack={handleBack}
              title="Métro"
            />

            <MissionCollectionSectionHeader
              first
              accent={CYAN}
              title="MISSIONS COMPLÈTES"
              subtitle="Choisis ton trajet réel dans le métro de Séoul."
            />

            <View
              style={[
                styles.missionStack,
                missionColumns > 1 && styles.missionGrid,
                { gap: Math.max(15, responsive.gridGap) },
              ]}
            >
              {completeMissions.map((mission) => renderMissionCard(mission))}
            </View>

            <MissionCollectionSectionHeader
              accent={CYAN}
              title="MINI-MISSIONS CIBLÉES"
              subtitle="Des scènes courtes centrées sur une compétence."
            />

            <View
              style={[
                styles.missionStack,
                missionColumns > 1 && styles.missionGrid,
                { gap: Math.max(15, responsive.gridGap) },
              ]}
            >
              {miniMissions.map((mission) => renderMissionCard(mission, true))}
            </View>
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: BG_DEEP,
    overflow: "hidden",
  },
  ambientGlow: {
    position: "absolute",
    top: 250,
    right: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  safe: {
    flex: 1,
  },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },
  content: {
    paddingTop: 0,
    paddingBottom: 96,
  },
  missionStack: {
    gap: 15,
  },
  missionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
});
