import { Ionicons } from "@expo/vector-icons";
import * as Speech from "@/lib/speechPlayback";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IMMERSIVE_MIN_TOUCH_TARGET } from "../../constants/immersive-layout";
import { useSpeechLifecycle } from "../../hooks/useSpeechLifecycle";
import {
  buildAeroportConversationSummary,
  type AeroportConversationMemory,
} from "../../lib/aeroportConversationMemory";
import { AppText } from "../app-text";

type Props = Readonly<{
  memory: AeroportConversationMemory;
  onClose: () => void;
  visible: boolean;
}>;

const REFERENCE_PHRASE = {
  korean: "실례합니다, 서울역까지 어떻게 가요?",
  french: "Excusez-moi, comment aller à Seoul Station ?",
} as const;

export function AeroportConversationSummaryModal({
  memory,
  onClose,
  visible,
}: Props) {
  useSpeechLifecycle();
  const [hasListened, setHasListened] = useState(false);
  const summary = buildAeroportConversationSummary(memory);

  const handleClose = () => {
    Speech.stop();
    setHasListened(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.sheet} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <View>
              <AppText variant="caption" tone="premium" script="latin">
                MISSION AÉROPORT
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
            <View style={styles.card}>
              <AppText variant="bodyStrong" tone="strong" script="latin">
                Réussi
              </AppText>
              {(summary.achievements.length > 0
                ? summary.achievements
                : ["Mission menée jusqu’au bout"]
              ).map((item) => (
                <View key={item} style={styles.reviewRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#A855F7" />
                  <AppText variant="bodySecondary" tone="muted" script="latin">
                    {item}
                  </AppText>
                </View>
              ))}
            </View>

            {summary.vocabularyToReview.length > 0 ? (
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
            ) : null}

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
                {REFERENCE_PHRASE.korean}
              </AppText>
              <AppText variant="bodySecondary" tone="muted" script="latin">
                {REFERENCE_PHRASE.french}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${hasListened ? "Réécouter" : "Écouter"} la phrase à retenir`}
                onPress={() => {
                  Speech.stop();
                  setHasListened(true);
                  Speech.speak(REFERENCE_PHRASE.korean, {
                    language: "ko-KR",
                    rate: 0.82,
                  });
                }}
                style={styles.listenButton}
              >
                <Ionicons name="volume-high" size={18} color="#050508" />
                <AppText variant="button" script="latin" style={styles.listenText}>
                  {hasListened ? "Réécouter" : "Écouter"}
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  sheet: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "92%",
    alignSelf: "center",
    backgroundColor: "#0A0D1A",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  closeButton: {
    width: IMMERSIVE_MIN_TOUCH_TARGET,
    height: IMMERSIVE_MIN_TOUCH_TARGET,
    borderRadius: IMMERSIVE_MIN_TOUCH_TARGET / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  content: { paddingHorizontal: 20, paddingBottom: 28, gap: 14 },
  card: {
    gap: 10,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  listenButton: {
    minHeight: 44,
    borderRadius: 15,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#A855F7",
  },
  listenText: { color: "#050508" },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#A855F7" },
});
