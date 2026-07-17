import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  buildMetroConversationSummary,
  type MetroConversationMemory,
} from "../../lib/metroConversationMemory";
import { AppText } from "../app-text";

type Props = {
  memory: MetroConversationMemory;
  onClose: () => void;
  visible: boolean;
};

const REFERENCE_PHRASE = "강남 방향은 어느 쪽이에요?";

export function MetroConversationSummaryModal({
  memory,
  onClose,
  visible,
}: Props) {
  const summary = buildMetroConversationSummary(memory);

  const handleClose = () => {
    Speech.stop();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <View>
              <AppText variant="caption" tone="premium" script="latin">
                MISSION MÉTRO
              </AppText>
              <AppText variant="sectionTitle" tone="strong" script="latin">
                Bilan de la conversation
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer le bilan"
              hitSlop={8}
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.metrics}>
              {[
                ["Prises de parole", summary.speakingTurns],
                ["Compris directement", summary.directSuccesses],
                ["Compris avec conseil", summary.understoodWithCorrection],
                ["Erreurs corrigées", summary.errorsCorrected],
                ["Aides demandées", summary.helpRequests],
                ["Audios réécoutés", summary.audioReplays],
              ].map(([label, value]) => (
                <View key={String(label)} style={styles.metricCard}>
                  <AppText variant="sectionTitle" tone="strong" script="latin">
                    {String(value)}
                  </AppText>
                  <AppText variant="caption" tone="soft" script="latin">
                    {String(label)}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <AppText variant="bodyStrong" tone="strong" script="latin">
                Phrase à retenir
              </AppText>
              <AppText
                accessibilityLanguage="ko-KR"
                variant="koreanSecondary"
                tone="strong"
                script="korean"
              >
                {REFERENCE_PHRASE}
              </AppText>
              <AppText variant="bodySecondary" tone="muted" script="latin">
                De quel côté se trouve la direction de Gangnam ?
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Écouter la phrase à retenir"
                onPress={() => {
                  Speech.stop();
                  Speech.speak(REFERENCE_PHRASE, {
                    language: "ko-KR",
                    rate: 0.82,
                  });
                }}
                style={styles.listenButton}
              >
                <Ionicons name="volume-high" size={18} color="#050508" />
                <AppText variant="button" script="latin" style={styles.listenText}>
                  Écouter
                </AppText>
              </Pressable>
            </View>

            <View style={styles.card}>
              <AppText variant="bodyStrong" tone="strong" script="latin">
                À revoir
              </AppText>
              {summary.vocabularyToReview.map((item) => (
                <View key={item} style={styles.reviewRow}>
                  <View style={styles.dot} />
                  <AppText variant="bodySecondary" tone="muted" script="latin">
                    {item}
                  </AppText>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { maxHeight: "92%", backgroundColor: "#0A0D1A", borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  closeButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  content: { paddingHorizontal: 20, paddingBottom: 28, gap: 14 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { width: "48%", flexGrow: 1, minHeight: 84, borderRadius: 18, padding: 14, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  card: { gap: 10, borderRadius: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  listenButton: { minHeight: 44, borderRadius: 15, paddingHorizontal: 16, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#A855F7" },
  listenText: { color: "#050508" },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#A855F7" },
});
