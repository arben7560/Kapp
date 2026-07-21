import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedAppText, AppText } from "../../../components/app-text";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { useVocAudio } from "../../../hooks/useVocAudio";
import { useVocDialogue } from "../../../hooks/useVocDialogue";

type AudioAsset = number;

type DialogueMessage = {
  char: string;
  kr: string;
  fr: string;
  side: "me" | "server";
  audio?: AudioAsset;
};

type ExpressionItem = {
  word: string;
  rom: string;
  mean: string;
  context: string;
  audio?: AudioAsset;
};

type Scene = {
  id: string;
  title: string;
  koreanTitle: string;
  description: string;
  accent: string;
  image: number;
  dialogue: DialogueMessage[];
  expressions: ExpressionItem[];
};

const COLORS = {
  bg: "#020306",
  calmBlue: "#7DD3FC",
  softTeal: "#2DD4BF",
  pureWhite: "#F8FAFC",
  accentOrange: "#FB923C",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
};

const RENCONTRE_AUDIO = {
  message1: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Rencontre/rencontre-bulle-4.mp3"),

  bonjour: require("../../../assets/audio/voc/Rencontre/toolbox/bonjour.mp3"),
  enchanteRencontre: require("../../../assets/audio/voc/Rencontre/toolbox/enchante-rencontre.mp3"),
  jeMappelle: require("../../../assets/audio/voc/Rencontre/toolbox/je-mappelle.mp3"),
  jeSuisFrancais: require("../../../assets/audio/voc/Rencontre/toolbox/je-suis-francais.mp3"),
  raviDeTeRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-te-rencontrer.mp3"),
  raviDeVousRencontrer: require("../../../assets/audio/voc/Rencontre/toolbox/ravi-de-vous-rencontrer.mp3"),
  jeCompteSurVous: require("../../../assets/audio/voc/Rencontre/toolbox/je-compte-sur-vous.mp3"),
};

const POLITESSE_AUDIO = {
  message1: require("../../../assets/audio/voc/Politesse/politesse-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Politesse/politesse-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Politesse/politesse-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Politesse/politesse-bulle-4.mp3"),

  excusezMoi: require("../../../assets/audio/voc/Politesse/toolbox/excusez-moi.mp3"),
  gomawoyo: require("../../../assets/audio/voc/Politesse/toolbox/gomawoyo.mp3"),
  jeogiyo: require("../../../assets/audio/voc/Politesse/toolbox/jeogiyo.mp3"),
  merci: require("../../../assets/audio/voc/Politesse/toolbox/merci.mp3"),
  unInstant: require("../../../assets/audio/voc/Politesse/toolbox/un-instant.mp3"),
  voici: require("../../../assets/audio/voc/Politesse/toolbox/voici.mp3"),
  pasGrave: require("../../../assets/audio/voc/Politesse/toolbox/pas-grave.mp3"),
};
const EXCUSER_AUDIO = {
  message1: require("../../../assets/audio/voc/Excuser/excuser-bulle-1.mp3"),
  message2: require("../../../assets/audio/voc/Excuser/excuser-bulle-2.mp3"),
  message3: require("../../../assets/audio/voc/Excuser/excuser-bulle-3.mp3"),
  message4: require("../../../assets/audio/voc/Excuser/excuser-bulle-4.mp3"),

  anieyo: require("../../../assets/audio/voc/Excuser/toolbox/anieyo.mp3"),
  desole: require("../../../assets/audio/voc/Excuser/toolbox/desole.mp3"),
  mianhae: require("../../../assets/audio/voc/Excuser/toolbox/mianhae.mp3"),
  mianhaeyo: require("../../../assets/audio/voc/Excuser/toolbox/mianhaeyo.mp3"),
  retardDesole: require("../../../assets/audio/voc/Excuser/toolbox/retard-desole.mp3"),
  vraimentDesole: require("../../../assets/audio/voc/Excuser/toolbox/vraiment-desole.mp3"),
  caVa: require("../../../assets/audio/voc/Excuser/toolbox/ca-va.mp3"),
};
const SCENES: Scene[] = [
  {
    id: "greeting",
    title: "La rencontre",
    koreanTitle: "첫 만남 (Cheot Mannam)",
    description: "Saluer poliment et se présenter pour la première fois.",
    accent: COLORS.calmBlue,
    image: require("../../../assets/images/meet.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "안녕하세요! 처음 뵙겠습니다.",
        fr: "Bonjour ! Enchanté de vous rencontrer.",
        side: "me",
        audio: RENCONTRE_AUDIO.message1,
      },
      {
        char: "Ji-won",
        kr: "네, 안녕하세요. 만나서 반가워요.",
        fr: "Oui, bonjour. Ravi de vous rencontrer.",
        side: "server",
        audio: RENCONTRE_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "제 이름은 마크예요. 저는 프랑스 사람이에요.",
        fr: "Je m'appelle Marc. Je suis français.",
        side: "me",
        audio: RENCONTRE_AUDIO.message3,
      },
      {
        char: "Ji-won",
        kr: "반갑습니다. 잘 부탁드립니다.",
        fr: "Enchantée. Je compte sur vous.",
        side: "server",
        audio: RENCONTRE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "안녕하세요",
        rom: "Annyeong-haseyo",
        mean: "Bonjour",
        context: "La salutation universelle et polie.",
        audio: RENCONTRE_AUDIO.bonjour,
      },
      {
        word: "처음 뵙겠습니다",
        rom: "Cheoeum boepgetseumnida",
        mean: "Enchanté de vous rencontrer",
        context: "Forme très polie lors d'une première rencontre.",
        audio: RENCONTRE_AUDIO.enchanteRencontre,
      },
      {
        word: "반갑습니다",
        rom: "Bangapseumnida",
        mean: "Ravi de vous rencontrer",
        context: "Très respectueux, utile en contexte formel.",
        audio: RENCONTRE_AUDIO.raviDeVousRencontrer,
      },
      {
        word: "만나서 반가워요",
        rom: "Mannaseo bangawoyo",
        mean: "Ravi de te/vous rencontrer",
        context: "Forme polie mais plus naturelle au quotidien.",
        audio: RENCONTRE_AUDIO.raviDeTeRencontrer,
      },
      {
        word: "제 이름은 마크예요",
        rom: "Je ireumeun makeu ieyo",
        mean: "Mon nom est Marc",
        context: "Structure formelle pour se présenter.",
        audio: RENCONTRE_AUDIO.jeMappelle,
      },
      {
        word: "저는 프랑스 사람이에요",
        rom: "Jeoneun Peurangseu saram-ieyo",
        mean: "Je suis français",
        context: "Phrase simple pour dire sa nationalité.",
        audio: RENCONTRE_AUDIO.jeSuisFrancais,
      },
      {
        word: "잘 부탁드립니다",
        rom: "Jal butakdeurimnida",
        mean: "Je compte sur vous",
        context: "Expression culturelle après une présentation.",
        audio: RENCONTRE_AUDIO.jeCompteSurVous,
      },
    ],
  },
  {
    id: "politeness",
    title: "Politesse",
    koreanTitle: "예의 (Yei)",
    description: "Demander un prix poliment dans une boutique.",
    accent: COLORS.softTeal,
    image: require("../../../assets/images/meet.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "죄송해요. 잠시만요.",
        fr: "Excusez-moi, je peux regarder un instant ?",
        side: "me",
        audio: POLITESSE_AUDIO.message1,
      },
      {
        char: "Vendeur",
        kr: "네, 괜찮습니다. 천천히 하세요.",
        fr: "Oui, bien sûr. Prenez votre temps.",
        side: "server",
        audio: POLITESSE_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "감사합니다. 저기요, 이거 얼마예요?",
        fr: "Merci. Excusez-moi, cet article coûte combien ?",
        side: "me",
        audio: POLITESSE_AUDIO.message3,
      },
      {
        char: "Vendeur",
        kr: "여기 있습니다. 만 원입니다.",
        fr: "Tenez, c'est 10 000 wons.",
        side: "server",
        audio: POLITESSE_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "감사합니다",
        rom: "Gamsahamnida",
        mean: "Merci",
        context: "Forme très polie et standard.",
        audio: POLITESSE_AUDIO.merci,
      },
      {
        word: "고마워요",
        rom: "Gomawoyo",
        mean: "Merci",
        context: "Poli, plus doux et quotidien.",
        audio: POLITESSE_AUDIO.gomawoyo,
      },
      {
        word: "죄송해요",
        rom: "Joesonghaeyo",
        mean: "Excusez-moi",
        context: "Pour interpeller ou passer dans la foule.",
        audio: POLITESSE_AUDIO.excusezMoi,
      },
      {
        word: "잠시만요",
        rom: "Jamsimanyo",
        mean: "Un instant / laissez-moi passer",
        context: "Très fréquent dans les transports ou magasins.",
        audio: POLITESSE_AUDIO.unInstant,
      },
      {
        word: "저기요",
        rom: "Jeogiyo",
        mean: "S'il vous plaît / excusez-moi",
        context: "Pour appeler un serveur ou attirer l'attention.",
        audio: POLITESSE_AUDIO.jeogiyo,
      },
      {
        word: "여기 있습니다",
        rom: "Yeogi itseumnida",
        mean: "Voici",
        context: "Quand on donne quelque chose poliment.",
        audio: POLITESSE_AUDIO.voici,
      },
      {
        word: "괜찮습니다",
        rom: "Gwaenchansseumnida",
        mean: "Ça va / ce n'est pas grave",
        context: "Forme polie pour rassurer.",
        audio: POLITESSE_AUDIO.pasGrave,
      },
    ],
  },
  {
    id: "apology",
    title: "S'excuser",
    koreanTitle: "사과 (Sagwa)",
    description: "Exprimer des regrets de manière appropriée.",
    accent: COLORS.accentOrange,
    image: require("../../../assets/images/meet.png"),
    dialogue: [
      {
        char: "Moi",
        kr: "늦어서 정말 죄송합니다.",
        fr: "Je suis vraiment désolé d'être en retard.",
        side: "me",
        audio: EXCUSER_AUDIO.message1,
      },
      {
        char: "Ji-ho",
        kr: "아니에요, 괜찮아요.",
        fr: "Ce n'est rien, ce n'est pas grave.",
        side: "server",
        audio: EXCUSER_AUDIO.message2,
      },
      {
        char: "Moi",
        kr: "기다리게 해서 미안해요.",
        fr: "Désolé de t'avoir fait attendre.",
        side: "me",
        audio: EXCUSER_AUDIO.message3,
      },
      {
        char: "Ji-ho",
        kr: "정말 괜찮아요. 그럼 갈까요?",
        fr: "Vraiment, ça va. Allons-y ensemble maintenant.",
        side: "server",
        audio: EXCUSER_AUDIO.message4,
      },
    ],
    expressions: [
      {
        word: "죄송합니다",
        rom: "Joesong-hamnida",
        mean: "Je suis désolé",
        context: "Forme polie et standard d'excuse.",
        audio: EXCUSER_AUDIO.desole,
      },
      {
        word: "정말 죄송합니다",
        rom: "Jeongmal joesong-hamnida",
        mean: "Je suis vraiment désolé",
        context: "Plus intense, pour une vraie faute.",
        audio: EXCUSER_AUDIO.vraimentDesole,
      },
      {
        word: "늦어서 죄송합니다",
        rom: "Neujeoseo joesong-hamnida",
        mean: "Désolé d'être en retard",
        context: "Très utile dans un rendez-vous.",
        audio: EXCUSER_AUDIO.retardDesole,
      },
      {
        word: "미안해요",
        rom: "Mianhaeyo",
        mean: "Désolé",
        context: "Poli, plus doux et personnel.",
        audio: EXCUSER_AUDIO.mianhaeyo,
      },
      {
        word: "미안해",
        rom: "Mianhae",
        mean: "Désolé",
        context: "Familier, avec des amis proches.",
        audio: EXCUSER_AUDIO.mianhae,
      },
      {
        word: "아니에요",
        rom: "Anieyo",
        mean: "Ce n'est rien",
        context: "Réponse naturelle à des excuses.",
        audio: EXCUSER_AUDIO.anieyo,
      },
      {
        word: "괜찮아요",
        rom: "Gwaenchanayo",
        mean: "Ça va / ce n'est pas grave",
        context: "Pour rassurer quelqu'un.",
        audio: EXCUSER_AUDIO.caVa,
      },
    ],
  },
];

export default function FirstStepsImmersion() {
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { playAudio, stopAudio } = useVocAudio(setSelectedWord, {
    trackPlayback: false,
  });
  const {
    advanceDialogue,
    hintText,
    isTyping,
    resetDialogue,
    shouldHighlightHint,
    visibleMessages,
  } = useVocDialogue({
    sceneId: activeScene.id,
    messages: activeScene.dialogue,
    playAudio,
    stopAudio,
    setSelectedAudio: setSelectedWord,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tapHintPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }).start();

  }, [activeScene, fadeAnim]);

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
    };
  }, [tapHintPulse]);

  const handleSceneChange = (scene: Scene) => {
    if (scene.id === activeScene.id) return;

    stopAudio();
    setSelectedWord(null);
    resetDialogue();
    setActiveScene(scene);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={activeScene.image}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.topNav}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <AppText variant="screenTitle" lineContract="singleLine" style={styles.backArrow}>‹</AppText>
            </Pressable>
            <View>
              <AppText variant="sectionLabel" style={[styles.navEyebrow, { color: activeScene.accent }]}>
                SÉOUL IMMERSION
              </AppText>
              <AppText variant="cardTitle" style={styles.navTitle}>Premiers pas</AppText>
            </View>
          </View>

          <View style={styles.tabBar}>
            {SCENES.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.tab,
                  activeScene.id === scene.id && {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: activeScene.accent,
                  },
                ]}
              >
                <AppText variant="label" lineContract="singleLine"
                  style={[
                    styles.tabLabel,
                    activeScene.id === scene.id && {
                      color: activeScene.accent,
                    },
                  ]}
                >
                  {scene.title}
                </AppText>
              </Pressable>
            ))}
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            }}
          >
            <BlurView intensity={30} tint="dark" style={styles.mainCard}>
              <LinearGradient
                colors={[`${activeScene.accent}15`, "transparent"]}
                style={ABSOLUTE_FILL}
              />

              <View style={styles.cardInfo}>
                <AppText variant="koreanSecondary" script="korean" lineContract="singleLine"
                  style={[styles.krCategory, { color: activeScene.accent }]}
                >
                  {activeScene.koreanTitle}
                </AppText>
                <AppText accessibilityRole="header" variant="sceneTitle" style={styles.sceneTitle}>{activeScene.title}</AppText>
                <AppText variant="subtitle" style={styles.sceneSubtitle}>
                  {activeScene.description}
                </AppText>
              </View>

              <View style={styles.chatArea}>
                {activeScene.dialogue
                  .slice(0, visibleMessages)
                  .map((line, idx) => {
                    const dialogueId = `${activeScene.id}-dialogue-${idx}`;
                    const isMe = line.side === "me";
                    const isActive = selectedWord === dialogueId;

                    return (
                      <Pressable
                        key={dialogueId}
                        onPress={(event) => {
                          event.stopPropagation();
                          playAudio(line.audio, dialogueId);
                        }}
                        style={[
                          styles.msgBox,
                          isMe ? styles.msgRight : styles.msgLeft,
                          isActive && {
                            borderColor: activeScene.accent,
                          },
                        ]}
                      >
                        <AppText variant="label"
                          style={[
                            styles.msgChar,
                            { color: activeScene.accent },
                          ]}
                        >
                          {line.char}
                        </AppText>
                        <AppText variant="koreanSecondary" script="korean" style={styles.msgKr}>{line.kr}</AppText>
                        <AppText variant="bodySecondary" tone="muted" style={styles.msgFr}>{line.fr}</AppText>
                      </Pressable>
                    );
                  })}

                {isTyping && (
                  <View
                    style={[styles.msgBox, styles.msgLeft, styles.typingBubble]}
                  >
                    <AppText variant="label"
                      style={[styles.msgChar, { color: activeScene.accent }]}
                    >
                      {activeScene.dialogue[visibleMessages]?.char}
                    </AppText>

                    <View style={styles.typingDots}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: activeScene.accent },
                        ]}
                      />
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: activeScene.accent },
                        ]}
                      />
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: activeScene.accent },
                        ]}
                      />
                    </View>
                  </View>
                )}

                <Pressable onPress={advanceDialogue} disabled={isTyping}>
                  <AnimatedAppText variant="caption"
                    style={[
                      styles.tapHint,
                      shouldHighlightHint && {
                        color: activeScene.accent,
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
                    {hintText}
                  </AnimatedAppText>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>

          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <AppText variant="sectionTitle" style={styles.toolboxTitle}>Expressions clés</AppText>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>

            <View style={styles.expGrid}>
              {activeScene.expressions.map((exp, i) => {
                const cardId = `${activeScene.id}-${i}`;
                const isActive = selectedWord === cardId;

                return (
                  <Pressable
                    key={cardId}
                    onPress={() => playAudio(exp.audio, cardId)}
                    style={({ pressed }) => [
                      styles.expPressable,
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <BlurView
                      intensity={18}
                      tint="dark"
                      style={[
                        styles.expCard,
                        isActive && { borderColor: activeScene.accent },
                      ]}
                    >
                      <View
                        style={[
                          styles.expGlow,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.8,
                          },
                        ]}
                      />

                      <View style={styles.expTopRow}>
                        <View style={{ flex: 1 }}>
                          <AppText variant="koreanPrimary" script="korean" style={styles.expWord}>{exp.word}</AppText>
                          <AppText variant="caption"
                            style={[
                              styles.expRom,
                              { color: activeScene.accent },
                            ]}
                          >
                            {exp.rom}
                          </AppText>
                        </View>

                        <View
                          style={[
                            styles.listenPill,
                            {
                              backgroundColor: `${activeScene.accent}20`,
                              borderColor: `${activeScene.accent}55`,
                            },
                          ]}
                        >
                          <AppText variant="caption" lineContract="singleLine"
                            style={[
                              styles.listenIcon,
                              { color: activeScene.accent },
                            ]}
                          >
                            {isActive ? "●" : "▶"}
                          </AppText>
                          <AppText variant="label" lineContract="singleLine" style={styles.listenText}>ÉCOUTER</AppText>
                        </View>
                      </View>

                      <AppText variant="bodyStrong" style={styles.expMean}>{exp.mean}</AppText>
                      <AppText variant="bodySecondary" tone="muted" style={styles.expCtx}>{exp.context}</AppText>
                    </BlurView>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { flex: 1, overflow: "hidden" },
  overlay: {
    ...ABSOLUTE_FILL,
    backgroundColor: "rgba(2,3,6,0.86)",
  },
  scroll: { paddingHorizontal: 22, paddingBottom: 90 },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  backArrow: { color: "#fff", marginTop: -2 },
  navEyebrow: {
  },
  navTitle: { color: "#fff", opacity: 0.8 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: {
    color: COLORS.muted,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  levelText: {
    color: COLORS.muted,
  },

  tabBar: { flexDirection: "row", gap: 10, marginBottom: 25 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  tabLabel: {
    color: COLORS.muted,
  },

  mainCard: {
    borderRadius: 32,
    padding: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardInfo: { marginBottom: 30 },
  krCategory: {
    marginBottom: 2,
  },
  sceneTitle: {
    color: COLORS.txt,
  },
  sceneSubtitle: {
    color: COLORS.muted,
    fontStyle: "italic",
    marginTop: 8,
  },

  chatArea: { gap: 16 },
  msgBox: {
    maxWidth: "85%",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  msgLeft: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderBottomLeftRadius: 2,
  },
  msgRight: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomRightRadius: 2,
  },
  msgChar: {
    marginBottom: 6,
  },
  msgKr: {
    color: COLORS.txt,
    marginBottom: 5,
  },
  msgFr: {
    color: COLORS.muted,
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
  },
  tapHint: {
    alignSelf: "center",
    color: "rgba(255,255,255,0.42)",
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
  },
  toolboxLine: { flex: 1, height: 1, opacity: 0.2 },

  expGrid: { gap: 14 },
  expPressable: { width: "100%" },
  expCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  expGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  expTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  expWord: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  expRom: {
  },
  expMean: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  expCtx: {
    color: COLORS.muted,
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
  },
  listenText: {
    color: "rgba(255, 255, 255, 0.78)",
  },
});
