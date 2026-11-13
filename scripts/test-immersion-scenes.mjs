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

function assertRenderedGridGap(screen, styleName, gapPattern, path) {
  // Check every rendered grid, not an unrelated gap in a calculation or style.
  const grids = [...screen.matchAll(/style=\{\[([^\]]*)\]\}/gu)]
    .map((match) => match[1])
    .filter((style) => new RegExp(`\\bstyles\\.${styleName}\\b`, "u").test(style));
  assert.ok(grids.length > 0, `${path}: grille rendue introuvable`);
  for (const style of grids) assert.match(style, gapPattern, path);
}

function assertHubGridGap(screen, path) {
  // The initializer may depend on orientation. The contract is a shared value
  // for column selection, both item-width branches and every rendered grid.
  assert.match(screen, /const effectiveGap\s*=/u, path);
  assert.match(screen, /getColumns\(\{[^}]*\bgap:\s*effectiveGap\s*,?\s*\}/u, path);
  assert.match(
    screen,
    /const gridItemWidth\s*=\s*(?:isLandscape\s*&&\s*gridColumns > 1\s*\?\s*\(safeContentWidth - effectiveGap \* \(gridColumns - 1\)\) \/ gridColumns\s*:\s*)?responsive\.getGridItemWidth\(\s*gridColumns,\s*effectiveGap\s*,?\s*\)/u,
    path,
  );
  assertRenderedGridGap(screen, "grid", /\{\s*gap:\s*effectiveGap\s*,?\s*\}/u, path);
  assert.match(screen, /width:\s*gridItemWidth\b/u, path);
}

function assertMissionGridGap(screen, scaffold, path) {
  // Mission hubs delegate their calculations to the shared scaffold.
  assert.match(screen, /<GuidedMissionsScaffold\s+responsive=\{responsive\}/u, path);
  assert.match(screen, /renderMissions=\{\(\{ columns, gap, isLandscape, itemStyle \}\)/u, path);
  assert.match(scaffold, /const columns\s*=\s*missionContentWidth >= minCardWidth \* 2 \+ gap \? 2 : 1/u, path);
  assert.match(scaffold, /\(missionContentWidth - gap \* \(columns - 1\)\) \/ columns/u, path);
  assert.match(scaffold, /\{ width: calculatedItemWidth \}/u, path);
  assert.match(scaffold, /const gridLayout[^=]*=\s*\{\s*columns,\s*gap,\s*isLandscape,\s*itemStyle,\s*\}/u, path);
  assert.equal([...scaffold.matchAll(/renderMissions\(gridLayout\)/gu)].length, 2, path);
  assertRenderedGridGap(screen, "missionStack", /\{\s*gap\s*,?\s*\}/u, path);
  assert.match(screen, /style=\{itemStyle\}/u, path);
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

test("les quatre simulations restent responsives sans verrouillage natif d’orientation", () => {
  for (const path of [
    "app/lesson/cafeIA.tsx",
    "app/lesson/metroIA.tsx",
    "app/lesson/restaurantIA.tsx",
    "app/lesson/aeroportIA.tsx",
  ]) {
    const screen = source(path);
    assert.doesNotMatch(screen, /useAndroidPhonePortraitLock/u, path);
    assert.match(screen, /useResponsiveLayout/u, path);
    assert.match(screen, /getImmersivePortraitMediaLayout/u, path);
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
    if (path.startsWith("app/lesson/")) {
      assertMissionGridGap(screen, source("components/immersion/GuidedMissionsScaffold.tsx"), path);
    } else {
      assertHubGridGap(screen, path);
    }
  }
});

test("le contrôle des grilles refuse un gap différent dans les calculs ou le rendu", () => {
  const path = "app/(tabs)/hangul/index.tsx";
  const screen = source(path);
  for (const [before, after, fromEnd = false] of [
    ["gap: effectiveGap,", "gap: responsive.gridGap,"],
    ["getGridItemWidth(gridColumns, effectiveGap)", "getGridItemWidth(gridColumns, responsive.gridGap)"],
    ["safeContentWidth - effectiveGap *", "safeContentWidth - responsive.gridGap *"],
    ["gap: effectiveGap,", "gap: 99,", true],
  ]) {
    // Mutate calculations and rendering separately, entirely in memory.
    const index = fromEnd ? screen.lastIndexOf(before) : screen.indexOf(before);
    assert.ok(index >= 0, before);
    const mutated = screen.slice(0, index) + after + screen.slice(index + before.length);
    assert.throws(() => assertHubGridGap(mutated, path), assert.AssertionError);
  }
  const missionPath = "app/lesson/metroMissions.tsx";
  const mission = source(missionPath);
  const scaffold = source("components/immersion/GuidedMissionsScaffold.tsx");
  assert.throws(() => assertMissionGridGap(
    mission.replace("{ gap },", "{ gap: 99 },"), scaffold, missionPath,
  ), assert.AssertionError);
  assert.throws(() => assertMissionGridGap(
    mission, scaffold.replace("missionContentWidth - gap *", "missionContentWidth - 99 *"), missionPath,
  ), assert.AssertionError);
});

test("Aéroport réinitialise toute la session quand la mission change", () => {
  const screen = source("app/lesson/aeroportIA.tsx");
  const resetEffect = screen.match(
    /useEffect\(\(\) => \{[\s\S]*?setCurrentNodeId\(currentScenario\.startNodeId\)[\s\S]*?setIsSceneEnded\(false\)[\s\S]*?\}, \[currentScenario\]\);/u,
  );

  assert.ok(resetEffect);
  assert.match(screen, /<Pressable\s+accessibilityRole="button"\s+accessibilityLabel=\{translate\("Retour aux missions"\)\}[^>]*\bonPress=\{handleExit\}/u);
});

test("le lancement d’une mission ignore un second appui immédiat", () => {
  const modal = source("components/immersion/MissionLaunchModal.tsx");
  assert.match(modal, /const startLockRef = React\.useRef\(false\)/u);
  assert.match(modal, /if \(startLockRef\.current\) return;[\s\S]*?startLockRef\.current = true/u);
  assert.match(modal, /onPress=\{handleStart\}/u);
});
