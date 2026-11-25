import { Alert } from "react-native";
import { speakKoreanReview, stop } from "./speechPlayback";

/** Shared entry point for the vocal-immersion end-of-mission review only. */
export function playKoreanReviewPhrase(
  phrase: string,
  onStart: () => void,
  translate: (text: string) => string,
) {
  void stop();
  speakKoreanReview(phrase, {
    onStart,
    onUnavailable: () => {
      Alert.alert(
        translate("Audio coréen indisponible"),
        translate("Vérifie qu’une voix coréenne est installée et activée dans les réglages de synthèse vocale de ton appareil, puis réessaie."),
      );
    },
  });
}
