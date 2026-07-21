import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  buildMetroConversationSummary,
  type MetroConversationMemory,
} from "../../lib/metroConversationMemory";
import { AppText } from "../app-text";

type Props = {
  memory: MetroConversationMemory;
  missionId?: string;
  onClose: () => void;
  visible: boolean;
};

const MISSION_REFERENCE_PHRASES: Record<
  string,
  Readonly<{ korean: string; french: string }>
> = {
  "hongik-gangnam": {
    korean: "강남 방향은 어느 쪽이에요?",
    french: "De quel côté se trouve la direction de Gangnam ?",
  },
  "myeongdong-itaewon": {
    korean: "실례합니다, 여기서 이태원역까지 어떻게 가나요?",
    french: "Excusez-moi, comment aller à Itaewon depuis ici ?",
  },
  "ask-exit": {
    korean: "강남역에서는 몇 번 출구로 나가야 하나요?",
    french: "Quelle sortie dois-je prendre à Gangnam ?",
  },
  "ask-transfer": {
    korean: "환승은 어디서 하나요?",
    french: "Où dois-je changer de ligne ?",
  },
  "ask-time": {
    korean: "얼마나 걸려요?",
    french: "Combien de temps cela prend-il ?",
  },
  "ask-direction": {
    korean: "강남 방향은 어느 쪽이에요?",
    french: "De quel côté se trouve la direction de Gangnam ?",
  },
};

const DEFAULT_REFERENCE_PHRASE = MISSION_REFERENCE_PHRASES["ask-direction"];

export function MetroConversationSummaryModal({
  memory,
  missionId,
  onClose,
  visible,
}: Props) {
  const [hasListened, setHasListened] = useState(false);
  const summary = buildMetroConversationSummary(memory);
  const referencePhrase =
    MISSION_REFERENCE_PHRASES[missionId ?? ""] ?? DEFAULT_REFERENCE_PHRASE;

  const handleClose = () => {
    Speech.stop();
    setHasListened(false);
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
                {referencePhrase.korean}
              </AppText>
              <AppText variant="bodySecondary" tone="muted" script="latin">
                {referencePhrase.french}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${hasListened ? "Réécouter" : "Écouter"} la phrase à retenir`}
                onPress={() => {
                  Speech.stop();
                  setHasListened(true);
                  Speech.speak(referencePhrase.korean, {
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
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.62)" },
  sheet: { maxHeight: "92%", backgroundColor: "#0A0D1A", borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  closeButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  content: { paddingHorizontal: 20, paddingBottom: 28, gap: 14 },
  card: { gap: 10, borderRadius: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  listenButton: { minHeight: 44, borderRadius: 15, paddingHorizontal: 16, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#A855F7" },
  listenText: { color: "#050508" },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#A855F7" },
});
