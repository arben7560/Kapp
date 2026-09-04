import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
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
  cafeMissions,
  type CafeMission,
} from "../../data/lesson/cafe/cafeMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const cafeBackground = require("../../assets/images/cafe.jpg");

const cafeMissionBackgrounds = [
  {
    uri: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  {
    uri: "https://images.pexels.com/photos/29980679/pexels-photo-29980679.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
  {
    uri: "https://images.pexels.com/photos/16815690/pexels-photo-16815690.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  },
] as const;

const BG_DEEP = "#050508";
const PINK = "#F472B6";
const CAFE_VOCAL_MISSION_ID = "order-takeout";

function normalizeMode(rawMode: string | string[] | undefined) {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

export default function CafeMissionsScreen() {
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const { setTrack } = useStore();
  const { hasPremiumAccess } = usePaywall();
  const [selectedMission, setSelectedMission] =
    React.useState<CafeMission | null>(null);
  const responsive = useResponsiveLayout({ maxWidth: 860 });

  const handleBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }, []);

  const openMission = (mission: CafeMission) => {
    if (!canOpenImmersionMission(mission, hasPremiumAccess)) {
      router.push("/premium");
      return;
    }

    setSelectedMission(mission);
  };

  const startSelectedMission = async () => {
    if (!selectedMission) return;

    const mission = selectedMission;
    setSelectedMission(null);

    try {
      await Promise.all([
        setTrack("cafe_ia"),
        saveHomeResumeContext({
          track: "cafe_ia",
          title: mission.title,
          detail: mode === "real" ? "Simulation réelle" : "Simulation guidée",
          route: "/lesson/cafeIA",
          routeParams: {
            mode,
            mission: mission.id,
          },
        }),
      ]);
    } finally {
      router.push({
        pathname: "/lesson/cafeIA",
        params: {
          mode,
          mission: mission.id,
        },
      });
    }
  };

  return (
    <ImageBackground
      source={cafeBackground}
      style={styles.background}
      resizeMode="cover"
    >
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
      <View style={[styles.ambientGlow, { backgroundColor: `${PINK}10` }]} />

      <SafeAreaView style={styles.safe}>
        <GuidedMissionsScaffold
          responsive={responsive}
          renderHeader={(isLandscape) => (
            <GuidedMissionsHeader
              accent={PINK}
              compact={responsive.isCompact}
              intro="Apprends à commander un café en immersion"
              landscape={isLandscape}
              onBack={handleBack}
              title="Café"
            />
          )}
          renderMissions={({ columns, gap, isLandscape, itemStyle }) => (
            <>
            <MissionCollectionSectionHeader
              first
              accent={PINK}
              landscape={isLandscape}
              title="MISSIONS DISPONIBLES"
              subtitle={`${cafeMissions.length} situations à pratiquer`}
            />

            <View
              style={[
                styles.missionStack,
                columns > 1 && styles.missionGrid,
                isLandscape && styles.missionStackLandscape,
                { gap },
              ]}
            >
              {cafeMissions.map((mission, index) => {
                const isVocalMission = mission.id === CAFE_VOCAL_MISSION_ID;
                const cardMission = isVocalMission
                  ? { ...mission, subtitle: "Exprime-toi et commande." }
                  : mission;
                const cardBackground =
                  cafeMissionBackgrounds[index] ?? cafeMissionBackgrounds[0];

                return (
                  <MissionMasteryCardFrame
                    key={mission.id}
                    scene="cafe"
                    missionId={mission.id}
                    accent={PINK}
                    style={itemStyle}
                  >
                    <MissionCollectionCard
                      mission={cardMission}
                      order={index + 1}
                      hasPremiumAccess={hasPremiumAccess}
                      accent={PINK}
                      background={cardBackground}
                      isVocal={isVocalMission}
                      onPress={() => openMission(mission)}
                    />
                  </MissionMasteryCardFrame>
                );
              })}
            </View>
            </>
          )}
        />

        <MissionLaunchModal
          visible={!!selectedMission}
          mission={selectedMission}
          accent={PINK}
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
    top: 260,
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
