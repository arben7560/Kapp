import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Check,
  ChevronRight,
  LockKeyhole,
  Sparkles,
} from "lucide-react-native";
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
const CARD_BACKGROUND_SOURCE = require("../../../assets/images/grammar-card.jpg");

const BG_DEEP = SeoulMidnightGlass.colors.bgDeep;
const TXT = SeoulMidnightGlass.colors.text;
const MUTED = "rgba(241,245,249,0.76)";
const SOFT = "rgba(241,245,249,0.54)";

const GRAMMAR = HubModuleAccents.grammar;
const GRAMMAR_ACCENT = GRAMMAR.base;
const GRAMMAR_LIGHT = "#B8B4E2";
const GRAMMAR_PALE = "#D9D6F3";

const PREMIUM_GOLD = SeoulMidnightGlass.colors.premiumGold;
const PREMIUM_LIGHT = "#FFF1A8";
const PREMIUM_SOFT = "#D8C89A";
const ACTIVE_PEARL = "#E8E3D8";
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
      !grammarProgress.stages[grammarProgress.lastStageId]?.activeSession
        ?.completedAt
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
      <ImageBackground
        source={BACKGROUND_SOURCE}
        style={styles.background}
        resizeMode="cover"
      >
        <BlurView
          intensity={25}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={[
            "rgba(2,3,6,0.40)",
            "rgba(2,3,6,0.63)",
            "rgba(2,3,6,0.93)",
          ]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.ambientGlowTop} pointerEvents="none" />
        <View style={styles.ambientGlowBottom} pointerEvents="none" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View
            style={[
              styles.contentFrame,
              { maxWidth: responsive.maxWidth },
            ]}
          >
            <View style={styles.navHeader}>
              <AppBackButton accessibilityLabel="Retour à l’accueil" />
            </View>

            <GrammarHero
              compact={responsive.isCompact}
              completedStages={completedStages}
            />

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
                    const premiumLocked = !canAccessGrammarStage(
                      stage,
                      isPremium,
                    );
                    const prerequisiteLocked = !access.canOpen;
                    const disabled = prerequisiteLocked && !premiumLocked;
                    const completed =
                      state === "practiced" || state === "mastered";
                    const isCurrent = stageId === nextStageId && !completed;
                    const missingRecommended = access.missingRecommended[0];
                    const conceptForms = stage.conceptIds
                      .slice(0, 3)
                      .map(
                        (conceptId) =>
                          GRAMMAR_CONCEPTS.find(
                            (concept) => concept.id === conceptId,
                          )?.form,
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
                            .map((item) =>
                              prerequisiteLabel(item.prerequisite),
                            )
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
                        style={
                          gridColumns > 1
                            ? { width: gridItemWidth }
                            : undefined
                        }
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

function GrammarHero({
  compact,
  completedStages,
}: {
  compact: boolean;
  completedStages: number;
}) {
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

      <AppText variant="screenTitle" style={styles.heroTitle}>
        Grammaire
      </AppText>

      <AppText variant="bodySecondary" style={styles.heroSubtitle}>
        Construis des phrases naturelles, étape par étape.
      </AppText>

      <View style={styles.heroMetaRow}>
        <View style={styles.levelPill}>
          <Sparkles size={15} strokeWidth={2} color={GRAMMAR_ACCENT} />

          <AppText
            variant="sectionLabel"
            lineContract="singleLine"
            style={styles.levelText}
          >
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
      accessibilityLabel={`${isResume ? "À continuer" : "Prochaine étape"}. Étape ${stage.number}. ${stage.title}. ${stage.communicativeGoal}.`}
      accessibilityHint={
        premiumLocked
          ? "Ouvre l'accès Premium"
          : prerequisiteLocked
            ? "Termine d'abord les prérequis"
            : "Ouvre cette leçon"
      }
      disabled={prerequisiteLocked && !premiumLocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredWrap,
        premiumLocked && styles.featuredWrapPremiumLocked,
        prerequisiteLocked && styles.featuredWrapBlocked,
        pressed && styles.pressablePressed,
      ]}
    >
      <View style={styles.featuredCard}>
        <ImageBackground
          source={CARD_BACKGROUND_SOURCE}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          imageStyle={styles.featuredImage}
          pointerEvents="none"
        />

        <LinearGradient
          colors={[
            "rgba(2,3,6,0.18)",
            "rgba(2,3,6,0.34)",
            "rgba(2,3,6,0.60)",
          ]}
          locations={[0, 0.52, 1]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={
            premiumLocked
              ? [
                  "rgba(253,224,71,0.07)",
                  "rgba(0,0,0,0)",
                  "rgba(2,3,6,0.12)",
                ]
              : [
                  "rgba(119,114,170,0.10)",
                  "rgba(0,0,0,0)",
                  "rgba(2,3,6,0.10)",
                ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.glassTopHairline} />

        <View
          style={[
            styles.featuredGlow,
            premiumLocked && styles.featuredGlowPremiumLocked,
            prerequisiteLocked && styles.featuredGlowBlocked,
          ]}
        />

        <View style={styles.featuredTopRow}>
          <View style={styles.featuredKicker}>
            <View
              style={[
                styles.featuredKickerDot,
                premiumLocked && styles.premiumDotLocked,
                prerequisiteLocked && styles.blockedDot,
              ]}
            />

            <AppText variant="sectionLabel" style={styles.featuredKickerText}>
              {isResume ? "À CONTINUER" : "PROCHAINE ÉTAPE"}
            </AppText>
          </View>

          <View style={styles.featuredTopActions}>
            {blocked ? (
              <View
                style={[
                  styles.featuredPremiumBadgeLocked,
                  prerequisiteLocked && styles.featuredBlockedBadge,
                ]}
              >
                <LockKeyhole
                  size={12}
                  strokeWidth={2}
                  color={premiumLocked ? PREMIUM_GOLD : SOFT}
                />

                <AppText
                  variant="caption"
                  style={
                    premiumLocked
                      ? styles.featuredPremiumTextLocked
                      : styles.featuredBlockedText
                  }
                >
                  {premiumLocked ? "PREMIUM" : "PRÉREQUIS"}
                </AppText>
              </View>
            ) : (
              <View style={styles.featuredAccessBadgeActive}>
                <Check size={11} strokeWidth={2.5} color={ACTIVE_PEARL} />

                <AppText
                  variant="caption"
                  style={styles.featuredAccessTextActive}
                >
                  ACCÈS ACTIF
                </AppText>
              </View>
            )}

            <View
              style={[
                styles.featuredArrow,
                premiumLocked && styles.featuredArrowPremiumLocked,
                prerequisiteLocked && styles.featuredArrowBlocked,
              ]}
            >
              {blocked ? (
                <LockKeyhole
                  size={17}
                  strokeWidth={2}
                  color={premiumLocked ? PREMIUM_GOLD : SOFT}
                />
              ) : (
                <ChevronRight
                  size={19}
                  strokeWidth={2.25}
                  color={GRAMMAR_LIGHT}
                />
              )}
            </View>
          </View>
        </View>

        <AppText variant="caption" style={styles.featuredMicroLabel}>
          ÉTAPE {String(stage.number).padStart(2, "0")} · NIVEAU {level}
        </AppText>

        <View style={styles.featuredContent}>
          <AppText variant="featureTitle" style={styles.featuredTitle}>
            {stage.title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.featuredSubtitle}
          >
            {stage.communicativeGoal}
          </AppText>
        </View>

        <View style={styles.featuredFooter}>
          <AppText
            variant="caption"
            style={[
              styles.featuredFooterLabel,
              premiumLocked && styles.featuredFooterLabelPremiumLocked,
              prerequisiteLocked && styles.featuredFooterLabelBlocked,
            ]}
          >
            {premiumLocked
              ? "DÉBLOQUER PREMIUM"
              : prerequisiteLocked
                ? "PRÉREQUIS À TERMINER"
                : isResume
                  ? "REPRENDRE LA LEÇON"
                  : "COMMENCER LA LEÇON"}
          </AppText>

          <View style={styles.featuredFooterLine}>
            <LinearGradient
              colors={
                premiumLocked
                  ? [PREMIUM_GOLD, PREMIUM_LIGHT, "transparent"]
                  : prerequisiteLocked
                    ? ["rgba(255,255,255,0.22)", "transparent"]
                    : [GRAMMAR_ACCENT, GRAMMAR_LIGHT, "transparent"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <AppText variant="caption" style={styles.featuredProgressText}>
            {Math.round(completion * 100)}%
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

function GrammarSectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <View style={styles.sectionTitleRow}>
          <AppText variant="sectionLabel" style={styles.sectionTitle}>
            {title}
          </AppText>
        </View>

        <AppText variant="caption" style={styles.sectionSubtitle}>
          {subtitle}
        </AppText>
      </View>

      <View style={styles.sectionLineWrap}>
        <View style={styles.sectionLineBase} />

        <LinearGradient
          colors={["transparent", GRAMMAR_ACCENT, GRAMMAR_LIGHT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionLineGlow}
        />
      </View>
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
  const premiumActive = isPremiumStage && !premiumLocked;
  const level = stage.status === "pre-a1" ? "A0" : "A1";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Étape ${stage.number}. ${stage.title}. ${status}. ${helper}`}
      accessibilityHint={
        premiumLocked
          ? "Ouvre l'offre Premium"
          : prerequisiteLocked
            ? "Termine d'abord les prérequis"
            : "Ouvre la leçon"
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.collectionWrap,
        premiumLocked && styles.collectionWrapPremiumLocked,
        premiumActive && styles.collectionWrapPremiumActive,
        prerequisiteLocked && styles.collectionWrapBlocked,
        isCurrent && styles.collectionWrapCurrent,
        completed && styles.collectionWrapCompleted,
        pressed && styles.pressablePressed,
      ]}
    >
      <View style={styles.collectionCard}>
        <ImageBackground
          source={CARD_BACKGROUND_SOURCE}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          imageStyle={styles.collectionImage}
          pointerEvents="none"
        />

        <LinearGradient
          colors={[
            "rgba(2,3,6,0.18)",
            "rgba(2,3,6,0.34)",
            "rgba(2,3,6,0.60)",
          ]}
          locations={[0, 0.52, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={
            premiumLocked
              ? [
                  "rgba(253,224,71,0.06)",
                  "rgba(0,0,0,0)",
                  "rgba(2,3,6,0.10)",
                ]
              : premiumActive
                ? [
                    "rgba(216,200,154,0.04)",
                    "rgba(0,0,0,0)",
                    "rgba(2,3,6,0.09)",
                  ]
                : [
                    "rgba(119,114,170,0.08)",
                    "rgba(0,0,0,0)",
                    "rgba(2,3,6,0.09)",
                  ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View
          style={[
            styles.cardTopHairline,
            premiumLocked && styles.cardTopHairlinePremiumLocked,
            premiumActive && styles.cardTopHairlinePremiumActive,
            completed && styles.cardTopHairlineCompleted,
          ]}
        />

        <View
          style={[
            styles.collectionAmbientGlow,
            premiumLocked && styles.collectionAmbientGlowPremiumLocked,
            premiumActive && styles.collectionAmbientGlowPremiumActive,
            completed && styles.collectionAmbientGlowCompleted,
          ]}
        />

        {isPremiumStage ? (
          <View
            style={[
              styles.premiumRail,
              premiumLocked && styles.premiumRailLocked,
              premiumActive && styles.premiumRailActive,
            ]}
          />
        ) : null}

        <View style={styles.collectionTopRow}>
          <View style={styles.collectionTopMeta}>
            <View style={styles.collectionIdentity}>
              <AppText
                variant="sectionLabel"
                lineContract="singleLine"
                style={[
                  styles.collectionIndex,
                  premiumLocked && styles.collectionIndexPremiumLocked,
                  premiumActive && styles.collectionIndexPremiumActive,
                  completed && styles.collectionIndexCompleted,
                ]}
              >
                ÉTAPE {String(stage.number).padStart(2, "0")} · {level}
              </AppText>

              {isPremiumStage ? (
                <AppText
                  variant="caption"
                  lineContract="singleLine"
                  style={[
                    styles.premiumMicroLabel,
                    premiumLocked && styles.premiumMicroLabelLocked,
                  ]}
                >
                  PREMIUM
                </AppText>
              ) : null}
            </View>

            <GrammarStatusBadge
              status={status}
              premiumLocked={premiumLocked}
              premiumActive={premiumActive}
              prerequisiteLocked={prerequisiteLocked}
              completed={completed}
              isCurrent={isCurrent}
            />
          </View>
        </View>

        <View style={styles.collectionCopy}>
          <AppText variant="cardTitle" style={styles.collectionTitle}>
            {stage.title}
          </AppText>

          <AppText
            variant="bodySecondary"
            tone="muted"
            style={styles.collectionSubtitle}
          >
            {helper}
          </AppText>

          {conceptForms ? (
            <AppText variant="caption" style={styles.conceptForms}>
              {conceptForms}
            </AppText>
          ) : null}
        </View>

        <View style={styles.collectionFooter}>
          <View style={styles.collectionFooterLine} />

          <View
            style={[
              styles.collectionArrow,
              premiumLocked && styles.collectionArrowPremiumLocked,
              premiumActive && styles.collectionArrowPremiumActive,
              prerequisiteLocked && styles.collectionArrowBlocked,
              completed && styles.collectionArrowCompleted,
            ]}
          >
            {premiumLocked || prerequisiteLocked ? (
              <LockKeyhole
                size={15}
                strokeWidth={2}
                color={premiumLocked ? PREMIUM_GOLD : SOFT}
              />
            ) : completed ? (
              <Check size={15} strokeWidth={2.4} color={COMPLETED_MINT} />
            ) : (
              <ChevronRight
                size={17}
                strokeWidth={2.2}
                color={premiumActive ? PREMIUM_SOFT : GRAMMAR_LIGHT}
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function GrammarStatusBadge({
  status,
  premiumLocked,
  premiumActive,
  prerequisiteLocked,
  completed,
  isCurrent,
}: {
  status: string;
  premiumLocked: boolean;
  premiumActive: boolean;
  prerequisiteLocked: boolean;
  completed: boolean;
  isCurrent: boolean;
}) {
  if (premiumLocked) {
    return (
      <View style={styles.premiumBadgeLocked}>
        <LockKeyhole size={10} strokeWidth={2} color={PREMIUM_GOLD} />
        <AppText variant="caption" style={styles.premiumBadgeTextLocked}>
          À DÉBLOQUER
        </AppText>
      </View>
    );
  }

  if (prerequisiteLocked) {
    return (
      <View style={styles.blockedBadge}>
        <LockKeyhole size={10} strokeWidth={2} color={SOFT} />
        <AppText variant="caption" style={styles.blockedBadgeText}>
          À VENIR
        </AppText>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={styles.completedBadge}>
        <Check size={10} strokeWidth={2.5} color={COMPLETED_MINT} />
        <AppText variant="caption" style={styles.completedBadgeText}>
          {status}
        </AppText>
      </View>
    );
  }

  if (premiumActive) {
    return (
      <View style={styles.accessBadgeActive}>
        <Check size={10} strokeWidth={2.5} color={ACTIVE_PEARL} />
        <AppText variant="caption" style={styles.accessBadgeActiveText}>
          {isCurrent ? "EN COURS" : "ACCÈS ACTIF"}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.includedBadge, isCurrent && styles.includedBadgeCurrent]}>
      <View style={[styles.statusDot, isCurrent && styles.currentDotIncluded]} />
      <AppText variant="caption" style={styles.includedBadgeText}>
        {isCurrent ? "EN COURS" : "INCLUSE"}
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
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  background: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: BG_DEEP,
  },

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },

  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },

  pressablePressed: {
    opacity: 0.84,
    transform: [{ scale: 0.992 }],
  },

  glassTopHairline: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    opacity: 0.7,
  },

  ambientGlowTop: {
    position: "absolute",
    top: 120,
    right: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(119,114,170,0.035)",
    boxShadow: "0px 0px 70px rgba(119,114,170,0.07)",
  },

  ambientGlowBottom: {
    position: "absolute",
    top: 680,
    left: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(184,180,226,0.022)",
    boxShadow: "0px 0px 80px rgba(184,180,226,0.045)",
  },

  navHeader: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  hero: {
    paddingHorizontal: 2,
    marginTop: 12,
    marginBottom: 28,
  },

  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 8,
    backgroundColor: GRAMMAR_ACCENT,
    boxShadow: "0px 0px 8px rgba(119,114,170,0.78)",
  },

  heroEyebrow: {
    color: "rgba(221,218,240,0.64)",
    letterSpacing: 1.3,
  },

  heroKorean: {
    color: "rgba(255,248,252,0.98)",
    fontSize: 40,
    lineHeight: 48,
    textShadowColor: "rgba(119,114,170,0.22)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },

  heroKoreanCompact: {
    fontSize: 36,
    lineHeight: 44,
  },

  heroTitle: {
    color: TXT,
    marginTop: -2,
  },

  heroSubtitle: {
    maxWidth: 560,
    marginTop: 8,
    color: MUTED,
  },

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
    borderColor: "rgba(119,114,170,0.28)",
    backgroundColor: "rgba(18,16,29,0.70)",
  },

  levelText: {
    marginLeft: 7,
    color: "rgba(184,180,226,0.90)",
  },

  heroStageCount: {
    color: SOFT,
    textAlign: "right",
  },

  featuredWrap: {
    marginBottom: 8,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GRAMMAR.featuredBorder,
    backgroundColor: "rgba(2,3,6,0.20)",
    boxShadow: `0px 12px 30px ${GRAMMAR.featuredShadow}`,
  },

  featuredWrapPremiumLocked: {
    borderColor: "rgba(253,224,71,0.25)",
    backgroundColor: "rgba(10,9,5,0.18)",
    boxShadow: "0px 12px 32px rgba(253,224,71,0.06)",
  },

  featuredWrapBlocked: {
    borderColor: "rgba(255,255,255,0.10)",
    opacity: 0.72,
  },

  featuredCard: {
    minHeight: 220,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },

  featuredImage: {
    borderRadius: 29,
  },

  featuredGlow: {
    position: "absolute",
    top: -86,
    right: -66,
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.065,
    backgroundColor: GRAMMAR_ACCENT,
    boxShadow: `0px 0px 58px ${GRAMMAR.glow}`,
  },

  featuredGlowPremiumLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.045,
    boxShadow: "0px 0px 58px rgba(253,224,71,0.12)",
  },

  featuredGlowBlocked: {
    backgroundColor: "rgba(255,255,255,0.16)",
    opacity: 0.025,
    boxShadow: "none",
  },

  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18,
  },

  featuredTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  featuredKicker: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(3,6,10,0.62)",
  },

  featuredKickerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 7,
    backgroundColor: GRAMMAR_ACCENT,
  },

  premiumDotLocked: {
    backgroundColor: PREMIUM_GOLD,
  },

  blockedDot: {
    backgroundColor: SOFT,
  },

  featuredKickerText: {
    color: "rgba(241,245,249,0.62)",
  },

  featuredPremiumBadgeLocked: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.28)",
    backgroundColor: "rgba(253,224,71,0.07)",
  },

  featuredBlockedBadge: {
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  featuredPremiumTextLocked: {
    color: PREMIUM_LIGHT,
    letterSpacing: 0.5,
  },

  featuredBlockedText: {
    color: SOFT,
    letterSpacing: 0.45,
  },

  featuredAccessBadgeActive: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(232,227,216,0.19)",
    backgroundColor: "rgba(232,227,216,0.045)",
  },

  featuredAccessTextActive: {
    color: "rgba(232,227,216,0.86)",
    letterSpacing: 0.4,
  },

  featuredArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.32)",
    backgroundColor: "rgba(18,16,29,0.66)",
  },

  featuredArrowPremiumLocked: {
    borderColor: "rgba(253,224,71,0.22)",
    backgroundColor: "rgba(253,224,71,0.04)",
  },

  featuredArrowBlocked: {
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },

  featuredMicroLabel: {
    color: "rgba(184,180,226,0.62)",
    letterSpacing: 0.9,
    marginBottom: 6,
  },

  featuredContent: {
    maxWidth: 600,
  },

  featuredTitle: {
    color: TXT,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.60)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  featuredSubtitle: {
    color: MUTED,
    maxWidth: 560,
    textShadowColor: "rgba(0,0,0,0.70)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  featuredFooter: {
    marginTop: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  featuredFooterLabel: {
    color: "rgba(184,180,226,0.82)",
    letterSpacing: 0.45,
  },

  featuredFooterLabelPremiumLocked: {
    color: PREMIUM_LIGHT,
  },

  featuredFooterLabelBlocked: {
    color: SOFT,
  },

  featuredFooterLine: {
    flex: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0.82,
  },

  featuredProgressText: {
    minWidth: 34,
    color: GRAMMAR_PALE,
    textAlign: "right",
  },

  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },

  sectionCopy: {
    flexShrink: 0,
    maxWidth: "72%",
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  sectionTitle: {
    color: "rgba(241,245,249,0.66)",
    letterSpacing: 1.05,
  },

  sectionSubtitle: {
    marginTop: 3,
    color: "rgba(241,245,249,0.46)",
  },

  sectionLineWrap: {
    flex: 1,
    height: 10,
    position: "relative",
    justifyContent: "center",
    marginBottom: 2,
  },

  sectionLineBase: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  sectionLineGlow: {
    position: "absolute",
    right: 0,
    width: 96,
    height: 1,
    opacity: 0.82,
  },

  grid: {
    gap: 15,
  },

  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },

  collectionWrap: {
    minHeight: 184,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.24)",
    backgroundColor: "rgba(2,3,6,0.22)",
    boxShadow: "0px 10px 24px rgba(0,0,0,0.26)",
  },

  collectionWrapPremiumLocked: {
    borderColor: "rgba(253,224,71,0.18)",
    backgroundColor: "rgba(10,9,5,0.18)",
    boxShadow: "0px 10px 26px rgba(253,224,71,0.035)",
  },

  collectionWrapPremiumActive: {
    borderColor: "rgba(216,200,154,0.105)",
    backgroundColor: "rgba(5,6,7,0.18)",
    boxShadow: "0px 10px 24px rgba(0,0,0,0.28)",
  },

  collectionWrapBlocked: {
    borderColor: "rgba(255,255,255,0.08)",
    opacity: 0.58,
  },

  collectionWrapCurrent: {
    borderColor: "rgba(184,180,226,0.38)",
    boxShadow: "0px 10px 28px rgba(119,114,170,0.08)",
  },

  collectionWrapCompleted: {
    borderColor: "rgba(167,215,196,0.18)",
  },

  collectionCard: {
    flex: 1,
    minHeight: 184,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-start",
  },

  collectionImage: {
    borderRadius: 24,
  },

  cardTopHairline: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    opacity: 0.62,
  },

  cardTopHairlinePremiumLocked: {
    backgroundColor: "rgba(253,224,71,0.28)",
    opacity: 0.72,
  },

  cardTopHairlinePremiumActive: {
    backgroundColor: "rgba(216,200,154,0.14)",
    opacity: 0.58,
  },

  cardTopHairlineCompleted: {
    backgroundColor: "rgba(167,215,196,0.28)",
  },

  premiumRail: {
    position: "absolute",
    top: 18,
    bottom: 18,
    left: 0,
    width: 2,
    borderRadius: 2,
  },

  premiumRailLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.82,
    boxShadow: "0px 0px 10px rgba(253,224,71,0.22)",
  },

  premiumRailActive: {
    backgroundColor: PREMIUM_SOFT,
    opacity: 0.48,
    boxShadow: "0px 0px 6px rgba(216,200,154,0.08)",
  },

  collectionAmbientGlow: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: GRAMMAR_ACCENT,
    opacity: 0.04,
  },

  collectionAmbientGlowPremiumLocked: {
    backgroundColor: PREMIUM_GOLD,
    opacity: 0.035,
  },

  collectionAmbientGlowPremiumActive: {
    backgroundColor: PREMIUM_SOFT,
    opacity: 0.012,
  },

  collectionAmbientGlowCompleted: {
    backgroundColor: COMPLETED_MINT,
    opacity: 0.025,
  },

  collectionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  collectionTopMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
  },

  collectionIdentity: {
    flex: 1,
    minWidth: 0,
  },

  collectionIndex: {
    color: "rgba(214,211,238,0.66)",
    letterSpacing: 0.95,
  },

  collectionIndexPremiumLocked: {
    color: "rgba(255,241,168,0.60)",
  },

  collectionIndexPremiumActive: {
    color: "rgba(216,200,154,0.56)",
  },

  collectionIndexCompleted: {
    color: "rgba(167,215,196,0.72)",
  },

  premiumMicroLabel: {
    marginTop: 3,
    color: "rgba(216,200,154,0.52)",
    fontSize: 10,
    letterSpacing: 0.8,
  },

  premiumMicroLabelLocked: {
    color: "rgba(253,224,71,0.72)",
  },

  includedBadge: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.30)",
    backgroundColor: "rgba(18,16,29,0.76)",
  },

  includedBadgeCurrent: {
    borderColor: "rgba(184,180,226,0.36)",
    backgroundColor: "rgba(25,22,40,0.78)",
  },

  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
    backgroundColor: GRAMMAR_ACCENT,
  },

  currentDotIncluded: {
    backgroundColor: GRAMMAR_LIGHT,
  },

  includedBadgeText: {
    color: "rgba(184,180,226,0.88)",
  },

  premiumBadgeLocked: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(253,224,71,0.26)",
    backgroundColor: "rgba(25,21,7,0.74)",
  },

  premiumBadgeTextLocked: {
    color: PREMIUM_LIGHT,
    letterSpacing: 0.35,
  },

  blockedBadge: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  blockedBadgeText: {
    color: SOFT,
    letterSpacing: 0.35,
  },

  accessBadgeActive: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(232,227,216,0.18)",
    backgroundColor: "rgba(16,16,15,0.74)",
  },

  accessBadgeActiveText: {
    color: "rgba(232,227,216,0.86)",
    fontSize: 10,
    letterSpacing: 0.25,
  },

  completedBadge: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(167,215,196,0.20)",
    backgroundColor: "rgba(167,215,196,0.045)",
  },

  completedBadgeText: {
    color: "rgba(183,226,208,0.88)",
    fontSize: 10,
    letterSpacing: 0.25,
  },

  collectionCopy: {
    marginTop: 18,
    paddingRight: 8,
  },

  collectionTitle: {
    color: TXT,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  collectionSubtitle: {
    marginTop: 5,
    color: "rgba(241,245,249,0.82)",
    maxWidth: 560,
    textShadowColor: "rgba(0,0,0,0.72)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  conceptForms: {
    marginTop: 8,
    color: "rgba(184,180,226,0.64)",
  },

  collectionFooter: {
    marginTop: "auto",
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  collectionFooterLine: {
    flex: 1,
    height: 1,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  collectionArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(119,114,170,0.30)",
    backgroundColor: "rgba(18,16,29,0.78)",
  },

  collectionArrowPremiumLocked: {
    borderColor: "rgba(253,224,71,0.22)",
    backgroundColor: "rgba(25,21,7,0.76)",
  },

  collectionArrowPremiumActive: {
    borderColor: "rgba(216,200,154,0.16)",
    backgroundColor: "rgba(16,16,15,0.76)",
  },

  collectionArrowBlocked: {
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },

  collectionArrowCompleted: {
    borderColor: "rgba(167,215,196,0.20)",
    backgroundColor: "rgba(167,215,196,0.035)",
  },
});
