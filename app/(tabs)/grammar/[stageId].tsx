import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../_store";
import { AppText } from "../../../components/app-text";
import { ABSOLUTE_FILL } from "../../../constants/layout";
import { SeoulMidnightGlass } from "../../../constants/theme";
import {
  CONTENT_REFS,
  GRAMMAR_CONCEPTS,
  GRAMMAR_STAGE_BY_ID,
  GRAMMAR_STAGE_IDS,
  getGrammarLessonExamples,
  type GrammarConcept,
  type GrammarPracticeAnswer,
  type GrammarPracticeQuestion,
  type GrammarPracticeSession,
  type GrammarStageId,
} from "../../../data/grammar";
import { useResponsiveLayout } from "../../../hooks/useResponsiveLayout";
import { useDailyStreak } from "../../../lib/DailyStreakProvider";
import {
  GRAMMAR_PRACTICE_PASS_RATIO,
  advanceGrammarPracticeSession,
  answerGrammarPracticeQuestion,
  createGrammarPracticeSession,
  getGrammarStageAccess,
  markGrammarSessionStreakRecorded,
  recordGrammarSessionCompletion,
  setGrammarActiveSession,
  setGrammarPracticeDraft,
} from "../../../lib/grammar";
import { buildProgressId } from "../../../lib/progressIds";

const BACKGROUND_SOURCE = require("../../../assets/images/vowelbasic.png");
const ACCENT = "#2DD4BF";
const SUCCESS = "#86EFAC";
const ERROR = "#FDA4AF";
const COLORS = SeoulMidnightGlass.colors;

function isGrammarStageId(value: string | undefined): value is GrammarStageId {
  return !!value && GRAMMAR_STAGE_IDS.includes(value as GrammarStageId);
}

function answerLabel(answer: GrammarPracticeAnswer) {
  return Array.isArray(answer) ? answer.join(" ") : answer;
}

function scoreLabel(score: number) {
  const plural = score === 1 ? "" : "s";
  return `${score} réponse${plural} correcte${plural}`;
}

function getRemainingTokens(options: readonly string[], draft: readonly string[]) {
  const used = new Set<number>();
  for (const token of draft) {
    const matchIndex = options.findIndex((option, index) => option === token && !used.has(index));
    if (matchIndex >= 0) used.add(matchIndex);
  }
  return options.map((token, index) => ({ token, index })).filter(({ index }) => !used.has(index));
}

function EditorialNote({ note, boxed = false }: { note: string; boxed?: boolean }) {
  const [label, ...contentParts] = note.split("\n");
  const content = contentParts.join("\n");

  return (
    <View style={boxed ? styles.memoBox : styles.editorialNote}>
      <AppText variant="sectionLabel" style={styles.accentText}>{label}</AppText>
      {content ? <AppText variant="caption" tone="muted">{content}</AppText> : null}
    </View>
  );
}

function QuestionDisplay({ value }: { value: string }) {
  const sections = value.split("\n\n");

  return (
    <View style={styles.questionSections}>
      {sections.map((section, index) => {
        const [label, ...contentParts] = section.split("\n");
        const content = contentParts.join("\n");
        const isKorean = /[가-힣]/u.test(content);
        const contentVariant = isKorean
          ? "koreanPrimary"
          : content.length > 70
            ? "bodyStrong"
            : "featureTitle";

        return (
          <View key={`${label}-${index}`} style={styles.questionSection}>
            <AppText variant="sectionLabel" tone="soft">{label}</AppText>
            {content ? (
              <AppText variant={contentVariant} script={isKorean ? "korean" : "latin"}>
                {content}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export default function GrammarLessonScreen() {
  const params = useLocalSearchParams<{ stageId?: string | string[] }>();
  const rawStageId = Array.isArray(params.stageId) ? params.stageId[0] : params.stageId;
  const validStageId = isGrammarStageId(rawStageId) ? rawStageId : undefined;
  const stageId = validStageId ?? GRAMMAR_STAGE_IDS[0];
  const { progress, updateGrammarProgress, complete, setTrack } = useStore();
  const { completeDailyActivity } = useDailyStreak();
  const responsive = useResponsiveLayout({ maxWidth: 900 });
  const completionInFlight = React.useRef(new Set<string>());
  const scrollRef = React.useRef<ScrollView>(null);

  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const stageProgress = progress.grammarProgress.stages[stageId];
  const session = stageProgress?.activeSession;
  const completedContentRefs = new Set(
    CONTENT_REFS.filter((contentRef) => {
      const normalizedId = contentRef.id.replace(/[^a-zA-Z0-9]+/gu, "_").toLowerCase();
      return progress.completed[contentRef.id] || progress.completed[normalizedId];
    }).map((contentRef) => contentRef.id),
  );
  const access = getGrammarStageAccess(progress.grammarProgress, stageId, completedContentRefs);
  const completionRecorded = !!session && stageProgress?.completedSessionIds.includes(session.id);
  const streakRecorded = !!session && stageProgress?.streakSessionIds.includes(session.id);
  const contentState = !access.canOpen
    ? "locked"
    : session?.completedAt
      ? "result"
      : session
        ? "practice"
        : "lesson";

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [contentState, stageId]);

  React.useEffect(() => {
    if (
      !session?.completedAt ||
      !completionRecorded ||
      streakRecorded ||
      completionInFlight.current.has(session.id)
    ) {
      return;
    }

    completionInFlight.current.add(session.id);
    const ratio = session.questions.length > 0 ? session.score / session.questions.length : 0;
    if (ratio >= GRAMMAR_PRACTICE_PASS_RATIO) {
      complete(buildProgressId("grammar", stageId));
    }

    completeDailyActivity("grammar_exercise")
      .then(() => {
        updateGrammarProgress((current) =>
          markGrammarSessionStreakRecorded(current, stageId, session.id),
        );
      })
      .catch((error) => {
        console.warn("Impossible de valider la pratique grammaticale:", error);
      })
      .finally(() => {
        completionInFlight.current.delete(session.id);
      });
  }, [
    complete,
    completeDailyActivity,
    completionRecorded,
    session,
    stageId,
    streakRecorded,
    updateGrammarProgress,
  ]);

  const replaceSession = React.useCallback((nextSession: GrammarPracticeSession) => {
    updateGrammarProgress((current) => setGrammarActiveSession(current, nextSession));
  }, [updateGrammarProgress]);

  const startPractice = React.useCallback(() => {
    const attemptNumber = (stageProgress?.attempts ?? 0) + 1;
    const nextSession = createGrammarPracticeSession(stageId, attemptNumber);
    setTrack("grammar");
    updateGrammarProgress((current) => setGrammarActiveSession(current, nextSession));
  }, [setTrack, stageId, stageProgress?.attempts, updateGrammarProgress]);

  const chooseAnswer = React.useCallback((answer: GrammarPracticeAnswer) => {
    if (!session) return;
    const next = answerGrammarPracticeQuestion(session, answer);
    if (next === session) return;
    Vibration.vibrate(next.score > session.score ? 12 : [0, 45]);
    replaceSession(next);
  }, [replaceSession, session]);

  const updateDraft = React.useCallback((answer: GrammarPracticeAnswer) => {
    if (!session) return;
    replaceSession(setGrammarPracticeDraft(session, answer));
  }, [replaceSession, session]);

  const continuePractice = React.useCallback(() => {
    if (!session) return;
    const next = advanceGrammarPracticeSession(session);
    if (next === session) return;
    if (next.completedAt) {
      updateGrammarProgress((current) => recordGrammarSessionCompletion(current, next));
    } else {
      replaceSession(next);
    }
  }, [replaceSession, session, updateGrammarProgress]);

  const renderContent = () => {
    if (!access.canOpen) {
      return <LockedLesson stageId={stageId} />;
    }
    if (session?.completedAt) {
      return <LessonResult session={session} onRetry={startPractice} />;
    }
    if (session) {
      return (
        <PracticePanel
          session={session}
          isTablet={responsive.isTablet}
          onAnswer={chooseAnswer}
          onDraft={updateDraft}
          onContinue={continuePractice}
        />
      );
    }
    return <LessonExplanation stageId={stageId} isTablet={responsive.isTablet} onStart={startPractice} />;
  };

  if (!validStageId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centeredState}>
          <AppText variant="sectionTitle">Cette leçon n’existe pas.</AppText>
          <PrimaryButton label="RETOUR AU PARCOURS" onPress={() => router.replace("/grammar" as never)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={BACKGROUND_SOURCE} style={styles.background} resizeMode="cover">
        <BlurView intensity={84} tint="dark" style={styles.backgroundBlur} />
        <LinearGradient colors={["rgba(2,3,6,0.55)", "rgba(2,3,6,0.94)", "#020306"]} style={ABSOLUTE_FILL} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: responsive.horizontalPadding }]}
        >
          <View style={[styles.frame, { maxWidth: responsive.maxWidth }]}>
            <View style={styles.navRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour au parcours Grammaire"
                onPress={() => router.back()}
                hitSlop={8}
                style={styles.backButton}
              >
                <AppText aria-hidden variant="screenTitle">‹</AppText>
                <AppText variant="caption">PARCOURS GRAMMAIRE</AppText>
              </Pressable>
              <AppText variant="caption" tone="soft">{stage.number} / {GRAMMAR_STAGE_IDS.length}</AppText>
            </View>

            <View style={styles.lessonHeader}>
              <AppText variant="sectionLabel" style={styles.accentText}>
                {stage.status === "pre-a1" ? "NIVEAU A0" : "NIVEAU A1"} · ÉTAPE {stage.number}
              </AppText>
              <AppText accessibilityRole="header" variant={responsive.isCompact ? "featureTitle" : "screenTitle"}>
                {stage.title}
              </AppText>
              <AppText variant="subtitle" tone="muted">{stage.communicativeGoal}</AppText>
              <View style={styles.headerProgressTrack}>
                <View style={[styles.headerProgressFill, { width: `${(stage.number / GRAMMAR_STAGE_IDS.length) * 100}%` }]} />
              </View>
            </View>

            {renderContent()}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function LessonExplanation({ stageId, isTablet, onStart }: { stageId: GrammarStageId; isTablet: boolean; onStart: () => void }) {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  const concepts = stage.conceptIds
    .map((conceptId) => GRAMMAR_CONCEPTS.find((concept) => concept.id === conceptId))
    .filter((concept): concept is GrammarConcept => !!concept);
  const receptiveConcepts = (stage.receptiveConceptIds ?? [])
    .map((conceptId) => GRAMMAR_CONCEPTS.find((concept) => concept.id === conceptId))
    .filter((concept): concept is GrammarConcept => !!concept);
  const reuseLinks = stage.reuseContentRefIds
    .map((contentRefId) => CONTENT_REFS.find((item) => item.id === contentRefId))
    .filter((item) => item?.route && item.availability === "public")
    .slice(0, 3);
  const lessonExamples = getGrammarLessonExamples(stageId);
  const detailExamples = lessonExamples.slice(stage.canonicalExamples.length);
  const isGeneralReview = stage.mode === "review";
  const advancedForms = isGeneralReview
    ? []
    : concepts.flatMap((concept) => concept.advancedRecognitionForms ?? []);

  return (
    <View style={styles.contentStack}>
      <View style={[styles.explanationGrid, isTablet && styles.explanationGridTablet]}>
        <View style={[styles.explanationColumn, isTablet && styles.explanationColumnTablet]}>
          <AppText variant="sectionLabel" tone="soft">
            {isGeneralReview ? "REPÈRES DE RÉVISION" : "LA RÈGLE"}
          </AppText>
          {isGeneralReview ? (
            <BlurView intensity={50} tint="dark" style={styles.ruleCard}>
              <LinearGradient colors={["rgba(45,212,191,0.13)", "rgba(255,255,255,0.02)"]} style={ABSOLUTE_FILL} />
              <AppText variant="sectionTitle">Observe, choisis, puis construis</AppText>
              <AppText variant="bodySecondary" tone="muted">
                Repère la particule ou la terminaison utile, vérifie sa place, puis lis la phrase entière avant de répondre.
              </AppText>
            </BlurView>
          ) : concepts.map((concept) => (
            <BlurView key={concept.id} intensity={50} tint="dark" style={styles.ruleCard}>
              <LinearGradient colors={["rgba(45,212,191,0.13)", "rgba(255,255,255,0.02)"]} style={ABSOLUTE_FILL} />
              <AppText variant="koreanPrimary" script="korean" style={styles.accentText}>{concept.form}</AppText>
              <AppText variant="bodySecondary">{concept.rule}</AppText>
              {concept.ruleParts?.length ? (
                <View style={styles.ruleParts}>
                  {concept.ruleParts.map((part) => (
                    <View key={part.form} style={styles.rulePart}>
                      <AppText variant="bodyStrong">{part.form}</AppText>
                      <AppText variant="bodySecondary" tone="muted">{part.explanation}</AppText>
                    </View>
                  ))}
                </View>
              ) : null}
              <AppText variant="caption" tone="soft">
                {concept.a1Usage === "productive" ? "À comprendre et à utiliser" : "À reconnaître"}
              </AppText>
            </BlurView>
          ))}
        </View>

        <View style={[styles.explanationColumn, isTablet && styles.explanationColumnTablet]}>
          <AppText variant="sectionLabel" tone="soft">EXEMPLES</AppText>
          {stage.canonicalExamples.map((example, index) => (
            <BlurView key={`${example.korean}-${index}`} intensity={46} tint="dark" style={styles.exampleCard}>
              <AppText variant={example.format === "dialogue" ? "koreanSecondary" : "koreanPrimary"} script="korean">
                {example.korean}
              </AppText>
              <AppText variant="bodySecondary" tone="muted">{example.french}</AppText>
              {example.note ? <EditorialNote note={example.note} boxed /> : null}
            </BlurView>
          ))}
          {!isGeneralReview ? detailExamples.map((example, index) => (
            <View key={`${example.korean}-detail-${index}`} style={styles.exampleLine}>
              <AppText variant="koreanSecondary" script="korean">{example.korean}</AppText>
              <AppText variant="bodySecondary" tone="muted">{example.french}</AppText>
              {example.note ? <EditorialNote note={example.note} /> : null}
            </View>
          )) : null}
        </View>
      </View>

      {receptiveConcepts.length > 0 ? (
        <View style={styles.receptiveBox}>
          <AppText variant="sectionLabel" style={styles.pinkText}>À RECONNAÎTRE</AppText>
          {receptiveConcepts.map((concept) => (
            <View key={concept.id} style={styles.receptiveRow}>
              <AppText variant="bodyStrong">{concept.form}</AppText>
              <AppText variant="bodySecondary" tone="muted">{concept.shortFunction}</AppText>
            </View>
          ))}
          {advancedForms.map((form) => (
            <View key={form.form} style={styles.receptiveRow}>
              <AppText variant="bodyStrong">{form.form}</AppText>
              <AppText variant="bodySecondary" tone="muted">{form.shortFunction}</AppText>
            </View>
          ))}
        </View>
      ) : null}

      <BlurView intensity={55} tint="dark" style={styles.practiceLaunchCard}>
        <AppText variant="sectionLabel" style={styles.accentText}>PRATIQUE GUIDÉE</AppText>
        <AppText variant="sectionTitle">
          {isGeneralReview ? "Revois cinq structures en contexte" : "Mets la règle en pratique"}
        </AppText>
        <AppText variant="bodySecondary" tone="muted">
          {isGeneralReview
            ? "Cinq situations courtes, renouvelées à chaque tentative. Cette révision ne constitue pas une validation du niveau A1."
            : "Cinq exercices sur le sens, la forme et la construction. Quatre réponses correctes terminent l’étape."}
        </AppText>
        <PrimaryButton label="COMMENCER LES EXERCICES" onPress={onStart} />
      </BlurView>

      {reuseLinks.length > 0 ? (
        <View style={styles.reuseSection}>
          <AppText variant="sectionLabel" tone="soft">À RETROUVER DANS L’APP</AppText>
          <View style={styles.reuseLinks}>
            {reuseLinks.map((contentRef) => (
              <Pressable key={contentRef!.id} onPress={() => router.push(contentRef!.route as never)} style={styles.reuseLink}>
                <AppText variant="bodyStrong">{contentRef!.title}</AppText>
                <AppText aria-hidden variant="symbol" style={styles.accentText}>›</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function PracticePanel({
  session,
  isTablet,
  onAnswer,
  onDraft,
  onContinue,
}: {
  session: GrammarPracticeSession;
  isTablet: boolean;
  onAnswer: (answer: GrammarPracticeAnswer) => void;
  onDraft: (answer: GrammarPracticeAnswer) => void;
  onContinue: () => void;
}) {
  const question = session.questions[session.questionIndex];
  const response = session.responses.find((item) => item.questionId === question.id);
  const draft = Array.isArray(session.draftAnswer) ? session.draftAnswer : [];
  const remainingTokens = question.kind === "order" ? getRemainingTokens(question.options, draft) : [];
  const isLast = session.questionIndex === session.questions.length - 1;

  return (
    <View style={styles.practiceStack}>
      <View style={styles.practiceMetaRow}>
        <AppText variant="sectionLabel" style={styles.accentText}>
          EXERCICE {session.questionIndex + 1} / {session.questions.length}
        </AppText>
        <AppText variant="caption" tone="soft">{scoreLabel(session.score)}</AppText>
      </View>
      <View style={styles.exerciseProgressTrack}>
        <View style={[styles.exerciseProgressFill, { width: `${((session.questionIndex + (response ? 1 : 0)) / session.questions.length) * 100}%` }]} />
      </View>

      <BlurView intensity={58} tint="dark" style={styles.questionCard}>
        <AppText variant="sectionLabel" tone="soft">{exerciseKindLabel(question)}</AppText>
        <AppText variant="sectionTitle">{question.prompt}</AppText>
        {question.display ? <QuestionDisplay value={question.display} /> : null}
      </BlurView>

      {question.kind === "order" ? (
        <OrderAnswer
          draft={draft}
          remainingTokens={remainingTokens}
          answered={!!response}
          onDraft={onDraft}
          onValidate={() => onAnswer(draft)}
          expectedLength={Array.isArray(question.answer) ? question.answer.length : 0}
        />
      ) : (
        <View style={[styles.optionGrid, isTablet && styles.optionGridTablet]}>
          {question.options.map((option) => {
            const isSelected = response?.answer === option;
            const isCorrectOption = response && question.answer === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ disabled: !!response, selected: isSelected }}
                disabled={!!response}
                onPress={() => onAnswer(option)}
                style={({ pressed }) => [
                  styles.optionButton,
                  isTablet && styles.optionButtonTablet,
                  isSelected && (response.correct ? styles.optionCorrect : styles.optionWrong),
                  isCorrectOption && styles.optionCorrect,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  variant={option.match(/[가-힣]/u) ? "koreanSecondary" : "bodyStrong"}
                  script={option.match(/[가-힣]/u) ? "korean" : "latin"}
                  align="center"
                >
                  {option}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}

      {response ? (
        <FeedbackCard question={question} response={response} onContinue={onContinue} isLast={isLast} />
      ) : null}
    </View>
  );
}

function OrderAnswer({
  draft,
  remainingTokens,
  answered,
  expectedLength,
  onDraft,
  onValidate,
}: {
  draft: readonly string[];
  remainingTokens: readonly { token: string; index: number }[];
  answered: boolean;
  expectedLength: number;
  onDraft: (answer: GrammarPracticeAnswer) => void;
  onValidate: () => void;
}) {
  return (
    <View style={styles.orderStack}>
      <View style={styles.orderAnswerZone}>
        {draft.length === 0 ? (
          <AppText variant="bodySecondary" tone="soft">Touche les éléments dans le bon ordre.</AppText>
        ) : draft.map((token, index) => (
          <Pressable key={`${token}-draft-${index}`} disabled={answered} onPress={() => onDraft(draft.filter((_, draftIndex) => draftIndex !== index))} style={styles.tokenSelected}>
            <AppText variant="koreanSecondary" script="korean">{token}</AppText>
          </Pressable>
        ))}
      </View>
      <View style={styles.tokenBank}>
        {remainingTokens.map(({ token, index }) => (
          <Pressable key={`${token}-${index}`} disabled={answered} onPress={() => onDraft([...draft, token])} style={styles.tokenButton}>
            <AppText variant="koreanSecondary" script="korean">{token}</AppText>
          </Pressable>
        ))}
      </View>
      {!answered ? (
        <PrimaryButton label="VALIDER LA PHRASE" disabled={draft.length !== expectedLength} onPress={onValidate} />
      ) : null}
    </View>
  );
}

function FeedbackCard({
  question,
  response,
  onContinue,
  isLast,
}: {
  question: GrammarPracticeQuestion;
  response: GrammarPracticeSession["responses"][number];
  onContinue: () => void;
  isLast: boolean;
}) {
  return (
    <BlurView intensity={58} tint="dark" style={[styles.feedbackCard, response.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
      <AppText variant="sectionLabel" style={response.correct ? styles.successText : styles.errorText}>
        {response.correct ? "CORRECT" : "À CORRIGER"}
      </AppText>
      {!response.correct ? (
        <View style={styles.correctAnswerBox}>
          <AppText variant="caption" tone="soft">RÉPONSE ATTENDUE</AppText>
          <AppText variant="bodyStrong">{answerLabel(question.answer)}</AppText>
        </View>
      ) : null}
      <AppText variant="bodySecondary" tone="muted">{question.explanation}</AppText>
      {question.memo ? <EditorialNote note={question.memo} /> : null}
      <PrimaryButton label={isLast ? "VOIR MON BILAN" : "CONTINUER"} onPress={onContinue} />
    </BlurView>
  );
}

function LessonResult({ session, onRetry }: { session: GrammarPracticeSession; onRetry: () => void }) {
  const stage = GRAMMAR_STAGE_BY_ID[session.stageId];
  const stageIndex = GRAMMAR_STAGE_IDS.indexOf(session.stageId);
  const nextStageId = GRAMMAR_STAGE_IDS[stageIndex + 1];
  const ratio = session.questions.length > 0 ? session.score / session.questions.length : 0;
  const passed = ratio >= GRAMMAR_PRACTICE_PASS_RATIO;
  const wrongResponses = session.responses.filter((response) => !response.correct);
  const isGeneralReview = stage.mode === "review";

  return (
    <View style={styles.resultStack}>
      <BlurView intensity={62} tint="dark" style={[styles.resultCard, passed ? styles.resultPassed : styles.resultRetry]}>
        <AppText variant="sectionLabel" style={passed ? styles.successText : styles.pinkText}>
          {passed
            ? isGeneralReview ? "RÉVISION TERMINÉE" : "ÉTAPE TERMINÉE"
            : isGeneralReview ? "RÉVISION À REPRENDRE" : "ÉTAPE À REPRENDRE"}
        </AppText>
        <AppText variant="numericValue" style={passed ? styles.successText : styles.pinkText}>
          {session.score}/{session.questions.length}
        </AppText>
        <AppText variant="sectionTitle">
          {scoreLabel(session.score)} sur {session.questions.length}.
        </AppText>
        <AppText variant="bodySecondary" tone="muted">
          {passed
            ? isGeneralReview
              ? "Tu as revu cinq structures. Reviens à cette révision pour en rencontrer d’autres."
              : "Objectif atteint. Tu peux poursuivre ou refaire la leçon."
            : "Revois les corrections ci-dessous, puis essaie de nouveau."}
        </AppText>
        <View style={styles.resultMetrics}>
          <Metric value={`${Math.round(ratio * 100)}%`} label="PRÉCISION" />
          <Metric value={`${wrongResponses.length}`} label="À REVOIR" />
          <Metric value={`${session.attemptNumber}`} label="TENTATIVE" />
        </View>
      </BlurView>

      {wrongResponses.length > 0 ? (
        <View style={styles.reviewBox}>
          <AppText variant="sectionLabel" tone="soft">TES POINTS À REVOIR</AppText>
          {wrongResponses.map((response) => {
            const question = session.questions.find((item) => item.id === response.questionId);
            if (!question) return null;
            return (
              <View key={response.questionId} style={styles.reviewRow}>
                <AppText variant="bodyStrong">{answerLabel(question.answer)}</AppText>
                <AppText variant="bodySecondary" tone="muted">{question.explanation}</AppText>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.resultActions}>
        <PrimaryButton label={passed ? "REFAIRE LA LEÇON" : "RÉESSAYER"} onPress={onRetry} />
        {passed && nextStageId ? (
          <SecondaryButton
            label="ÉTAPE SUIVANTE"
            onPress={() => router.replace({ pathname: "/grammar/[stageId]", params: { stageId: nextStageId } } as never)}
          />
        ) : null}
        <Pressable onPress={() => router.replace("/grammar" as never)} style={styles.textButton}>
          <AppText variant="button" tone="muted">RETOUR AU PARCOURS</AppText>
        </Pressable>
      </View>
    </View>
  );
}

function LockedLesson({ stageId }: { stageId: GrammarStageId }) {
  const stage = GRAMMAR_STAGE_BY_ID[stageId];
  return (
    <BlurView intensity={58} tint="dark" style={styles.lockedCard}>
      <AppText variant="sectionLabel" tone="soft">ÉTAPE VERROUILLÉE</AppText>
      <AppText variant="sectionTitle">Cette étape n’est pas encore accessible.</AppText>
      <AppText variant="bodySecondary" tone="muted">
        Termine d’abord les étapes requises pour ouvrir « {stage.title} ».
      </AppText>
      <PrimaryButton label="VOIR LE PARCOURS" onPress={() => router.replace("/grammar" as never)} />
    </BlurView>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="sectionTitle" align="center">{value}</AppText>
      <AppText variant="caption" tone="soft" align="center">{label}</AppText>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, disabled && styles.buttonDisabled, pressed && styles.pressed]}
    >
      <AppText variant="button" style={styles.primaryButtonText}>{label}</AppText>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
      <AppText variant="button" style={styles.accentText}>{label}</AppText>
    </Pressable>
  );
}

function exerciseKindLabel(question: GrammarPracticeQuestion) {
  switch (question.kind) {
    case "order": return "CONSTRUCTION";
    case "matching": return "COMPRÉHENSION";
    case "transformation": return "FORME";
    case "scene": return "MISE EN SITUATION";
    default: return "CHOIX GUIDÉ";
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgDeep },
  background: { flex: 1, backgroundColor: COLORS.bgDeep },
  backgroundBlur: { ...ABSOLUTE_FILL },
  scroll: { paddingTop: 12, paddingBottom: 100 },
  frame: { width: "100%", alignSelf: "center" },
  centeredState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 18 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  lessonHeader: { gap: 7, marginBottom: 26 },
  accentText: { color: ACCENT },
  successText: { color: SUCCESS },
  errorText: { color: ERROR },
  pinkText: { color: "#F9A8D4" },
  headerProgressTrack: { height: 3, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 999, marginTop: 8, overflow: "hidden" },
  headerProgressFill: { height: "100%", backgroundColor: ACCENT, borderRadius: 999 },
  contentStack: { gap: 22 },
  explanationGrid: { gap: 22 },
  explanationGridTablet: { flexDirection: "row", alignItems: "flex-start" },
  explanationColumn: { gap: 10 },
  explanationColumnTablet: { flex: 1 },
  ruleCard: { borderRadius: 22, borderWidth: 1, borderColor: "rgba(45,212,191,0.24)", padding: 18, gap: 7, overflow: "hidden" },
  ruleParts: { gap: 10 },
  rulePart: { gap: 3, paddingTop: 2 },
  exampleCard: { borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 18, gap: 7, overflow: "hidden" },
  exampleLine: { borderLeftWidth: 2, borderLeftColor: "rgba(45,212,191,0.32)", paddingLeft: 14, gap: 3 },
  editorialNote: { marginTop: 4, gap: 2 },
  memoBox: { marginTop: 4, borderRadius: 10, padding: 10, backgroundColor: "rgba(45,212,191,0.09)" },
  receptiveBox: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(244,114,182,0.2)", backgroundColor: "rgba(244,114,182,0.06)", padding: 18, gap: 12 },
  receptiveRow: { gap: 2 },
  practiceLaunchCard: { borderRadius: 24, borderWidth: 1, borderColor: "rgba(45,212,191,0.28)", padding: 20, gap: 10, overflow: "hidden" },
  reuseSection: { gap: 10 },
  reuseLinks: { gap: 8 },
  reuseLink: { minHeight: 52, borderRadius: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 16 },
  practiceStack: { gap: 16 },
  practiceMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  exerciseProgressTrack: { height: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.09)", overflow: "hidden" },
  exerciseProgressFill: { height: "100%", borderRadius: 999, backgroundColor: ACCENT },
  questionCard: { minHeight: 190, borderRadius: 26, borderWidth: 1, borderColor: "rgba(45,212,191,0.22)", padding: 22, justifyContent: "center", gap: 12, overflow: "hidden" },
  questionSections: { marginTop: 5, gap: 14 },
  questionSection: { gap: 4 },
  optionGrid: { gap: 10 },
  optionGridTablet: { flexDirection: "row", flexWrap: "wrap" },
  optionButton: { minHeight: 62, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.13)", backgroundColor: "rgba(255,255,255,0.045)", alignItems: "center", justifyContent: "center", padding: 14 },
  optionButtonTablet: { width: "49%", flexGrow: 1 },
  optionCorrect: { borderColor: "rgba(134,239,172,0.7)", backgroundColor: "rgba(134,239,172,0.12)" },
  optionWrong: { borderColor: "rgba(253,164,175,0.7)", backgroundColor: "rgba(253,164,175,0.1)" },
  orderStack: { gap: 12 },
  orderAnswerZone: { minHeight: 92, borderRadius: 18, borderWidth: 1, borderColor: "rgba(45,212,191,0.24)", backgroundColor: "rgba(45,212,191,0.05)", padding: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  tokenBank: { minHeight: 54, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tokenButton: { borderRadius: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(255,255,255,0.06)", paddingVertical: 9, paddingHorizontal: 13 },
  tokenSelected: { borderRadius: 13, borderWidth: 1, borderColor: "rgba(45,212,191,0.5)", backgroundColor: "rgba(45,212,191,0.12)", paddingVertical: 9, paddingHorizontal: 13 },
  feedbackCard: { borderRadius: 24, borderWidth: 1, padding: 20, gap: 10, overflow: "hidden" },
  feedbackCorrect: { borderColor: "rgba(134,239,172,0.36)" },
  feedbackWrong: { borderColor: "rgba(253,164,175,0.36)" },
  correctAnswerBox: { borderRadius: 13, backgroundColor: "rgba(255,255,255,0.055)", padding: 12, gap: 3 },
  resultStack: { gap: 18 },
  resultCard: { borderRadius: 28, borderWidth: 1, padding: 24, gap: 10, overflow: "hidden" },
  resultPassed: { borderColor: "rgba(134,239,172,0.38)" },
  resultRetry: { borderColor: "rgba(244,114,182,0.34)" },
  resultMetrics: { flexDirection: "row", gap: 8, marginTop: 8 },
  metric: { flex: 1, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.045)", padding: 12, gap: 2 },
  reviewBox: { borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.035)", padding: 18, gap: 14 },
  reviewRow: { gap: 3, borderLeftWidth: 2, borderLeftColor: "rgba(253,164,175,0.42)", paddingLeft: 12 },
  resultActions: { gap: 10 },
  lockedCard: { borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", padding: 22, gap: 12, overflow: "hidden" },
  primaryButton: { minHeight: 52, borderRadius: 16, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, marginTop: 6 },
  primaryButtonText: { color: "#02110F" },
  secondaryButton: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: "rgba(45,212,191,0.5)", alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  textButton: { alignItems: "center", justifyContent: "center", padding: 14 },
  buttonDisabled: { opacity: 0.35 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.995 }] },
});
