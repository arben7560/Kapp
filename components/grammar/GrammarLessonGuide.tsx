import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import type { GrammarLessonGuide as GrammarLessonGuideData } from "../../data/grammar/lessonGuides";
import { ABSOLUTE_FILL } from "../../constants/layout";
import { SeoulMidnightGlass } from "../../constants/theme";
import { AppText } from "../app-text";

const ACCENT = "#2DD4BF";

type GrammarLessonGuideProps = {
  guide: GrammarLessonGuideData;
  isTablet: boolean;
};

export function GrammarLessonGuide({
  guide,
  isTablet,
}: GrammarLessonGuideProps) {
  return (
    <View style={styles.guideStack}>
      <BlurView intensity={54} tint="dark" style={styles.introductionCard}>
        <LinearGradient
          colors={["rgba(45,212,191,0.15)", "rgba(255,255,255,0.025)"]}
          style={ABSOLUTE_FILL}
        />
        <AppText variant="sectionLabel" tone="soft">L’IDÉE ESSENTIELLE</AppText>
        <AppText variant="body">{guide.introduction}</AppText>
      </BlurView>

      <View style={styles.mainRuleCard}>
        <AppText variant="sectionLabel" style={styles.accentText}>
          RÈGLE PRINCIPALE
        </AppText>
        <AppText variant="bodyStrong">{guide.mainRule}</AppText>
      </View>

      <BlurView intensity={58} tint="dark" style={styles.formulaCard}>
        <AppText variant="sectionLabel" style={styles.accentText}>LA FORMULE</AppText>
        <View style={styles.formulaPattern}>
          <AppText variant="cardTitle" align="center">
            {guide.formula.pattern}
          </AppText>
        </View>
        <AppText variant="bodySecondary" tone="muted">
          {guide.formula.explanation}
        </AppText>
      </BlurView>

      <View style={[styles.learningGrid, isTablet && styles.learningGridTablet]}>
        <View style={[styles.learningColumn, isTablet && styles.learningColumnTablet]}>
          <AppText variant="sectionLabel" tone="soft">ÉTAPE PAR ÉTAPE</AppText>
          <View style={styles.stepsCard}>
            {guide.steps.map((step, index) => (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <AppText variant="caption" style={styles.accentText} align="center">
                    {index + 1}
                  </AppText>
                </View>
                <View style={styles.stepCopy}>
                  <AppText variant="bodyStrong">{step.title}</AppText>
                  <AppText variant="bodySecondary" tone="muted">
                    {step.explanation}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.learningColumn, isTablet && styles.learningColumnTablet]}>
          <AppText variant="sectionLabel" tone="soft">ERREURS FRÉQUENTES</AppText>
          <View style={styles.mistakesCard}>
            {guide.commonMistakes.map((item) => (
              <View key={item.mistake} style={styles.mistakeRow}>
                <AppText aria-hidden variant="bodyStrong" style={styles.mistakeMark}>×</AppText>
                <View style={styles.stepCopy}>
                  <AppText variant="bodySecondary">{item.mistake}</AppText>
                  <AppText variant="bodySecondary" style={styles.correctionText}>
                    {item.correction}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.examplesSection}>
        <AppText variant="sectionLabel" tone="soft">EXEMPLES DÉCOMPOSÉS</AppText>
        {guide.examples.map((example) => (
          <BlurView
            key={example.korean}
            intensity={48}
            tint="dark"
            style={styles.exampleCard}
          >
            <AppText variant="koreanPrimary" script="korean">
              {example.korean}
            </AppText>
            <AppText variant="bodySecondary" tone="muted">
              {example.french}
            </AppText>
            <View style={styles.exampleParts}>
              {example.parts.map((part, index) => (
                <View key={`${part.korean}-${index}`} style={styles.examplePart}>
                  <AppText variant="koreanSecondary" script="korean" style={styles.accentText}>
                    {part.korean}
                  </AppText>
                  <AppText variant="caption">{part.french}</AppText>
                  <AppText variant="caption" tone="soft">{part.role}</AppText>
                </View>
              ))}
            </View>
          </BlurView>
        ))}
      </View>

      <View style={styles.memoryCard}>
        <View style={styles.memoryGlyph}>
          <AppText aria-hidden variant="symbol" style={styles.accentText}>◇</AppText>
        </View>
        <View style={styles.stepCopy}>
          <AppText variant="sectionLabel" style={styles.accentText}>ASTUCE MÉMOIRE</AppText>
          <AppText variant="bodySecondary">{guide.memoryTip}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  guideStack: { gap: 18 },
  accentText: { color: ACCENT },
  introductionCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.26)",
    padding: 20,
    gap: 9,
    overflow: "hidden",
  },
  mainRuleCard: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.035)",
    padding: 16,
    gap: 7,
  },
  formulaCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: SeoulMidnightGlass.colors.glassSurface,
    padding: 18,
    gap: 10,
    overflow: "hidden",
  },
  formulaPattern: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.22)",
    backgroundColor: "rgba(45,212,191,0.075)",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  learningGrid: { gap: 18 },
  learningGridTablet: { flexDirection: "row", alignItems: "flex-start" },
  learningColumn: { gap: 10 },
  learningColumnTablet: { flex: 1 },
  stepsCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.035)",
    padding: 16,
    gap: 16,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.34)",
    backgroundColor: "rgba(45,212,191,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCopy: { flex: 1, minWidth: 0, gap: 3 },
  mistakesCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(253,164,175,0.18)",
    backgroundColor: "rgba(253,164,175,0.045)",
    padding: 16,
    gap: 16,
  },
  mistakeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  mistakeMark: { color: "#FDA4AF" },
  correctionText: { color: "rgba(134,239,172,0.9)" },
  examplesSection: { gap: 10 },
  exampleCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 18,
    gap: 7,
    overflow: "hidden",
  },
  exampleParts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 7,
  },
  examplePart: {
    minWidth: 112,
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.17)",
    backgroundColor: "rgba(45,212,191,0.055)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 1,
  },
  memoryCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.24)",
    backgroundColor: "rgba(45,212,191,0.07)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  memoryGlyph: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(45,212,191,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
});
