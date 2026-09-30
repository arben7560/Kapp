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
            {guide.stageId === "mark-contrast" ? (
              <View style={styles.registerNote}>
                <AppText variant="sectionLabel" style={styles.accentText}>
                  REGISTRE
                </AppText>
                <AppText variant="bodySecondary" tone="muted">
                  -지만 est le « mais » net, un peu plus posé : écrit, ou oral quand
                  l’opposition est volontaire. À l’oral quotidien, le voisin
                  -(으)ㅄ/는데 pose souvent le contexte avant la suite ; il sera
                  traité plus tard. Ici, on produit seulement -지만.
                </AppText>
              </View>
            ) : null}
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
