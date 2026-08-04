import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getGrammarModalLayout } from "../components/grammar/grammar-modal-layout.ts";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const PHONE_VIEWPORTS = [
  ["petit Android", 360, 640],
  ["Android récent compact", 360, 800],
  ["Pixel récent", 412, 915],
  ["Xiaomi récent", 393, 873],
  ["iPhone SE", 375, 667],
  ["iPhone 13/14", 390, 844],
  ["iPhone 14/15/16 Pro", 393, 852],
  ["iPhone 16 Pro", 402, 874],
  ["iPhone Pro Max", 430, 932],
];

const TABLET_VIEWPORTS = [
  ["tablette Android portrait", 800, 1280],
  ["tablette Android paysage", 1280, 800],
  ["iPad portrait", 768, 1024],
  ["iPad paysage", 1024, 768],
  ["iPad Pro portrait", 1024, 1366],
  ["iPad Pro paysage", 1366, 1024],
];

test("phone viewports keep a single readable grammar column", () => {
  for (const [name, width, height] of PHONE_VIEWPORTS) {
    const portrait = getGrammarModalLayout(width, height);
    const landscape = getGrammarModalLayout(height, width);

    assert.equal(portrait.useWideLayout, false, `${name} portrait`);
    assert.equal(landscape.useWideLayout, false, `${name} paysage`);
    assert.equal(landscape.useHorizontalFooter, true, `${name} footer paysage`);
  }
});

test("tablet viewports use the capped multi-column grammar layout", () => {
  for (const [name, width, height] of TABLET_VIEWPORTS) {
    const layout = getGrammarModalLayout(width, height);
    assert.equal(layout.useWideLayout, true, name);
    assert.equal(layout.useHorizontalFooter, false, name);
  }
});

test("short and compact screens select height-aware density", () => {
  assert.equal(getGrammarModalLayout(320, 568).isCompactWidth, true);
  assert.equal(getGrammarModalLayout(375, 667).isShortHeight, true);
  assert.equal(getGrammarModalLayout(844, 390).isVeryShortHeight, true);
  assert.equal(getGrammarModalLayout(390, 844).isVeryShortHeight, false);
});

test("the grammar modal keeps controls fixed around one scroll region", () => {
  const modal = readFileSync(
    join(projectRoot, "components/grammar/GrammarLessonGuideModal.tsx"),
    "utf8",
  );

  assert.match(modal, /maxWidth=\{920\}/u);
  assert.match(modal, /maxHeight=\{1040\}/u);
  assert.match(modal, /fillAvailableHeight/u);
  assert.match(modal, /respectHorizontalSafeArea/u);
  assert.match(modal, /scrollable=\{false\}/u);
  assert.match(modal, /<ScrollView/u);
  assert.match(modal, /bodyScrollRef\.current\?\.scrollTo/u);
  assert.match(modal, /styles\.exerciseFooter/u);

  const scrollEnd = modal.indexOf("</ScrollView>");
  const closeButton = modal.indexOf('accessibilityLabel="Fermer l’explication"');
  const exerciseButton = modal.indexOf('label="Accéder aux exercices"');
  assert.ok(closeButton >= 0 && closeButton < scrollEnd);
  assert.ok(exerciseButton > scrollEnd);
});
