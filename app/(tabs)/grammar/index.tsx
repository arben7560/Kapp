import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Check, ChevronRight, LockKeyhole, Sparkles } from "lucide-react-native";
import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { AppBackButton } from "../../../components/ui/app-back-button";
import { HubModuleAccents, SeoulMidnightGlass } from "../../../constants/theme";
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

const BACKGROUND_SOURCE = require("../../../assets/images/grammar-card.jpg");

const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const MUTED = "rgba(241,245,249,0.76)";
const SOFT = "rgba(241,245,249,0.54)";
const GRAMMAR = HubModuleAccents.grammar;
const GRAMMAR_ACCENT = GRAMMAR.base;
const GRAMMAR_LIGHT = "#B8B4E2";
const PREMIUM_GOLD = SeoulMidnightGlass.colors.premiumGold;
const PREMIUM_LIGHT = "#FFF1A8";
const COMPLETED_MINT = "#A7D7C4";

function getCompletedContentRefs(completed: Record<string, boolean>) {
  return new Set(
    CONTENT_REFS.filter((contentRef) => {
      const normalizedId = contentRef.id
        .replace(/[^a-zA-Z0-9]+/gu, "_")
        .toLowerCase();
      return completed[contentRef.id] || completed[normalizedId];
    }).map((contentRef) => contentRef.id),
  );
}

function prerequisiteLabel(prerequisite: GrammarPrerequisite): string {
  if (prerequisite.kind === "stage") {
    return GRAMMAR_STAGE_BY_ID[prerequisite.stageId].title;
  }
  if (prerequisite.kind === "concept") {
    return (
      GRAMMAR_CONCEPTS.find((concept) => concept.id === prerequisite.conceptId)
        ?.form ?? prerequisite.conceptId
    );
  }
  return (
    CONTENT_REFS.find((contentRef) => contentRef.id === prerequisite.contentRefId)
      ?.title ?? prerequisite.contentRefId
  );
}

export default function GrammarHubScreen() {
  const { progress, setTrack } = useStore();
  const { hasPremiumAccess: isPremium } = usePaywall();
  const responsive = useResponsiveLayout({ maxWidth: 920 });

  const gridColumns = responsive.getColumns({
    minColumnWidth: 330,
    maxColumns: 2,
    gap: responsive.gridGap,
  });
  const gridItemWidth = responsive.getGridItemWidth(
    gridColumns,
    responsive.gridGap,
  );

  const grammarProgress = progress.grammarProgress;
  const completedContentRefs = React.useMemo(
    () => getCompletedContentRefs(progress.completed),
    [progress.completed],
  );
  const completion = getGrammarJourneyCompletion(grammarProgress);
  const completedStages = Math.round(completion * GRAMMAR_STAGE_IDS.length);

  const nextStageId = React.useMemo(() => {
    const resumable =
      grammarProgress.lastStageId &&
      grammarProgress.stages[grammarProgress.lastStageId]?.activeSession &&
      !grammarProgress.stages[grammarProgress.lastStageId]?.activeSession?.completedAt
        ? grammarProgress.lastStageId
        : undefined;

    return (
      resumable ??
      GRAMMAR_STAGE_IDS.find((stageId) => {
        const state = getGrammarStageState(grammarProgress, stageId);
        return state !== "practiced" && state !== "mastered";
      }) ??
      GRAMMAR_STAGE_IDS[0]
    );
  }, [grammarProgress]);

  const nextStage = GRAMMAR_STAGE_BY_ID[nextStageId];
  const nextStageAccess = getGrammarStageAccess(
    grammarProgress,
    nextStageId,
    completedContentRefs,
  );
  const nextStagePremiumLocked = !canAccessGrammarStage(nextStage, isPremium);
  const nextStagePrerequisiteLocked = !nextStageAccess.canOpen;
  const nextStageSession = grammarProgress.stages[nextStageId]?.activeSession;
  const isResume = !!nextStageSession && !nextStageSession.completedAt;

  const openStage = React.useCallback(
    (stageId: GrammarStageId, openTheory = false) => {
      if (!canAccessGrammarStage(GRAMMAR_STAGE_BY_ID[stageId], isPremium)) {
        router.push("/premium");
        return;
      }
      const access = getGrammarStageAccess(
        grammarProgress,
        stageId,
        completedContentRefs,
      );
      if (!access.canOpen) return;
      setTrack("grammar");
      router.push({
        pathname: "/grammar/[stageId]",
        params: openTheory ? { stageId, theory: "open" } : { stageId },
      } as never);
    },
    [completedContentRefs, grammarProgress, isPremium, setTrack],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.background} resizeMode="cover">
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <LinearGradient
          colors={["rgba(2,3,6,0.40)", "rgba(2,3,6,0.63)", "rgba(2,3,6,0.93)"]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
            <View style={styles.navHeader}>
              <AppBackButton accessibilityLabel="Retour à l’accueil" />
            </View>

            <GrammarHero compact={responsive.isCompact} completedStages={completedStages} />

            <AnimatedFragment index={0}>
              <FeaturedGrammarCard
                stageId={nextStageId}
                isResume={isResume}
                premiumLocked={nextStagePremiumLocked}
                prerequisiteLocked={nextStagePrerequisiteLocked}
                completion={completion}
                onPress={() => openStage(nextStageId)}
              />
            </AnimatedFragment>

            {GRAMMAR_CHAPTERS.map((chapter, chapterIndex) => (
              <View key={chapter.id}>
                <GrammarSectionHeader
                  title={`CHAPITRE ${String(chapter.number).padStart(2, "0")} · ${chapter.title}`}
                  subtitle={`${chapter.stageIds.length} étapes · progression A0 → A1`}
                />

                <View
                  style={[
                    styles.grid,
                    gridColumns > 1 && styles.gridWide,
                    { gap: Math.max(15, responsive.gridGap) },
                  ]}
                >
                  {chapter.stageIds.map((stageId, stageIndex) => {
                    const stage = GRAMMAR_STAGE_BY_ID[stageId];
                    const state = getGrammarStageState(grammarProgress, stageId);
                    const access = getGrammarStageAccess(
                      grammarProgress,
                      stageId,
                      completedContentRefs,
                    );
                    const isPremiumStage = stage.access === "premium";
                    const premiumLocked = !canAccessGrammarStage(stage, isPremium);
                    const prerequisiteLocked = !access.canOpen;
                    const disabled = prerequisiteLocked && !premiumLocked;
                    const completed = state === "practiced" || state === "mastered";
                    const isCurrent = stageId === nextStageId && !completed;
                    const missingRecommended = access.missingRecommended[0];
                    const conceptForms = stage.conceptIds
                      .slice(0, 3)
                      .map(
                        (conceptId) =>
                          GRAMMAR_CONCEPTS.find((concept) => concept.id === conceptId)?.form,
                      )
                      .filter(Boolean)
                      .join(" · ");

                    const status = premiumLocked
                      ? "PREMIUM"
                      : prerequisiteLocked
                        ? "À VENIR"
                        : completed
                          ? state === "mastered"
                            ? "MAÎTRISÉE"
                            : "TERMINÉE"
                          : state === "discovered" || isCurrent
                            ? "EN COURS"
                            : "DISPONIBLE";

                    const helper = premiumLocked
                      ? "Inclus avec K-App Premium"
                      : prerequisiteLocked
                        ? `Requis : ${access.missingBlocking
                            .map((item) => prerequisiteLabel(item.prerequisite))
                            .join(", ")}`
                        : missingRecommended
                          ? `Ordre conseillé : après ${prerequisiteLabel(
                              missingRecommended.prerequisite,
                            )}`
                          : stage.communicativeGoal;

                    return (
                      <AnimatedFragment
                        key={stageId}
                        index={1 + chapterIndex * 4 + stageIndex}
                        style={gridColumns > 1 ? { width: gridItemWidth } : undefined}
                      >
                        <GrammarStageCard
                          stageId={stageId}
                          status={status}
                          helper={helper}
                          conceptForms={conceptForms}
                          isPremiumStage={isPremiumStage}
                          premiumLocked={premiumLocked}
                          prerequisiteLocked={prerequisiteLocked}
                          completed={completed}
                          isCurrent={isCurrent}
                          disabled={disabled}
                          onPress={() => openStage(stageId, true)}
                        />
                      </AnimatedFragment>
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

function GrammarHero({ compact, completedStages }: { compact: boolean; completedStages: number }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroEyebrowRow}>
        <View style={styles.heroDot} />
        <AppText variant="sectionLabel" style={styles.heroEyebrow}>
          PARCOURS · GRAMMAIRE
        </AppText>
      </View>

      <AppText
        variant="koreanPrimary"
        script="korean"
        lineContract="singleLine"
        style={[styles.heroKorean, compact && styles.heroKoreanCompact]}
      >
        문법
      </AppText>
      <AppText variant="screenTitle" style={styles.heroTitle}>Grammaire</AppText>
      <AppText variant="bodySecondary" style={styles.heroSubtitle}>
        Construis des phrases naturelles, étape par étape.
      </AppText>

      <View style={styles.heroMetaRow}>
        <View style={styles.levelPill}>
          <Sparkles size={15} strokeWidth={2} color={GRAMMAR_ACCENT} />
          <AppText variant="sectionLabel" lineContract="singleLine" style={styles.levelText}>
            A0 → A1
          </AppText>
        </View>
        <AppText variant="caption" style={styles.heroStageCount}>
          {completedStages} / {GRAMMAR_STAGE_IDS.length} étapes
        </AppText>
      </View>
    </View>
  );
}

function FeaturedGrammarCard({
  stageId,
  isResume,
  premiumLocked,
  prerequisiteLocked,
  completion,
  onPress,
}: {
  stageId: GrammarStageId;
  isResume: boolean;
  premiumLocked: boolean;
  prerequisiteLocked: boolean;
  completion: number;
  onPress: () => void;
}) {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const blocked = premiumLocked || prerequisiteLocked;
  const level = stage.status === "pre-a1" ? "A0" : "A1";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={prerequisiteLocked && !premiumLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredWrap,
        premiumLocked && styles.premiumBorder,
        prerequisiteLocked && styles.blocked,
        pressed && styles.pressablePressed,
      ]}
    >
      <LinearGradient
        colors={["rgba(16,14,30,0.78)", "rgba(7,7,16,0.88)", "rgba(2,3,6,0.94)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredCard}
      >
        <View style={styles.glassGlow} pointerEvents="none" />

        <View style={styles.featuredTopRow}>
          <View style={styles.kicker}>
            <View style={styles.kickerDot} />
            <AppText variant="sectionLabel" style={styles.kickerText}>
              {isResume ? "À CONTINUER" : "PROCHAINE ÉTAPE"}
            </AppText>
          </View>

          <View style={styles.actions}>
            <View style={styles.accessPill}>
              {blocked ? (
                <LockKeyhole size={11} strokeWidth={2} color={premiumLocked ? PREMIUM_GOLD : SOFT} />
              ) : (
                <Check size={11} strokeWidth={2.5} color={GRAMMAR_LIGHT} />
              )}
              <AppText variant="caption" style={styles.accessText}>
                {premiumLocked ? "PREMIUM" : prerequisiteLocked ? "PRÉREQUIS" : "ACCÈS ACTIF"}
              </AppText>
            </View>
            <View style={styles.arrowButton}>
              {blocked ? (
                <LockKeyhole size={17} color={premiumLocked ? PREMIUM_GOLD : SOFT} />
              ) : (
                <ChevronRight size={19} color={GRAMMAR_LIGHT} />
              )}
            </View>
          </View>
        </View>

        <AppText variant="caption" style={styles.stageMeta}>
          ÉTAPE {String(stage.number).padStart(2, "0")} · NIVEAU {level}
        </AppText>
        <AppText variant="featureTitle" style={styles.featuredTitle}>{stage.title}</AppText>
        <AppText variant="bodySecondary" style={styles.featuredSubtitle}>
          {stage.communicativeGoal}
        </AppText>

        <View style={styles.featuredFooter}>
          <AppText variant="caption" style={styles.ctaText}>
            {premiumLocked
              ? "DÉBLOQUER PREMIUM"
              : prerequisiteLocked
                ? "PRÉREQUIS À TERMINER"
                : isResume
                  ? "REPRENDRE LA LEÇON"
                  : "COMMENCER LA LEÇON"}
          </AppText>
          <View style={styles.footerLine} />
          <AppText variant="caption" style={styles.progressText}>
            {Math.round(completion * 100)}%
          </AppText>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function GrammarSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <AppText variant="sectionLabel" style={styles.sectionTitle}>{title}</AppText>
        <AppText variant="caption" style={styles.sectionSubtitle}>{subtitle}</AppText>
      </View>
      <View style={styles.sectionLine} />
    </View>
  );
}

function GrammarStageCard({
  stageId,
  status,
  helper,
  conceptForms,
  isPremiumStage,
  premiumLocked,
  prerequisiteLocked,
  completed,
  isCurrent,
  disabled,
  onPress,
}: {
  stageId: GrammarStageId;
  status: string;
  helper: string;
  conceptForms: string;
  isPremiumStage: boolean;
  premiumLocked: boolean;
  prerequisiteLocked: boolean;
  completed: boolean;
  isCurrent: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const level = stage.status === "pre-a1" ? "A0" : "A1";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stageWrap,
        isCurrent && styles.currentBorder,
        completed && styles.completedBorder,
        premiumLocked && styles.premiumBorder,
        prerequisiteLocked && styles.blocked,
        pressed && styles.pressablePressed,
      ]}
    >
      <LinearGradient
        colors={
          premiumLocked
            ? ["rgba(26,21,8,0.82)", "rgba(7,7,12,0.92)"]
            : ["rgba(17,15,31,0.78)", "rgba(4,5,11,0.92)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stageCard}
      >
        <View style={styles.glassGlowSmall} pointerEvents="none" />

        <View style={styles.stageTopRow}>
          <View style={styles.stageIdentity}>
            <AppText variant="sectionLabel" style={styles.stageIndex}>
              ÉTAPE {String(stage.number).padStart(2, "0")} · {level}
            </AppText>
            {isPremiumStage ? (
              <AppText variant="caption" style={styles.premiumMicro}>PREMIUM</AppText>
            ) : null}
          </View>
          <StatusPill
            status={status}
            premiumLocked={premiumLocked}
            prerequisiteLocked={prerequisiteLocked}
            completed={completed}
            isCurrent={isCurrent}
          />
        </View>

        <AppText variant="cardTitle" style={styles.stageTitle}>{stage.title}</AppText>
        <AppText variant="bodySecondary" style={styles.stageSubtitle}>{helper}</AppText>
        {conceptForms ? (
          <AppText variant="caption" style={styles.conceptForms}>{conceptForms}</AppText>
        ) : null}

        <View style={styles.stageFooter}>
          <View style={styles.footerLine} />
          <View style={styles.smallArrow}>
            {premiumLocked || prerequisiteLocked ? (
              <LockKeyhole size={15} color={premiumLocked ? PREMIUM_GOLD : SOFT} />
            ) : completed ? (
              <Check size={15} color={COMPLETED_MINT} />
            ) : (
              <ChevronRight size={17} color={GRAMMAR_LIGHT} />
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function StatusPill({
  status,
  premiumLocked,
  prerequisiteLocked,
  completed,
  isCurrent,
}: {
  status: string;
  premiumLocked: boolean;
  prerequisiteLocked: boolean;
  completed: boolean;
  isCurrent: boolean;
}) {
  return (
    <View style={styles.statusPill}>
      {premiumLocked || prerequisiteLocked ? (
        <LockKeyhole size={10} color={premiumLocked ? PREMIUM_GOLD : SOFT} />
      ) : completed ? (
        <Check size={10} color={COMPLETED_MINT} />
      ) : (
        <View style={styles.statusDot} />
      )}
      <AppText variant="caption" style={styles.statusText}>
        {premiumLocked ? "À DÉBLOQUER" : prerequisiteLocked ? "À VENIR" : isCurrent ? "EN COURS" : status}
      </AppText>
    </View>
  );
}

function AnimatedFragment({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: StyleProp<ViewStyle>;
}) {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(18), []);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 620,
        delay: index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 720,
        delay: index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, [fadeAnim, index, slideAnim]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG_DEEP },
  background: { flex: 1, overflow: "hidden", backgroundColor: BG_DEEP },
  scrollContent: { paddingTop: 8, paddingBottom: 120 },
  contentFrame: { width: "100%", alignSelf: "center" },
  navHeader: { minHeight: 60, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  pressablePressed: { opacity: 0.86, transform: [{ scale: 0.992 }] },

  hero: { paddingHorizontal: 2, marginTop: 12, marginBottom: 28 },
  heroEyebrowRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 8,
    backgroundColor: GRAMMAR_ACCENT,
    boxShadow: "0px 0px 8px rgba(119,114,170,0.78)",
  },
  heroEyebrow: { color: "rgba(221,218,240,0.64)", letterSpacing: 1.3 },
  heroKorean: {
    color: "rgba(255,248,252,0.98)",
    fontSize: 40,
    lineHeight: 48,
    textShadowColor: "rgba(119,114,170,0.22)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  heroKoreanCompact: { fontSize: 36, lineHeight: 44 },
  heroTitle: { color: TXT, marginTop: -2 },
  heroSubtitle: { maxWidth: 560, marginTop: 8, color: MUTED },
  heroMetaRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  levelPill: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.30)",
    backgroundColor: "rgba(14,12,25,0.62)",
  },
  levelText: { marginLeft: 7, color: "rgba(184,180,226,0.90)" },
  heroStageCount: { color: SOFT, textAlign: "right" },

  featuredWrap: {
    marginBottom: 8,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.52)",
    backgroundColor: "transparent",
    boxShadow: "0px 12px 30px rgba(119,114,170,0.10)",
  },
  featuredCard: { minHeight: 220, padding: 20, overflow: "hidden" },
  glassGlow: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(119,114,170,0.10)",
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18,
  },
  kicker: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(2,3,6,0.42)",
  },
  kickerDot: { width: 5, height: 5, borderRadius: 3, marginRight: 7, backgroundColor: GRAMMAR_ACCENT },
  kickerText: { color: "rgba(241,245,249,0.64)" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  accessPill: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(184,180,226,0.22)",
    backgroundColor: "rgba(12,10,22,0.48)",
  },
  accessText: { color: "rgba(224,221,244,0.82)" },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.34)",
    backgroundColor: "rgba(12,10,22,0.48)",
  },
  stageMeta: { color: "rgba(184,180,226,0.70)", letterSpacing: 0.9, marginBottom: 7 },
  featuredTitle: { color: TXT, marginBottom: 6 },
  featuredSubtitle: { color: MUTED, maxWidth: 560 },
  featuredFooter: { marginTop: 27, flexDirection: "row", alignItems: "center", gap: 12 },
  ctaText: { color: "rgba(184,180,226,0.88)", letterSpacing: 0.45 },
  footerLine: { flex: 1, height: 1, backgroundColor: "rgba(184,180,226,0.28)" },
  progressText: { minWidth: 34, color: "rgba(217,214,243,0.90)", textAlign: "right" },

  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },
  sectionCopy: { flexShrink: 0, maxWidth: "72%" },
  sectionTitle: { color: "rgba(241,245,249,0.66)", letterSpacing: 1.05 },
  sectionSubtitle: { marginTop: 3, color: "rgba(241,245,249,0.46)" },
  sectionLine: {
    flex: 1,
    height: 1,
    marginBottom: 5,
    backgroundColor: "rgba(184,180,226,0.46)",
  },

  grid: { gap: 15 },
  gridWide: { flexDirection: "row", flexWrap: "wrap", alignItems: "stretch" },
  stageWrap: {
    minHeight: 174,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.26)",
    backgroundColor: "transparent",
    boxShadow: "0px 10px 24px rgba(0,0,0,0.24)",
  },
  stageCard: { flex: 1, minHeight: 174, padding: 16, overflow: "hidden" },
  glassGlowSmall: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(119,114,170,0.08)",
  },
  currentBorder: { borderColor: "rgba(184,180,226,0.50)" },
  completedBorder: { borderColor: "rgba(167,215,196,0.20)" },
  premiumBorder: { borderColor: "rgba(253,224,71,0.24)" },
  blocked: { opacity: 0.58 },
  stageTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  stageIdentity: { flex: 1, minWidth: 0 },
  stageIndex: { color: "rgba(214,211,238,0.68)", letterSpacing: 0.95 },
  premiumMicro: { marginTop: 3, color: "rgba(253,224,71,0.72)", fontSize: 10, letterSpacing: 0.8 },
  statusPill: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(184,180,226,0.24)",
    backgroundColor: "rgba(12,10,22,0.50)",
  },
  statusDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: GRAMMAR_LIGHT },
  statusText: { color: "rgba(217,214,243,0.84)" },
  stageTitle: { color: TXT, marginTop: 18 },
  stageSubtitle: { marginTop: 5, color: "rgba(241,245,249,0.80)", maxWidth: 560 },
  conceptForms: { marginTop: 8, color: "rgba(184,180,226,0.66)" },
  stageFooter: { marginTop: "auto", paddingTop: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  smallArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.30)",
    backgroundColor: "rgba(12,10,22,0.48)",
  },
});
