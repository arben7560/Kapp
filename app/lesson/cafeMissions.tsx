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
  cafeMissions,
  type CafeMission,
} from "../../data/lesson/cafe/cafeMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const cafeBackground = require("../../assets/images/cafe.jpg");
const cafeCardBackground = require("../../assets/images/cafeIA.jpg");

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
  const missionColumns = responsive.getColumns({
    minColumnWidth: 320,
    maxColumns: 2,
    gap: responsive.gridGap,
  });
  const missionItemWidth = responsive.getGridItemWidth(
    missionColumns,
    responsive.gridGap,
  );

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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
            <GuidedMissionsHeader
              accent={PINK}
              compact={responsive.isCompact}
              intro="Apprends à commander un café en immersion"
              onBack={handleBack}
              title="Café"
            />

            <MissionCollectionSectionHeader
              first
              accent={PINK}
              title="MISSIONS DISPONIBLES"
              subtitle={`${cafeMissions.length} situations à pratiquer`}
            />

            <View
              style={[
                styles.missionStack,
                missionColumns > 1 && styles.missionGrid,
                { gap: Math.max(15, responsive.gridGap) },
              ]}
            >
              {cafeMissions.map((mission, index) => (
                <MissionCollectionCard
                  key={mission.id}
                  mission={mission}
                  order={index + 1}
                  hasPremiumAccess={hasPremiumAccess}
                  accent={PINK}
                  background={cafeCardBackground}
                  isVocal={mission.id === CAFE_VOCAL_MISSION_ID}
                  onPress={() => openMission(mission)}
                  style={
                    missionColumns > 1 ? { width: missionItemWidth } : undefined
                  }
                />
              ))}
            </View>
          </View>
        </ScrollView>

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
