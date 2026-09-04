import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ImageBackground,
  type ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import { GuidedMissionsHeader } from "../../components/immersion/GuidedMissionsHeader";
import { GuidedMissionsScaffold } from "../../components/immersion/GuidedMissionsScaffold";
import {
  MissionCollectionCard,
  MissionCollectionSectionHeader,
} from "../../components/immersion/MissionCollectionCard";
import { MissionLaunchModal } from "../../components/immersion/MissionLaunchModal";
import { MissionMasteryCardFrame } from "../../components/immersion/MissionMasteryCardFrame";
import {
  aeroportMissions,
  type AeroportMission,
} from "../../data/lesson/aeroport/aeroportMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const airportBackground = require("../../assets/images/airport.jpg");

const AIRPORT_MISSION_BACKGROUNDS: Record<string, ImageSourcePropType> = {
  "go-seoul-station": {
    uri: "https://images.pexels.com/photos/12940671/pexels-photo-12940671.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  "buy-tmoney": {
    uri: "https://images.pexels.com/photos/19702166/pexels-photo-19702166.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  "choose-arex": {
    uri: "https://images.pexels.com/photos/11308707/pexels-photo-11308707.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  "find-platform": {
    uri: "https://images.pexels.com/photos/31826589/pexels-photo-31826589.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  "lost-help": {
    uri: "https://images.pexels.com/photos/6544060/pexels-photo-6544060.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  "arrival-assistance": {
    uri: "https://images.pexels.com/photos/14335630/pexels-photo-14335630.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
};

const BG_DEEP = "#050508";
const CYAN = "#22D3EE";
const AEROPORT_VOCAL_MISSION_ID = "arrival-assistance";

function normalizeMode(rawMode: string | string[] | undefined) {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

export default function AeroportMissionsScreen() {
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const { setTrack } = useStore();
  const { hasPremiumAccess } = usePaywall();
  const [selectedMission, setSelectedMission] =
    React.useState<AeroportMission | null>(null);
  const responsive = useResponsiveLayout({ maxWidth: 860 });

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }, []);

  const openMission = (mission: AeroportMission) => {
    if (!canOpenImmersionMission(mission, hasPremiumAccess)) {
      router.push("/premium");
      return;
    }

    setSelectedMission(mission);
  };

  const startSelectedMission = async () => {
    if (!selectedMission) return;

    const mission = selectedMission;
    const isVocal = mission.id === AEROPORT_VOCAL_MISSION_ID;
    const resolvedMode = isVocal ? "guided" : mode;

    setSelectedMission(null);

    try {
      await Promise.all([
        setTrack("aeroport_ia"),
        saveHomeResumeContext({
          track: "aeroport_ia",
          title: mission.title,
          detail:
            resolvedMode === "real" ? "Simulation réelle" : "Simulation guidée",
          route: "/lesson/aeroportIA",
          routeParams: {
            mode: resolvedMode,
            mission: mission.id,
          },
        }),
      ]);
    } finally {
      router.push({
        pathname: "/lesson/aeroportIA",
        params: {
          mode: resolvedMode,
          mission: mission.id,
        },
      });
    }
  };

  const isVocalMission = selectedMission?.id === AEROPORT_VOCAL_MISSION_ID;

  return (
    <ImageBackground source={airportBackground} style={styles.background}>
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
              intro="Apprends à rejoindre Séoul depuis l’aéroport en immersion"
              landscape={isLandscape}
              onBack={handleBack}
              title="Aéroport"
            />
          )}
          renderMissions={({ columns, gap, isLandscape, itemStyle }) => (
            <>
            <MissionCollectionSectionHeader
              first
              accent={CYAN}
              landscape={isLandscape}
              title="MISSIONS DISPONIBLES"
              subtitle={`${aeroportMissions.length} situations à pratiquer`}
            />

            <View
              style={[
                styles.missionStack,
                columns > 1 && styles.missionGrid,
                isLandscape && styles.missionStackLandscape,
                { gap },
              ]}
            >
              {aeroportMissions.map((mission, index) => (
                <MissionMasteryCardFrame
                  key={mission.id}
                  scene="aeroport"
                  missionId={mission.id}
                  accent={CYAN}
                  style={itemStyle}
                >
                  <MissionCollectionCard
                    mission={mission}
                    order={index + 1}
                    hasPremiumAccess={hasPremiumAccess}
                    accent={CYAN}
                    background={
                      AIRPORT_MISSION_BACKGROUNDS[mission.id] ?? airportBackground
                    }
                    isVocal={mission.id === AEROPORT_VOCAL_MISSION_ID}
                    onPress={() => openMission(mission)}
                  />
                </MissionMasteryCardFrame>
              ))}
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
              ? "L’agent te répondra de manière naturelle, comme un vrai Coréen le ferait. Tu n’as pas besoin de tout comprendre ni de réussir du premier coup : reviens autant de fois que nécessaire pour te familiariser progressivement avec le scénario."
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
