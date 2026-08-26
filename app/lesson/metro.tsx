import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../../components/app-text";
import { AppBackButton } from "../../components/ui/app-back-button";
import { RESPONSIVE_AUDIO_COPY_MIN_WIDTH } from "../../constants/layout";
import { metroLessons } from "../../data/lesson/metroLessons";
import { useVocAudio } from "../../hooks/useVocAudio";

const COLORS = {
  bg: "#020306",
  pink: "#F472B6",
  cyan: "#22D3EE",
  gold: "#FDE047",
  txt: "rgba(255,255,255,0.96)",
  muted: "rgba(255,255,255,0.60)",
  glass: "rgba(255,255,255,0.05)",
};

const METRO_IMAGE = require("../../assets/images/metroIA.jpg");
const metroLesson =
  metroLessons.find((lesson) => lesson.id === "myeongdong_to_itaewon") ??
  metroLessons[0];

type DialogueLine = {
  char: string;
  kr: string;
  fr: string;
  side: "server" | "me";
};

type Expression = {
  word: string;
  rom: string;
  mean: string;
  context: string;
};

type Scene = {
  id: "ai" | "user";
  tab: string;
  title: string;
  koreanTitle: string;
  description: string;
  accent: string;
  image: ImageSourcePropType;
  dialogue: DialogueLine[];
  expressions: Expression[];
};

const METRO_EXPRESSION_AUDIO: Record<Scene["id"], readonly number[]> = {
  ai: [
    require("../../assets/ai/metro-memo/agent-1.mp3"),
    require("../../assets/ai/metro-memo/agent-2.mp3"),
    require("../../assets/ai/metro-memo/agent-3.mp3"),
    require("../../assets/ai/metro-memo/agent-4.mp3"),
    require("../../assets/ai/metro-memo/agent-5.mp3"),
    require("../../assets/ai/metro-memo/agent-6.mp3"),
    require("../../assets/ai/metro-memo/agent-7.mp3"),
    require("../../assets/ai/metro-memo/agent-8.mp3"),
    require("../../assets/ai/metro-memo/agent-9.mp3"),
  ],
  user: [
    require("../../assets/ai/metro-memo/voyageur-1.mp3"),
    require("../../assets/ai/metro-memo/voyageur-2.mp3"),
    require("../../assets/ai/metro-memo/voyageur-3.mp3"),
    require("../../assets/ai/metro-memo/voyageur-4.mp3"),
    require("../../assets/ai/metro-memo/voyageur-5.mp3"),
    require("../../assets/ai/metro-memo/voyageur-6.mp3"),
    require("../../assets/ai/metro-memo/voyageur-7.mp3"),
    require("../../assets/ai/metro-memo/voyageur-8.mp3"),
    require("../../assets/ai/metro-memo/voyageur-9.mp3"),
  ],
};

const AGENT_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "환승",
    rom: "Hwanseung",
    mean: "Correspondance",
    context: "Mot essentiel pour changer de ligne.",
  },
  {
    word: "명동역에서 타세요",
    rom: "Myeongdong-yeogeseo taseyo",
    mean: "Prenez le métro à Myeongdong",
    context: "Point de départ du trajet.",
  },
  {
    word: "삼각지역에서 내리세요",
    rom: "Samgakji-yeogeseo naeriseyo",
    mean: "Descendez à Samgakji",
    context: "Arrêt où faire la correspondance.",
  },
  {
    word: "6호선을 타세요",
    rom: "Yukhoseoneul taseyo",
    mean: "Prenez la ligne 6",
    context: "Ligne à prendre après la correspondance.",
  },
  {
    word: "이태원역까지 가세요",
    rom: "Itaewon-yeokkkaji gaseyo",
    mean: "Allez jusqu'à Itaewon",
    context: "Destination finale.",
  },
  {
    word: "약 네 정거장 후에",
    rom: "Yak ne jeonggeojang hue",
    mean: "Après environ 4 arrêts",
    context: "Indication de distance dans le métro.",
  },
  {
    word: "그다음 6호선으로 환승하세요",
    rom: "Geudaeum yukhoseoneuro hwanseunghaseyo",
    mean: "Ensuite, changez pour la ligne 6",
    context: "Formulation de guidage côté agent.",
  },
  {
    word: "표지판을 따라가세요",
    rom: "Pyojipaneul ttaragaseyo",
    mean: "Suivez les panneaux",
    context: "Utile pour trouver une ligne ou une sortie.",
  },
  {
    word: "1번 출구",
    rom: "Ilbeon chulgu",
    mean: "Sortie 1",
    context: "Expression essentielle pour les sorties.",
  },
];

const VOYAGEUR_TOOLBOX_EXPRESSIONS: Expression[] = [
  {
    word: "이태원역 어떻게 가요?",
    rom: "Itaewon-yeok eotteoke gayo?",
    mean: "Comment aller à Itaewon ?",
    context: "Question courte pour demander son chemin.",
  },
  {
    word: "어디에서 환승해요?",
    rom: "Eodieseo hwanseunghaeyo?",
    mean: "Où est-ce que je change ?",
    context: "Pour demander le lieu de correspondance.",
  },
  {
    word: "어디에서 내려요?",
    rom: "Eodieseo naeryeoyo?",
    mean: "Où dois-je descendre ?",
    context: "Question essentielle dans le métro.",
  },
  {
    word: "몇 정거장이에요?",
    rom: "Myeot jeonggeojang-ieyo?",
    mean: "C'est à combien d'arrêts ?",
    context: "Pour vérifier la distance.",
  },
  {
    word: "한 정거장",
    rom: "Han jeonggeojang",
    mean: "1 arrêt",
    context: "Réponse ou repère très fréquent.",
  },
  {
    word: "두 정거장",
    rom: "Du jeonggeojang",
    mean: "2 arrêts",
    context: "Réponse ou repère très fréquent.",
  },
  {
    word: "몇 번 출구예요?",
    rom: "Myeot beon chulgu-yeyo?",
    mean: "Quelle sortie ?",
    context: "Pour demander le numéro de sortie.",
  },
  {
    word: "다시 말해 주세요",
    rom: "Dasi malhae juseyo",
    mean: "Répétez, s'il vous plaît",
    context: "Phrase de secours si l'information va trop vite.",
  },
  {
    word: "감사합니다",
    rom: "Gamsahamnida",
    mean: "Merci",
    context: "Fin naturelle de l'échange.",
  },
];

const buildScenes = (): Scene[] => {
  const aiSteps = metroLesson.steps.filter(
    (step) => step.speaker === "ai" && step.korean,
  );

  const userChoices = metroLesson.steps.flatMap((step) =>
    (step.choices ?? [])
      .filter((choice) => choice.korean)
      .map((choice) => ({
        ...choice,
        phase: step.phase,
      })),
  );

  return [
    {
      id: "ai",
      tab: "Agent",
      title: "Côté agent",
      koreanTitle: "길 안내",
      description: metroLesson.situation,
      accent: COLORS.cyan,
      image: METRO_IMAGE,
      dialogue: aiSteps.map((step) => ({
        char: step.phase ?? "Agent",
        kr: step.korean ?? "",
        fr: step.french ?? step.text,
        side: "server",
      })),
      expressions: AGENT_TOOLBOX_EXPRESSIONS,
    },
    {
      id: "user",
      tab: "Voyageur",
      title: "Côté voyageur",
      koreanTitle: "승객 표현",
      description: metroLesson.objective,
      accent: COLORS.pink,
      image: METRO_IMAGE,
      dialogue: userChoices.map((choice) => ({
        char: "Voyageur",
        kr: choice.korean ?? "",
        fr: choice.label,
        side: "me",
      })),
      expressions: VOYAGEUR_TOOLBOX_EXPRESSIONS,
    },
  ];
};

export default function MetroLesson() {
  const scenes = useMemo(() => buildScenes(), []);
  const [activeScene, setActiveScene] = useState<Scene>(scenes[0]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { playAudio, stopAudio } = useVocAudio(setSelectedWord);

  const handleBack = useCallback(() => {
    stopAudio();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }, [stopAudio]);

  const handleSceneChange = (scene: Scene) => {
    if (scene.id === activeScene.id) return;
    stopAudio();
    setActiveScene(scene);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={METRO_IMAGE}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <View style={styles.backBtn}>
              <AppBackButton onPress={handleBack} />
            </View>

            <AppText
              variant="sectionLabel"
              lineContract="singleLine"
              style={styles.headerTitle}
            >
              MÉTRO
            </AppText>
          </View>
          <View style={styles.selectorRow}>
            {scenes.map((scene) => (
              <Pressable
                key={scene.id}
                onPress={() => handleSceneChange(scene)}
                style={[
                  styles.selectorItem,
                  activeScene.id === scene.id && {
                    borderColor: scene.accent,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                ]}
              >
                <AppText
                  variant="label"
                  lineContract="singleLine"
                  style={[
                    styles.selectorText,
                    activeScene.id === scene.id && { color: scene.accent },
                  ]}
                >
                  {scene.tab}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.toolbox}>
            <View style={styles.toolboxHeader}>
              <AppText variant="sectionLabel" style={styles.toolboxTitle}>
                Expressions clés
              </AppText>
              <View
                style={[
                  styles.toolboxLine,
                  { backgroundColor: activeScene.accent },
                ]}
              />
            </View>
            <View style={styles.expressionGrid}>
              {activeScene.expressions.map((exp, i) => {
                const cardId = `${activeScene.id}-${i}`;
                const audioSource = METRO_EXPRESSION_AUDIO[activeScene.id][i];
                const isActive = selectedWord === cardId;
                return (
                  <Pressable
                    key={cardId}
                    onPress={() => void playAudio(audioSource, cardId)}
                    style={({ pressed }) => [
                      styles.expPressable,
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.expCard,
                        isActive && {
                          borderColor: activeScene.accent,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.expAccent,
                          {
                            backgroundColor: activeScene.accent,
                            opacity: isActive ? 1 : 0.75,
                          },
                        ]}
                      />
                      <View style={styles.expContent}>
                        <View style={styles.expTopRow}>
                          <View
                            style={{
                              flex: 1,
                              minWidth: RESPONSIVE_AUDIO_COPY_MIN_WIDTH,
                            }}
                          >
                            <AppText
                              variant="koreanPrimary"
                              script="korean"
                              style={styles.expWord}
                            >
                              {exp.word}
                            </AppText>
                            <AppText
                              variant="caption"
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
                            <AppText
                              variant="caption"
                              lineContract="singleLine"
                              style={[
                                styles.listenIcon,
                                { color: activeScene.accent },
                              ]}
                            >
                              {isActive ? "●" : "▶"}
                            </AppText>
                            <AppText
                              variant="label"
                              lineContract="singleLine"
                              style={styles.listenText}
                            >
                              ÉCOUTER
                            </AppText>
                          </View>
                        </View>
                        <AppText variant="bodyStrong" style={styles.expMean}>
                          {exp.mean}
                        </AppText>
                        <AppText
                          variant="bodySecondary"
                          tone="muted"
                          style={styles.expContext}
                        >
                          {exp.context}
                        </AppText>
                      </View>
                    </View>
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
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 25,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: {
    color: COLORS.muted,
  },
  headerTitle: {
    color: COLORS.pink,
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  selectorItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  selectorText: {
    color: COLORS.muted,
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
  expressionGrid: { gap: 14 },
  expPressable: { width: "100%" },
  expCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "transparent",
  },
  expAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  expContent: { padding: 20 },
  expTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 10,
  },
  expWord: {
    color: COLORS.txt,
    marginBottom: 2,
  },
  expRom: {},
  expMean: {
    color: COLORS.txt,
    marginBottom: 4,
  },
  expContext: {
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
  listenIcon: {},
  listenText: {
    color: "rgba(255,255,255,0.78)",
  },
});
