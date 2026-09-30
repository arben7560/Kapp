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

function buildGlossedParts(content: string, vocabulary: readonly GrammarVocabularyHint[]): GlossPart[] {
  const hints = vocabulary
    .map((hint) => ({ ...hint, index: content.indexOf(hint.korean) }))
    .filter((hint) => hint.index >= 0)
    .sort((left, right) => left.index - right.index);
  const parts: GlossPart[] = [];
  let cursor = 0;

  hints.forEach((hint, hintIndex) => {
    if (hint.index < cursor) return;
    if (hint.index > cursor) {
      parts.push({
        key: `text-${hintIndex}`,
        korean: content.slice(cursor, hint.index),
      });
    }
    parts.push({
      key: `hint-${hint.korean}-${hintIndex}`,
      korean: hint.korean,
      french: hint.french,
    });
    cursor = hint.index + hint.korean.length;
  });

  if (cursor < content.length) {
    parts.push({
      key: "text-tail",
      korean: content.slice(cursor),
    });
  }

  return parts;
}

function GlossToken({
  part,
}: {
  part: GlossPart;
}) {
  const [wordHeight, setWordHeight] = React.useState(0);

  const onWordLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setWordHeight((current) => (current === nextHeight ? current : nextHeight));
  }, []);

  return (
    <View style={part.french ? styles.vocabularyUnit : styles.vocabularyTextUnit}>
      <AppText variant="koreanPrimary" script="korean" onLayout={onWordLayout}>
        {part.korean}
      </AppText>
      {part.french && wordHeight > 0 ? (
        <AppText
          variant="caption"
          tone="muted"
          align="center"
          numberOfLines={2}
          style={[styles.vocabularyTranslation, { top: wordHeight + 1 }]}
        >
          {part.french}
        </AppText>
      ) : null}
    </View>
  );
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

  return (
    <View style={styles.vocabularyPhrase}>
      {parts.map((part) => (
        <GlossToken key={part.key} part={part} />
      ))}
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
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    rowGap: 22,
    paddingBottom: 22,
    overflow: "visible",
  },
  vocabularyTextUnit: {
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: "flex-end",
  },
  vocabularyUnit: {
    position: "relative",
    flexGrow: 0,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  vocabularyTranslation: {
    position: "absolute",
    width: 72,
    fontSize: 10,
    lineHeight: 12,
    zIndex: 1,
  },
});
