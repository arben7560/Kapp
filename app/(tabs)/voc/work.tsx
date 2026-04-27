import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#020306",
  cyan: "#22D3EE",
  pink: "#F472B6",
  purple: "#A78BFA",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const BUSINESS_DIALOGUE = [
  {
    char: "Moi",
    kr: "안녕하세요. 일정 확인 부탁드립니다.",
    fr: "Bonjour. Merci de vérifier le planning.",
    side: "me",
  },
  {
    char: "Collègue",
    kr: "네, 확인했습니다. 내일 가능합니다.",
    fr: "Oui, j’ai vérifié. C’est possible demain.",
    side: "server",
  },
  {
    char: "Moi",
    kr: "감사합니다. 가능한 시간 알려 주세요.",
    fr: "Merci. Indiquez-moi vos disponibilités.",
    side: "me",
  },
  {
    char: "Collègue",
    kr: "오후 두 시가 괜찮습니다. 잘 부탁드립니다.",
    fr: "14 h me convient. Merci d’avance.",
    side: "server",
  },
];

const SECTIONS = [
  {
    items: [
      {
        kr: "확인했습니다.",
        fr: "J’ai bien vérifié / confirmé.",
        note: "Ultra utile pour répondre sobrement à un message.",
      },
      {
        kr: "알겠습니다.",
        fr: "D’accord / j’ai compris.",
        note: "Très fréquent dans un contexte pro.",
      },
      {
        kr: "감사합니다.",
        fr: "Merci.",
        note: "Base incontournable, très neutre et professionnelle.",
      },
      {
        kr: "잘 부탁드립니다.",
        fr: "Je compte sur votre bienveillance / merci d’avance.",
        note: "Formule très coréenne, utile en message ou mail.",
      },
    ],
  },
  {
    title: "🗓️ Disponibilité / organisation",
    items: [
      {
        kr: "가능한 시간 알려 주세요.",
        fr: "Merci de m’indiquer vos disponibilités.",
      },
      {
        kr: "내일 가능합니다.",
        fr: "C’est possible demain.",
      },
      {
        kr: "조금 늦을 것 같습니다.",
        fr: "Je risque d’être un peu en retard.",
      },
      {
        kr: "일정 확인 후 다시 연락드리겠습니다.",
        fr: "Je vous recontacte après vérification de mon planning.",
      },
    ],
  },
  {
    title: "✉️ Mini formules d’email",
    items: [
      {
        kr: "안녕하세요.",
        fr: "Bonjour.",
      },
      {
        kr: "문의드립니다.",
        fr: "Je vous contacte pour une demande / une question.",
      },
      {
        kr: "확인 부탁드립니다.",
        fr: "Merci de vérifier.",
      },
      {
        kr: "답변 기다리겠습니다.",
        fr: "J’attends votre réponse.",
      },
      {
        kr: "감사합니다. 좋은 하루 되세요.",
        fr: "Merci. Passez une bonne journée.",
      },
    ],
  },
  {
    title: "💬 Exemples courts",
    items: [
      {
        kr: "안녕하세요. 확인했습니다. 감사합니다.",
        fr: "Bonjour. J’ai bien vérifié. Merci.",
      },
      {
        kr: "내일 가능합니다. 잘 부탁드립니다.",
        fr: "C’est possible demain. Merci d’avance.",
      },
      {
        kr: "일정 확인 후 다시 연락드리겠습니다.",
        fr: "Je vous recontacte après vérification du planning.",
      },
    ],
  },
];

function speakKR(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "ko-KR",
    rate: 0.92,
    pitch: 1,
  });
}

export default function WorkEmailPage() {
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const tapHintPulse = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(tapHintPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tapHintPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
      if (typingTimer.current) clearTimeout(typingTimer.current);
      Speech.stop();
    };
  }, [tapHintPulse]);

  const speak = (text: string, id: string) => {
    Speech.stop();
    setSelectedWord(id);
    Vibration.vibrate(8);

    Speech.speak(text, {
      language: "ko-KR",
      rate: 0.92,
      pitch: 1,
      onDone: () => setSelectedWord(null),
      onStopped: () => setSelectedWord(null),
      onError: () => setSelectedWord(null),
    });
  };

  const advanceDialogue = () => {
    if (isTyping) return;

    if (visibleMessages >= BUSINESS_DIALOGUE.length) {
      Vibration.vibrate(8);
      setVisibleMessages(1);
      setIsTyping(false);
      return;
    }

    const nextMessage = BUSINESS_DIALOGUE[visibleMessages];

    Vibration.vibrate(8);

    if (nextMessage.side === "server") {
      setIsTyping(true);

      const delay = 600 + Math.floor(Math.random() * 301);

      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) =>
          Math.min(prev + 1, BUSINESS_DIALOGUE.length),
        );
      }, delay);

      return;
    }

    setVisibleMessages((prev) => Math.min(prev + 1, BUSINESS_DIALOGUE.length));
  };

  const shouldHighlightHint =
    !isTyping && visibleMessages < BUSINESS_DIALOGUE.length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#020306", "#090A18", "#060B18"]}
        style={styles.bg}
      >
        <View style={styles.orbPurple} />
        <View style={styles.orbCyan} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backText}>SÉOUL BUSINESS</Text>
            </Pressable>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>PREMIUM</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabText, { color: COLORS.cyan }]}>
                Pro simple
              </Text>
            </View>
            <View style={styles.tab}>
              <Text style={styles.tabText}>Messages utiles</Text>
            </View>
            <View style={styles.tab}>
              <Text style={styles.tabText}>Emails courts</Text>
            </View>
          </View>

          <BlurView intensity={42} tint="dark" style={styles.glassCard}>
            <LinearGradient
              colors={[`${COLORS.cyan}20`, "transparent"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.cardHeader}>
              <Text style={[styles.krLabel, { color: COLORS.cyan }]}>
                업무 메시지
              </Text>
              <Text style={styles.sceneMainTitle}>Travail & emails courts</Text>
            </View>

            <Text style={styles.sceneDesc}>
              Formules courtes et utiles pour le travail, les messages
              professionnels et les réponses simples.
            </Text>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                MINI ÉCHANGE PROFESSIONNEL
              </Text>
              <View
                style={[styles.sectionLine, { backgroundColor: COLORS.cyan }]}
              />
            </View>

            <Pressable onPress={advanceDialogue} style={styles.dialogueList}>
              {BUSINESS_DIALOGUE.slice(0, visibleMessages).map((line, idx) => {
                const isMe = line.side === "me";
                const dialogueId = `business-dialogue-${idx}`;

                return (
                  <Pressable
                    key={dialogueId}
                    onPress={() => speak(line.kr, dialogueId)}
                    style={[
                      styles.bubble,
                      isMe ? styles.bubbleRight : styles.bubbleLeft,
                      selectedWord === dialogueId && {
                        borderColor: COLORS.cyan,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleChar,
                        { color: isMe ? COLORS.cyan : COLORS.purple },
                      ]}
                    >
                      {line.char}
                    </Text>
                    <Text style={styles.bubbleKr}>{line.kr}</Text>
                    <Text style={styles.bubbleFr}>{line.fr}</Text>
                  </Pressable>
                );
              })}

              {isTyping && (
                <View
                  style={[
                    styles.bubble,
                    styles.bubbleLeft,
                    styles.typingBubble,
                  ]}
                >
                  <Text style={[styles.bubbleChar, { color: COLORS.purple }]}>
                    {BUSINESS_DIALOGUE[visibleMessages]?.char}
                  </Text>

                  <View style={styles.typingDots}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              )}

              <Animated.Text
                style={[
                  styles.tapHint,
                  shouldHighlightHint && {
                    color: COLORS.cyan,
                    opacity: tapHintPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.45, 1],
                    }),
                    transform: [
                      {
                        scale: tapHintPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.03],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {visibleMessages >= BUSINESS_DIALOGUE.length
                  ? "Toucher pour recommencer"
                  : isTyping
                    ? "Réponse en cours..."
                    : "Toucher pour continuer"}
              </Animated.Text>
            </Pressable>
          </BlurView>

          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <Text style={styles.toolboxTitle}>BUSINESS TOOLBOX</Text>
              <View
                style={[styles.toolboxLine, { backgroundColor: COLORS.cyan }]}
              />
            </View>

            <View style={styles.expGrid}>
              {SECTIONS.map((section, sectionIndex) => (
                <View key={section.title} style={styles.sectionGroup}>
                  <Text style={styles.sectionCardTitle}>{section.title}</Text>

                  <View style={styles.phraseList}>
                    {section.items.map((item, i) => {
                      const cardId = `section-${sectionIndex}-${i}`;
                      const isActive = selectedWord === cardId;

                      return (
                        <Pressable
                          key={cardId}
                          onPress={() => speak(item.kr, cardId)}
                          style={({ pressed }) => [
                            styles.phraseCard,
                            isActive && { borderColor: COLORS.cyan },
                            pressed && { transform: [{ scale: 0.985 }] },
                          ]}
                        >
                          <View
                            style={[
                              styles.vocabAccent,
                              {
                                backgroundColor: COLORS.cyan,
                                opacity: isActive ? 1 : 0.75,
                              },
                            ]}
                          />

                          <View style={styles.phraseContent}>
                            <View style={styles.vocabTopRow}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.vocabKr}>{item.kr}</Text>
                                <Text
                                  style={[
                                    styles.vocabRom,
                                    { color: COLORS.cyan },
                                  ]}
                                >
                                  FORMULE PRO
                                </Text>
                              </View>

                              <View
                                style={[
                                  styles.listenPill,
                                  {
                                    backgroundColor: `${COLORS.cyan}20`,
                                    borderColor: `${COLORS.cyan}55`,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.listenIcon,
                                    { color: COLORS.cyan },
                                  ]}
                                >
                                  {isActive ? "●" : "▶"}
                                </Text>
                                <Text style={styles.listenText}>ÉCOUTER</Text>
                              </View>
                            </View>

                            <Text style={styles.vocabMean}>{item.fr}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 90 },

  orbPurple: {
    position: "absolute",
    top: -120,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.16)",
  },
  orbCyan: {
    position: "absolute",
    bottom: -150,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(34,211,238,0.12)",
  },

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
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: {
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1,
  },

  tabContainer: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: `${COLORS.cyan}25`,
    borderColor: COLORS.cyan,
  },
  tabText: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
  },

  glassCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardHeader: { marginBottom: 15 },
  krLabel: {
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sceneMainTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 32,
  },
  sceneDesc: {
    color: COLORS.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 22,
    lineHeight: 20,
  },

  premiumNote: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 18,
    marginBottom: 26,
  },
  noteAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  noteTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 18,
    marginBottom: 8,
  },
  noteText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Outfit_500Medium",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 2.4,
  },
  sectionLine: { flex: 1, height: 1, opacity: 0.25 },

  dialogueList: { gap: 16 },
  bubble: {
    maxWidth: "88%",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderBottomRightRadius: 4,
  },
  bubbleChar: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bubbleKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 4,
  },
  bubbleFr: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },
  typingBubble: {
    minWidth: 92,
    paddingVertical: 15,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingTop: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    opacity: 0.85,
    backgroundColor: COLORS.purple,
  },
  tapHint: {
    alignSelf: "center",
    color: "rgba(255,255,255,0.42)",
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 4,
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
    fontSize: 11,
    letterSpacing: 3,
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  sectionGroup: { gap: 12 },
  sectionCardTitle: {
    color: COLORS.txt,
    fontFamily: "Outfit_900Black",
    fontSize: 18,
  },
  phraseList: { gap: 12 },
  phraseCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  vocabAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  phraseContent: { padding: 18 },
  vocabTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  vocabKr: {
    color: COLORS.txt,
    fontFamily: "NotoSansKR_700Bold",
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 2,
  },
  vocabRom: {
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    textTransform: "uppercase",
  },
  vocabMean: {
    color: COLORS.txt,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 20,
  },
  vocabCtx: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  listenPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  listenIcon: {
    fontSize: 9,
    fontFamily: "Outfit_700Bold",
  },
  listenText: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: "Outfit_700Bold",
    fontSize: 9,
    letterSpacing: 1,
  },
});
