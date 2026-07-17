import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "../app-text";

type ImmersionPlaceholderProps = {
  title: string;
  description: string;
  imageSource: number;
};

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.94)";
const MUTED = "rgba(255,255,255,0.66)";
const CARD = "rgba(255,255,255,0.06)";
const LINE = "rgba(255,255,255,0.12)";

export function ImmersionPlaceholder({
  title,
  description,
  imageSource,
}: ImmersionPlaceholderProps) {
  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />

        <AppText accessibilityRole="header" variant="screenTitle" style={styles.title}>{title}</AppText>
        <AppText variant="body" tone="muted" style={styles.description}>{description}</AppText>

        <View style={styles.panel}>
          <AppText variant="sectionTitle" style={styles.panelTitle}>Scène en préparation</AppText>
          <AppText variant="bodySecondary" tone="muted" style={styles.panelText}>
            Cette capsule existe dans le hub Immersion, mais son scénario
            interactif n&apos;est pas encore branché.
          </AppText>
        </View>

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" align="center" style={styles.backButtonText}>Retour</AppText>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    marginBottom: 22,
  },
  title: {
    color: TXT,
  },
  description: {
    color: MUTED,
    marginTop: 10,
  },
  panel: {
    backgroundColor: CARD,
    borderColor: LINE,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  panelTitle: {
    color: TXT,
  },
  panelText: {
    color: MUTED,
    marginTop: 8,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: CARD,
    borderColor: LINE,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    paddingVertical: 14,
  },
  backButtonText: {
    color: TXT,
  },
});
