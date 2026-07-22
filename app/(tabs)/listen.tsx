import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useStore } from "../../_store";
import { AppText } from "../../components/app-text";
import { useVocAudio } from "../../hooks/useVocAudio";
import { completeDailyActivity } from "../../lib/dailyStreak";
import { shuffleArray, shuffleIndexedChoices } from "../../lib/choiceOrder";
import { buildProgressId } from "../../lib/progressIds";

const BG_URL =
  "https://images.unsplash.com/photo-1741533911359-943221043128?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=75&w=1600";

const COLORS = {
  bg: "#07080d",
  card: "rgba(14, 17, 28, 0.78)",
  cardSoft: "rgba(255,255,255,0.08)",
  line: "rgba(255,255,255,0.14)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.66)",
  faint: "rgba(255,255,255,0.42)",
  red: "#ff4f66",
  redSoft: "rgba(255,79,102,0.18)",
  purple: "#a855f7",
  green: "#8df0b5",
};

type ExerciseKind = "dictation" | "situation" | "gap" | "order" | "reaction";

type BaseExercise = {
  id: string;
  kind: ExerciseKind;
  theme: string;
  title: string;
  instruction: string;
  explanation?: string;
};

type ChoiceExercise = BaseExercise & {
  kind: "dictation" | "situation" | "reaction";
  options: string[];
  answer: number;
};

type GapExercise = BaseExercise & {
  kind: "gap";
  before: string;
  after: string;
  options: string[];
  answer: string;
};

type OrderExercise = BaseExercise & {
  kind: "order";
  words: string[];
  answer: string[];
};

type ListenExercise = ChoiceExercise | GapExercise | OrderExercise;

function shuffleListenChoices(exercise: ListenExercise): ListenExercise {
  if (exercise.kind === "order") {
    return { ...exercise, words: shuffleArray(exercise.words) };
  }

  if (exercise.kind === "gap") {
    return { ...exercise, options: shuffleArray(exercise.options) };
  }

  const shuffled = shuffleIndexedChoices(exercise.options, exercise.answer);
  return {
    ...exercise,
    options: shuffled.choices,
    answer: shuffled.correctIndex,
  };
}

const LISTEN_AUDIO_BY_ID: Partial<Record<string, number>> = {
  "cafe-dictation-01": require("../../assets/audio/listen/cafe-dictation-01.mp3"),
  "cafe-dictation-02": require("../../assets/audio/listen/cafe-dictation-02.mp3"),
  "metro-dictation-03": require("../../assets/audio/listen/metro-dictation-03.mp3"),
  "shop-dictation-04": require("../../assets/audio/listen/shop-dictation-04.mp3"),
  "hotel-dictation-05": require("../../assets/audio/listen/hotel-dictation-05.mp3"),
  "bbq-situation-01": require("../../assets/audio/listen/bbq-situation-01.mp3"),
  "cafe-situation-02": require("../../assets/audio/listen/cafe-situation-02.mp3"),
  "metro-situation-03": require("../../assets/audio/listen/metro-situation-03.mp3"),
  "shop-situation-04": require("../../assets/audio/listen/shop-situation-04.mp3"),
  "street-situation-05": require("../../assets/audio/listen/street-situation-05.mp3"),
  "restaurant-gap-01": require("../../assets/audio/listen/restaurant-gap-01.mp3"),
  "cafe-gap-02": require("../../assets/audio/listen/cafe-gap-02.mp3"),
  "shop-gap-03": require("../../assets/audio/listen/shop-gap-03.mp3"),
  "metro-gap-04": require("../../assets/audio/listen/metro-gap-04.mp3"),
  "hotel-gap-05": require("../../assets/audio/listen/hotel-gap-05.mp3"),
  "metro-order-01": require("../../assets/audio/listen/metro-order-01.mp3"),
  "cafe-order-02": require("../../assets/audio/listen/cafe-order-02.mp3"),
  "shop-order-03": require("../../assets/audio/listen/shop-order-03.mp3"),
  "restaurant-order-04": require("../../assets/audio/listen/restaurant-order-04.mp3"),
  "street-order-05": require("../../assets/audio/listen/street-order-05.mp3"),
  "cafe-reaction-01": require("../../assets/audio/listen/cafe-reaction-01.mp3"),
  "restaurant-reaction-02": require("../../assets/audio/listen/restaurant-reaction-02.mp3"),
  "shop-reaction-03": require("../../assets/audio/listen/shop-reaction-03.mp3"),
  "hotel-reaction-04": require("../../assets/audio/listen/hotel-reaction-04.mp3"),
  "street-reaction-05": require("../../assets/audio/listen/street-reaction-05.mp3"),
};

const TRAINING_ORDER: ExerciseKind[] = [
  "dictation",
  "situation",
  "gap",
  "order",
  "reaction",
];

const EXERCISES_BY_KIND: Record<ExerciseKind, ListenExercise[]> = {
  dictation: [
    {
      id: "cafe-dictation-01",
      kind: "dictation",
      theme: "Café",
      title: "Retrouve la phrase",
      instruction: "Écoute, puis choisis la bonne écriture.",
      options: ["몇 분이세요?", "몇 본이세요?", "몇 분 이세요?"],
      answer: 0,
      explanation: "몇 분이세요? = Vous êtes combien ?",
    },
    {
      id: "cafe-dictation-02",
      kind: "dictation",
      theme: "Café",
      title: "Repère la formule",
      instruction: "Écoute, puis choisis la phrase exacte.",
      options: [
        "아이스 아메리카노 주세요.",
        "아이 아메리카노 주세요.",
        "아이스 아메리카노 주새요.",
      ],
      answer: 0,
      explanation:
        "아이스 아메리카노 주세요. = Un americano glacé, s'il vous plaît.",
    },
    {
      id: "metro-dictation-03",
      kind: "dictation",
      theme: "Métro",
      title: "Entends la direction",
      instruction: "Écoute, puis retrouve l'écriture correcte.",
      options: ["이곳으로 가세요.", "이것으로 가세요.", "이곳으로 가새요."],
      answer: 0,
      explanation: "이곳으로 가세요. = Allez par ici.",
    },
    {
      id: "shop-dictation-04",
      kind: "dictation",
      theme: "Boutique",
      title: "Distingue le prix",
      instruction: "Écoute, puis sélectionne la bonne phrase.",
      options: ["얼마예요?", "얼마에요?", "얼마이에요?"],
      answer: 0,
      explanation: "얼마예요? = Combien ça coûte ?",
    },
    {
      id: "hotel-dictation-05",
      kind: "dictation",
      theme: "Hôtel",
      title: "Note la demande",
      instruction: "Écoute, puis choisis la bonne écriture.",
      options: ["예약했어요.", "여약했어요.", "예약해써요."],
      answer: 0,
      explanation: "예약했어요. = J'ai réservé.",
    },
  ],
  situation: [
    {
      id: "bbq-situation-01",
      kind: "situation",
      theme: "K-BBQ",
      title: "Comprends la situation",
      instruction: "Écoute la serveuse et choisis la réponse logique.",
      options: ["두 명이에요.", "카드로 계산할게요.", "물 주세요."],
      answer: 0,
      explanation: "La serveuse demande le nombre de personnes.",
    },
    {
      id: "cafe-situation-02",
      kind: "situation",
      theme: "Café",
      title: "Réponds au barista",
      instruction: "Écoute la question et choisis la réponse naturelle.",
      options: ["따뜻한 라떼 주세요.", "여기서 내려요.", "예약했어요."],
      answer: 0,
      explanation: "On te demande ce que tu veux commander.",
    },
    {
      id: "metro-situation-03",
      kind: "situation",
      theme: "Métro",
      title: "Trouve l'arrêt",
      instruction: "Écoute l'annonce et choisis quoi faire.",
      options: ["여기서 내려요.", "두 명이에요.", "포장해 주세요."],
      answer: 0,
      explanation: "L'annonce indique que c'est l'arrêt où descendre.",
    },
    {
      id: "shop-situation-04",
      kind: "situation",
      theme: "Boutique",
      title: "Choisis le paiement",
      instruction: "Écoute la question et choisis la réponse adaptée.",
      options: ["카드로 할게요.", "화장실이 어디예요?", "괜찮아요."],
      answer: 0,
      explanation: "On te demande comment tu veux payer.",
    },
    {
      id: "street-situation-05",
      kind: "situation",
      theme: "Rue",
      title: "Demande ton chemin",
      instruction: "Écoute la personne et choisis la réponse logique.",
      options: ["네, 감사합니다.", "아이스로 주세요.", "삼겹살 주세요."],
      answer: 0,
      explanation: "La personne vient de t'indiquer le chemin.",
    },
  ],
  gap: [
    {
      id: "restaurant-gap-01",
      kind: "gap",
      theme: "Restaurant",
      title: "Complète le mot",
      instruction: "Écoute, puis complète la phrase.",
      before: "삼겹살 ",
      after: " 주세요.",
      options: ["2인분", "2번", "2명"],
      answer: "2인분",
      explanation: "2인분 = deux portions.",
    },
    {
      id: "cafe-gap-02",
      kind: "gap",
      theme: "Café",
      title: "Complète la commande",
      instruction: "Écoute, puis choisis le mot manquant.",
      before: "아이스 ",
      after: " 주세요.",
      options: ["라떼", "지하철", "계산"],
      answer: "라떼",
      explanation: "아이스 라떼 주세요. = Un latte glacé, s'il vous plaît.",
    },
    {
      id: "shop-gap-03",
      kind: "gap",
      theme: "Boutique",
      title: "Complète le paiement",
      instruction: "Écoute, puis complète la phrase.",
      before: "",
      after: "로 계산할게요.",
      options: ["카드", "물", "여기"],
      answer: "카드",
      explanation: "카드로 계산할게요. = Je vais payer par carte.",
    },
    {
      id: "metro-gap-04",
      kind: "gap",
      theme: "Métro",
      title: "Complète le lieu",
      instruction: "Écoute, puis choisis le mot manquant.",
      before: "",
      after: "에서 내려요.",
      options: ["홍대입구", "커피", "예약"],
      answer: "홍대입구",
      explanation: "홍대입구에서 내려요. = Je descends à Hongik University.",
    },
    {
      id: "hotel-gap-05",
      kind: "gap",
      theme: "Hôtel",
      title: "Complète la réservation",
      instruction: "Écoute, puis complète la phrase.",
      before: "",
      after: "했어요.",
      options: ["예약", "주문", "하차"],
      answer: "예약",
      explanation: "예약했어요. = J'ai réservé.",
    },
  ],
  order: [
    {
      id: "metro-order-01",
      kind: "order",
      theme: "Métro",
      title: "Remets en ordre",
      instruction: "Écoute, puis reconstruis la phrase.",
      words: ["가세요", "이곳으로", "그냥"],
      answer: ["그냥", "이곳으로", "가세요"],
      explanation: "그냥 이곳으로 가세요. = Allez simplement par ici.",
    },
    {
      id: "cafe-order-02",
      kind: "order",
      theme: "Café",
      title: "Reconstruis la commande",
      instruction: "Écoute, puis remets les mots dans l'ordre.",
      words: ["주세요", "아이스", "아메리카노"],
      answer: ["아이스", "아메리카노", "주세요"],
      explanation:
        "아이스 아메리카노 주세요. = Un americano glacé, s'il vous plaît.",
    },
    {
      id: "shop-order-03",
      kind: "order",
      theme: "Boutique",
      title: "Replace les mots",
      instruction: "Écoute, puis reconstruis la phrase.",
      words: ["얼마예요", "이거", "?"],
      answer: ["이거", "얼마예요", "?"],
      explanation: "이거 얼마예요? = Combien coûte ceci ?",
    },
    {
      id: "restaurant-order-04",
      kind: "order",
      theme: "Restaurant",
      title: "Remets la demande",
      instruction: "Écoute, puis remets les mots en ordre.",
      words: ["주세요", "물", "좀"],
      answer: ["물", "좀", "주세요"],
      explanation: "물 좀 주세요. = Un peu d'eau, s'il vous plaît.",
    },
    {
      id: "street-order-05",
      kind: "order",
      theme: "Rue",
      title: "Reconstruis la question",
      instruction: "Écoute, puis reconstruis la phrase.",
      words: ["어디예요", "화장실이", "?"],
      answer: ["화장실이", "어디예요", "?"],
      explanation: "화장실이 어디예요? = Où sont les toilettes ?",
    },
  ],
  reaction: [
    {
      id: "cafe-reaction-01",
      kind: "reaction",
      theme: "Café",
      title: "Choisis la réaction",
      instruction: "Écoute et réponds naturellement.",
      options: ["아이스 아메리카노 주세요.", "화장실이 어디예요?", "괜찮아요."],
      answer: 0,
      explanation: "On te demande ce que tu veux prendre.",
    },
    {
      id: "restaurant-reaction-02",
      kind: "reaction",
      theme: "Restaurant",
      title: "Réagis à la serveuse",
      instruction: "Écoute et choisis la réponse naturelle.",
      options: ["네, 물 좀 주세요.", "여기서 내려요.", "예약했어요."],
      answer: 0,
      explanation: "La serveuse demande si tu as besoin de quelque chose.",
    },
    {
      id: "shop-reaction-03",
      kind: "reaction",
      theme: "Boutique",
      title: "Réponds au vendeur",
      instruction: "Écoute, puis choisis la bonne réaction.",
      options: ["괜찮아요, 그냥 볼게요.", "두 명이에요.", "맛있어요."],
      answer: 0,
      explanation: "Le vendeur propose de t'aider, tu réponds que tu regardes.",
    },
    {
      id: "hotel-reaction-04",
      kind: "reaction",
      theme: "Hôtel",
      title: "Réponds à l'accueil",
      instruction: "Écoute et choisis la réponse adaptée.",
      options: ["예약했어요.", "포장해 주세요.", "얼마예요?"],
      answer: 0,
      explanation: "La réception demande si tu as une réservation.",
    },
    {
      id: "street-reaction-05",
      kind: "reaction",
      theme: "Rue",
      title: "Réagis poliment",
      instruction: "Écoute, puis choisis la réaction naturelle.",
      options: ["감사합니다.", "아이스로 주세요.", "카드로 할게요."],
      answer: 0,
      explanation: "Quelqu'un vient de t'aider, tu remercies.",
    },
  ],
};

const KIND_LABEL: Record<ExerciseKind, { mini: string; skill: string }> = {
  dictation: { mini: "Orthographe", skill: "Écoute + Hangul" },
  situation: { mini: "Situation", skill: "Compréhension" },
  gap: { mini: "Mot manquant", skill: "Vocabulaire" },
  order: { mini: "Ordre", skill: "Syntaxe" },
  reaction: { mini: "Réaction", skill: "Conversation" },
};

export default function ListenScreen() {
  const { complete } = useStore();
  const scrollRef = useRef<ScrollView | null>(null);
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playedAudioIds, setPlayedAudioIds] = useState<Record<string, true>>({});
  const { playAudio: playMp3, stopAudio } = useVocAudio(setPlayingAudioId);

  const trainingKind = TRAINING_ORDER[trainingIndex];
  const exercises = EXERCISES_BY_KIND[trainingKind];
  const sourceItem = exercises[exerciseIndex];
  const item = useMemo(() => shuffleListenChoices(sourceItem), [sourceItem]);
  const meta = KIND_LABEL[trainingKind];
  const audioSource = LISTEN_AUDIO_BY_ID[item.id];
  const hasAttempt = item.kind === "order" ? picked.length > 0 : selected !== null;
  const hasPlayedCurrentAudio = !!playedAudioIds[item.id];
  const isLastExercise = exerciseIndex === exercises.length - 1;

  useEffect(() => {
    return stopAudio;
  }, [item.id, stopAudio]);

  useEffect(() => {
    if (!audioSource) {
      console.warn(`[Listen] Source audio manquante pour l’exercice ${item.id}.`);
    }
  }, [audioSource, item.id]);

  const canCheck = useMemo(() => {
    if (item.kind === "order") return picked.length === item.words.length;
    return selected !== null;
  }, [item, picked.length, selected]);

  const isAnswerCorrect = () => {
    if (item.kind === "order") {
      const sentence = picked.map((id) => item.words[id]);
      return sentence.join(" ") === item.answer.join(" ");
    }

    if (item.kind === "gap") {
      return item.options[selected ?? -1] === item.answer;
    }

    return selected === item.answer;
  };

  const getExpectedAnswer = () => {
    if (item.kind === "order") return item.answer.join(" ");
    if (item.kind === "gap") return item.answer;
    return item.options[item.answer] ?? "";
  };

  const isCorrect = checked && isAnswerCorrect();

  const resetAnswer = () => {
    setSelected(null);
    setPicked([]);
    setChecked(false);
  };

  const goNext = () => {
    const nextIndex =
      exerciseIndex === exercises.length - 1 ? 0 : exerciseIndex + 1;
    setExerciseIndex(nextIndex);
    resetAnswer();
  };

  const changeTraining = (direction: -1 | 1) => {
    const nextTrainingIndex =
      (trainingIndex + direction + TRAINING_ORDER.length) %
      TRAINING_ORDER.length;

    setTrainingIndex(nextTrainingIndex);
    setExerciseIndex(0);
    resetAnswer();
  };

  const handleValidate = () => {
    if (!canCheck) return;

    const correct = isAnswerCorrect();
    const expectedAnswer = getExpectedAnswer();

    setChecked(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);

    AccessibilityInfo.announceForAccessibility(
      correct
        ? `Correct. Réponse attendue : ${expectedAnswer}.`
        : `À revoir. Réponse attendue : ${expectedAnswer}.`,
    );

    if (correct) {
      complete(buildProgressId("listen", item.id));
      void completeDailyActivity("listen_exercise").then((state) => {
        setDailyMessage(
          state.lastCompletionResult === "completed_with_freeze"
            ? "Protection de série utilisée. Série conservée."
            : "Série conservée.",
        );
        setTimeout(
          () => scrollRef.current?.scrollToEnd({ animated: true }),
          80,
        );
        setTimeout(() => setDailyMessage(null), 2200);
      });
    }
  };

  const playAudio = () => {
    if (!audioSource) return;
    setPlayedAudioIds((current) => ({ ...current, [item.id]: true }));
    playMp3(audioSource, item.id);
  };

  const pickOrderWord = (wordIndex: number) => {
    if (checked || picked.includes(wordIndex)) return;
    setPicked((prev) => [...prev, wordIndex]);
  };

  const removeOrderWord = (wordIndex: number) => {
    if (checked) return;
    setPicked((prev) => prev.filter((id) => id !== wordIndex));
  };

  const renderChoices = () => {
    if (item.kind === "order") {
      return (
        <View>
          <View style={styles.sentenceBox}>
            {picked.length === 0 ? (
              <AppText variant="body" tone="soft" style={styles.placeholder}>
                Construis la phrase ici
              </AppText>
            ) : (
              picked.map((wordIndex) => (
                <Pressable
                  key={wordIndex}
                  accessibilityRole="button"
                  accessibilityLabel={`Retirer ${item.words[wordIndex]} de la phrase`}
                  accessibilityState={{ selected: true }}
                  aria-selected={true}
                  hitSlop={6}
                  onPress={() => removeOrderWord(wordIndex)}
                  style={styles.wordSelected}
                >
                  <AppText
                    variant="koreanSecondary"
                    tone="strong"
                    script="korean"
                    accessibilityLanguage="ko"
                    style={styles.wordText}
                  >
                    {item.words[wordIndex]}
                  </AppText>
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.wordGrid}>
            {item.words.map((word, wordIndex) => {
              const used = picked.includes(wordIndex);
              return (
                <Pressable
                  key={`${word}-${wordIndex}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Ajouter ${word} a la phrase`}
                  accessibilityState={{
                    disabled: used || checked,
                    selected: used,
                  }}
                  aria-disabled={used || checked}
                  aria-selected={used}
                  hitSlop={6}
                  disabled={used || checked}
                  onPress={() => pickOrderWord(wordIndex)}
                  style={[styles.wordOption, used && styles.disabledOption]}
                >
                  <AppText
                    variant="koreanSecondary"
                    tone={used ? "soft" : "strong"}
                    script="korean"
                    accessibilityLanguage="ko"
                    style={[styles.optionText, used && styles.disabledText]}
                  >
                    {word}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (item.kind === "gap") {
      return (
        <View>
          <View style={styles.gapSentence}>
            <AppText
              variant="koreanPrimary"
              tone="strong"
              script="korean"
              accessibilityLanguage="ko"
              style={styles.koreanInline}
            >
              {item.before}
            </AppText>
            <View style={styles.blank} />
            <AppText
              variant="koreanPrimary"
              tone="strong"
              script="korean"
              accessibilityLanguage="ko"
              style={styles.koreanInline}
            >
              {item.after}
            </AppText>
          </View>

          <View style={styles.choiceStack}>
            {item.options.map((option, optionIndex) => (
              <ChoiceButton
                key={option}
                label={option}
                active={selected === optionIndex}
                locked={checked}
                correct={checked && option === item.answer}
                wrong={
                  checked && selected === optionIndex && option !== item.answer
                }
                onPress={() => !checked && setSelected(optionIndex)}
              />
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.choiceStack}>
        {item.options.map((option, optionIndex) => (
          <ChoiceButton
            key={option}
            label={option}
            active={selected === optionIndex}
            locked={checked}
            correct={checked && optionIndex === item.answer}
            wrong={
              checked && selected === optionIndex && optionIndex !== item.answer
            }
            onPress={() => !checked && setSelected(optionIndex)}
          />
        ))}
      </View>
    );
  };

  return (
    <ImageBackground
      source={{ uri: BG_URL }}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            hitSlop={6}
            onPress={() => router.back()}
            style={styles.roundButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <AppText variant="sectionLabel" tone="brand" style={styles.kicker}>
              SÉOUL IMMERSION
            </AppText>
            <AppText
              variant="sectionTitle"
              tone="strong"
              style={styles.headerTitle}
            >
              Écoute
            </AppText>
          </View>

          <View style={styles.roundButton} />
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.modePill}>
            <Ionicons name="volume-high" size={16} color={COLORS.purple} />
            <AppText variant="label" tone="strong" style={styles.modeText}>
              ÉCOUTE
            </AppText>
          </View>

          <View style={styles.modeSwitcherWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entraînement précédent"
              hitSlop={8}
              onPress={() => changeTraining(-1)}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.text} />
            </Pressable>

            <View style={styles.modeCenterPill}>
              <AppText
                variant="label"
                tone="soft"
                style={styles.modeCenterMini}
              >
                ENTRAÎNEMENT
              </AppText>
              <AppText
                variant="bodyStrong"
                tone="strong"
                style={styles.modeCenterLabel}
              >
                {meta.mini}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entraînement suivant"
              hitSlop={8}
              onPress={() => changeTraining(1)}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-forward" size={22} color={COLORS.text} />
            </Pressable>
          </View>

          <View style={styles.progressRow}>
            {exercises.map((exercise, currentExerciseIndex) => (
              <Pressable
                key={exercise.id}
                accessibilityRole="button"
                accessibilityLabel={`Question ${currentExerciseIndex + 1} sur ${exercises.length}`}
                accessibilityState={{
                  selected: currentExerciseIndex === exerciseIndex,
                }}
                aria-selected={currentExerciseIndex === exerciseIndex}
                hitSlop={12}
                onPress={() => {
                  setExerciseIndex(currentExerciseIndex);
                  resetAnswer();
                }}
                style={[
                  styles.dot,
                  currentExerciseIndex === exerciseIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopTitleWrap}>
                <AppText
                  variant="sectionLabel"
                  tone="brand"
                  style={styles.theme}
                >
                  {item.theme}
                </AppText>
                <AppText
                  variant="sectionTitle"
                  tone="strong"
                  style={styles.title}
                >
                  {item.title}
                </AppText>
              </View>
              <AppText
                variant="caption"
                tone="soft"
                align="end"
                style={styles.counter}
              >
                {String(exerciseIndex + 1).padStart(2, "0")} /{" "}
                {String(exercises.length).padStart(2, "0")}
              </AppText>
            </View>

            <View style={styles.skillRow}>
              <AppText variant="label" tone="strong" style={styles.skillPill}>
                {meta.mini}
              </AppText>
              <AppText variant="caption" tone="muted" style={styles.skillText}>
                {meta.skill}
              </AppText>
            </View>

            <AppText variant="body" tone="muted" style={styles.instruction}>
              {item.instruction}
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${hasPlayedCurrentAudio ? "Réécouter" : "Écouter"} l’audio de la question`}
              accessibilityState={{ disabled: !audioSource }}
              aria-disabled={!audioSource}
              hitSlop={6}
              disabled={!audioSource}
              onPress={playAudio}
              style={[
                styles.listenButton,
                !audioSource && styles.disabledButton,
              ]}
            >
              <Ionicons name="play" size={18} color={COLORS.text} />
              <AppText variant="button" tone="strong" style={styles.listenText}>
                {hasPlayedCurrentAudio ? "Réécouter" : "Écouter"}
              </AppText>
            </Pressable>

            <AppText
              variant="caption"
              tone="soft"
              align="center"
              style={styles.audioHint}
            >
              {audioSource
                ? playingAudioId === item.id
                  ? "Lecture en cours"
                  : hasPlayedCurrentAudio
                    ? "Prêt à réécouter"
                    : "Prêt à écouter"
                : "Audio indisponible"}
            </AppText>

            {renderChoices()}

            {checked && (
              <View
                accessibilityLiveRegion="polite"
                accessible
                accessibilityRole="alert"
                accessibilityLabel={`${isCorrect ? "Correct" : "À revoir"}. Réponse attendue : ${getExpectedAnswer()}. ${item.explanation ?? ""}`}
                style={[styles.feedback, isCorrect ? styles.good : styles.bad]}
              >
                <AppText
                  variant="bodyStrong"
                  tone="strong"
                  style={styles.feedbackTitle}
                >
                  {isCorrect ? "Correct" : "À revoir"}
                </AppText>
                <AppText
                  variant="label"
                  tone="strong"
                  style={styles.expectedLabel}
                >
                  Réponse attendue
                </AppText>
                <AppText
                  variant="koreanSecondary"
                  tone="accent"
                  script="korean"
                  accessibilityLanguage="ko"
                  style={styles.expectedText}
                >
                  {getExpectedAnswer()}
                </AppText>
                <AppText variant="body" tone="muted" style={styles.feedbackText}>
                  {item.explanation}
                </AppText>
              </View>
            )}

            <View style={styles.actionRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Réessayer cette question"
                accessibilityState={{ disabled: !hasAttempt }}
                aria-disabled={!hasAttempt}
                hitSlop={6}
                disabled={!hasAttempt}
                onPress={resetAnswer}
                style={[styles.actionButton, styles.secondaryButton, !hasAttempt && styles.disabledButton]}
              >
                <AppText
                  variant="button"
                  tone="muted"
                  style={styles.secondaryText}
                >
                  Réessayer
                </AppText>
              </Pressable>

              {!checked ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Valider la réponse"
                  accessibilityState={{ disabled: !canCheck }}
                  aria-disabled={!canCheck}
                  hitSlop={6}
                  disabled={!canCheck}
                  onPress={handleValidate}
                  style={[
                    styles.actionButton,
                    !canCheck && styles.disabledButton,
                  ]}
                >
                  <AppText variant="button" tone="strong" style={styles.actionText}>
                    Valider
                  </AppText>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isCorrect
                      ? isLastExercise
                        ? "Recommencer l’entraînement"
                        : "Passer à la question suivante"
                      : "Réessayer cette question"
                  }
                  hitSlop={6}
                  onPress={isCorrect ? goNext : resetAnswer}
                  style={styles.actionButton}
                >
                  <AppText variant="button" tone="strong" style={styles.actionText}>
                    {isCorrect ? isLastExercise ? "Recommencer l’entraînement" : "Suivant" : "Réessayer"}
                  </AppText>
                </Pressable>
              )}
            </View>

            {!!dailyMessage && (
              <View style={styles.streakToast}>
                <Ionicons name="flame" size={16} color={COLORS.green} />
                <AppText
                  variant="caption"
                  tone="accent"
                  style={styles.streakToastText}
                >
                  {dailyMessage}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.footerNote}>
            <AppText
              variant="sectionLabel"
              tone="brand"
              style={styles.footerTitle}
            >
              Objectif
            </AppText>
            <AppText variant="body" tone="muted" style={styles.footerText}>
              Comprendre avant de lire. La traduction n’apparaît qu’après
              validation.
            </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function ChoiceButton({
  label,
  active,
  locked,
  correct,
  wrong,
  onPress,
}: {
  label: string;
  active: boolean;
  locked: boolean;
  correct: boolean;
  wrong: boolean;
  onPress: () => void;
}) {
  const stateLabel = correct
    ? "Bonne réponse"
    : wrong
      ? "Réponse choisie incorrecte"
      : active
        ? "Selectionnee"
        : "Non sélectionnée";

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label}. ${stateLabel}`}
      accessibilityState={{
        checked: active,
        selected: active,
        disabled: locked,
      }}
      aria-checked={active}
      aria-selected={active}
      aria-disabled={locked}
      hitSlop={6}
      disabled={locked}
      onPress={onPress}
      style={[
        styles.choice,
        active && styles.choiceActive,
        correct && styles.choiceCorrect,
        wrong && styles.choiceWrong,
      ]}
    >
      <AppText
        variant="koreanSecondary"
        tone="strong"
        script="korean"
        accessibilityLanguage="ko"
        align="center"
        style={styles.optionText}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.66)",
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
  kicker: {
    color: COLORS.red,
  },
  headerTitle: {
    color: COLORS.text,
    marginTop: 3,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    paddingTop: 14,
  },
  modePill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.purple,
    backgroundColor: "rgba(168,85,247,0.12)",
    marginBottom: 22,
  },
  modeText: {
    color: COLORS.text,
  },
  modeSwitcherWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 28,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  modeCenterPill: {
    flex: 1,
    minWidth: 0,
    maxWidth: 158,
    minHeight: 54,
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
  },
  modeCenterMini: {
    color: COLORS.faint,
    marginBottom: 1,
  },
  modeCenterLabel: {
    color: COLORS.text,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginBottom: 22,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  dotActive: {
    backgroundColor: COLORS.purple,
    transform: [{ scale: 1.2 }],
  },
  card: {
    borderRadius: 32,
    paddingTop: 24,
    paddingBottom: 26,
    paddingLeft: 22,
    paddingRight: 28,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTopTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  theme: {
    color: COLORS.red,
  },
  title: {
    color: COLORS.text,
    marginTop: 7,
  },
  counter: {
    color: COLORS.faint,
    paddingTop: 4,
    minWidth: 48,
    textAlign: "right",
  },
  skillRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skillPill: {
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.redSoft,
    overflow: "hidden",
  },
  skillText: {
    color: COLORS.muted,
  },
  instruction: {
    color: COLORS.muted,
    marginTop: 18,
  },
  listenButton: {
    marginTop: 22,
    minHeight: 56,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "rgba(255,79,102,0.55)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  listenText: {
    color: COLORS.text,
  },
  audioHint: {
    color: COLORS.faint,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  choiceStack: {
    gap: 12,
  },
  choice: {
    minHeight: 58,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.cardSoft,
    justifyContent: "center",
  },
  choiceActive: {
    borderColor: COLORS.red,
    backgroundColor: COLORS.redSoft,
  },
  choiceCorrect: {
    borderColor: COLORS.green,
    backgroundColor: "rgba(141,240,181,0.14)",
  },
  choiceWrong: {
    borderColor: COLORS.red,
    backgroundColor: "rgba(255,79,102,0.22)",
  },
  optionText: {
    color: COLORS.text,
    textAlign: "center",
  },
  gapSentence: {
    minHeight: 76,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  koreanInline: {
    color: COLORS.text,
  },
  blank: {
    width: 82,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLORS.red,
    marginHorizontal: 8,
    marginTop: 18,
  },
  sentenceBox: {
    minHeight: 88,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  placeholder: {
    color: COLORS.faint,
  },
  wordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  wordOption: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.cardSoft,
  },
  wordSelected: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  wordText: {
    color: COLORS.text,
  },
  disabledOption: {
    opacity: 0.26,
  },
  disabledText: {
    color: COLORS.faint,
  },
  feedback: {
    marginTop: 14,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
  },
  good: {
    backgroundColor: "rgba(141,240,181,0.12)",
    borderColor: "rgba(141,240,181,0.42)",
  },
  bad: {
    backgroundColor: "rgba(255,79,102,0.12)",
    borderColor: "rgba(255,79,102,0.45)",
  },
  feedbackTitle: {
    color: COLORS.text,
    marginBottom: 4,
  },
  expectedLabel: {
    color: COLORS.text,
    marginTop: 6,
    marginBottom: 3,
  },
  expectedText: {
    color: COLORS.green,
    marginBottom: 6,
  },
  feedbackText: {
    color: COLORS.muted,
  },
  streakToast: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(141,240,181,0.12)",
    borderColor: "rgba(141,240,181,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  streakToastText: {
    color: COLORS.green,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  actionText: {
    color: COLORS.text,
  },
  secondaryText: {
    color: COLORS.muted,
  },
  disabledButton: {
    opacity: 0.35,
  },
  footerNote: {
    marginTop: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.24)",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  footerTitle: {
    color: COLORS.red,
    marginBottom: 8,
  },
  footerText: {
    color: COLORS.muted,
  },
});
