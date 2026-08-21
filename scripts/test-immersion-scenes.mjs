import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getScene,
  immersionScenes,
} from "../data/immersionScenes.ts";
import { resolveAutomaticScenePath } from "../lib/immersionSceneFlow.ts";

function source(relativePath) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

function getOutgoingStepIds(scene, step, stepIndex) {
  if (step.type === "choice") {
    return step.options.map((option) => option.goTo);
  }
  if (step.type === "line") {
    return [step.goTo ?? scene.steps[stepIndex + 1]?.id].filter(Boolean);
  }
  return [];
}

test("toutes les petites scènes immersives ont un graphe complet et terminable", () => {
  for (const scene of immersionScenes) {
    const stepById = new Map(scene.steps.map((step) => [step.id, step]));
    assert.ok(stepById.has(scene.start), `${scene.id}: départ manquant`);

    const reachable = new Set();
    const stack = [scene.start];
    while (stack.length > 0) {
      const stepId = stack.pop();
      if (!stepId || reachable.has(stepId)) continue;

      const step = stepById.get(stepId);
      assert.ok(step, `${scene.id}: cible manquante ${stepId}`);
      reachable.add(stepId);

      const stepIndex = scene.steps.findIndex((candidate) => candidate.id === stepId);
      for (const targetId of getOutgoingStepIds(scene, step, stepIndex)) {
        assert.ok(
          stepById.has(targetId),
          `${scene.id}: transition ${stepId} -> ${targetId} manquante`,
        );
        stack.push(targetId);
      }
    }

    assert.equal(
      reachable.size,
      scene.steps.length,
      `${scene.id}: une étape est inaccessible`,
    );

    for (const stepId of reachable) {
      const path = resolveAutomaticScenePath(scene, stepId);
      const destination = stepById.get(path.cursor);
      assert.ok(destination, `${scene.id}: curseur final invalide ${path.cursor}`);
      assert.ok(
        destination.type === "choice" || destination.type === "end",
        `${scene.id}: ${stepId} reste bloqué sur une réplique`,
      );
    }
  }
});

test("les réponses parallèles du magasin ne fuient pas dans une autre branche", () => {
  const scene = getScene("shop_try_size_taxfree");
  assert.ok(scene);

  const sizeIntro = resolveAutomaticScenePath(scene, "npc2");
  assert.deepEqual(
    sizeIntro.transcriptSteps.map((step) => step.id),
    ["npc2"],
  );
  assert.equal(sizeIntro.cursor, "c3");

  const requestedSize = resolveAutomaticScenePath(scene, "npc_size");
  assert.deepEqual(
    requestedSize.transcriptSteps.map((step) => step.id),
    ["npc_size", "taxfree_intro"],
  );
  assert.equal(requestedSize.cursor, "c4");
});

test("une fin atteinte après une réplique est ajoutée au transcript", () => {
  const scene = {
    id: "final-line",
    title: "Finale",
    place: "cafe",
    level: "A0",
    vibe: "Test",
    start: "line",
    steps: [
      {
        id: "line",
        type: "line",
        speaker: "npc",
        kr: "끝이에요.",
        fr: "C’est fini.",
      },
      {
        id: "end",
        type: "end",
        summaryKr: "완료",
        summaryFr: "Terminé",
        keyPhrases: [],
      },
    ],
  };

  const path = resolveAutomaticScenePath(scene, scene.start);
  assert.deepEqual(
    path.transcriptSteps.map((step) => step.id),
    ["line", "end"],
  );
  assert.equal(path.cursor, "end");
});

test("les quatre moteurs IA verrouillent et nettoient les transitions rapides", () => {
  for (const path of [
    "app/lesson/cafeIA.tsx",
    "app/lesson/metroIA.tsx",
    "app/lesson/restaurantIA.tsx",
    "app/lesson/aeroportIA.tsx",
  ]) {
    const screen = source(path);
    assert.match(screen, /const transitionLockRef = useRef\(false\)/u, path);
    assert.match(screen, /transitionLockRef\.current \|\|[\s\S]*?isTransitioning/u, path);
    assert.match(screen, /transitionLockRef\.current = true;[\s\S]*?setIsTransitioning\(true\)/u, path);
    assert.match(screen, /choiceTransitionTimerRef\.current = setTimeout/u, path);
    assert.match(screen, /clearTimeout\(choiceTransitionTimerRef\.current\)/u, path);
    assert.match(screen, /const exitLockRef = useRef\(false\)/u, path);
    assert.match(screen, /if \(exitLockRef\.current\) return;[\s\S]*?exitLockRef\.current = true/u, path);
  }
});

test("les quatre simulations sécurisent l’orientation téléphone et les bords latéraux", () => {
  const orientationHook = source("hooks/useAndroidPhonePortraitLock.ts");
  assert.match(orientationHook, /Platform\.OS === "android"/u);
  assert.match(
    orientationHook,
    /Math\.min\(width, height\) < ANDROID_TABLET_MIN_SHORTEST_SIDE/u,
  );
  assert.match(orientationHook, /useFocusEffect/u);
  assert.match(orientationHook, /OrientationLock\.PORTRAIT_UP/u);
  assert.match(orientationHook, /ScreenOrientation\.unlockAsync\(\)/u);

  for (const path of [
    "app/lesson/cafeIA.tsx",
    "app/lesson/metroIA.tsx",
    "app/lesson/restaurantIA.tsx",
    "app/lesson/aeroportIA.tsx",
  ]) {
    const screen = source(path);
    assert.match(screen, /useAndroidPhonePortraitLock\(\)/u, path);
    assert.match(
      screen,
      /edges=\{\["top", "left", "right"\]\}/u,
      path,
    );
  }
});

test("les huit hubs utilisent le même gap pour le calcul et le rendu des grilles", () => {
  for (const path of [
    "app/(tabs)/hangul/index.tsx",
    "app/(tabs)/voc/index.tsx",
    "app/(tabs)/grammar/index.tsx",
    "app/(tabs)/comptage/index.tsx",
    "app/lesson/cafeMissions.tsx",
    "app/lesson/metroMissions.tsx",
    "app/lesson/restaurantMissions.tsx",
    "app/lesson/aeroportMissions.tsx",
  ]) {
    const screen = source(path);
    assert.match(
      screen,
      /const effectiveGap = Math\.max\((?:15|16), responsive\.gridGap\)/u,
      path,
    );
    assert.match(screen, /getColumns\(\{[\s\S]*?gap: effectiveGap,/u, path);
    assert.match(
      screen,
      /getGridItemWidth\([\s\S]*?effectiveGap,[\s\S]*?\)/u,
      path,
    );
    assert.match(screen, /\{ gap: effectiveGap \}|gap: effectiveGap,/u, path);
    assert.doesNotMatch(screen, /gap: Math\.max\((?:15|16), responsive\.gridGap\)/u, path);
  }
});

test("Aéroport réinitialise toute la session quand la mission change", () => {
  const screen = source("app/lesson/aeroportIA.tsx");
  const resetEffect = screen.match(
    /useEffect\(\(\) => \{[\s\S]*?setCurrentNodeId\(currentScenario\.startNodeId\)[\s\S]*?setIsSceneEnded\(false\)[\s\S]*?\}, \[currentScenario\]\);/u,
  );

  assert.ok(resetEffect);
  assert.match(screen, /accessibilityLabel="Retour aux missions"[\s\S]*?onPress=\{handleExit\}/u);
});

test("le lancement d’une mission ignore un second appui immédiat", () => {
  const modal = source("components/immersion/MissionLaunchModal.tsx");
  assert.match(modal, /const startLockRef = React\.useRef\(false\)/u);
  assert.match(modal, /if \(startLockRef\.current\) return;[\s\S]*?startLockRef\.current = true/u);
  assert.match(modal, /onPress=\{handleStart\}/u);
});
