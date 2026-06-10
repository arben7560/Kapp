import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Scène en préparation</Text>
          <Text style={styles.panelText}>
            Cette capsule existe dans le hub Immersion, mais son scénario
            interactif n'est pas encore branché.
          </Text>
        </View>

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Retour</Text>
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
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  description: {
    color: MUTED,
    fontSize: 16,
    lineHeight: 24,
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
    fontSize: 17,
    fontWeight: "900",
  },
  panelText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
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
    fontSize: 15,
    fontWeight: "900",
  },
});
