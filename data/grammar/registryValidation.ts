import { GRAMMAR_CONCEPTS } from "./concepts.ts";
import {
  CONTENT_REFS,
  GRAMMAR_CONTENT_LINKS,
} from "./contentLinks.ts";
import { GRAMMAR_CHAPTERS, GRAMMAR_STAGES } from "./stages.ts";
import {
  GRAMMAR_CHAPTER_IDS,
  GRAMMAR_CONCEPT_IDS,
  GRAMMAR_STAGE_IDS,
  type GrammarConcept,
  type GrammarPrerequisite,
  type GrammarStage,
} from "./types.ts";

const KOREAN_KEY_PATTERN = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const NAMESPACED_ID_PATTERN = /^[a-z0-9]+(?:[-:][a-z0-9]+)*$/u;

function wordCount(value: string) {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function duplicateValues(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

function sameValues(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function findCycles(
  ids: readonly string[],
  getDependencies: (id: string) => readonly string[],
) {
  const cycles: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const path: string[] = [];

  function visit(id: string) {
    if (visiting.has(id)) {
      const cycleStart = path.indexOf(id);
      cycles.push([...path.slice(cycleStart), id].join(" -> "));
      return;
    }
    if (visited.has(id)) return;

    visiting.add(id);
    path.push(id);
    for (const dependency of getDependencies(id)) visit(dependency);
    path.pop();
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of ids) visit(id);
  return cycles;
}

export function validateGrammarRegistry(): string[] {
  const errors: string[] = [];
  const concepts: readonly GrammarConcept[] = GRAMMAR_CONCEPTS;
  const stages: readonly GrammarStage[] = GRAMMAR_STAGES;
  const conceptIds = concepts.map(({ id }) => id);
  const stageIds = stages.map(({ id }) => id);
  const chapterIds = GRAMMAR_CHAPTERS.map(({ id }) => id);
  const contentRefIds = CONTENT_REFS.map(({ id }) => id);
  const conceptIdSet = new Set<string>(conceptIds);
  const contentRefIdSet = new Set(contentRefIds);
  const stageById = new Map<string, GrammarStage>(
    stages.map((stage) => [stage.id, stage]),
  );
  const conceptById = new Map<string, GrammarConcept>(
    concepts.map((concept) => [concept.id, concept]),
  );
  const translationsByKorean = new Map<string, string>();
  const practiceGroups = new Map<string, GrammarConcept[]>();

  function registerTranslation(korean: string, french: string, owner: string) {
    const previous = translationsByKorean.get(korean);
    if (previous && previous !== french) {
      errors.push(
        `Traduction incohérente pour « ${korean} » (${owner}) : « ${previous} » / « ${french} »`,
      );
    } else {
      translationsByKorean.set(korean, french);
    }
  }

  for (const [label, ids] of [
    ["notion", conceptIds],
    ["étape", stageIds],
    ["chapitre", chapterIds],
    ["contenu", contentRefIds],
  ] as const) {
    for (const duplicate of duplicateValues(ids)) {
      errors.push(`Identifiant de ${label} dupliqué : ${duplicate}`);
    }
    for (const id of ids) {
      const pattern = label === "contenu" ? NAMESPACED_ID_PATTERN : SLUG_PATTERN;
      if (!pattern.test(id) || KOREAN_KEY_PATTERN.test(id)) {
        errors.push(`Identifiant de ${label} instable : ${id}`);
      }
    }
  }

  if (!sameValues(conceptIds, GRAMMAR_CONCEPT_IDS)) {
    errors.push("Le registre des notions ne correspond pas à GRAMMAR_CONCEPT_IDS");
  }
  if (!sameValues(stageIds, GRAMMAR_STAGE_IDS)) {
    errors.push("Le registre des étapes ne correspond pas à GRAMMAR_STAGE_IDS");
  }
  if (!sameValues(chapterIds, GRAMMAR_CHAPTER_IDS)) {
    errors.push("Le registre des chapitres ne correspond pas à GRAMMAR_CHAPTER_IDS");
  }

  const centralLinksByConcept = new Map<string, string[]>();
  for (const link of GRAMMAR_CONTENT_LINKS) {
    if (!conceptIdSet.has(link.conceptId)) {
      errors.push(`Lien vers une notion absente : ${link.conceptId}`);
    }
    if (!contentRefIdSet.has(link.contentRefId)) {
      errors.push(`Lien vers un contenu absent : ${link.contentRefId}`);
    }
    const key = `${link.contentRefId}:${link.role}`;
    const links = centralLinksByConcept.get(link.conceptId) ?? [];
    if (links.includes(key)) {
      errors.push(
        `Lien grammatical dupliqué : ${link.conceptId} -> ${key}`,
      );
    }
    links.push(key);
    centralLinksByConcept.set(link.conceptId, links);
  }

  for (const concept of concepts) {
    if (!concept.form.trim() || !concept.shortFunction.trim() || !concept.rule.trim()) {
      errors.push(`Notion incomplète : ${concept.id}`);
    }
    const minimumRuleWords = concept.level === "pre-a1" ? 15 : 30;
    const maximumRuleWords = concept.level === "pre-a1" ? 25 : 45;
    const ruleWords = wordCount(concept.rule);
    if (ruleWords < minimumRuleWords || ruleWords > maximumRuleWords) {
      errors.push(
        `Règle hors format pour ${concept.id} : ${ruleWords} mots au lieu de ${minimumRuleWords}-${maximumRuleWords}`,
      );
    }
    if (concept.rule.trim() === concept.shortFunction.trim()) {
      errors.push(`Fonction utilisée comme règle : ${concept.id}`);
    }
    if (
      !concept.practice.scenario.trim() ||
      !concept.practice.focusForm.trim() ||
      !concept.practice.scene.korean.trim() ||
      !concept.practice.scene.french.trim()
    ) {
      errors.push(`Pratique éditoriale incomplète : ${concept.id}`);
    }
    if (
      concept.practice.formDistractors.some((value) => !value.trim()) ||
      new Set(concept.practice.formDistractors).size !== 3 ||
      concept.practice.formDistractors.includes(concept.practice.focusForm)
    ) {
      errors.push(`Distracteurs de forme invalides : ${concept.id}`);
    }
    const group = practiceGroups.get(concept.practice.distractorGroup) ?? [];
    group.push(concept);
    practiceGroups.set(concept.practice.distractorGroup, group);
    if (concept.examples.length === 0) {
      errors.push(`Notion sans exemple : ${concept.id}`);
    }
    if (concept.contentLinks.length === 0) {
      errors.push(`Notion sans contenu lié : ${concept.id}`);
    }
    for (const prerequisiteId of concept.prerequisiteIds) {
      if (!conceptIdSet.has(prerequisiteId)) {
        errors.push(
          `Prérequis de notion absent : ${concept.id} -> ${prerequisiteId}`,
        );
      }
      if (prerequisiteId === concept.id) {
        errors.push(`Prérequis réflexif : ${concept.id}`);
      }
    }
    for (const example of concept.examples) {
      if (!example.korean.trim() || !example.french.trim()) {
        errors.push(`Exemple incomplet : ${concept.id}`);
      }
      if (
        example.sourceRefId &&
        !contentRefIdSet.has(example.sourceRefId)
      ) {
        errors.push(
          `Source d’exemple absente : ${concept.id} -> ${example.sourceRefId}`,
        );
      }
      registerTranslation(example.korean, example.french, concept.id);
    }
    registerTranslation(
      concept.practice.scene.korean,
      concept.practice.scene.french,
      `${concept.id}:situation`,
    );
    if (
      concept.level === "early-a2-receptive" &&
      concept.a1Usage !== "receptive"
    ) {
      errors.push(`Notion début A2 productive à A1 : ${concept.id}`);
    }
    for (const advancedForm of concept.advancedRecognitionForms ?? []) {
      if (
        advancedForm.level !== "early-a2-receptive" ||
        advancedForm.a1Usage !== "receptive"
      ) {
        errors.push(`Forme avancée non réceptive : ${concept.id}`);
      }
    }

    const localLinks = concept.contentLinks.map(
      (link) => `${link.contentRefId}:${link.role}`,
    );
    const centralLinks = centralLinksByConcept.get(concept.id) ?? [];
    if (!sameValues(localLinks, centralLinks)) {
      errors.push(`Liens désynchronisés pour la notion : ${concept.id}`);
    }
  }

  for (const [groupId, group] of practiceGroups) {
    if (group.length < 4) {
      errors.push(`Famille de distracteurs trop petite : ${groupId}`);
    }
    if (
      new Set(group.map(({ practice }) => practice.scene.korean)).size !==
      group.length
    ) {
      errors.push(`Situations dupliquées dans la famille de distracteurs : ${groupId}`);
    }
  }

  for (const cycle of findCycles(conceptIds, (id) => {
    return conceptById.get(id)?.prerequisiteIds ?? [];
  })) {
    errors.push(`Cycle de prérequis entre notions : ${cycle}`);
  }

  if (stages.length !== 41) {
    errors.push(`Le registre contient ${stages.length} étapes au lieu de 41`);
  }
  for (const [index, stage] of stages.entries()) {
    if (stage.number !== index + 1) {
      errors.push(`Numéro d’étape inattendu : ${stage.id} = ${stage.number}`);
    }
    if (!stage.title.trim() || !stage.communicativeGoal.trim()) {
      errors.push(`Étape incomplète : ${stage.id}`);
    }
    if (
      stage.title.trim().toLocaleLowerCase("fr") ===
      stage.communicativeGoal.trim().toLocaleLowerCase("fr")
    ) {
      errors.push(`Titre et objectif identiques : ${stage.id}`);
    }
    if (stage.conceptIds.length === 0 || stage.canonicalExamples.length === 0) {
      errors.push(`Étape sans notion ou exemple : ${stage.id}`);
    }
    if (!sameValues(stage.reviewAfterDays.map(String), ["3", "10", "30"])) {
      errors.push(`Calendrier de révision incorrect : ${stage.id}`);
    }
    const expectedStatus = stage.number <= 15 ? "pre-a1" : "a1";
    if (stage.status !== expectedStatus) {
      errors.push(`Statut inattendu : ${stage.id} = ${stage.status}`);
    }
    for (const conceptId of [
      ...stage.conceptIds,
      ...(stage.receptiveConceptIds ?? []),
    ]) {
      if (!conceptIdSet.has(conceptId)) {
        errors.push(`Notion d’étape absente : ${stage.id} -> ${conceptId}`);
      }
    }
    for (const contentRefId of stage.reuseContentRefIds) {
      if (!contentRefIdSet.has(contentRefId)) {
        errors.push(`Réemploi absent : ${stage.id} -> ${contentRefId}`);
      }
    }
    for (const example of stage.canonicalExamples) {
      if (!example.korean.trim() || !example.french.trim()) {
        errors.push(`Exemple d’étape incomplet : ${stage.id}`);
      }
      if (
        example.sourceRefId &&
        !contentRefIdSet.has(example.sourceRefId)
      ) {
        errors.push(
          `Source d’exemple d’étape absente : ${stage.id} -> ${example.sourceRefId}`,
        );
      }
      if (example.format === "dialogue" && !/[\r\n]/u.test(example.korean)) {
        errors.push(`Dialogue non présenté sur plusieurs lignes : ${stage.id}`);
      }
      if (example.format !== "dialogue" && /[\r\n]/u.test(example.korean)) {
        errors.push(`Exemple composite non identifié : ${stage.id}`);
      }
      registerTranslation(example.korean, example.french, stage.id);
    }
    for (const duplicate of duplicateValues(
      stage.canonicalExamples.map(({ korean }) => korean.trim()),
    )) {
      errors.push(`Exemple d’étape dupliqué : ${stage.id} -> ${duplicate}`);
    }
    for (const prerequisite of stage.prerequisites) {
      if (prerequisite.policy !== "recommended") {
        errors.push(`Prérequis bloquant dans le Lot 0 : ${stage.id}`);
      }
      if (prerequisite.kind === "concept") {
        if (!conceptIdSet.has(prerequisite.conceptId)) {
          errors.push(
            `Prérequis de notion absent : ${stage.id} -> ${prerequisite.conceptId}`,
          );
        }
      } else if (prerequisite.kind === "content") {
        if (!contentRefIdSet.has(prerequisite.contentRefId)) {
          errors.push(
            `Prérequis de contenu absent : ${stage.id} -> ${prerequisite.contentRefId}`,
          );
        }
      } else {
        const prerequisiteStage = stageById.get(prerequisite.stageId);
        if (!prerequisiteStage) {
          errors.push(
            `Prérequis d’étape absent : ${stage.id} -> ${prerequisite.stageId}`,
          );
        } else if (prerequisiteStage.number >= stage.number) {
          errors.push(
            `Prérequis d’étape non antérieur : ${stage.id} -> ${prerequisite.stageId}`,
          );
        }
      }
    }
  }

  const generalReview = stageById.get("a1-validation");
  if (
    generalReview?.title !== "Révision générale A1" ||
    generalReview.communicativeGoal !==
      "Revoir les principales structures dans des phrases courtes." ||
    generalReview.mode !== "review"
  ) {
    errors.push("L’étape finale doit rester une révision générale A1");
  }
  if (
    !generalReview?.canonicalExamples.some(
      (example) => example.format === "dialogue" && /[\r\n]/u.test(example.korean),
    )
  ) {
    errors.push("La révision générale A1 doit présenter un dialogue multilignes");
  }

  for (const cycle of findCycles(stageIds, (id) => {
    return (
      stageById
        .get(id)
        ?.prerequisites.filter(
          (
            item,
          ): item is Extract<GrammarPrerequisite, { kind: "stage" }> =>
            item.kind === "stage",
        )
        .map((item) => item.stageId) ?? []
    );
  })) {
    errors.push(`Cycle de prérequis entre étapes : ${cycle}`);
  }

  const chapterStageIds = GRAMMAR_CHAPTERS.flatMap((chapter) => {
    for (const stageId of chapter.stageIds) {
      if (stageById.get(stageId)?.chapterId !== chapter.id) {
        errors.push(`Étape rattachée au mauvais chapitre : ${stageId}`);
      }
    }
    return chapter.stageIds;
  });
  if (!sameValues(chapterStageIds, stageIds)) {
    errors.push("Les chapitres ne couvrent pas les 41 étapes dans l’ordre");
  }

  for (const contentRef of CONTENT_REFS) {
    if (!contentRef.title.trim() || !contentRef.sourcePath.trim()) {
      errors.push(`ContentRef incomplet : ${contentRef.id}`);
    }
    if (
      contentRef.sourcePath.startsWith("/") ||
      contentRef.sourcePath.includes("..") ||
      contentRef.sourcePath.includes("\\")
    ) {
      errors.push(`Chemin de ContentRef non portable : ${contentRef.id}`);
    }
    if (contentRef.route?.includes("/(tabs)")) {
      errors.push(`Route Expo non canonique : ${contentRef.id}`);
    }
  }

  return errors;
}
