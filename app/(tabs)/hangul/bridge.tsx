import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AppBackButton } from "../../../components/ui/app-back-button";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { HangulAudioBadge } from "../../../components/hangul/HangulAudioBadge";
import { useHangulAudio } from "../../../hooks/useHangulAudio";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.jpg");
const READINGS = [
  { text: "아이와 여우", audio: "아이와 여우", guide: "아이 + 와 + 여우", meaning: "L’enfant et le renard" },
  { text: "사과와 우유", audio: "사과와 우유", guide: "사과 + 와 + 우유", meaning: "Une pomme et du lait" },
  { text: "집에 가요", audio: "집에 가요", guide: "집 + 에 → 지베 · 가요", meaning: "Je vais à la maison" },
  { text: "한국어", audio: "한국어", guide: "한국 + 어 → 한구거", meaning: "Langue coréenne" },
];

export default function HangulBridgeScreen() {
  const { progress } = useStore();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const responsive = useResponsiveLayout({ maxWidth: isLandscape ? 1040 : 820 });
  const landscapeGap = height <= 380 ? 20 : 28;
  const safeContentWidth = Math.min(
    responsive.maxWidth,
    Math.max(
      0,
      width -
        insets.left -
        insets.right -
        responsive.horizontalPadding * 2,
    ),
  );
  const useLandscapeLayout = isLandscape && safeContentWidth >= 600;
  const introWidth = Math.min(300, Math.max(220, safeContentWidth * 0.34));
  const readingColumnWidth = Math.max(
    0,
    safeContentWidth - introWidth - landscapeGap,
  );
  const readingColumns =
    useLandscapeLayout && readingColumnWidth >= 500 ? 2 : 1;
  const readingCardWidth =
    readingColumns > 1 ? (readingColumnWidth - 12) / 2 : "100%";
  const unlocked = !!progress.hangulProgress.assessment?.passed;
  const { playAudio } = useHangulAudio();

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.bgImage} resizeMode="cover">
        <BlurView intensity={18} tint="dark" style={styles.bgBlur} />
        <View style={styles.vignetteOverlay} />
        <LinearGradient
          colors={["rgba(2,3,6,0.10)", "rgba(2,3,6,0.22)", "rgba(2,3,6,0.72)"]}
          locations={[0, 0.44, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.ambientGlowTop} pointerEvents="none" />
        <View style={styles.ambientGlowBottom} pointerEvents="none" />
        <ScrollView
          showsVerticalScrollIndicator={!useLandscapeLayout}
          contentContainerStyle={[
            styles.scroll,
            useLandscapeLayout && styles.scrollLandscape,
            { paddingHorizontal: responsive.horizontalPadding },
          ]}
        >
          <View
            style={[
              styles.frame,
              useLandscapeLayout && styles.frameLandscape,
              useLandscapeLayout && { gap: landscapeGap },
              { maxWidth: responsive.maxWidth },
            ]}
          >
            <View
              style={
                useLandscapeLayout
                  ? [styles.introColumn, { width: introWidth }]
                  : undefined
              }
            >
              <View style={[styles.back, useLandscapeLayout && styles.backLandscape]}><AppBackButton /></View>
              <AppText variant="sectionLabel" style={styles.teal}>LECTURE GUIDÉE</AppText>
              <AppText variant="screenTitle" style={[styles.title, useLandscapeLayout && styles.titleLandscape]}>Lire des phrases complètes</AppText>
              <AppText variant="bodySecondary" tone="muted">Lis chaque ligne avant de lancer l’écoute lente. Aucun texte latin n’est nécessaire.</AppText>
            </View>

            <View style={useLandscapeLayout ? styles.readingColumn : undefined}>
              {unlocked ? <>
              <AppText variant="sectionLabel" style={[styles.teal, styles.packLabel, useLandscapeLayout && styles.packLabelLandscape]}>PREMIÈRES PHRASES</AppText>
              <View style={[styles.readings, useLandscapeLayout && styles.readingsLandscape]}>
                {READINGS.map((item) => <Pressable key={item.text} onPress={() => playAudio(item.audio)} style={readingColumns > 1 ? { width: readingCardWidth } : undefined}><BlurView intensity={50} tint="dark" style={[styles.readingCard, useLandscapeLayout && styles.readingCardLandscape]}><View style={styles.readingTop}><AppText variant="koreanPrimary" script="korean" style={styles.korean}>{item.text}</AppText><HangulAudioBadge accent="#2DD4BF" label="ÉCOUTER" /></View><AppText variant="bodyStrong">{item.guide}</AppText><AppText variant="bodySecondary" tone="muted">{item.meaning}</AppText></BlurView></Pressable>)}
              </View>

              <BlurView intensity={55} tint="dark" style={[styles.transitionCard, useLandscapeLayout && styles.transitionCardLandscape]}>
              <AppText variant="sceneTitle">Choisis la suite</AppText>
              <AppText variant="bodySecondary" tone="muted">Le vocabulaire et l’écoute utilisent maintenant des phrases plus longues. Observe les nouvelles règles ; tu les apprendras plus tard.</AppText>
              <Pressable onPress={() => router.push("/(tabs)/voc/basics" as never)} style={styles.primary}><AppText variant="button" style={styles.primaryText}>OUVRIR LE VOCABULAIRE</AppText></Pressable>
              <Pressable onPress={() => router.push("/(tabs)/listen" as never)} style={styles.secondary}><AppText variant="button" style={styles.teal}>OUVRIR L’ÉCOUTE ET LA DICTÉE</AppText></Pressable>
              <Pressable onPress={() => router.push("/(tabs)" as never)} style={styles.home}><AppText variant="caption" tone="muted">Retour à l’accueil</AppText></Pressable>
              </BlurView>
              </> : (
              <BlurView intensity={55} tint="dark" style={[styles.transitionCard, useLandscapeLayout && styles.transitionCardLandscape]}>
                <AppText variant="sceneTitle">Termine d’abord l’évaluation</AppText>
                <AppText variant="bodySecondary" tone="muted">Cette lecture se débloque avec au moins 11 bonnes réponses sur 12.</AppText>
                <Pressable onPress={() => router.replace("/(tabs)/hangul/assessment" as never)} style={styles.primary}><AppText variant="button" style={styles.primaryText}>OUVRIR L’ÉVALUATION</AppText></Pressable>
              </BlurView>
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020306" },
  bgImage: { flex: 1, overflow: "hidden", backgroundColor: "#020306" },
  bgBlur: { ...ABSOLUTE_FILL },
  vignetteOverlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.52)",
  },
  ambientGlowTop: {
    position: "absolute",
    top: 100,
    right: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(103,232,249,0.05)",
    boxShadow: "0px 0px 90px rgba(103,232,249,0.10)",
  },
  ambientGlowBottom: {
    position: "absolute",
    top: 510,
    left: -130,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(94,234,212,0.035)",
    boxShadow: "0px 0px 100px rgba(94,234,212,0.07)",
  },
  scroll: { paddingTop: 16, paddingBottom: 100 },
  scrollLandscape: { paddingTop: 8, paddingBottom: 36 },
  frame: { width: "100%", alignSelf: "center" },
  frameLandscape: { flexDirection: "row", alignItems: "flex-start" },
  introColumn: { flexShrink: 0, paddingTop: 2 },
  readingColumn: { flex: 1, minWidth: 0 },
  back: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 26 },
  backLandscape: { marginBottom: 18 },
  teal: { color: "#2DD4BF" },
  title: { marginTop: 15, marginBottom: 18 },
  titleLandscape: { marginTop: 10, marginBottom: 12 },
  packLabel: { marginTop: 24 },
  packLabelLandscape: { marginTop: 2 },
  readings: { marginTop: 10, gap: 12 },
  readingsLandscape: { flexDirection: "row", flexWrap: "wrap" },
  readingCard: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(45,212,191,0.26)", padding: 18, gap: 7, overflow: "hidden" },
  readingCardLandscape: { padding: 15 },
  readingTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  korean: { color: "#2DD4BF", flexShrink: 1 },
  transitionCard: { marginTop: 24, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 20, gap: 12, overflow: "hidden" },
  transitionCardLandscape: { marginTop: 16, padding: 18 },
  primary: { borderRadius: 15, backgroundColor: "#2DD4BF", padding: 15, alignItems: "center" },
  primaryText: { color: "#020306" },
  secondary: { borderRadius: 15, borderWidth: 1, borderColor: "#2DD4BF", padding: 15, alignItems: "center" },
  home: { padding: 10, alignItems: "center" },
});
