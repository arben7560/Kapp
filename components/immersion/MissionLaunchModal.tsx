import React from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "../app-text";
import { ActionButton } from "../ui/action-button";
import { AppDialog, DialogActions } from "../ui/app-dialog";
import type { ImmersionMission } from "../../lib/immersion/missions";
import { MissionAccessBadge } from "./MissionAccessBadge";

const LINE = "rgba(255,255,255,0.12)";
const CYAN = "#22D3EE";

type MissionLaunchModalProps = {
  visible: boolean;
  mission: ImmersionMission | null;
  accent?: string;
  immersionNoticeTitle?: string;
  immersionNoticeBody?: string;
  onCancel: () => void;
  onStart: () => void;
};

function DetailList({ items, accent }: { items?: string[]; accent: string }) {
  if (!items?.length) return null;

  return (
    <View style={styles.detailSection}>
      {items.slice(0, 3).map((item) => (
        <View key={item} style={styles.detailRow}>
          <View style={[styles.detailDot, { backgroundColor: accent }]} />
          <AppText variant="bodySecondary" tone="muted" style={styles.detailText}>
            {item}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export function MissionLaunchModal({
  visible,
  mission,
  accent = CYAN,
  immersionNoticeTitle,
  immersionNoticeBody,
  onCancel,
  onStart,
}: MissionLaunchModalProps) {
  const startLockRef = React.useRef(false);

  React.useEffect(() => {
    if (visible) startLockRef.current = false;
  }, [mission?.id, visible]);

  if (!mission) return null;

  const highlights = mission.goals?.length ? mission.goals : mission.skills;
  const showImmersionNotice = Boolean(immersionNoticeTitle && immersionNoticeBody);
  const handleStart = () => {
    if (startLockRef.current) return;
    startLockRef.current = true;
    onStart();
  };

  return (
    <AppDialog
      visible={visible}
      onRequestClose={onCancel}
      accentColor={accent}
      accessibilityLabel={`Lancer la mission ${mission.title}`}
      contentContainerStyle={styles.cardContent}
    >
      <View style={styles.topRow}>
        <MissionAccessBadge access={mission.access} accent={accent} />

        {mission.duration ? (
          <AppText variant="caption" tone="soft">
            {mission.duration}
          </AppText>
        ) : null}
      </View>

      <AppText accessibilityRole="header" variant="screenTitle">
        {mission.title}
      </AppText>

      {mission.objective ? (
        <View style={styles.objectiveBox}>
          <AppText variant="body" tone="muted">
            {mission.objective}
          </AppText>
        </View>
      ) : null}

      <DetailList items={highlights} accent={accent} />

      {showImmersionNotice ? (
        <View
          accessibilityRole="summary"
          style={[
            styles.immersionNotice,
            {
              borderColor: `${accent}55`,
              backgroundColor: `${accent}10`,
            },
          ]}
        >
          <View style={styles.immersionNoticeHeader}>
            <View style={[styles.immersionNoticeDot, { backgroundColor: accent }]} />
            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={[styles.immersionNoticeTitle, { color: accent }]}
            >
              {immersionNoticeTitle}
            </AppText>
          </View>
          <AppText variant="bodySecondary" style={styles.immersionNoticeBody}>
            {immersionNoticeBody}
          </AppText>
        </View>
      ) : null}

      <DialogActions style={styles.actions}>
        <ActionButton
          label="Commencer la mission"
          size="large"
          accentColor={accent}
          onPress={handleStart}
        />
        <ActionButton label="Annuler" variant="secondary" onPress={onCancel} />
      </DialogActions>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    padding: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  objectiveBox: {
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  detailSection: {
    marginTop: 16,
    gap: 8,
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
    marginTop: 7,
  },
  detailText: {
    flex: 1,
  },
  immersionNotice: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 7,
  },
  immersionNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  immersionNoticeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  immersionNoticeTitle: {
    flex: 1,
    letterSpacing: 0.7,
  },
  immersionNoticeBody: {
    color: "rgba(255,255,255,0.84)",
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
  },
});
