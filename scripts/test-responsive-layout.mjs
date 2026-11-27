import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getImmersiveLandscapeLayout, getImmersivePhoneLandscapeLayout, IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO } from "../constants/immersive-layout.ts";
import { getViewportClass, getSafeContentWidth, getWebImmersiveSceneWidth, getCenteredCarouselMetrics, getHubGrid, getGridColumns, getGridItemWidth, getPedagogicalFrame, getTabletDialogFrame } from "../constants/responsive-layout.ts";

test("portrait scene framing adapts at the requested browser widths", () => {
  for (const [width, height] of [[360, 800], [390, 844], [412, 915], [599, 900], [600, 960], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
    const sceneWidth = getWebImmersiveSceneWidth(width, height);
    assert.ok(sceneWidth <= width);
    assert.equal(sceneWidth, width < 600 ? width : Math.min(width, Math.max(560, Math.min(960, height * 0.56))));
    if (width >= 600) assert.ok(sceneWidth <= 960);
  }
  assert.ok(getWebImmersiveSceneWidth(768, 1024) < 600);
});

test("Speak cards and pagination stay centered across browser resizes", () => {
  for (const viewportWidth of [280, 320, 342, 364, 712, 920]) {
    const { cardWidth, itemSize, sidePadding } = getCenteredCarouselMetrics(viewportWidth);
    assert.ok(cardWidth <= viewportWidth);
    assert.ok(itemSize <= viewportWidth);
    assert.equal(sidePadding + itemSize / 2, viewportWidth / 2);
    assert.equal(2 * sidePadding + 4 * itemSize - viewportWidth, 3 * itemSize);
  }
});

test("immersive routes share Web framing and retain the native ImageBackground", () => {
  const source = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
  for (const path of [
    "app/(tabs)/speak.tsx",
    ...["index", "basics", "emotion", "famille", "gastronomie", "health", "kdrama", "lieux", "meteo", "nuit", "objets", "romance", "sante", "transport", "voyage", "work"]
      .map(name => `app/(tabs)/voc/${name}.tsx`),
  ]) {
    assert.match(source(path), /<ResponsiveImmersiveBackground\b/u, path);
  }
  assert.match(source("components/ui/responsive-immersive-background.tsx"), /return <ImageBackground \{\.\.\.props\}>\{children\}<\/ImageBackground>/u);
  assert.match(source("components/ui/responsive-immersive-background.web.tsx"), /getWebImmersiveSceneWidth\(width, height\)/u);
});

test("native tablets remain tablets in both orientations", () => {
  for (const [width, height] of [[600, 960], [768, 1024], [834, 1194], [800, 1280], [1024, 1366]]) {
    assert.equal(getViewportClass(width, height, false), "tabletPortrait");
    assert.equal(getViewportClass(height, width, false), "tabletLandscape");
  }
});

test("rotated phones are not tablets and web desktop is preserved", () => {
  for (const [width, height] of [[360, 640], [390, 844], [430, 932], [480, 1024]]) {
    assert.ok(!getViewportClass(width, height, false).startsWith("tablet"));
    assert.ok(!getViewportClass(height, width, false).startsWith("tablet"));
  }
  assert.equal(getViewportClass(1280, 800, true), "desktop");
});

test("numeric content width accounts for safe areas exactly once", () => {
  assert.equal(getSafeContentWidth(834, 920, 28, 20, 10), 748);
  assert.equal(getSafeContentWidth(1280, 1120, 32, 50, 50), 1116);
  assert.equal(getSafeContentWidth(1280, 920, 32, 50, 50), 920);
  assert.equal(getSafeContentWidth(40, 920, 32, 10, 10), 0);
});

test("wide hub grids respect 330 dp minimum and fit the safe frame", () => {
  for (const width of [550, 600, 674, 900, 1017, 1018, 1120]) {
    const { columns, itemWidth } = getHubGrid(width, 14, true, true);
    assert.equal(columns, width >= 1018 ? 3 : width >= 674 ? 2 : 1);
    if (columns > 1) {
      assert.ok(itemWidth >= 330);
      assert.ok(Math.abs(itemWidth * columns + 14 * (columns - 1) - width) < 1e-8);
    }
  }
  assert.equal(getHubGrid(900, 16, false, true).columns, 2);
  assert.equal(getHubGrid(640, 14, true, false).columns, 2);
  assert.equal(getHubGrid(900, 14, true, false).columns, 3);
});

test("safe-area changes can reduce columns before overflow", () => {
  const width = getSafeContentWidth(1100, 1120, 32, 30, 30);
  assert.equal(getHubGrid(width, 14, true, true).columns, 2);
  assert.equal(getGridColumns(width, 330, 3, 14), 2);
  assert.equal(getGridItemWidth(width, 2, 14), 481);
});

test("pedagogical lesson frames leave phone styles unchanged", () => {
  for (const [width, height] of [[360, 640], [390, 844], [430, 932], [480, 1024]]) {
    for (const [w, h] of [[width, height], [height, width]]) {
      const viewport = getViewportClass(w, h, false);
      const wide = viewport.startsWith("tablet") || viewport === "desktop";
      assert.equal(getPedagogicalFrame(wide, w > h, 24), undefined);
    }
  }
});

test("lesson frame caps inner content and respects its safe parent", () => {
  for (const [width, height, padding] of [[600, 960, 24], [768, 1024, 28], [834, 1194, 28], [800, 1280, 28], [1024, 1366, 32], [1280, 800, 32], [1366, 1024, 32]]) {
    const viewport = getViewportClass(width, height, false);
    const frame = getPedagogicalFrame(viewport.startsWith("tablet"), width > height, padding);
    assert.equal(frame.width, "100%");
    assert.equal(frame.alignSelf, "center");
    assert.equal(frame.paddingHorizontal, padding);
    const cap = width > height ? 880 : 800;
    assert.equal(frame.maxWidth - 2 * padding, cap);
    for (const safeInsets of [0, 20, 100]) {
      const parentWidth = width - safeInsets;
      const actualWidth = Math.min(parentWidth, frame.maxWidth);
      assert.ok(actualWidth <= parentWidth);
      assert.equal(actualWidth - 2 * padding, Math.min(parentWidth - 2 * padding, cap));
    }
  }
});

test("public pedagogical screens share the same frame without replacing the scroll container", () => {
  const routes = [
    ...["basics", "gastronomie", "kdrama", "nuit", "romance", "sante", "transport", "work"].map(name => "app/(tabs)/voc/" + name + ".tsx"),
    "components/comptage/CountingImmersionScreen.tsx",
    ...["cafe", "metro", "restaurant", "airport"].map(name => "app/lesson/" + name + ".tsx"),
    "app/(tabs)/listen.tsx",
  ];
  for (const path of routes) {
    const source = readFileSync(new URL("../" + path, import.meta.url), "utf8");
    assert.match(source, /const pedagogicalFrame = usePedagogicalLayout\(\);/u, path);
    assert.match(source, /contentContainerStyle=\{\[styles\.(scroll|content), pedagogicalFrame\]\}/u, path);
    assert.match(source, /<SafeAreaView/u, path);
    assert.match(source, /<(?:(?:Animated\.)?ScrollView)\b/u, path);
  }
  const listen = readFileSync(new URL("../app/(tabs)/listen.tsx", import.meta.url), "utf8");
  assert.match(listen, /styles\.header, landscapeHeaderStyle, pedagogicalFrame/u);
});

test("tablet immersion landscape fits the safe viewport and reserves transcript space", () => {
  for (const [windowWidth, windowHeight] of [[800, 600], [960, 600], [1024, 768], [1194, 834], [1280, 800], [1366, 1024], [1600, 1000]]) {
    for (const [horizontalSafeArea, topSafeArea, bottomSafeArea] of [[0, 0, 0], [24, 24, 24]]) {
      const layout = getImmersiveLandscapeLayout({ windowWidth, windowHeight, horizontalSafeArea, topSafeArea, bottomSafeArea, isWideViewport: true });
      assert.equal(layout.mode, "tablet");
      assert.equal(layout.primaryColumnWidth + layout.interactionColumnWidth + layout.columnGap + 2 * layout.horizontalPadding, windowWidth - horizontalSafeArea);
      assert.ok(layout.availableWidth <= 1200);
      assert.ok(layout.primaryColumnWidth >= 300 && layout.interactionColumnWidth >= 360);
      assert.ok(layout.mediaWidth <= layout.primaryColumnWidth && layout.mediaHeight >= 160 && layout.mediaHeight <= 480);
      assert.ok(Math.abs(layout.mediaWidth / layout.mediaHeight - IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO) < 1e-9);
      assert.ok(layout.transcriptMaxHeight >= 144);
      const bodyHeight = windowHeight - topSafeArea - bottomSafeArea - (44 + Math.max(6, topSafeArea * 0.15));
      assert.ok(layout.mediaHeight + layout.transcriptMaxHeight + 148 <= bodyHeight);
    }
  }
});

test("phone immersion landscape calculations are unchanged", () => {
  for (const [windowWidth, windowHeight] of [[640, 360], [844, 390], [932, 430], [1024, 480]]) {
    const args = { windowWidth, windowHeight, horizontalSafeArea: 40, topSafeArea: 20 };
    const { mode, ...layout } = getImmersiveLandscapeLayout({ ...args, isWideViewport: false });
    assert.equal(mode, "phone");
    assert.deepEqual(layout, getImmersivePhoneLandscapeLayout(args));
  }
});

test("portrait and insufficient tablet split space retain the stacked immersion layout", () => {
  for (const [windowWidth, windowHeight, horizontalSafeArea, isWideViewport] of [[800, 1280, 0, true], [390, 844, 0, false], [700, 600, 0, true], [800, 600, 150, true]]) {
    assert.equal(getImmersiveLandscapeLayout({ windowWidth, windowHeight, horizontalSafeArea, isWideViewport }), null);
  }
});

test("all four immersive simulations share the landscape layout without replacing the video or response scroll view", () => {
  for (const name of ["cafeIA", "metroIA", "restaurantIA", "aeroportIA"]) {
    const screen = readFileSync(new URL("../app/lesson/" + name + ".tsx", import.meta.url), "utf8");
    assert.match(screen, /const landscapeLayout = getImmersiveLandscapeLayout\(\{/u, name);
    assert.match(screen, /horizontalSafeArea: insets\.left \+ insets\.right/u, name);
    assert.match(screen, /bottomSafeArea: insets\.bottom/u, name);
    assert.match(screen, /const isSplitLandscape = landscapeLayout !== null/u, name);
    assert.match(screen, /enabled=\{isSplitLandscape\}/u, name);
    assert.match(screen, /maxHeight=\{landscapeLayout\?\.transcriptMaxHeight\}/u, name);
    assert.match(screen, /<VideoView\b/u, name);
    assert.match(screen, /<ScrollView\s+ref=\{scrollRef\}/u, name);
    assert.match(screen, /IMMERSIVE_TABLET_LANDSCAPE_STYLES\.transcriptCard/u, name);
  }
});

test("landscape tablet modal frame respects safe areas and explicit content caps", () => {
  for (const [width, height] of [[800, 600], [960, 600], [1024, 768], [1194, 834], [1280, 800], [1366, 1024]]) {
    for (const [left, right, top, bottom] of [[0, 0, 0, 0], [50, 16, 24, 24], [80, 60, 50, 40]]) {
      const frame = getTabletDialogFrame(width, height, true, left, right, top, bottom);
      assert.ok(frame.width + frame.leftInset + frame.rightInset <= width);
      assert.ok(frame.maxHeight + frame.topInset + frame.bottomInset <= height);
      assert.ok(frame.width <= 720 && frame.maxHeight <= 760);
      assert.ok(frame.leftInset >= left + 8 && frame.rightInset >= right + 8);
      assert.ok(frame.topInset >= top + 8 && frame.bottomInset >= bottom + 8);
      const explicit = getTabletDialogFrame(width, height, true, left, right, top, bottom, 460, 300);
      assert.equal(explicit.width, 460);
      assert.equal(explicit.maxHeight, 300);
    }
  }
});

test("tablet modal adaptation leaves phone and portrait frames unchanged", () => {
  for (const [width, height, wide] of [[390, 844, false], [844, 390, false], [800, 1280, true], [600, 960, true]]) {
    assert.equal(getTabletDialogFrame(width, height, wide, 0, 0, 0, 0), undefined);
  }
});

test("modal integration preserves mission actions and scrollable details", () => {
  const source = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
  const speak = source("app/(tabs)/speak.tsx");
  assert.match(speak, /tabletFrame\?\.width/u);
  assert.match(speak, /tabletFrame\?\.maxHeight/u);
  assert.match(speak, /onPress=\{goToImmersive\}/u);
  assert.match(speak, /onPress=\{goToText\}/u);
  const mission = source("components/immersion/MissionLaunchModal.tsx");
  assert.match(mission, /const useFixedActions = isPhoneLandscape \|\| isTabletLandscape/u);
  assert.match(mission, /onPress=\{handleStart\}/u);
  assert.match(mission, /onPress=\{onCancel\}/u);
  assert.match(mission, /\{details\}\s*<\/ScrollView>\s*\{actions\}/u);
  for (const path of [
    "components/cafe/CafeConversationSummaryModal.tsx",
    "components/metro/MetroConversationSummaryModal.tsx",
    "components/aeroport/AeroportConversationSummaryModal.tsx",
    "components/listen/ListenTrainingCompletionModal.tsx",
  ]) {
    const screen = source(path);
    assert.match(screen, /isTabletLandscape && styles\.tabletSheet/u, path);
    assert.match(screen, /<ScrollView/u, path);
    assert.match(screen, /accessibilityViewIsModal/u, path);
  }
});
