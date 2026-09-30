import React from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "../app-text";

export type GrammarVocabularyHint = {
  korean: string;
  french: string;
};

type QuestionDisplayProps = {
  value: string;
  vocabulary?: readonly GrammarVocabularyHint[];
};

function buildGlossedParts(content: string, vocabulary: readonly GrammarVocabularyHint[]) {
  const hints = vocabulary
    .map((hint) => ({ ...hint, index: content.indexOf(hint.korean) }))
    .filter((hint) => hint.index >= 0)
    .sort((left, right) => left.index - right.index);

  const parts: { key: string; korean: string; french?: string }[] = [];
  let cursor = 0;

  hints.forEach((hint, hintIndex) => {
    if (hint.index > cursor) {
      parts.push({
        key: `text-${hintIndex}`,
        korean: content.slice(cursor, hint.index),
      });
    }
    parts.push({
      key: `hint-${hint.korean}-${hint.index}`,
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
                <View style={styles.vocabularyPhrase}>
                  {buildGlossedParts(content, vocabulary).map((part) => (
                    <View
                      key={part.key}
                      style={part.french ? styles.vocabularyUnit : styles.vocabularyTextUnit}
                    >
                      <AppText variant="koreanPrimary" script="korean">
                        {part.korean}
                      </AppText>
                      {part.french ? (
                        <AppText
                          variant="caption"
                          tone="muted"
                          align="center"
                          numberOfLines={2}
                          style={styles.vocabularyTranslation}
                        >
                          {part.french}
                        </AppText>
                      ) : null}
                    </View>
                  ))}
                </View>
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
    paddingBottom: 16,
  },
  vocabularyTextUnit: {
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: "flex-end",
  },
  vocabularyUnit: {
    flexGrow: 0,
    flexShrink: 0,
    alignItems: "center",
    position: "relative",
  },
  vocabularyTranslation: {
    position: "absolute",
    top: "100%",
    left: -36,
    right: -36,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 1,
  },
});
