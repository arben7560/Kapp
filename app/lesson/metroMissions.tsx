import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { GuidedMissionsHeader } from "../../components/immersion/GuidedMissionsHeader";
import {
  GuidedMissionsScaffold,
  type GuidedMissionsGridLayout,
} from "../../components/immersion/GuidedMissionsScaffold";
import {
  MissionCollectionCard,
  MissionCollectionSectionHeader,
} from "../../components/immersion/MissionCollectionCard";
import { MissionLaunchModal } from "../../components/immersion/MissionLaunchModal";
import { MissionMasteryCardFrame } from "../../components/immersion/MissionMasteryCardFrame";
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

const METRO_CARD_BACKGROUNDS: Record<string, { uri: string }> = {
  "hongik-gangnam": {
    uri: "https://images.pexels.com/photos/32211609/pexels-photo-32211609.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  },
  "myeongdong-itaewon": {
    uri: "https://images.pexels.com/photos/19271594/pexels-photo-19271594.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  },
  "ask-exit": {
    uri: "https://images.pexels.com/photos/31768195/pexels-photo-31768195.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  },
  "ask-transfer": {
    uri: "https://images.pexels.com/photos/31826590/pexels-photo-31826590.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  },
  "ask-time": {
    uri: "https://images.pexels.com/photos/31768200/pexels-photo-31768200.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  },
  "ask-direction": {
    uri: "https://images.pexels.com/photos/31768194/pexels-photo-31768194.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  },
};

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

  const renderMissionCard = (
    mission: MetroMission,
    compact = false,
    itemStyle?: GuidedMissionsGridLayout["itemStyle"],
  ) => {
    const order = metroMissions.findIndex((item) => item.id === mission.id) + 1;
    const background =
      METRO_CARD_BACKGROUNDS[mission.id] ?? metroCardBackground;

    return (
      <MissionMasteryCardFrame
        key={mission.id}
        scene="metro"
        missionId={mission.id}
        accent={CYAN}
        style={itemStyle}
      >
        <MissionCollectionCard
          mission={mission}
          order={order}
          hasPremiumAccess={hasPremiumAccess}
          accent={CYAN}
          background={background}
          compact={compact}
          isVocal={mission.id === METRO_VOCAL_MISSION_ID}
          isComingSoon={COMING_SOON_MISSION_IDS.has(mission.id)}
          onPress={() => openMission(mission)}
        />
      </MissionMasteryCardFrame>
    );
  };

  const isVocalMission = selectedMission?.id === METRO_VOCAL_MISSION_ID;

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
        <GuidedMissionsScaffold
          responsive={responsive}
          renderHeader={(isLandscape) => (
            <GuidedMissionsHeader
              accent={CYAN}
              compact={responsive.isCompact}
              intro="Apprends à te déplacer en métro en immersion"
              landscape={isLandscape}
              onBack={handleBack}
              title="Métro"
            />
          )}
          renderMissions={({ columns, gap, isLandscape, itemStyle }) => (
            <>
            <MissionCollectionSectionHeader
              first
              accent={CYAN}
              landscape={isLandscape}
              title="MISSIONS COMPLÈTES"
              subtitle="Choisis ton trajet réel dans le métro de Séoul."
            />

            <View
              style={[
                styles.missionStack,
                columns > 1 && styles.missionGrid,
                isLandscape && styles.missionStackLandscape,
                { gap },
              ]}
            >
              {completeMissions.map((mission) =>
                renderMissionCard(mission, false, itemStyle),
              )}
            </View>

            <MissionCollectionSectionHeader
              accent={CYAN}
              landscape={isLandscape}
              title="MINI-MISSIONS CIBLÉES"
              subtitle="Des scènes courtes centrées sur une compétence."
            />

            <View
              style={[
                styles.missionStack,
                columns > 1 && styles.missionGrid,
                isLandscape && styles.missionStackLandscape,
                { gap },
              ]}
            >
              {miniMissions.map((mission) =>
                renderMissionCard(mission, true, itemStyle),
              )}
            </View>
            </>
          )}
        />

        <MissionLaunchModal
          visible={!!selectedMission}
          mission={selectedMission}
          accent={CYAN}
          immersionNoticeTitle={isVocalMission ? "IMMERSION RÉELLE" : undefined}
          immersionNoticeBody={
            isVocalMission
              ? "L'agent te répondra de manière naturel, comme un vrai coréen le ferait. Tu n'as pas besoin de tout comprendre et de réussir du premier coup: reviens autant de fois que nécessaire pour te familiariser progressivement avec le scénario."
              : undefined
          }
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
  missionStack: {
    gap: 15,
  },
  missionStackLandscape: {
    alignItems: "flex-start",
  },
  missionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
});
