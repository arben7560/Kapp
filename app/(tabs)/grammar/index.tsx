import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { HubHero } from "../../../components/hub/HubHero";
import { SectionHeader } from "../../../components/hub/SectionHeader";
import { StatusBadge } from "../../../components/ui/status-badge";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { SeoulMidnightGlass } from "../../../constants/theme";
import {
  CONTENT_REFS,
  GRAMMAR_CHAPTERS,
  GRAMMAR_CONCEPTS,
  GRAMMAR_STAGE_BY_ID,
  GRAMMAR_STAGE_IDS,
  type GrammarPrerequisite,
  type GrammarStageId,
} from "../../../data/grammar";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import {
  canAccessGrammarStage,
  getGrammarJourneyCompletion,
  getGrammarStageAccess,
  getGrammarStageState,
} from "../../../lib/grammar";
import { usePaywall } from "../../../lib/paywall/PaywallProvider";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.jpg");
const ACCENT = "#2DD4BF";
const COLORS = SeoulMidnightGlass.colors;

function getCompletedContentRefs(completed: Record<string, boolean>) {
  return new Set(
    CONTENT_REFS.filter((contentRef) => {
      const normalizedId = contentRef.id.replace(/[^a-zA-Z0-9]+/gu, "_").toLowerCase();
      return completed[contentRef.id] || completed[normalizedId];
    }).map((contentRef) => contentRef.id),
  );
}

function prerequisiteLabel(prerequisite: GrammarPrerequisite): string {
  if (prerequisite.kind === "stage") {
    return GRAMMAR_STAGE_BY_ID[prerequisite.stageId].title;
  }
  if (prerequisite.kind === "concept") {
    return GRAMMAR_CONCEPTS.find((concept) => concept.id === prerequisite.conceptId)?.form ?? prerequisite.conceptId;
  }
  return CONTENT_REFS.find((contentRef) => contentRef.id === prerequisite.contentRefId)?.title ?? prerequisite.contentRefId;
}

export default function GrammarHubScreen() {
  const { progress, setTrack } = useStore();
  const { hasPremiumAccess: isPremium } = usePaywall();
  const responsive = useResponsiveLayout({ maxWidth: 960 });
  const grammarProgress = progress.grammarProgress;
  const completedContentRefs = React.useMemo(
    () => getCompletedContentRefs(progress.completed),
    [progress.completed],
  );
  const completion = getGrammarJourneyCompletion(grammarProgress);
  const completedStages = Math.round(completion * GRAMMAR_STAGE_IDS.length);
  const nextStageId = React.useMemo(() => {
    const resumable = grammarProgress.lastStageId &&
      grammarProgress.stages[grammarProgress.lastStageId]?.activeSession &&
      !grammarProgress.stages[grammarProgress.lastStageId]?.activeSession?.completedAt
      ? grammarProgress.lastStageId
      : undefined;
    return resumable ?? GRAMMAR_STAGE_IDS.find((stageId) => {
      const state = getGrammarStageState(grammarProgress, stageId);
      return state !== "practiced" && state !== "mastered";
    }) ?? GRAMMAR_STAGE_IDS[0];
  }, [grammarProgress]);
  const nextStage = GRAMMAR_STAGE_BY_ID[nextStageId];
  const nextStageIsLocked = !canAccessGrammarStage(nextStage, isPremium);

  const openStage = React.useCallback((stageId: GrammarStageId) => {
    if (!canAccessGrammarStage(GRAMMAR_STAGE_BY_ID[stageId], isPremium)) {
      router.push("/premium");
      return;
    }
    const access = getGrammarStageAccess(grammarProgress, stageId, completedContentRefs);
    if (!access.canOpen) return;
    setTrack("grammar");
    router.push({ pathname: "/grammar/[stageId]", params: { stageId } } as never);
  }, [completedContentRefs, grammarProgress, isPremium, setTrack]);

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.background} resizeMode="cover">
        <BlurView intensity={82} tint="dark" style={styles.backgroundBlur} />
        <LinearGradient
          colors={["rgba(2,3,6,0.48)", "rgba(2,3,6,0.9)", "#020306"]}
          locations={[0, 0.55, 1]}
          style={ABSOLUTE_FILL}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.frame, { maxWidth: responsive.maxWidth }]}>
            <View style={styles.navHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour à l’accueil"
                hitSlop={8}
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <AppText aria-hidden variant="screenTitle">‹</AppText>
                <AppText variant="caption">SÉOUL IMMERSION</AppText>
              </Pressable>
            </View>

            <HubHero
              korean="문법"
              title="Grammaire"
              subtitle="Comprendre la structure. Construire. Parler avec justesse."
              badgeLabel={`${completedStages} / ${GRAMMAR_STAGE_IDS.length} ÉTAPES`}
              accentColor={ACCENT}
              animateGlow
            />

            <BlurView intensity={54} tint="dark" style={styles.overviewCard}>
              <LinearGradient
                colors={["rgba(45,212,191,0.16)", "rgba(255,255,255,0.025)"]}
                style={ABSOLUTE_FILL}
              />
              <View style={styles.overviewTop}>
                <View style={styles.overviewCopy}>
                  <AppText variant="sectionLabel" style={styles.accentText}>PARCOURS A0 → A1</AppText>
                  <AppText variant="sectionTitle">Ta prochaine étape</AppText>
                  <AppText variant="bodySecondary" tone="muted">
                    {nextStage.title} · {nextStage.communicativeGoal}
                  </AppText>
                </View>
                <AppText variant="numericValue" style={styles.progressNumber}>{Math.round(completion * 100)}%</AppText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(2, completion * 100)}%` }]} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Continuer avec ${GRAMMAR_STAGE_BY_ID[nextStageId].title}`}
                onPress={() => openStage(nextStageId)}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <AppText variant="button" style={styles.primaryButtonText}>
                  {nextStageIsLocked
                    ? "DÉCOUVRIR PREMIUM"
                    : grammarProgress.stages[nextStageId]?.activeSession &&
                  !grammarProgress.stages[nextStageId]?.activeSession?.completedAt
                    ? "REPRENDRE LA LEÇON"
                    : "COMMENCER LA LEÇON"}
                </AppText>
              </Pressable>
            </BlurView>

            {GRAMMAR_CHAPTERS.map((chapter) => (
              <View key={chapter.id} style={styles.chapter}>
                <SectionHeader title={`${String(chapter.number).padStart(2, "0")} · ${chapter.title}`} />
                <View style={[styles.grid, responsive.isTablet && styles.gridTablet]}>
                  {chapter.stageIds.map((stageId) => {
                    const stage = GRAMMAR_STAGE_BY_ID[stageId];
                    const state = getGrammarStageState(grammarProgress, stageId);
                    const access = getGrammarStageAccess(grammarProgress, stageId, completedContentRefs);
                    const isPremiumStage = stage.access === "premium";
                    const premiumLocked = !canAccessGrammarStage(stage, isPremium);
                    const prerequisiteLocked = !access.canOpen;
                    const locked = premiumLocked || prerequisiteLocked;
                    const disabled = prerequisiteLocked && !premiumLocked;
                    const completed = state === "practiced" || state === "mastered";
                    const missingRecommended = access.missingRecommended[0];
                    const conceptForms = stage.conceptIds
                      .slice(0, 3)
                      .map((conceptId) => GRAMMAR_CONCEPTS.find((concept) => concept.id === conceptId)?.form)
                      .filter(Boolean)
                      .join(" · ");
                    const status = locked
                      ? "VERROUILLÉE"
                      : completed
                        ? state === "mastered" ? "MAÎTRISÉE" : "TERMINÉE"
                        : state === "discovered"
                          ? "EN COURS"
                          : "DISPONIBLE";
                    const helper = premiumLocked
                      ? "Inclus avec K-App Premium"
                      : prerequisiteLocked
                      ? `Requis : ${access.missingBlocking.map((item) => prerequisiteLabel(item.prerequisite)).join(", ")}`
                      : missingRecommended
                        ? `Ordre conseillé : après ${prerequisiteLabel(missingRecommended.prerequisite)}`
                        : stage.communicativeGoal;

                    return (
                      <Pressable
                        key={stageId}
                        accessibilityRole="button"
                        accessibilityLabel={`Étape ${stage.number}. ${stage.title}. ${status}. ${helper}`}
                        accessibilityHint={premiumLocked ? "Ouvre l’offre Premium" : undefined}
                        accessibilityState={{ disabled }}
                        disabled={disabled}
                        onPress={() => openStage(stageId)}
                        style={({ pressed }) => [
                          styles.stagePressable,
                          responsive.isTablet && styles.stageTablet,
                          pressed && styles.pressed,
                          locked && styles.locked,
                        ]}
                      >
                        <BlurView
                          intensity={44}
                          tint="dark"
                          style={[styles.stageCard, isPremiumStage && styles.premiumStageCard]}
                        >
                          <View style={[
                            styles.stageAccent,
                            isPremiumStage && styles.stageAccentPremium,
                            completed && styles.stageAccentCompleted,
                          ]} />
                          <View style={[
                            styles.stageNumber,
                            isPremiumStage && styles.stageNumberPremium,
                          ]}>
                            <AppText
                              variant="label"
                              align="center"
                              style={[
                                styles.stageNumberText,
                                isPremiumStage && styles.premiumText,
                              ]}
                            >
                              {String(stage.number).padStart(2, "0")}
                            </AppText>
                          </View>
                          <View style={styles.stageCopy}>
                            <View style={styles.stageMetaRow}>
                              <AppText variant="sectionLabel" style={locked ? styles.lockedText : completed ? styles.completedText : styles.accentText}>
                                {status}
                              </AppText>
                              <View style={styles.stageAccessRow}>
                                <AppText variant="caption" tone="soft">{stage.status === "pre-a1" ? "A0" : "A1"}</AppText>
                                <StatusBadge
                                  label={isPremiumStage ? "PREMIUM" : "GRATUIT"}
                                  tone={isPremiumStage ? "premium" : "accent"}
                                  appearance="soft"
                                  size="compact"
                                  accentColor={ACCENT}
                                />
                              </View>
                            </View>
                            <AppText variant="cardTitle">{stage.title}</AppText>
                            <AppText variant="bodySecondary" tone="muted">{helper}</AppText>
                            {conceptForms ? (
                              <AppText variant="caption" tone="soft" style={styles.forms}>{conceptForms}</AppText>
                            ) : null}
                          </View>
                          <AppText
                            aria-hidden
                            variant="symbol"
                            style={
                              premiumLocked
                                ? styles.premiumText
                                : locked
                                  ? styles.lockedText
                                  : isPremiumStage
                                    ? styles.premiumText
                                    : styles.arrow
                            }
                          >
                            {locked ? "⌁" : completed ? "✓" : "›"}
                          </AppText>
                        </BlurView>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgDeep },
  background: { flex: 1, backgroundColor: COLORS.bgDeep },
  backgroundBlur: { ...ABSOLUTE_FILL },
  scroll: { paddingTop: 10, paddingBottom: 120 },
  frame: { width: "100%", alignSelf: "center" },
  navHeader: { marginBottom: 12 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  overviewCard: { borderRadius: 24, borderWidth: 1, borderColor: "rgba(45,212,191,0.28)", padding: 20, overflow: "hidden", gap: 16, marginBottom: 28 },
  overviewTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  overviewCopy: { flex: 1, gap: 5 },
  accentText: { color: ACCENT },
  completedText: { color: "#86EFAC" },
  lockedText: { color: "rgba(255,255,255,0.34)" },
  premiumText: { color: COLORS.premiumGold },
  progressNumber: { color: ACCENT },
  progressTrack: { height: 5, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: ACCENT, borderRadius: 999 },
  primaryButton: { minHeight: 50, borderRadius: 15, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, backgroundColor: ACCENT },
  primaryButtonText: { color: "#02110F" },
  chapter: { marginTop: 8, marginBottom: 22 },
  grid: { gap: 10 },
  gridTablet: { flexDirection: "row", flexWrap: "wrap" },
  stagePressable: { width: "100%", borderRadius: 20, overflow: "hidden" },
  stageTablet: { width: "49%", flexGrow: 1 },
  stageCard: { minHeight: 126, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", padding: 16, overflow: "hidden", flexDirection: "row", alignItems: "flex-start", gap: 13 },
  premiumStageCard: { borderColor: COLORS.premiumBorder, backgroundColor: COLORS.premiumSurface },
  stageAccent: { position: "absolute", left: 0, top: 18, bottom: 18, width: 3, backgroundColor: ACCENT, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  stageAccentPremium: { backgroundColor: COLORS.premiumGold },
  stageAccentCompleted: { backgroundColor: "#86EFAC" },
  stageNumber: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "rgba(45,212,191,0.28)", backgroundColor: "rgba(45,212,191,0.08)", alignItems: "center", justifyContent: "center" },
  stageNumberPremium: { borderColor: COLORS.premiumBorder, backgroundColor: COLORS.premiumSurfaceStrong },
  stageNumberText: { color: ACCENT },
  stageCopy: { flex: 1, minWidth: 0, gap: 4 },
  stageMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  stageAccessRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  forms: { marginTop: 4 },
  arrow: { color: ACCENT, opacity: 0.8, alignSelf: "center" },
  locked: { opacity: 0.58 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
});
