import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
      explanation: "홍대입구에서 내려요. = Je descends à Hongdae입구.",
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
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState("Audio IA à brancher");

  const trainingKind = TRAINING_ORDER[trainingIndex];
  const exercises = EXERCISES_BY_KIND[trainingKind];
  const item = exercises[exerciseIndex];
  const meta = KIND_LABEL[trainingKind];

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

  const isCorrect = checked && isAnswerCorrect();

  const resetAnswer = () => {
    setSelected(null);
    setPicked([]);
    setChecked(false);
    setHint("Audio IA à brancher");
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

    if (isAnswerCorrect()) {
      goNext();
      return;
    }

    setChecked(true);
  };

  const playAudio = () => {
    setHint("Audio IA à brancher");
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
              <Text style={styles.placeholder}>Construis la phrase ici</Text>
            ) : (
              picked.map((wordIndex) => (
                <Pressable
                  key={wordIndex}
                  onPress={() => removeOrderWord(wordIndex)}
                  style={styles.wordSelected}
                >
                  <Text style={styles.wordText}>{item.words[wordIndex]}</Text>
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
                  disabled={used || checked}
                  onPress={() => pickOrderWord(wordIndex)}
                  style={[styles.wordOption, used && styles.disabledOption]}
                >
                  <Text
                    style={[styles.optionText, used && styles.disabledText]}
                  >
                    {word}
                  </Text>
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
            <Text style={styles.koreanInline}>{item.before}</Text>
            <View style={styles.blank} />
            <Text style={styles.koreanInline}>{item.after}</Text>
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
          <Pressable onPress={() => router.back()} style={styles.roundButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.kicker}>SÉOUL IMMERSION</Text>
            <Text style={styles.headerTitle}>Écoute active</Text>
          </View>

          <Pressable style={styles.roundButton}>
            <Ionicons name="settings-sharp" size={24} color={COLORS.muted} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.modePill}>
            <Ionicons name="volume-high" size={16} color={COLORS.purple} />
            <Text style={styles.modeText}>MODE ÉCOUTE</Text>
          </View>

          <View style={styles.modeSwitcherWrap}>
            <Pressable
              onPress={() => changeTraining(-1)}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.text} />
            </Pressable>

            <View style={styles.modeCenterPill}>
              <Text style={styles.modeCenterMini}>ENTRAÎNEMENT</Text>
              <Text style={styles.modeCenterLabel}>{meta.mini}</Text>
            </View>

            <Pressable
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
                <Text style={styles.theme}>{item.theme}</Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Text style={styles.counter}>
                {String(exerciseIndex + 1).padStart(2, "0")} /{" "}
                {String(exercises.length).padStart(2, "0")}
              </Text>
            </View>

            <View style={styles.skillRow}>
              <Text style={styles.skillPill}>{meta.mini}</Text>
              <Text style={styles.skillText}>{meta.skill}</Text>
            </View>

            <Text style={styles.instruction}>{item.instruction}</Text>

            <Pressable onPress={playAudio} style={styles.listenButton}>
              <Ionicons name="play" size={18} color={COLORS.text} />
              <Text style={styles.listenText}>Écouter</Text>
            </Pressable>

            <Text style={styles.audioHint}>{hint}</Text>

            {renderChoices()}

            {checked && (
              <View
                style={[styles.feedback, isCorrect ? styles.good : styles.bad]}
              >
                <Text style={styles.feedbackTitle}>
                  {isCorrect ? "Correct" : "À revoir"}
                </Text>
                <Text style={styles.feedbackText}>{item.explanation}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              <Pressable
                onPress={resetAnswer}
                style={[styles.actionButton, styles.secondaryButton]}
              >
                <Text style={styles.secondaryText}>Réessayer</Text>
              </Pressable>

              {!checked ? (
                <Pressable
                  disabled={!canCheck}
                  onPress={handleValidate}
                  style={[
                    styles.actionButton,
                    !canCheck && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.actionText}>Valider</Text>
                </Pressable>
              ) : (
                <Pressable onPress={resetAnswer} style={styles.actionButton}>
                  <Text style={styles.actionText}>Corriger</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerTitle}>Objectif</Text>
            <Text style={styles.footerText}>
              Comprendre avant de lire. La traduction n’apparaît qu’après
              validation.
            </Text>
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
  return (
    <Pressable
      disabled={locked}
      onPress={onPress}
      style={[
        styles.choice,
        active && styles.choiceActive,
        correct && styles.choiceCorrect,
        wrong && styles.choiceWrong,
      ]}
    >
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3.8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
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
    letterSpacing: 2.5,
    fontSize: 10,
    fontWeight: "800",
  },
  modeSwitcherWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
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
    minWidth: 158,
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
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  modeCenterLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
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
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 7,
  },
  counter: {
    color: COLORS.faint,
    fontSize: 13,
    fontWeight: "700",
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
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.redSoft,
    overflow: "hidden",
  },
  skillText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  instruction: {
    color: COLORS.muted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 18,
  },
  listenButton: {
    marginTop: 22,
    height: 56,
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
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  audioHint: {
    color: COLORS.faint,
    fontSize: 12,
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
    fontSize: 20,
    fontWeight: "700",
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
    fontSize: 24,
    fontWeight: "800",
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
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "800",
  },
  disabledOption: {
    opacity: 0.26,
  },
  disabledText: {
    color: COLORS.faint,
  },
  feedback: {
    marginTop: 18,
    borderRadius: 22,
    padding: 15,
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
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  feedbackText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    height: 52,
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
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  secondaryText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "800",
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
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
