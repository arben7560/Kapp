import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { AppFontFamily, SeoulMidnightGlass } from "../../constants/theme";
import type { ImmersionMission } from "../../lib/immersion/missions";
import { MissionAccessBadge } from "./MissionAccessBadge";

const TXT = "rgba(255,255,255,0.98)";
const MUTED = "rgba(255,255,255,0.68)";
const SOFT = "rgba(255,255,255,0.48)";
const LINE = "rgba(255,255,255,0.12)";
const CYAN = "#22D3EE";
const fonts = AppFontFamily.outfit;

type MissionLaunchModalProps = {
  visible: boolean;
  mission: ImmersionMission | null;
  accent?: string;
  onCancel: () => void;
  onStart: () => void;
};

function DetailList({ items }: { items?: string[] }) {
  if (!items?.length) return null;

  return (
    <View style={styles.detailSection}>
      {items.slice(0, 3).map((item) => (
        <View key={item} style={styles.detailRow}>
          <View style={styles.detailDot} />
          <Text style={styles.detailText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function MissionLaunchModal({
  visible,
  mission,
  accent = CYAN,
  onCancel,
  onStart,
}: MissionLaunchModalProps) {
  const { height, width } = useWindowDimensions();

  if (!mission) return null;

  const highlights = mission.goals?.length ? mission.goals : mission.skills;
  const isCompact = width <= 380 || height <= 680;
  const cardMaxHeight = Math.max(320, height - (isCompact ? 24 : 48));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.root, isCompact && styles.rootCompact]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <View style={[styles.card, { maxHeight: cardMaxHeight }]}>
          <LinearGradient
            colors={[`${accent}24`, "rgba(255,255,255,0.04)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <ScrollView
            style={styles.cardScroller}
            contentContainerStyle={styles.cardContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topRow}>
              <MissionAccessBadge access={mission.access} accent={accent} />

              {mission.duration ? (
                <Text style={styles.duration}>{mission.duration}</Text>
              ) : null}
            </View>

            <Text style={styles.title}>{mission.title}</Text>
            <Text style={styles.subtitle}>{mission.subtitle}</Text>

            {mission.objective ? (
              <View style={styles.objectiveBox}>
                <Text style={styles.objectiveText}>{mission.objective}</Text>
              </View>
            ) : null}

            <DetailList items={highlights} />

            <View style={styles.actions}>
              <Pressable
                onPress={onStart}
                style={({ pressed }) => [
                  styles.startButton,
                  { backgroundColor: accent },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.startText}>{"Commencer l'immersion"}</Text>
              </Pressable>

              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
    padding: 20,
  },
  rootCompact: {
    padding: 12,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderRadius: SeoulMidnightGlass.radii.card,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(8,10,18,0.98)",
    overflow: "hidden",
  },
  cardScroller: {
    width: "100%",
  },
  cardContent: {
    padding: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  duration: {
    color: SOFT,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  title: {
    color: TXT,
    fontSize: 27,
    lineHeight: 33,
    fontFamily: fonts.bold,
  },
  subtitle: {
    color: MUTED,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 22,
    marginTop: 9,
  },
  objectiveBox: {
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  objectiveText: {
    color: MUTED,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
    marginTop: 6,
  },
  detailSection: {
    marginTop: 16,
    gap: 8,
  },
  detailTitle: {
    color: TXT,
    fontSize: 13,
    fontFamily: fonts.medium,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CYAN,
    marginTop: 7,
  },
  detailText: {
    flex: 1,
    color: MUTED,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  actions: {
    marginTop: 22,
    gap: 10,
  },
  startButton: {
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  startText: {
    color: TXT,
    fontSize: 14,
    fontFamily: fonts.medium,
    letterSpacing: SeoulMidnightGlass.cta.letterSpacing,
    textTransform: "uppercase",
  },
  cancelButton: {
    height: 48,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cancelText: {
    color: MUTED,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
