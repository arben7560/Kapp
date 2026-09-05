import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Check, Sparkles } from "lucide-react-native";
import React from "react";
import {
  ImageBackground,
  type ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../_store";
import {
  consumeMissionMasteryCelebration,
  getMissionMasteryProgress,
  getMissionMasterySceneFromTitle,
  normalizeMissionMasteryMode,
  type MissionMasteryCelebration,
  type MissionMasteryScene,
} from "../../lib/immersion/missionMastery";
import { AppText } from "../app-text";
import { AppBackButton } from "../ui/app-back-button";

type GuidedMissionsHeaderProps = {
  accent: string;
  compact?: boolean;
  intro: string;
  landscape?: boolean;
  onBack?: () => void;
  title: string;
};

const SCENE_BACKGROUNDS: Record<MissionMasteryScene, ImageSourcePropType> = {
  cafe: require("../../assets/images/cafe.jpg"),
  metro: require("../../assets/images/metrobg.jpg"),
  restaurant: require("../../assets/images/restaurant.jpg"),
  aeroport: require("../../assets/images/airport.jpg"),
};

export function GuidedMissionsHeader({
  accent,
  compact = false,
  intro,
  landscape = false,
  onBack,
  title,
}: GuidedMissionsHeaderProps) {
  const params = useLocalSearchParams();
  const { progress, isHydrated } = useStore();
  const scene = getMissionMasterySceneFromTitle(title);
  const mode = normalizeMissionMasteryMode(
    params.mode as string | string[] | undefined,
  );
  const masteryProgress = scene
    ? getMissionMasteryProgress(progress.completed, scene, mode)
    : null;
  const [celebration, setCelebration] =
    React.useState<MissionMasteryCelebration | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (!scene || !isHydrated) return;

      const pending = consumeMissionMasteryCelebration(scene, mode);
      if (!pending) return;

      setCelebration(pending);
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }, [isHydrated, mode, scene]),
  );

  return (
    <>
      <View
        style={[
          styles.root,
          compact && styles.rootCompact,
          landscape && styles.rootLandscape,
        ]}
      >
        <AppBackButton
          accessibilityLabel={`Retour depuis les missions ${title}`}
          onPress={onBack}
          style={[
            styles.backButton,
            compact && styles.backButtonCompact,
            landscape && styles.backButtonLandscape,
          ]}
        />

        <View style={styles.copy}>
          <View
            style={[
              styles.eyebrowRow,
              landscape && styles.eyebrowRowLandscape,
            ]}
          >
            <View style={[styles.eyebrowMarker, { backgroundColor: accent }]} />
            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={{ color: accent }}
            >
              SCÈNE GUIDÉE
            </AppText>
          </View>

          <AppText
            accessibilityRole="header"
            variant="screenTitle"
            tone="strong"
          >
            {title}
          </AppText>

          <AppText
            variant="body"
            tone="muted"
            style={[styles.intro, landscape && styles.introLandscape]}
          >
            {intro}
          </AppText>

          {masteryProgress && masteryProgress.total > 0 ? (
            <View
              accessibilityLabel={`${masteryProgress.completedCount} missions maîtrisées sur ${masteryProgress.total}`}
              style={[
                styles.masteryPanel,
                landscape && styles.masteryPanelLandscape,
                { borderColor: `${accent}30` },
              ]}
            >
              <View style={styles.masteryCopy}>
                <View style={styles.masteryLabelRow}>
                  <Check size={13} strokeWidth={2.4} color={accent} />
                  <AppText
                    variant="sectionLabel"
                    lineContract="singleLine"
                    style={[styles.masteryLabel, { color: accent }]}
                  >
                    MAÎTRISE
                  </AppText>
                </View>
                <AppText variant="caption" style={styles.masteryCount}>
                  {masteryProgress.completedCount} / {masteryProgress.total}{" "}
                  missions maîtrisées
                </AppText>
              </View>

              <View style={styles.masteryDots}>
                {masteryProgress.missionIds.map((missionId) => {
                  const mastered =
                    masteryProgress.masteredMissionIds.includes(missionId);
                  return (
                    <View
                      key={missionId}
                      style={[
                        styles.masteryDot,
                        mastered
                          ? {
                              backgroundColor: accent,
                              borderColor: accent,
                              shadowColor: accent,
                            }
                          : styles.masteryDotPending,
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.divider,
            compact && styles.dividerCompact,
            landscape && styles.dividerLandscape,
          ]}
        >
          <View style={[styles.dividerAccent, { backgroundColor: accent }]} />
          <View style={styles.dividerLine} />
        </View>
      </View>

      {scene ? (
        <MissionMasteryCelebrationModal
          accent={accent}
          background={SCENE_BACKGROUNDS[scene]}
          celebration={celebration}
          completedCount={masteryProgress?.completedCount ?? 0}
          total={masteryProgress?.total ?? 0}
          onContinue={() => setCelebration(null)}
        />
      ) : null}
    </>
  );
}

type MissionMasteryCelebrationModalProps = {
  accent: string;
  background: ImageSourcePropType;
  celebration: MissionMasteryCelebration | null;
  completedCount: number;
  total: number;
  onContinue: () => void;
};

function MissionMasteryCelebrationModal({
  accent,
  background,
  celebration,
  completedCount,
  total,
  onContinue,
}: MissionMasteryCelebrationModalProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isCompactLandscape = isLandscape && height < 440;

  if (!celebration) return null;

  const landscapeHorizontalPadding = Math.max(
    22,
    Math.min(52, Math.round(width * 0.045)),
  );
  const landscapeColumnGap = Math.max(
    22,
    Math.min(56, Math.round(width * 0.04)),
  );
  const landscapeContent = (
    <View
      style={[
        styles.celebrationContent,
        isLandscape && styles.celebrationContentLandscape,
        isLandscape && {
          maxWidth: Math.min(1120, width - landscapeHorizontalPadding * 2),
          paddingHorizontal: landscapeHorizontalPadding,
          gap: landscapeColumnGap,
        },
        isCompactLandscape && styles.celebrationContentLandscapeCompact,
      ]}
    >
      <View
        style={[
          styles.celebrationIdentity,
          isLandscape && styles.celebrationIdentityLandscape,
        ]}
      >
        <View
          style={[
            styles.successHaloOuter,
            isLandscape && styles.successHaloOuterLandscape,
            isCompactLandscape && styles.successHaloOuterLandscapeCompact,
            { borderColor: `${accent}42` },
          ]}
        >
          <View
            style={[
              styles.successHaloInner,
              isLandscape && styles.successHaloInnerLandscape,
              isCompactLandscape && styles.successHaloInnerLandscapeCompact,
              {
                borderColor: `${accent}A8`,
                backgroundColor: `${accent}16`,
                shadowColor: accent,
              },
            ]}
          >
            <View style={styles.successCheck}>
              <Check
                size={isCompactLandscape ? 30 : isLandscape ? 34 : 40}
                strokeWidth={2.6}
                color="#F8FAFC"
              />
            </View>
          </View>
        </View>

        <View style={styles.celebrationEyebrowRow}>
          <Sparkles size={14} strokeWidth={2} color={accent} />
          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={[styles.celebrationEyebrow, { color: accent }]}
          >
            NOUVELLE MAÎTRISE
          </AppText>
        </View>

        <AppText
          accessibilityRole="header"
          variant="screenTitle"
          tone="strong"
          style={styles.celebrationTitle}
        >
          Mission accomplie
        </AppText>

        <AppText variant="body" style={[styles.sceneMeta, { color: accent }]}>
          {celebration.sceneTitle} · {celebration.location}
        </AppText>
      </View>

      <View
        style={[
          styles.celebrationDetails,
          isLandscape && styles.celebrationDetailsLandscape,
        ]}
      >
        <View
          style={[
            styles.masteredMissionCard,
            isLandscape && styles.masteredMissionCardLandscape,
            isCompactLandscape && styles.masteredMissionCardLandscapeCompact,
          ]}
        >
          <AppText
            variant="cardTitle"
            tone="strong"
            style={styles.masteredMissionTitle}
          >
            {celebration.missionTitle}
          </AppText>
          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.masteredMissionObjective}
          >
            {celebration.objective
              ? `Objectif maîtrisé : ${celebration.objective}`
              : "Tu as mené cette situation jusqu’au bout en coréen."}
          </AppText>
        </View>

        {total > 0 ? (
          <View
            style={[
              styles.celebrationProgressRow,
              isLandscape && styles.celebrationProgressRowLandscape,
            ]}
          >
            <AppText variant="caption" style={styles.celebrationProgressLabel}>
              Progression de la scène
            </AppText>
            <AppText
              variant="caption"
              style={[styles.celebrationProgressValue, { color: accent }]}
            >
              {completedCount} / {total} maîtrisées
            </AppText>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continuer vers les missions"
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueButton,
            isLandscape && styles.continueButtonLandscape,
            pressed && styles.continueButtonPressed,
          ]}
        >
          <LinearGradient
            colors={[accent, "#A855F7"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.continueGradient,
              isCompactLandscape && styles.continueGradientLandscapeCompact,
            ]}
          >
            <AppText
              variant="button"
              lineContract="singleLine"
              style={styles.continueLabel}
            >
              Continuer
            </AppText>
          </LinearGradient>
        </Pressable>

        <AppText variant="caption" style={styles.continueHint}>
          Ta progression est enregistrée automatiquement.
        </AppText>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent
      transparent
      visible
      onRequestClose={onContinue}
    >
      <ImageBackground
        source={background}
        resizeMode="cover"
        style={styles.celebrationBackground}
      >
        <BlurView
          intensity={22}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[
            "rgba(2,3,8,0.44)",
            "rgba(2,3,8,0.78)",
            "rgba(2,3,8,0.96)",
          ]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View
          pointerEvents="none"
          style={[
            styles.celebrationGlow,
            isLandscape && styles.celebrationGlowLandscape,
            { backgroundColor: accent },
          ]}
        />

        <SafeAreaView style={styles.celebrationSafe}>
          {isLandscape ? (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.celebrationLandscapeScroll}
            >
              {landscapeContent}
            </ScrollView>
          ) : (
            landscapeContent
          )}
        </SafeAreaView>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 8,
    marginBottom: 26,
  },
  rootCompact: {
    paddingTop: 4,
    marginBottom: 20,
  },
  rootLandscape: {
    paddingTop: 0,
    marginBottom: 0,
  },
  backButton: {
    marginBottom: 28,
  },
  backButtonCompact: {
    marginBottom: 20,
  },
  backButtonLandscape: {
    marginBottom: 16,
  },
  copy: {
    width: "100%",
    maxWidth: 620,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 9,
  },
  eyebrowMarker: {
    width: 4,
    height: 18,
    borderRadius: 999,
  },
  eyebrowRowLandscape: {
    marginBottom: 6,
  },
  intro: {
    maxWidth: 580,
    marginTop: 12,
  },
  introLandscape: {
    marginTop: 8,
  },
  masteryPanel: {
    marginTop: 18,
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(7,9,14,0.56)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  masteryPanelLandscape: {
    marginTop: 12,
    minHeight: 56,
    paddingVertical: 9,
  },
  masteryCopy: {
    flex: 1,
    minWidth: 0,
  },
  masteryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  masteryLabel: {
    color: "rgba(241,245,249,0.86)",
  },
  masteryCount: {
    marginTop: 3,
    color: "rgba(241,245,249,0.75)",
  },
  masteryDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  masteryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 2,
  },
  masteryDotPending: {
    borderColor: "rgba(255,255,255,0.20)",
    backgroundColor: "rgba(255,255,255,0.07)",
    shadowOpacity: 0,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 26,
  },
  dividerCompact: {
    marginTop: 20,
  },
  dividerLandscape: {
    marginTop: 16,
  },
  dividerAccent: {
    width: 44,
    height: 2,
    borderRadius: 999,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  celebrationBackground: {
    flex: 1,
    backgroundColor: "#050508",
  },
  celebrationGlow: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.10,
  },
  celebrationGlowLandscape: {
    top: "2%",
    left: "8%",
    alignSelf: "flex-start",
  },
  celebrationSafe: {
    flex: 1,
    justifyContent: "center",
  },
  celebrationLandscapeScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 14,
  },
  celebrationContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 34,
  },
  celebrationContentLandscape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  celebrationContentLandscapeCompact: {
    paddingVertical: 10,
  },
  celebrationIdentity: {
    width: "100%",
    alignItems: "center",
  },
  celebrationIdentityLandscape: {
    flex: 0.88,
    minWidth: 0,
    justifyContent: "center",
  },
  celebrationDetails: {
    width: "100%",
    alignItems: "center",
  },
  celebrationDetailsLandscape: {
    flex: 1.12,
    minWidth: 0,
    justifyContent: "center",
  },
  successHaloOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "rgba(3,5,10,0.42)",
  },
  successHaloOuterLandscape: {
    width: 94,
    height: 94,
    borderRadius: 47,
    marginBottom: 16,
  },
  successHaloOuterLandscapeCompact: {
    width: 78,
    height: 78,
    borderRadius: 39,
    marginBottom: 11,
  },
  successHaloInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.52,
    shadowRadius: 18,
    elevation: 7,
  },
  successHaloInnerLandscape: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  successHaloInnerLandscapeCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  successCheck: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -2 }],
  },
  celebrationEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  celebrationEyebrow: {
    color: "rgba(241,245,249,0.84)",
  },
  celebrationTitle: {
    textAlign: "center",
  },
  sceneMeta: {
    marginTop: 9,
    textAlign: "center",
  },
  masteredMissionCard: {
    width: "100%",
    marginTop: 26,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "rgba(6,8,13,0.72)",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  masteredMissionCardLandscape: {
    marginTop: 0,
  },
  masteredMissionCardLandscapeCompact: {
    paddingVertical: 14,
  },
  masteredMissionTitle: {
    textAlign: "center",
  },
  masteredMissionObjective: {
    marginTop: 7,
    textAlign: "center",
    color: "rgba(241,245,249,0.76)",
  },
  celebrationProgressRow: {
    width: "100%",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  celebrationProgressRowLandscape: {
    marginTop: 13,
  },
  celebrationProgressLabel: {
    color: "rgba(241,245,249,0.55)",
  },
  celebrationProgressValue: {
    color: "rgba(241,245,249,0.86)",
  },
  continueButton: {
    width: "100%",
    marginTop: 28,
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 6,
  },
  continueButtonLandscape: {
    marginTop: 18,
  },
  continueButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
  continueGradient: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  continueGradientLandscapeCompact: {
    minHeight: 48,
  },
  continueLabel: {
    color: "#FFFFFF",
  },
  continueHint: {
    marginTop: 12,
    color: "rgba(241,245,249,0.48)",
    textAlign: "center",
  },
});
