import React from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";

import { AppText } from "../app-text";

export type GrammarVocabularyHint = {
  korean: string;
  french: string;
};

type QuestionDisplayProps = {
  value: string;
  vocabulary?: readonly GrammarVocabularyHint[];
};

type GlossPart = {
  key: string;
  korean: string;
  french?: string;
};

type TokenLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const GLOSS_WIDTH = 84;
const GLOSS_LINE_GAP = 2;
const PARTICLE_SPLIT = /(부터|까지|에서|으로|에게|한테|동안|__)/u;

function attachHint(token: string, vocabulary: readonly GrammarVocabularyHint[]) {
  return vocabulary.find((hint) => token === hint.korean || token.startsWith(hint.korean));
}

function buildGlossedParts(content: string, vocabulary: readonly GrammarVocabularyHint[]): GlossPart[] {
  const chunks = content.split(PARTICLE_SPLIT).filter((chunk) => chunk.length > 0);
  const usedHints = new Set<string>();
  const parts: GlossPart[] = [];

  chunks.forEach((chunk, index) => {
    const hint = attachHint(chunk, vocabulary);
    if (hint && !usedHints.has(hint.korean) && chunk.startsWith(hint.korean) && chunk !== hint.korean) {
      usedHints.add(hint.korean);
      parts.push({
        key: `hint-${hint.korean}-${index}`,
        korean: hint.korean,
        french: hint.french,
      });
      const rest = chunk.slice(hint.korean.length);
      if (rest) {
        parts.push({
          key: `rest-${index}`,
          korean: rest,
        });
      }
      return;
    }

    if (hint && !usedHints.has(hint.korean)) {
      usedHints.add(hint.korean);
      parts.push({
        key: `hint-${hint.korean}-${index}`,
        korean: chunk,
        french: hint.french,
      });
      return;
    }

    parts.push({
      key: `text-${index}`,
      korean: chunk,
    });
  });

  return parts;
}

function clampGlossLeft(wordX: number, wordWidth: number, phraseWidth: number) {
  const centered = wordX + wordWidth / 2 - GLOSS_WIDTH / 2;
  const maxLeft = Math.max(0, phraseWidth - GLOSS_WIDTH);
  return Math.min(Math.max(0, centered), maxLeft);
}

function GlossedPhrase({
  content,
  vocabulary,
}: {
  content: string;
  vocabulary: readonly GrammarVocabularyHint[];
}) {
  const parts = React.useMemo(
    () => buildGlossedParts(content, vocabulary),
    [content, vocabulary],
  );
  const [layouts, setLayouts] = React.useState<Record<string, TokenLayout>>({});
  const [phraseWidth, setPhraseWidth] = React.useState(0);

  React.useEffect(() => {
    setLayouts({});
  }, [content]);

  const onPhraseLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setPhraseWidth((current) => (current === nextWidth ? current : nextWidth));
  }, []);

  const onTokenLayout = React.useCallback((key: string, event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout;
    setLayouts((current) => {
      const previous = current[key];
      if (
        previous &&
        previous.x === next.x &&
        previous.y === next.y &&
        previous.width === next.width &&
        previous.height === next.height
      ) {
        return current;
      }
      return { ...current, [key]: next };
    });
  }, []);

  return (
    <View style={styles.vocabularyPhrase} onLayout={onPhraseLayout}>
      {parts.map((part) => (
        <View
          key={part.key}
          style={styles.vocabularyTextUnit}
          onLayout={(event) => onTokenLayout(part.key, event)}
        >
          <AppText variant="koreanPrimary" script="korean">
            {part.korean}
          </AppText>
        </View>
      ))}
      {parts.map((part) => {
        if (!part.french) return null;
        const layout = layouts[part.key];
        if (!layout) return null;
        return (
          <AppText
            key={`${part.key}-gloss`}
            variant="caption"
            tone="muted"
            align="center"
            numberOfLines={2}
            style={[
              styles.vocabularyTranslation,
              {
                top: layout.y + layout.height + GLOSS_LINE_GAP,
                left: clampGlossLeft(layout.x, layout.width, phraseWidth),
                width: GLOSS_WIDTH,
              },
            ]}
          >
            {part.french}
          </AppText>
        );
      })}
    </View>
  );
}

export function QuestionDisplay({
  value,
  vocabulary,
}: QuestionDisplayProps) {
  const sections = value.split("\n\n");

  return (
    <View style={styles.questionSections}>
      {sections.map((section, index) => {
        const [label, ...contentParts] = section.split("\n");
        const content = contentParts.join("\n");
        const isKorean = /[가-힣]/u.test(content);
        const contentVariant = label === "CONTEXTE" ? "bodyStrong" : isKorean
          ? "koreanPrimary"
          : "featureTitle";

        return (
          <View key={`${label}-${index}`} style={styles.questionSection}>
            <AppText variant="sectionLabel" tone="soft">{label}</AppText>
            {content ? (
              vocabulary && isKorean ? (
                <GlossedPhrase content={content} vocabulary={vocabulary} />
              ) : (
                <AppText variant={contentVariant} script={isKorean ? "korean" : "latin"}>
                  {content}
                </AppText>
              )
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  questionSections: {
    marginTop: 5,
    gap: 14,
  },
  questionSection: {
    gap: 4,
  },
  vocabularyPhrase: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    rowGap: 18,
    paddingBottom: 18,
    overflow: "visible",
  },
  vocabularyTextUnit: {
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: "flex-end",
  },
  vocabularyTranslation: {
    position: "absolute",
    fontSize: 10,
    lineHeight: 13,
    zIndex: 1,
  },
});
