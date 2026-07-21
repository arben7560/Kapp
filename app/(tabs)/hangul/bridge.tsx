import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");
const READINGS = [
  { text: "아이와 여우", guide: "아이 + 와 + 여우", meaning: "L’enfant et le renard" },
  { text: "사과와 우유", guide: "사과 + 와 + 우유", meaning: "Une pomme et du lait" },
  { text: "집에 가요", guide: "집 + 에 → 지베 · 가요", meaning: "Je vais à la maison" },
  { text: "한국어", guide: "한국 + 어 → 한구거", meaning: "Langue coréenne" },
];

export default function HangulBridgeScreen() {
  const { progress } = useStore();
  const responsive = useResponsiveLayout({ maxWidth: 820 });
  const unlocked = !!progress.hangulProgress.assessment?.passed;
  const speak = (value: string) => {
    Speech.stop();
    Speech.speak(value, { language: "ko-KR", rate: 0.62 });
  };
  React.useEffect(() => () => {
    void Speech.stop();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.background} resizeMode="cover">
        <LinearGradient colors={["rgba(2,3,6,0.65)", "rgba(2,3,6,0.94)"]} style={StyleSheet.absoluteFillObject} />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: responsive.horizontalPadding }]}>
          <View style={[styles.frame, { maxWidth: responsive.maxWidth }]}>
            <Pressable onPress={() => router.back()} style={styles.back}><AppText variant="screenTitle">‹</AppText><AppText variant="sectionLabel">ÉVALUATION HANGUL</AppText></Pressable>
            <AppText variant="sectionLabel" style={styles.teal}>LECTURE GUIDÉE</AppText>
            <AppText variant="screenTitle" style={styles.title}>Lire des phrases complètes</AppText>
            <AppText variant="bodySecondary" tone="muted">Lis chaque ligne avant de lancer l’écoute lente. Aucun texte latin n’est nécessaire.</AppText>

            {unlocked ? <>
            <AppText variant="sectionLabel" style={[styles.teal, styles.packLabel]}>PREMIÈRES PHRASES</AppText>
            <View style={styles.readings}>
              {READINGS.map((item) => <Pressable key={item.text} onPress={() => speak(item.text)}><BlurView intensity={50} tint="dark" style={styles.readingCard}><View style={styles.readingTop}><AppText variant="koreanPrimary" script="korean" style={styles.korean}>{item.text}</AppText><AppText variant="caption">🔊 LENT</AppText></View><AppText variant="bodyStrong">{item.guide}</AppText><AppText variant="bodySecondary" tone="muted">{item.meaning}</AppText></BlurView></Pressable>)}
            </View>

            <BlurView intensity={55} tint="dark" style={styles.transitionCard}>
              <AppText variant="sceneTitle">Choisis la suite</AppText>
              <AppText variant="bodySecondary" tone="muted">Le vocabulaire et l’écoute utilisent maintenant des phrases plus longues. Observe les nouvelles règles ; tu les apprendras plus tard.</AppText>
              <Pressable onPress={() => router.push("/(tabs)/voc/basics" as never)} style={styles.primary}><AppText variant="button" style={styles.primaryText}>OUVRIR LE VOCABULAIRE</AppText></Pressable>
              <Pressable onPress={() => router.push("/(tabs)/listen" as never)} style={styles.secondary}><AppText variant="button" style={styles.teal}>OUVRIR L’ÉCOUTE ET LA DICTÉE</AppText></Pressable>
              <Pressable onPress={() => router.push("/(tabs)" as never)} style={styles.home}><AppText variant="caption" tone="muted">Retour à l’accueil</AppText></Pressable>
            </BlurView>
            </> : (
              <BlurView intensity={55} tint="dark" style={styles.transitionCard}>
                <AppText variant="sceneTitle">Termine d’abord l’évaluation</AppText>
                <AppText variant="bodySecondary" tone="muted">Cette lecture se débloque avec au moins 11 bonnes réponses sur 12.</AppText>
                <Pressable onPress={() => router.replace("/(tabs)/hangul/assessment" as never)} style={styles.primary}><AppText variant="button" style={styles.primaryText}>OUVRIR L’ÉVALUATION</AppText></Pressable>
              </BlurView>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020306" },
  background: { flex: 1 },
  scroll: { paddingTop: 16, paddingBottom: 100 },
  frame: { width: "100%", alignSelf: "center" },
  back: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 26 },
  teal: { color: "#2DD4BF" },
  title: { marginTop: 6, marginBottom: 8 },
  packLabel: { marginTop: 24 },
  readings: { marginTop: 10, gap: 12 },
  readingCard: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(45,212,191,0.26)", padding: 18, gap: 7, overflow: "hidden" },
  readingTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  korean: { color: "#2DD4BF", flexShrink: 1 },
  transitionCard: { marginTop: 24, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 20, gap: 12, overflow: "hidden" },
  primary: { borderRadius: 15, backgroundColor: "#2DD4BF", padding: 15, alignItems: "center" },
  primaryText: { color: "#020306" },
  secondary: { borderRadius: 15, borderWidth: 1, borderColor: "#2DD4BF", padding: 15, alignItems: "center" },
  home: { padding: 10, alignItems: "center" },
});
