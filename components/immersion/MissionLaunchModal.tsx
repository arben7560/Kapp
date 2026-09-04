import React from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

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

type LandscapeSpacing = {
  detailGap: number;
  detailMarginTop: number;
};

function DetailList({
  items,
  accent,
  landscapeSpacing,
}: {
  items?: string[];
  accent: string;
  landscapeSpacing?: LandscapeSpacing;
}) {
  if (!items?.length) return null;

  return (
    <View
      style={[
        styles.detailSection,
        landscapeSpacing && {
          gap: landscapeSpacing.detailGap,
          marginTop: landscapeSpacing.detailMarginTop,
        },
      ]}
    >
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
  const { height, width } = useWindowDimensions();
  const isPhoneLandscape = width > height && height <= 600;
  const landscapeProgress = isPhoneLandscape
    ? Math.min(1, Math.max(0, (height - 360) / 240))
    : 1;
  const interpolateLandscape = (compact: number, comfortable: number) =>
    Math.round(compact + (comfortable - compact) * landscapeProgress);
  const landscapeSpacing = isPhoneLandscape
    ? {
        detailGap: interpolateLandscape(5, 8),
        detailMarginTop: interpolateLandscape(8, 14),
      }
    : undefined;
  const landscapeModalHeight = isPhoneLandscape
    ? Math.min(Math.round(height * 0.9), 520)
    : undefined;

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

  const details = (
    <>
      <View
        style={[
          styles.topRow,
          isPhoneLandscape && {
            marginBottom: interpolateLandscape(8, 14),
          },
        ]}
      >
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
        <View
          style={[
            styles.objectiveBox,
            isPhoneLandscape && {
              marginTop: interpolateLandscape(8, 16),
              paddingVertical: interpolateLandscape(9, 13),
            },
          ]}
        >
          <AppText variant="body" tone="muted">
            {mission.objective}
          </AppText>
        </View>
      ) : null}

      <DetailList
        items={highlights}
        accent={accent}
        landscapeSpacing={landscapeSpacing}
      />

      {showImmersionNotice ? (
        <View
          accessibilityRole="summary"
          style={[
            styles.immersionNotice,
            {
              borderColor: `${accent}55`,
              backgroundColor: `${accent}10`,
            },
            isPhoneLandscape && {
              gap: interpolateLandscape(5, 7),
              marginTop: interpolateLandscape(9, 16),
              paddingVertical: interpolateLandscape(9, 13),
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
    </>
  );

  const actions = (
    <DialogActions
      style={[
        styles.actions,
        isPhoneLandscape && {
          gap: interpolateLandscape(8, 10),
          marginTop: interpolateLandscape(10, 16),
        },
      ]}
    >
      <ActionButton
        label="Commencer la mission"
        size="large"
        accentColor={accent}
        onPress={handleStart}
        style={
          isPhoneLandscape
            ? {
                minHeight: interpolateLandscape(44, 50),
                paddingVertical: 0,
              }
            : undefined
        }
      />
      <ActionButton
        label="Annuler"
        variant="secondary"
        onPress={onCancel}
        style={
          isPhoneLandscape
            ? {
                minHeight: interpolateLandscape(44, 48),
                paddingVertical: 0,
              }
            : undefined
        }
      />
    </DialogActions>
  );

  return (
    <AppDialog
      visible={visible}
      onRequestClose={onCancel}
      accentColor={accent}
      accessibilityLabel={`Lancer la mission ${mission.title}`}
      maxHeight={landscapeModalHeight}
      fillAvailableHeight={isPhoneLandscape}
      respectHorizontalSafeArea={isPhoneLandscape}
      scrollable={!isPhoneLandscape}
      contentContainerStyle={[
        styles.cardContent,
        isPhoneLandscape && {
          flex: 1,
          paddingVertical: interpolateLandscape(10, 18),
        },
      ]}
    >
      {isPhoneLandscape ? (
        <>
          <ScrollView
            style={styles.landscapeDetailsScroller}
            contentContainerStyle={styles.landscapeDetailsContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {details}
          </ScrollView>
          {actions}
        </>
      ) : (
        <>
          {details}
          {actions}
        </>
      )}
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    padding: 20,
  },
  landscapeDetailsScroller: {
    flex: 1,
  },
  landscapeDetailsContent: {
    paddingBottom: 2,
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
