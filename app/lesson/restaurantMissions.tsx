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
import { MissionMasteryCardFrame } from "../../components/immersion/MissionMasteryCardFrame";
import {
  RESTAURANT_SPEECH_MISSION_ID,
  restaurantMissions,
  type RestaurantMission,
} from "../../data/lesson/restaurant/restaurantMissions";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { saveHomeResumeContext } from "../../lib/homeResume";
import { canOpenImmersionMission } from "../../lib/immersion/missions";
import { usePaywall } from "../../lib/paywall/PaywallProvider";

const restaurantBackground = require("../../assets/images/restaurant.jpg");
const restaurantMissionImage = require("../../assets/images/restaurant.png");

const BG_DEEP = "#050508";
const ORANGE = "#FB923C";

const PEXELS_16_9 = {
  "order-simple":
    "https://images.pexels.com/photos/33873561/pexels-photo-33873561.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  "ask-recommendation":
    "https://images.pexels.com/photos/5774152/pexels-photo-5774152.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  "choose-grill":
    "https://images.pexels.com/photos/36759342/pexels-photo-36759342.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  "add-sides":
    "https://images.pexels.com/photos/31150502/pexels-photo-31150502.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  "pay-receipt":
    "https://images.pexels.com/photos/37594401/pexels-photo-37594401.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
  [RESTAURANT_SPEECH_MISSION_ID]:
    "https://images.pexels.com/photos/31601790/pexels-photo-31601790.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900",
} as const;

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
  const effectiveGap = Math.max(15, responsive.gridGap);
  const missionColumns = responsive.getColumns({
    minColumnWidth: 320,
    maxColumns: 2,
    gap: effectiveGap,
  });
  const missionItemWidth = responsive.getGridItemWidth(
    missionColumns,
    effectiveGap,
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

  const startSelectedMission = async () => {
    if (!selectedMission) return;
    const mission = selectedMission;
    const resolvedMode =
      mission.id === RESTAURANT_SPEECH_MISSION_ID ? "guided" : mode;
    setSelectedMission(null);

    try {
      await Promise.all([
        setTrack("restaurant_ia"),
        saveHomeResumeContext({
          track: "restaurant_ia",
          title: mission.title,
          detail:
            resolvedMode === "real" ? "Simulation réelle" : "Simulation guidée",
          route: "/lesson/restaurantIA",
          routeParams: {
            mode: resolvedMode,
            mission: mission.id,
          },
        }),
      ]);
    } finally {
      router.push({
        pathname: "/lesson/restaurantIA",
        params: {
          mode: resolvedMode,
          mission: mission.id,
        },
      });
    }
  };

  const renderMissionCard = (mission: RestaurantMission, compact = false) => {
    const order =
      restaurantMissions.findIndex((item) => item.id === mission.id) + 1;
    const cardMission =
      mission.id === RESTAURANT_SPEECH_MISSION_ID
        ? { ...mission, subtitle: "Exprime toi et commande" }
        : mission;
    const background =
      mission.id === RESTAURANT_SPEECH_MISSION_ID
        ? restaurantMissionImage
        : {
            uri:
              PEXELS_16_9[mission.id as keyof typeof PEXELS_16_9] ??
              PEXELS_16_9["order-simple"],
          };

    return (
      <MissionMasteryCardFrame
        key={mission.id}
        scene="restaurant"
        missionId={mission.id}
        accent={ORANGE}
        style={missionColumns > 1 ? { width: missionItemWidth } : undefined}
      >
        <MissionCollectionCard
          mission={cardMission}
          order={order}
          hasPremiumAccess={hasPremiumAccess}
          accent={ORANGE}
          background={background}
          compact={compact}
          isVocal={mission.id === RESTAURANT_SPEECH_MISSION_ID}
          onPress={() => openMission(mission)}
        />
      </MissionMasteryCardFrame>
    );
  };

  return (
    <ImageBackground source={restaurantBackground} style={styles.background}>
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
      <View style={[styles.ambientGlow, { backgroundColor: `${ORANGE}0F` }]} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View
            style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}
          >
            <GuidedMissionsHeader
              accent={ORANGE}
              compact={responsive.isCompact}
              intro="Apprends à commander un menu en immersion"
              onBack={handleBack}
              title="Restaurant"
            />

            <MissionCollectionSectionHeader
              first
              accent={ORANGE}
              title="MISSIONS COMPLÈTES"
              subtitle="Des situations du début à la fin du repas."
            />

            <View
              style={[
                styles.missionStack,
                missionColumns > 1 && styles.missionGrid,
                { gap: effectiveGap },
              ]}
            >
              {completeMissions.map((mission) => renderMissionCard(mission))}
            </View>

            <MissionCollectionSectionHeader
              accent={ORANGE}
              title="MINI-MISSIONS CIBLÉES"
              subtitle="Des scènes courtes centrées sur une compétence."
            />

            <View
              style={[
                styles.missionStack,
                missionColumns > 1 && styles.missionGrid,
                { gap: effectiveGap },
              ]}
            >
              {miniMissions.map((mission) => renderMissionCard(mission, true))}
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
