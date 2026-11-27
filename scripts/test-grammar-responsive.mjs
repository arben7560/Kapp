import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getGrammarModalLayout } from "../components/grammar/grammar-modal-layout.ts";
import { getDialogCardWidth, getTabletDialogFrame } from "../constants/responsive-layout.ts";

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

const REQUESTED_VIEWPORTS = [
  [390, 844], [600, 960], [768, 1024], [800, 1280], [1032, 1376],
];

test("grammar dialog fits all requested portrait and landscape viewports", () => {
  for (const [portraitWidth, portraitHeight] of REQUESTED_VIEWPORTS) {
    for (const [width, height] of [[portraitWidth, portraitHeight], [portraitHeight, portraitWidth]]) {
      const wide = Math.min(width, height) >= 600;
      const frame = getTabletDialogFrame(width, height, wide, 0, 0, 0, 0, 920, 1040);
      const leftInset = frame?.leftInset ?? (width <= 380 || height <= 680 ? 12 : 24);
      const rightInset = frame?.rightInset ?? leftInset;
      const cardWidth = frame?.width ?? getDialogCardWidth(width, leftInset, rightInset, 920);
      assert.ok(cardWidth > 0, `${width} × ${height}`);
      assert.ok(cardWidth + leftInset + rightInset <= width, `${width} × ${height}`);
      assert.equal(getGrammarModalLayout(width, height).useWideLayout, width >= 768 && height >= 600);
    }
  }
});

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
  assert.match(modal, /<Animated\.ScrollView/u);
  assert.match(modal, /bodyScrollRef\.current\?\.scrollTo/u);
  assert.match(modal, /styles\.exerciseFooter/u);
  assert.match(modal, /const expandedHeroHeight = isQuickGuide/u);
  assert.match(modal, /isQuickGuide && styles\.exerciseFooterQuick/u);
  assert.match(modal, /const compactHeroHeight = 60/u);
  assert.match(modal, /const headerCollapseDistance = expandedHeroHeight - compactHeroHeight/u);
  assert.match(modal, /lineContract="singleLine"/u);
  assert.match(modal, /transform: \[\{ translateY: animatedHeaderTranslateY \}\]/u);
  assert.match(modal, /style=\{\{ height: expandedHeroHeight \}\}/u);
  assert.match(
    modal,
    /onScroll=\{Animated\.event\([\s\S]*?\{ useNativeDriver: Platform\.OS !== "web" \},\s*\)\}/u,
  );
  assert.doesNotMatch(modal, /height: animatedHeroHeight/u);
  assert.doesNotMatch(modal, /animatedBodyTranslateY/u);
  assert.doesNotMatch(modal, /headerScrollY\.setValue\(scrollY\)/u);
  assert.doesNotMatch(modal, /setIsHeaderCompact/u);

  const scrollEnd = modal.indexOf("</Animated.ScrollView>");
  const closeButton = modal.indexOf('accessibilityLabel={translate("Fermer l’explication")}');
  const exerciseButton = modal.indexOf('label="Accéder aux exercices"');
  assert.ok(closeButton >= 0 && closeButton < scrollEnd);
  assert.ok(exerciseButton > scrollEnd);
});

test("lesson wallpaper and overlay follow the scrolling content", () => {
  const lesson = readFileSync(
    join(projectRoot, "app/(tabs)/grammar/[stageId].tsx"),
    "utf8",
  );
  const scrollStart = lesson.search(/<ScrollView\s+ref=\{scrollRef\}/u);
  const backgroundStart = lesson.indexOf("<ResponsiveImmersiveBackground", scrollStart);
  const backgroundEnd = lesson.indexOf("</ResponsiveImmersiveBackground>", backgroundStart);
  const scrollEnd = lesson.indexOf("</ScrollView>", backgroundEnd);
  assert.ok(scrollStart >= 0 && scrollStart < backgroundStart);
  assert.ok(backgroundStart < backgroundEnd && backgroundEnd < scrollEnd);
  assert.match(lesson.slice(backgroundStart, backgroundEnd), /styles\.backgroundBlur[\s\S]*?style=\{ABSOLUTE_FILL\}/u);
  assert.match(lesson, /scroll: \{ flexGrow: 1 \}/u);
  assert.match(lesson, /backgroundContent: \{[\s\S]*?flexGrow: 1,[\s\S]*?paddingBottom: 32/u);
});

test("grammar animations use the native driver only on native platforms", () => {
  for (const path of [
    "app/(tabs)/grammar/index.tsx",
    "components/grammar/GrammarLessonGuideModal.tsx",
  ]) {
    const source = readFileSync(join(projectRoot, path), "utf8");
    assert.doesNotMatch(source, /useNativeDriver: true/u, path);
    assert.match(source, /useNativeDriver: Platform\.OS !== "web"/u, path);
  }
});
