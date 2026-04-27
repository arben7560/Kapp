import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ──────────────────────────────────────────────
// DESIGN SYSTEM — TEMPORAL SKY EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  deepIndigo: "#4338CA",
  twilight: "#6366F1",
  softLilac: "#A78BFA",
  starWhite: "#F8FAFC",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "birthday",
    title: "L'Anniversaire",
    koreanTitle: "생일 날짜 (Saeng-il Nal-jja)",
    description: "Donner sa date de naissance complète (Année / Mois / Jour).",
    accent: COLORS.softLilac,
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "생일이 언제예요?",
        fr: "C'est quand ton anniversaire ?",
      },
      {
        char: "Moi",
        kr: "제 생일은 이천육년 사월 이십사일이에요.",
        fr: "Mon anniversaire est le 24 avril 2026 (I-cheon-yuk-nyeon Sa-wol I-sip-sa-il).",
      },
    ],
    expressions: [
      {
        word: "년 / 월 / 일",
        rom: "Nyeon / Wol / Il",
        mean: "Année / Mois / Jour",
        context: "L'ordre coréen est toujours du plus grand au plus petit.",
      },
      {
        word: "언제예요?",
        rom: "Eon-je-ye-yo?",
        mean: "C'est quand ?",
        context: "La question temporelle de base pour toute date.",
      },
      {
        word: "사월",
        rom: "Sa-wol",
        mean: "Avril",
        context:
          "Les mois sont simplement le chiffre + 'Wol'. (Janvier = Il-wol, etc.).",
      },
    ],
  },
  {
    id: "travel",
    title: "Le Voyage",
    koreanTitle: "여행 계획 (Travel Plan)",
    description: "Planifier les dates d'arrivée et de départ d'un séjour.",
    accent: COLORS.twilight,
    image:
      "https://images.unsplash.com/photo-1501503060477-724b392ac520?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Hôtel",
        kr: "언제 체크인 하시나요?",
        fr: "Quand faites-vous votre check-in ?",
      },
      {
        char: "Moi",
        kr: "다음 주 수요일부터 금요일까지요.",
        fr: "Du mercredi au vendredi de la semaine prochaine.",
      },
    ],
    expressions: [
      {
        word: "다음 주",
        rom: "Da-eum ju",
        mean: "La semaine prochaine",
        context: "Utilisé pour projeter des plans dans le futur proche.",
      },
      {
        word: "~부터 ~까지",
        rom: "~bu-teo ~kka-ji",
        mean: "De... à...",
        context: "Structure essentielle pour exprimer une durée de dates.",
      },
      {
        word: "평일 / 주말",
        rom: "Pyeong-il / Ju-mal",
        mean: "Semaine / Week-end",
        context: "Pour distinguer les jours travaillés du repos.",
      },
    ],
  },
  {
    id: "weekly",
    title: "La Semaine",
    koreanTitle: "요일 (Days of the week)",
    description: "Maîtriser les 7 jours de la semaine et leurs éléments.",
    accent: COLORS.deepIndigo,
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Manager",
        kr: "오늘 무슨 요일이에요?",
        fr: "On est quel jour de la semaine aujourd'hui ?",
      },
      {
        char: "Moi",
        kr: "오늘은 월요일이에요. 회의가 있어요.",
        fr: "Aujourd'hui on est lundi. Il y a une réunion.",
      },
    ],
    expressions: [
      {
        word: "월요일",
        rom: "Wol-yo-il",
        mean: "Lundi (Lune)",
        context: "Chaque jour commence par un élément (Feu, Eau, Bois...).",
      },
      {
        word: "오늘 / 내일",
        rom: "O-neul / Nae-il",
        mean: "Aujourd'hui / Demain",
        context: "Les ancres temporelles quotidiennes.",
      },
      {
        word: "무슨 요일?",
        rom: "Mu-seun yo-il?",
        mean: "Quel jour (semaine) ?",
        context: "À ne pas confondre avec 'Myeot il' (Quel jour du mois).",
      },
    ],
  },
];

export default function DatesCalendarImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [activeScene]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={{ uri: activeScene.image }} style={styles.bg}>
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* HEADER TEMPOREL */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL TEMPOREL</Text>
            </Pressable>
            <View
              style={[
                styles.calendarBadge,
                { borderColor: activeScene.accent },
              ]}
            >
              <Text
                style={[styles.calendarText, { color: activeScene.accent }]}
              >
                APRIL 2026
              </Text>
            </View>
          </View>

          {/* TIME SELECTOR */}
          <View style={styles.tabContainer}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => setActiveScene(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    activeScene.id === scene.id && {
                      color: activeScene.accent,
                    },
                  ]}
                >
                  {scene.title}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* IMMERSIVE CARD */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={45} tint="dark" style={styles.glassCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.cardInfo}>
                <Text style={[styles.krTitle, { color: activeScene.accent }]}>
                  {activeScene.koreanTitle}
                </Text>
                <Text style={styles.mainTitle}>{activeScene.title}</Text>
                <Text style={styles.mainDesc}>{activeScene.description}</Text>
              </View>

              <View style={styles.chatSection}>
                {activeScene.dialogue.map((line, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.bubble,
                      idx % 2 === 0 ? styles.bubbleL : styles.bubbleR,
                    ]}
                  >
                    <Text
                      style={[styles.bubbleChar, { color: activeScene.accent }]}
                    >
                      {line.char}
                    </Text>
                    <Text style={styles.bubbleKr}>{line.kr}</Text>
                    <Text style={styles.bubbleFr}>{line.fr}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

          {/* CALENDAR TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>CALENDAR TOOLBOX</Text>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.expGrid}>
              {activeScene.expressions.map((exp, i) => (
                <BlurView
                  key={i}
                  intensity={25}
                  tint="dark"
                  style={styles.expCard}
                >
                  <View
                    style={[
                      styles.expAccent,
                      { backgroundColor: activeScene.accent },
                    ]}
                  />
                  <View style={styles.expBody}>
                    <Text style={styles.expWord}>{exp.word}</Text>
                    <Text
                      style={[styles.expRom, { color: activeScene.accent }]}
                    >
                      {exp.rom}
                    </Text>
                    <Text style={styles.expMean}>{exp.mean}</Text>
                    <Text style={styles.expCtx}>{exp.context}</Text>
                  </View>
                </BlurView>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,3,6,0.85)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: COLORS.txt, fontSize: 32, marginRight: 5 },
  backText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2,
  },
  calendarBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  calendarText: { fontSize: 9, fontFamily: "Outfit_700Bold", letterSpacing: 1 },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: { color: COLORS.muted, fontFamily: "Outfit_700Bold", fontSize: 11 },

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardInfo: { marginBottom: 30 },
  krTitle: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: { color: COLORS.txt, fontFamily: "Outfit_900Black", fontSize: 30 },
  mainDesc: {
    color: COLORS.muted,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 8,
  },

  chatSection: { gap: 28 },
  bubble: { maxWidth: "88%", padding: 16, borderRadius: 24 },
  bubbleL: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 4,
  },
  bubbleChar: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bubbleKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },

  toolbox: { marginTop: 40 },
  toolboxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  toolboxTitle: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    letterSpacing: 3,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  expBody: { padding: 20 },
  expWord: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 24,
    marginBottom: 2,
  },
  expRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  expMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  expCtx: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
