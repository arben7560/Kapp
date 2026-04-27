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
// DESIGN SYSTEM — DIGITAL YEOUIDO EDITION
// ──────────────────────────────────────────────
const COLORS = {
  bg: "#020306",
  techCyan: "#22D3EE",
  silver: "#CBD5E1",
  kakaoYellow: "#FDE047",
  slate: "#475569",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const SCENES = [
  {
    id: "exchange",
    title: "L'Échange",
    koreanTitle: "연락처 교환 (Contact Exchange)",
    description: "Échanger son numéro lors d'une rencontre de networking.",
    accent: COLORS.techCyan,
    image:
      "https://images.unsplash.com/photo-1556740734-7f9a2b7a0f4d?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Moi",
        kr: "번호 좀 알려주시겠어요?",
        fr: "Pourriez-vous me donner votre numéro ?",
      },
      {
        char: "Min-ho",
        kr: "네, 제 번호는 공일공-이삼사-오육칠팔이에요.",
        fr: "Oui, mon numéro est le 010-234-5678.",
      },
    ],
    expressions: [
      {
        word: "번호",
        rom: "Beon-ho",
        mean: "Numéro",
        context: "Utilisé pour le numéro de téléphone, de chambre ou d'ordre.",
      },
      {
        word: "공일공",
        rom: "Gong-il-gong",
        mean: "010",
        context:
          "L'indicatif standard pour presque tous les portables en Corée.",
      },
      {
        word: "알려주다",
        rom: "Al-lyeo-juda",
        mean: "Faire savoir / Donner",
        context: "Forme polie pour demander une information.",
      },
    ],
  },
  {
    id: "call",
    title: "Au Téléphone",
    koreanTitle: "전화 통화 (Phone Call)",
    description: "Répondre à un appel formel ou laisser un message.",
    accent: COLORS.silver,
    image:
      "https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Manager",
        kr: "여보세요, 김수현 씨 계십니까?",
        fr: "Allô, est-ce que M. Kim Su-hyeon est là ?",
      },
      {
        char: "Moi",
        kr: "네, 제가 김수현입니다. 누구세요?",
        fr: "Oui, c'est moi Kim Su-hyeon. Qui est à l'appareil ?",
      },
    ],
    expressions: [
      {
        word: "여보세요",
        rom: "Yeo-bo-se-yo",
        mean: "Allô",
        context:
          "Uniquement utilisé au téléphone pour saluer ou vérifier la ligne.",
      },
      {
        word: "부재중",
        rom: "Bu-jae-jung",
        mean: "Absent / Manqué",
        context: "Apparaît sur votre écran pour les 'appels manqués'.",
      },
      {
        word: "통화 중",
        rom: "Tong-hwa jung",
        mean: "En ligne / Occupé",
        context: "Quand la personne est déjà en communication.",
      },
    ],
  },
  {
    id: "messaging",
    title: "Messagerie",
    koreanTitle: "문자 / 카톡 (Texting)",
    description: "Codes de la messagerie instantanée coréenne.",
    accent: COLORS.kakaoYellow,
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
    dialogue: [
      {
        char: "Ami",
        kr: "카톡 확인해봐! 이모티콘 보냈어.",
        fr: "Regarde ton KakaoTalk ! Je t'ai envoyé un emoji.",
      },
      {
        char: "Moi",
        kr: "답장이 늦어서 미안! 이따가 봐.",
        fr: "Désolé pour la réponse tardive ! On se voit tout à l'heure.",
      },
    ],
    expressions: [
      {
        word: "카톡",
        rom: "Ka-tok",
        mean: "KakaoTalk",
        context: "Le verbe et nom universel pour le messaging en Corée.",
      },
      {
        word: "답장",
        rom: "Dap-jang",
        mean: "Réponse (écrite)",
        context: "Utilisé pour les SMS, mails ou chats.",
      },
      {
        word: "읽씹",
        rom: "Ik-ssip",
        mean: "Lu et ignoré",
        context: "Argot pour 'Vu' mais pas de réponse (très mal vu !).",
      },
    ],
  },
];

export default function PhoneContactImmersion() {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
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
          {/* HEADER CONNECT */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL CONNECTÉ</Text>
            </Pressable>
            <View
              style={[styles.signalBadge, { borderColor: activeScene.accent }]}
            >
              <Text style={[styles.signalText, { color: activeScene.accent }]}>
                5G ACTIVE
              </Text>
            </View>
          </View>

          {/* CHANNEL SELECTOR */}
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

          {/* INTERACTION CARD */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
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

          {/* CONTACT TOOLBOX */}
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>CONTACT TOOLBOX</Text>
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
  signalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  signalText: { fontSize: 9, fontFamily: "Outfit_700Bold" },

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
    backgroundColor: "rgba(34, 211, 238, 0.05)",
    borderBottomLeftRadius: 4,
  },
  bubbleR: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
