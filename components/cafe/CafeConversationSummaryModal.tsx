import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../app-text";
import {
  buildCafeConversationSummary,
  type CafeConversationMemory,
  type CafeGroupedImperfection,
} from "../../lib/cafeConversationMemory";

type CafeConversationSummaryModalProps = Readonly<{
  memory: CafeConversationMemory;
  visible: boolean;
  onClose: () => void;
  onFinish: () => void;
}>;

function ImperfectionCard({
  item,
  uncertain = false,
}: Readonly<{
  item: CafeGroupedImperfection;
  uncertain?: boolean;
}>) {
  const recordedTranscript =
    item.recordedTranscripts.join(" · ") || "Aucune transcription";

  return (
    <View style={[styles.detailCard, uncertain && styles.uncertainCard]}>
      <AppText variant="caption" tone="soft" script="latin">
        {uncertain ? "Le micro a peut-être entendu" : item.stepLabel}
      </AppText>
      <AppText
        variant="koreanSecondary"
        tone="strong"
        script="korean"
        accessibilityLanguage="ko-KR"
        style={styles.transcript}
      >
        {recordedTranscript}
      </AppText>

      <AppText
        variant="bodySecondary"
        tone="muted"
        script="latin"
        style={styles.explanation}
      >
        {item.explanation}
      </AppText>

      <AppText variant="caption" tone="soft" script="latin">
        Essaie
      </AppText>
      <AppText
        variant="koreanSecondary"
        tone="strong"
        script={item.canonicalFormulation ? "korean" : "latin"}
        accessibilityLanguage={
          item.canonicalFormulation ? "ko-KR" : undefined
        }
        style={styles.canonical}
      >
        {item.canonicalFormulation ??
          "Reprends une des formulations proposées à cette étape."}
      </AppText>

      <View style={styles.cardMeta}>
        {item.attemptCount > 1 ? (
          <AppText variant="caption" tone="muted" script="latin">
            {item.attemptCount} tentatives regroupées
          </AppText>
        ) : null}
        {item.correctedDuringScene ? (
          <AppText variant="caption" tone="accent" script="latin">
            Corrigé pendant la scène
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export function CafeConversationSummaryModal({
  memory,
  visible,
  onClose,
  onFinish,
}: CafeConversationSummaryModalProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [listenedPhrases, setListenedPhrases] = useState<Record<string, true>>({});
  const summary = useMemo(() => buildCafeConversationSummary(memory), [memory]);
  const phraseToRemember = summary.canonicalReferencePhrases[0];

  useEffect(() => () => {
    void Speech.stop();
  }, []);

  const handleClose = () => {
    void Speech.stop();
    setIsReviewing(false);
    setListenedPhrases({});
    onClose();
  };

  const handleFinish = () => {
    void Speech.stop();
    onFinish();
  };

  const speak = (phrase: string) => {
    void Speech.stop();
    setListenedPhrases((current) => ({ ...current, [phrase]: true }));
    Speech.speak(phrase, { language: "ko-KR", rate: 0.88 });
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <AppText
                accessibilityRole="header"
                variant="screenTitle"
                tone="strong"
                script="latin"
                style={styles.title}
              >
                {isReviewing
                  ? "Phrases utiles"
                  : "Bilan"}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer le bilan"
                hitSlop={8}
                onPress={handleClose}
                style={styles.closeButton}
              >
                <AppText variant="button" tone="strong" script="latin">
                  ✕
                </AppText>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {isReviewing ? (
                <View style={styles.section}>
                  <AppText variant="sectionTitle" tone="strong" script="latin">
                    Phrases utiles
                  </AppText>
                  <AppText variant="bodySecondary" tone="muted" script="latin">
                    Réécoute les phrases de cette mission.
                  </AppText>
                  {summary.canonicalReferencePhrases.length > 0 ? (
                    summary.canonicalReferencePhrases.map((phrase) => (
                      <View key={phrase} style={styles.phraseRow}>
                        <AppText
                          variant="koreanSecondary"
                          tone="strong"
                          script="korean"
                          accessibilityLanguage="ko-KR"
                          style={styles.phraseText}
                        >
                          {phrase}
                        </AppText>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${listenedPhrases[phrase] ? "Réécouter" : "Écouter"} ${phrase}`}
                          hitSlop={6}
                          onPress={() => speak(phrase)}
                          style={styles.listenButton}
                        >
                          <AppText variant="button" tone="strong" script="latin">
                            {listenedPhrases[phrase] ? "Réécouter" : "Écouter"}
                          </AppText>
                        </Pressable>
                      </View>
                    ))
                  ) : (
                    <AppText variant="bodySecondary" tone="muted" script="latin">
                      Aucune phrase vocale à revoir pour cette mission.
                    </AppText>
                  )}
                </View>
              ) : (
                <>
                  <View style={styles.section}>
                    <AppText variant="sectionTitle" tone="strong" script="latin">
                      Réussi
                    </AppText>
                    {(summary.successfulPoints.length > 0
                      ? summary.successfulPoints
                      : ["Conversation menée jusqu’au bout"]
                    ).map((point) => (
                      <AppText
                        key={point}
                        variant="bodySecondary"
                        tone="strong"
                        script="latin"
                        style={styles.successPoint}
                      >
                        ✓ {point}
                      </AppText>
                    ))}
                  </View>

                  {summary.improvements.length > 0 ? (
                    <View style={styles.section}>
                      <AppText variant="sectionTitle" tone="strong" script="latin">
                        À revoir
                      </AppText>
                      {summary.improvements.map((item) => (
                        <ImperfectionCard key={item.id} item={item} />
                      ))}
                    </View>
                  ) : null}

                  {summary.uncertainRecognition.length > 0 ? (
                    <View style={styles.section}>
                      <AppText variant="sectionTitle" tone="strong" script="latin">
                        Transcription à vérifier
                      </AppText>
                      <AppText variant="bodySecondary" tone="muted" script="latin">
                        Ce point peut venir du micro, pas de ta réponse.
                      </AppText>
                      {summary.uncertainRecognition.map((item) => (
                        <ImperfectionCard key={item.id} item={item} uncertain />
                      ))}
                    </View>
                  ) : null}

                  {phraseToRemember ? (
                    <View style={styles.section}>
                      <AppText variant="sectionTitle" tone="strong" script="latin">
                        Phrase à retenir
                      </AppText>
                      <View style={styles.phraseRow}>
                        <AppText
                          variant="koreanSecondary"
                          tone="strong"
                          script="korean"
                          accessibilityLanguage="ko-KR"
                          style={styles.phraseText}
                        >
                          {phraseToRemember}
                        </AppText>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${listenedPhrases[phraseToRemember] ? "Réécouter" : "Écouter"} ${phraseToRemember}`}
                          hitSlop={6}
                          onPress={() => speak(phraseToRemember)}
                          style={styles.listenButton}
                        >
                          <AppText variant="button" tone="strong" script="latin">
                            {listenedPhrases[phraseToRemember] ? "Réécouter" : "Écouter"}
                          </AppText>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isReviewing ? "Retour au bilan" : "Ouvrir les phrases"
                }
                hitSlop={6}
                onPress={() => setIsReviewing((current) => !current)}
                style={styles.secondaryAction}
              >
                <AppText variant="button" tone="strong" script="latin" align="center">
                  {isReviewing ? "Retour au bilan" : "Ouvrir les phrases"}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Terminer la mission"
                hitSlop={6}
                onPress={handleFinish}
                style={styles.primaryAction}
              >
                <AppText variant="button" tone="strong" script="latin" align="center">
                  Terminer
                </AppText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,2,6,0.84)",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  sheet: {
    flex: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0B0C14",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  successPoint: {
    paddingVertical: 2,
  },
  detailCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(244,114,182,0.22)",
    backgroundColor: "rgba(244,114,182,0.06)",
    padding: 15,
    gap: 7,
  },
  uncertainCard: {
    borderColor: "rgba(34,211,238,0.24)",
    backgroundColor: "rgba(34,211,238,0.06)",
  },
  transcript: {
    marginBottom: 5,
  },
  explanation: {
    marginVertical: 6,
  },
  canonical: {
    marginTop: 1,
  },
  cardMeta: {
    gap: 4,
    marginTop: 6,
  },
  phraseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  phraseText: {
    flex: 1,
  },
  listenButton: {
    borderRadius: 14,
    backgroundColor: "rgba(34,211,238,0.14)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.28)",
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
});
