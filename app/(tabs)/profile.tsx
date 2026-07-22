import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../_store";
import { AppMixedText, AppText } from "../../components/app-text";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useDailyStreak } from "../../lib/DailyStreakProvider";
import { createEmptyHangulProgress } from "../../data/hangul/types";
import { createEmptyGrammarLearningProgress } from "../../lib/grammar";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.65)";
const LINE = "rgba(255,255,255,0.12)";
const CARD = "rgba(255,255,255,0.06)";

export default function Profile() {
  const { progress, setProgress, togglePremium } = useStore();
  const { resetStreak, streak } = useDailyStreak();
  const responsive = useResponsiveLayout({ maxWidth: 760 });

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            alignSelf: "center",
            maxWidth: responsive.maxWidth,
            paddingBottom: 120,
            paddingHorizontal: responsive.horizontalPadding,
            width: "100%",
          }}
        >
        <AppText accessibilityRole="header" variant="screenTitle" style={{ color: TXT, marginTop: 8 }}>
          Profil
        </AppText>
        <AppText variant="subtitle" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
          Objectifs, premium, debug
        </AppText>

        <View style={{ height: 14 }} />

        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 22,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <AppText variant="sectionTitle" style={{ color: TXT }}>
            Stats
          </AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 6 }}>XP : {progress.xp}</AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 2 }}>
            Streak : {streak?.currentStreak ?? 0} jours
          </AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 2 }}>
            Record : {streak?.longestStreak ?? 0} jours
          </AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 2 }}>
            Jour valide : {streak?.isTodayCompleted ? "Oui" : "Non"}
          </AppText>
          <AppMixedText
            variant="bodySecondary"
            tone="muted"
            style={{ color: MUTED, marginTop: 2 }}
            segments={[
              { text: "Hangul : niveau ", script: "latin" },
              { text: progress.hangulLevel, script: "latin" },
              { text: "/5", script: "latin" },
            ]}
          />
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 2 }}>
            Premium : {progress.isPremium ? "Actif" : "Non"}
          </AppText>
        </View>

        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 22,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <AppText variant="sectionTitle" style={{ color: TXT }}>
            Premium
          </AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
            Debloque dialogues avances + prononciation intensive.
          </AppText>

          <View style={{ height: 12 }} />

          <Pressable
            onPress={togglePremium}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              backgroundColor: "rgba(34,211,238,0.14)",
              borderColor: "rgba(34,211,238,0.55)",
              borderWidth: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: "center",
            })}
          >
            <AppText variant="button" align="center" style={{ color: TXT }}>
              {progress.isPremium
                ? "Desactiver Premium (prototype)"
                : "Activer Premium (prototype)"}
            </AppText>
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: CARD,
            borderColor: LINE,
            borderWidth: 1,
            borderRadius: 22,
            padding: 14,
          }}
        >
          <AppText variant="sectionTitle" style={{ color: TXT }}>
            Outils
          </AppText>
          <AppText variant="bodySecondary" tone="muted" style={{ color: MUTED, marginTop: 6 }}>
            Prototype pour tester vite.
          </AppText>

          <View style={{ height: 12 }} />

          <Pressable
            onPress={() => {
              Alert.alert("Réinitialiser", "Réinitialiser toute la progression ?", [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Confirmer",
                  style: "destructive",
                  onPress: () => {
                    void resetStreak();
                    setProgress({
                      completed: {},
                      grammarProgress: createEmptyGrammarLearningProgress(),
                      hangulProgress: createEmptyHangulProgress(),
                      hangulLevel: 1,
                      isPremium: false,
                      learningTrack: null,
                      streak: 0,
                      xp: 0,
                    });
                  },
                },
              ]);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              backgroundColor: "rgba(251,113,133,0.12)",
              borderColor: "rgba(251,113,133,0.45)",
              borderWidth: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: "center",
            })}
          >
            <AppText variant="button" align="center" style={{ color: TXT }}>Réinitialiser la progression</AppText>
          </Pressable>
        </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
