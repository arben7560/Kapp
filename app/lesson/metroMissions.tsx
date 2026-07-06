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

import { MissionLaunchModal } from "../../components/immersion/MissionLaunchModal";
import { ABSOLUTE_FILL } from "../../constants/layout";
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
const GOLD = "#FDE047";

function normalizeMode(rawMode: string | string[] | undefined) {
  const value = Array.isArray(rawMode) ? rawMode[0] : rawMode;
  return value === "real" ? "real" : "guided";
}

export default function MetroMissionsScreen() {
  const params = useLocalSearchParams();
  const mode = normalizeMode(params.mode as string | string[] | undefined);
  const { hasPremiumAccess } = usePaywall();
  const [selectedMission, setSelectedMission] =
    React.useState<MetroMission | null>(null);

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
            <Text style={styles.title}>Metro</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>
            {"Choisis une mission complete. Le trajet reste jouable jusqu'au bout."}
          </Text>
          <View style={styles.missionStack}>
            {metroMissions.map((mission) => {
              const isPremium = mission.access === "premium";
              const isLocked = isPremium && !hasPremiumAccess;
              return (
                <Pressable
                  key={mission.id}
                  onPress={() => openMission(mission)}
                  style={({ pressed }) => [
                    styles.missionCard,
                    isPremium && styles.premiumCard,
                    pressed && styles.pressedCard,
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.badge}>
                      <Text
                        style={[
                          styles.badgeText,
                          isPremium && styles.premiumBadgeText,
                        ]}
                      >
                        {isPremium ? "PREMIUM" : "GRATUIT"}
                      </Text>
                    </View>
                    <Text style={styles.cardArrow}>
                      {isLocked ? "Premium" : "Ouvrir"}
                    </Text>
                  </View>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionSubtitle}>{mission.subtitle}</Text>
                </Pressable>
              );
            })}
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
  background: { flex: 1, backgroundColor: BG_DEEP },
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
  backText: { color: TXT, fontSize: 18, fontWeight: "800" },
  headerCopy: { flex: 1 },
  kicker: {
    color: CYAN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.5,
  },
  title: { color: TXT, fontSize: 34, fontWeight: "900", marginTop: 4 },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 42 },
  intro: { color: MUTED, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  missionStack: { gap: 14 },
  missionCard: {
    minHeight: 126,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 18,
  },
  premiumCard: { borderColor: "rgba(253,224,71,0.34)" },
  pressedCard: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  premiumBadgeText: { color: GOLD },
  cardArrow: { color: SOFT, fontSize: 12, fontWeight: "800" },
  missionTitle: { color: TXT, fontSize: 21, lineHeight: 27, fontWeight: "900" },
  missionSubtitle: { color: MUTED, fontSize: 14, lineHeight: 20, marginTop: 7 },
});
