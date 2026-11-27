import assert from "node:assert/strict";
import test from "node:test";
import { getViewportClass, getSafeContentWidth, getHubGrid, getGridColumns, getGridItemWidth } from "../constants/responsive-layout.ts";

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
