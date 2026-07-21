import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  CONTENT_REFS,
  GRAMMAR_CHAPTERS,
  GRAMMAR_CONCEPTS,
  GRAMMAR_CONCEPT_IDS,
  GRAMMAR_CONTENT_LINKS,
  GRAMMAR_STAGES,
  GRAMMAR_STAGE_IDS,
  validateGrammarRegistry,
} from "../data/grammar/index.ts";
import {
  evaluateGrammarPrerequisites,
} from "../lib/grammar/prerequisites.ts";
import {
  GRAMMAR_REVIEW_OFFSETS,
  createGrammarProgressFromLegacyCompleted,
  createGrammarReviewProgress,
  evaluateGrammarCriteria,
  getGrammarMasteryState,
  getNextGrammarReview,
  meetsGrammarMasteryCriteria,
} from "../lib/grammar/progress.ts";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function routeCandidates(route) {
  const relativeRoute = route.replace(/^\//u, "");
  return [
    join(projectRoot, "app", `${relativeRoute}.tsx`),
    join(projectRoot, "app", "(tabs)", `${relativeRoute}.tsx`),
  ];
}

test("the central grammar registry is internally valid", () => {
  assert.deepEqual(validateGrammarRegistry(), []);
  assert.equal(GRAMMAR_CONCEPTS.length, GRAMMAR_CONCEPT_IDS.length);
  assert.equal(GRAMMAR_STAGES.length, 41);
  assert.equal(GRAMMAR_STAGE_IDS.length, 41);
  assert.equal(GRAMMAR_CHAPTERS.length, 6);
  assert.equal(
    CONTENT_REFS.filter(({ kind }) => kind === "vocabulary").length,
    8,
  );
  assert.equal(
    CONTENT_REFS.filter(({ kind }) => kind === "counting").length,
    8,
  );
  assert.equal(
    CONTENT_REFS.filter(
      ({ id, sourceId }) => id.startsWith("listening:") && sourceId,
    ).length,
    25,
  );
  assert.equal(
    CONTENT_REFS.filter(({ kind }) => kind === "speech-feedback").length,
    2,
  );
  assert.equal(
    new Set(GRAMMAR_CONTENT_LINKS.map(({ conceptId }) => conceptId)).size,
    GRAMMAR_CONCEPTS.length,
  );
});

test("every ContentRef resolves to a source and every declared route exists", () => {
  for (const contentRef of CONTENT_REFS) {
    const sourcePath = join(projectRoot, contentRef.sourcePath);
    assert.equal(
      existsSync(sourcePath),
      true,
      `${contentRef.id} points to missing source ${contentRef.sourcePath}`,
    );

    if (contentRef.sourceId) {
      assert.match(
        readFileSync(sourcePath, "utf8"),
        new RegExp(
          contentRef.sourceId.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"),
          "u",
        ),
        `${contentRef.id} does not resolve sourceId ${contentRef.sourceId}`,
      );
    }

    if (contentRef.route) {
      assert.equal(
        routeCandidates(contentRef.route).some(existsSync),
        true,
        `${contentRef.id} points to missing route ${contentRef.route}`,
      );
    }
  }
});

test("content availability matches the release route guard", () => {
  const rootLayout = readFileSync(join(projectRoot, "app/_layout.tsx"), "utf8");
  const hiddenPathsBlock = rootLayout.match(
    /const RELEASE_HIDDEN_PATHS = new Set\(\[([\s\S]*?)\]\);/u,
  );
  const hiddenPrefixesBlock = rootLayout.match(
    /const RELEASE_HIDDEN_PREFIXES = \[([\s\S]*?)\] as const;/u,
  );
  assert.ok(hiddenPathsBlock, "RELEASE_HIDDEN_PATHS must remain explicit");
  assert.ok(hiddenPrefixesBlock, "RELEASE_HIDDEN_PREFIXES must remain explicit");

  const extractRoutes = (block) =>
    new Set([...block.matchAll(/"(\/[^"\r\n]+)"/gu)].map((match) => match[1]));
  const hiddenPaths = extractRoutes(hiddenPathsBlock[1]);
  const hiddenPrefixes = extractRoutes(hiddenPrefixesBlock[1]);

  for (const contentRef of CONTENT_REFS.filter(
    ({ availability }) => availability === "release-hidden",
  )) {
    assert.ok(contentRef.route, `${contentRef.id} needs a guarded route`);
    assert.equal(
      hiddenPaths.has(contentRef.route) ||
        [...hiddenPrefixes].some(
          (prefix) =>
            contentRef.route === prefix ||
            contentRef.route.startsWith(`${prefix}/`),
        ),
      true,
      `${contentRef.id} route ${contentRef.route} is not covered by the release guard`,
    );
  }
  assert.match(rootLayout, /if \(isHidden\)[\s\S]*?<Redirect href="\/"/u);

  const speak = readFileSync(join(projectRoot, "app/(tabs)/speak.tsx"), "utf8");
  const publicThemes = speak.match(
    /const PUBLIC_THEME_KEYS[^=]*=\s*\[([\s\S]*?)\];/u,
  );
  assert.ok(publicThemes, "PUBLIC_THEME_KEYS must remain explicit");
  assert.doesNotMatch(publicThemes[1], /shopping/u);
});

test("early A2 forms remain receptive only", () => {
  for (const concept of GRAMMAR_CONCEPTS) {
    if (concept.level === "early-a2-receptive") {
      assert.equal(concept.a1Usage, "receptive", concept.id);
    }
    for (const advancedForm of concept.advancedRecognitionForms ?? []) {
      assert.equal(advancedForm.level, "early-a2-receptive", concept.id);
      assert.equal(advancedForm.a1Usage, "receptive", concept.id);
    }
  }
});

test("R M L P and D use the thresholds from the validated audit", () => {
  const evaluatedAt = "2026-01-01T10:00:00.000Z";
  const evidence = {
    R: { correct: 4, total: 5, usesNovelItems: true, evaluatedAt },
    M: {
      correct: 4,
      total: 5,
      isConstructionOrTransformation: true,
      evaluatedAt,
    },
    L: { correct: 3, total: 4, textInitiallyHidden: true, evaluatedAt },
    P: { contextualized: true, acceptable: true, evaluatedAt },
    D: {
      successful: true,
      usesNovelItem: true,
      sessionId: "session-2",
      previousSessionId: "session-1",
      previousEvaluatedAt: "2025-12-29T10:00:00.000Z",
      evaluatedAt,
    },
  };

  assert.deepEqual(evaluateGrammarCriteria(evidence), {
    R: true,
    M: true,
    L: true,
    P: true,
    D: true,
  });
  assert.equal(meetsGrammarMasteryCriteria(evidence), true);
  assert.equal(
    evaluateGrammarCriteria({
      ...evidence,
      R: { ...evidence.R, correct: 3 },
    }).R,
    false,
  );
  assert.equal(
    evaluateGrammarCriteria({
      ...evidence,
      D: { ...evidence.D, previousEvaluatedAt: evaluatedAt },
    }).D,
    false,
  );
});

test("legacy completion never implies grammar mastery", () => {
  const progress = createGrammarProgressFromLegacyCompleted(
    true,
    "2026-01-01T10:00:00.000Z",
  );
  assert.equal(getGrammarMasteryState(progress), "discovered");
  assert.equal(progress.criteriaEvidence.R, undefined);
  assert.equal(progress.milestones.mastery, undefined);
});

test("grammar reviews stay anchored at J+3, J+10 and J+30", () => {
  assert.deepEqual(GRAMMAR_REVIEW_OFFSETS, [3, 10, 30]);
  const review = createGrammarReviewProgress("2026-01-01T00:00:00.000Z");
  assert.equal(
    getNextGrammarReview(review, "2026-01-04T00:00:00.000Z")?.dueAt,
    "2026-01-04T00:00:00.000Z",
  );
  assert.equal(
    getNextGrammarReview(
      { ...review, completedOffsets: [3] },
      "2026-01-05T00:00:00.000Z",
    )?.dueAt,
    "2026-01-11T00:00:00.000Z",
  );
  assert.equal(
    getNextGrammarReview(
      { ...review, completedOffsets: [3, 10] },
      "2026-01-20T00:00:00.000Z",
    )?.dueAt,
    "2026-01-31T00:00:00.000Z",
  );
});

test("recommended prerequisites do not block access", () => {
  const recommendation = {
    kind: "stage",
    stageId: "sentence-structure",
    minimum: "practiced",
    policy: "recommended",
  };
  const blocking = {
    ...recommendation,
    policy: "blocking",
  };

  const recommendedResult = evaluateGrammarPrerequisites([recommendation]);
  assert.equal(recommendedResult.canOpen, true);
  assert.equal(recommendedResult.missingRecommended.length, 1);

  const blockingResult = evaluateGrammarPrerequisites([blocking]);
  assert.equal(blockingResult.canOpen, false);
  assert.equal(blockingResult.missingBlocking.length, 1);
});

test("the public grammar journey exposes its hub and dynamic lesson route", () => {
  assert.equal(existsSync(join(projectRoot, "app/(tabs)/grammar/index.tsx")), true);
  assert.equal(existsSync(join(projectRoot, "app/(tabs)/grammar/[stageId].tsx")), true);
  assert.match(
    readFileSync(join(projectRoot, "app/(tabs)/index.tsx"), "utf8"),
    /route:\s*"\/grammar"/u,
  );
});
