import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ABSOLUTE_FILL } from "../../constants/layout";
import {
  HubModuleAccents,
  SeoulMidnightGlass,
} from "../../constants/theme";
import type { GrammarLessonGuide as GrammarLessonGuideData } from "../../data/grammar/lessonGuides";
import { AppText } from "../app-text";
import { useGrammarModalLayout } from "./useGrammarModalLayout";

const COLORS = SeoulMidnightGlass.colors;
const GRAMMAR_ACCENT = HubModuleAccents.grammar;
const SUCCESS = "#86EFAC";
const ERROR = "#FDA4AF";

type GrammarLessonGuideProps = {
  guide: GrammarLessonGuideData;
};

type SectionHeadingProps = {
  index: string;
  label: string;
  detail?: string;
};

function SectionHeading({ index, label, detail }: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIndex}>
        <AppText variant="caption" style={styles.accentText} align="center">
          {index}
        </AppText>
      </View>
      <View style={styles.sectionHeadingCopy}>
        <AppText variant="sectionLabel" tone="soft">
          {label}
        </AppText>
        {detail ? (
          <AppText variant="caption" tone="soft">
            {detail}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export function GrammarLessonGuide({
  guide,
}: GrammarLessonGuideProps) {
  const layout = useGrammarModalLayout();

  return (
    <View style={[styles.guideStack, layout.isCompactWidth && styles.guideStackCompact]}>
      <BlurView intensity={62} tint="dark" style={styles.editorialCard}>
        <LinearGradient
          pointerEvents="none"
          colors={[
            GRAMMAR_ACCENT.surfaceStrong,
            GRAMMAR_ACCENT.decorative,
            "rgba(255,255,255,0.015)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={ABSOLUTE_FILL}
        />
        <View style={styles.editorialGlow} />

        <View
          style={[
            styles.editorialLayout,
            layout.useWideLayout && styles.editorialLayoutTablet,
          ]}
        >
          <View style={styles.essentialBlock}>
            <SectionHeading index="01" label="L’IDÉE ESSENTIELLE" />
            <AppText variant={layout.isCompactWidth ? "bodyStrong" : "subtitle"}>
              {guide.introduction}
            </AppText>
          </View>

          <View
            style={[
              styles.editorialDivider,
              layout.useWideLayout && styles.editorialDividerTablet,
            ]}
          />

          <View style={styles.ruleBlock}>
            <View style={styles.ruleMetaRow}>
              <AppText variant="sectionLabel" style={styles.accentText}>
                RÈGLE PRINCIPALE
              </AppText>
              <View style={styles.keyPill}>
                <View style={styles.keyPillDot} />
                <AppText variant="caption" style={styles.accentText}>
                  À RETENIR
                </AppText>
              </View>
            </View>
            <AppText variant="bodyStrong">{guide.mainRule}</AppText>
          </View>
        </View>
      </BlurView>

      <BlurView intensity={58} tint="dark" style={styles.formulaCard}>
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.045)", GRAMMAR_ACCENT.decorative]}
          style={ABSOLUTE_FILL}
        />
        <View style={styles.formulaHeader}>
          <SectionHeading index="02" label="LA FORMULE" />
          <View style={styles.structurePill}>
            <AppText variant="caption" tone="soft">
              STRUCTURE
            </AppText>
          </View>
        </View>

        <View style={styles.formulaPattern}>
          <View style={styles.formulaRail} />
          <AppText
            variant={layout.isCompactWidth ? "cardTitle" : "sectionTitle"}
            align="center"
          >
            {guide.formula.pattern}
          </AppText>
        </View>
        <AppText variant="bodySecondary" tone="muted">
          {guide.formula.explanation}
        </AppText>
      </BlurView>

      <View style={styles.sectionStack}>
        <SectionHeading
          index="03"
          label="ÉTAPE PAR ÉTAPE"
          detail="Une construction en trois mouvements"
        />
        <View
          style={[styles.stepsTrack, layout.useWideLayout && styles.stepsTrackTablet]}
        >
          {guide.steps.map((step, index) => (
            <View
              key={step.title}
              style={[styles.stepCard, layout.useWideLayout && styles.stepCardTablet]}
            >
              <View style={styles.stepTopRow}>
                <View style={styles.stepNumber}>
                  <AppText
                    variant="caption"
                    style={styles.accentText}
                    align="center"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </AppText>
                </View>
                <View style={styles.stepLine} />
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

      <View style={styles.sectionStack}>
        <View style={styles.sectionTitleRow}>
          <SectionHeading
            index="04"
            label="EXEMPLES DÉCOMPOSÉS"
            detail="Lis la phrase comme une architecture"
          />
          <View style={styles.countPill}>
            <AppText variant="caption" style={styles.accentText}>
              {guide.examples.length} EXEMPLES
            </AppText>
          </View>
        </View>

        <View
          style={[styles.examplesGrid, layout.useWideLayout && styles.examplesGridTablet]}
        >
          {guide.examples.map((example, exampleIndex) => (
            <BlurView
              key={example.korean}
              intensity={52}
              tint="dark"
              style={[styles.exampleCard, layout.useWideLayout && styles.exampleCardTablet]}
            >
              <LinearGradient
                pointerEvents="none"
                colors={[
                  GRAMMAR_ACCENT.surface,
                  "rgba(255,255,255,0.018)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.7, y: 1 }}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.exampleHeader}>
                <AppText variant="sectionLabel" style={styles.accentText}>
                  EXEMPLE {String(exampleIndex + 1).padStart(2, "0")}
                </AppText>
                <View style={styles.decompositionMark}>
                  <View style={styles.decompositionDot} />
                  <View style={styles.decompositionDot} />
                  <View style={styles.decompositionDot} />
                </View>
              </View>

              <View style={styles.examplePhrase}>
                <AppText variant="koreanPrimary" script="korean">
                  {example.korean}
                </AppText>
                <AppText variant="bodySecondary" tone="muted">
                  {example.french}
                </AppText>
              </View>

              <View style={styles.exampleDivider} />

              <View style={styles.exampleParts}>
                {example.parts.map((part, index) => (
                  <View
                    key={`${part.korean}-${index}`}
                    style={[
                      styles.examplePart,
                      layout.isCompactWidth && styles.examplePartCompact,
                    ]}
                  >
                    <View style={styles.partTopRow}>
                      <AppText
                        variant="koreanSecondary"
                        script="korean"
                        style={styles.accentText}
                      >
                        {part.korean}
                      </AppText>
                      <AppText variant="caption" tone="soft">
                        {String(index + 1).padStart(2, "0")}
                      </AppText>
                    </View>
                    <AppText variant="caption">{part.french}</AppText>
                    <View style={styles.rolePill}>
                      <AppText variant="caption" tone="soft">
                        {part.role}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          ))}
        </View>
      </View>

      <View style={styles.sectionStack}>
        <SectionHeading
          index="05"
          label="ERREURS FRÉQUENTES"
          detail="Compare le réflexe et la forme juste"
        />
        <View
          style={[
            styles.comparisonGrid,
            layout.useWideLayout && styles.comparisonGridTablet,
          ]}
        >
          {guide.commonMistakes.map((item, index) => (
            <View
              key={item.mistake}
              style={[
                styles.comparisonCard,
                layout.useWideLayout && styles.comparisonCardTablet,
              ]}
            >
              <View style={styles.mistakePanel}>
                <View style={styles.comparisonLabelRow}>
                  <View style={[styles.comparisonGlyph, styles.errorGlyph]}>
                    <AppText
                      aria-hidden
                      variant="caption"
                      style={styles.errorText}
                      align="center"
                    >
                      ×
                    </AppText>
                  </View>
                  <AppText variant="sectionLabel" style={styles.errorText}>
                    À ÉVITER
                  </AppText>
                  <AppText variant="caption" tone="soft">
                    {String(index + 1).padStart(2, "0")}
                  </AppText>
                </View>
                <AppText variant="bodySecondary">{item.mistake}</AppText>
              </View>

              <View style={styles.comparisonTransition}>
                <View style={styles.transitionLine} />
                <View style={styles.transitionArrow}>
                  <AppText
                    aria-hidden
                    variant="caption"
                    style={styles.accentText}
                    align="center"
                  >
                    ↓
                  </AppText>
                </View>
                <View style={styles.transitionLine} />
              </View>

              <View style={styles.correctionPanel}>
                <View style={styles.comparisonLabelRow}>
                  <View style={[styles.comparisonGlyph, styles.successGlyph]}>
                    <AppText
                      aria-hidden
                      variant="caption"
                      style={styles.successText}
                      align="center"
                    >
                      ✓
                    </AppText>
                  </View>
                  <AppText variant="sectionLabel" style={styles.successText}>
                    FORME JUSTE
                  </AppText>
                </View>
                <AppText variant="bodySecondary">
                  {item.correction}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <BlurView intensity={60} tint="dark" style={styles.memoryCard}>
        <LinearGradient
          pointerEvents="none"
          colors={[GRAMMAR_ACCENT.surfaceStrong, GRAMMAR_ACCENT.decorative]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={ABSOLUTE_FILL}
        />
        <View style={styles.memoryGlyphOuter}>
          <View style={styles.memoryGlyphInner}>
            <AppText
              aria-hidden
              variant="symbol"
              style={styles.accentText}
              align="center"
            >
              ◇
            </AppText>
          </View>
        </View>
        <View style={styles.memoryCopy}>
          <AppText variant="sectionLabel" style={styles.accentText}>
            ASTUCE MÉMOIRE
          </AppText>
          <AppText variant="bodyStrong">{guide.memoryTip}</AppText>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  guideStack: { gap: 26 },
  guideStackCompact: { gap: 22 },
  sectionStack: { gap: 14 },
  accentText: { color: GRAMMAR_ACCENT.base },
  successText: { color: SUCCESS },
  errorText: { color: ERROR },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  sectionIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.iconBorder,
    backgroundColor: GRAMMAR_ACCENT.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeadingCopy: { flexShrink: 1, gap: 1 },
  editorialCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.iconBorder,
    backgroundColor: COLORS.glassSurface,
    padding: 20,
    overflow: "hidden",
  },
  editorialGlow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -98,
    right: -55,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: GRAMMAR_ACCENT.decorative,
  },
  editorialLayout: { gap: 20 },
  editorialLayoutTablet: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 24,
  },
  essentialBlock: { flex: 1.2, minWidth: 0, gap: 13 },
  ruleBlock: { flex: 1, minWidth: 0, justifyContent: "center", gap: 10 },
  editorialDivider: {
    height: 1,
    width: "100%",
    backgroundColor: COLORS.line,
  },
  editorialDividerTablet: { width: 1, height: "auto" },
  ruleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  keyPill: {
    minHeight: 26,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.selectedShadow,
    backgroundColor: GRAMMAR_ACCENT.iconSurface,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  keyPillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GRAMMAR_ACCENT.base,
  },
  formulaCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.glassSurface,
    padding: 18,
    gap: 13,
    overflow: "hidden",
  },
  formulaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  structurePill: {
    minHeight: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  formulaPattern: {
    minHeight: 76,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: GRAMMAR_ACCENT.rain,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  formulaRail: {
    position: "absolute",
    left: 0,
    top: 15,
    bottom: 15,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: GRAMMAR_ACCENT.base,
  },
  stepsTrack: { gap: 10 },
  stepsTrackTablet: { flexDirection: "row", alignItems: "stretch" },
  stepCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    backgroundColor: "rgba(255,255,255,0.035)",
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepCardTablet: {
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
    gap: 13,
  },
  stepTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.iconBorder,
    backgroundColor: GRAMMAR_ACCENT.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    width: 24,
    height: 1,
    backgroundColor: GRAMMAR_ACCENT.selectedShadow,
  },
  stepCopy: { flex: 1, minWidth: 0, gap: 4 },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  countPill: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: GRAMMAR_ACCENT.iconSurface,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  examplesGrid: { gap: 12 },
  examplesGridTablet: { flexDirection: "row", alignItems: "stretch" },
  exampleCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: COLORS.glassSurface,
    padding: 18,
    gap: 14,
    overflow: "hidden",
  },
  exampleCardTablet: { flex: 1, minWidth: 0 },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  decompositionMark: { flexDirection: "row", gap: 4 },
  decompositionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GRAMMAR_ACCENT.selectedBorder,
  },
  examplePhrase: { gap: 3 },
  exampleDivider: { height: 1, backgroundColor: COLORS.lineSoft },
  exampleParts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  examplePart: {
    minWidth: 118,
    flexGrow: 1,
    flexBasis: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: GRAMMAR_ACCENT.decorative,
    padding: 11,
    gap: 3,
  },
  examplePartCompact: { minWidth: "100%" },
  partTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  rolePill: {
    alignSelf: "flex-start",
    marginTop: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.045)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comparisonGrid: { gap: 10 },
  comparisonGridTablet: { flexDirection: "row", alignItems: "stretch" },
  comparisonCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 10,
    gap: 2,
  },
  comparisonCardTablet: { flex: 1, minWidth: 0 },
  mistakePanel: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(253,164,175,0.16)",
    backgroundColor: "rgba(253,164,175,0.045)",
    padding: 13,
    gap: 8,
  },
  correctionPanel: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.17)",
    backgroundColor: "rgba(134,239,172,0.045)",
    padding: 13,
    gap: 8,
  },
  comparisonLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comparisonGlyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  errorGlyph: { backgroundColor: "rgba(253,164,175,0.1)" },
  successGlyph: { backgroundColor: "rgba(134,239,172,0.1)" },
  comparisonTransition: {
    height: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
  },
  transitionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lineSoft,
  },
  transitionArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  memoryCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: COLORS.glassSurface,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    overflow: "hidden",
  },
  memoryGlyphOuter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: GRAMMAR_ACCENT.cardBorder,
    backgroundColor: GRAMMAR_ACCENT.iconSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  memoryGlyphInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GRAMMAR_ACCENT.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  memoryCopy: { flex: 1, minWidth: 0, gap: 5 },
});
