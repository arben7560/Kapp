export type ScreenClass =
  | "compactPhone"
  | "phone"
  | "largePhone"
  | "tabletPortrait"
  | "tabletLandscape"
  | "desktop";

export function getLegacyWidthClass(width: number, height: number): ScreenClass {
  if (width <= 380 || (width <= 599 && height <= 700)) return "compactPhone";
  if (width <= 599) return "phone";
  if (width <= 767) return "largePhone";
  if (width <= 1023) return width > height ? "tabletLandscape" : "tabletPortrait";
  return "desktop";
}

/** Classify the viewport rather than the physical device. A rotated phone
 * remains a phone; native tablet-sized windows stay tablets in both orientations. */
export function getViewportClass(width: number, height: number, isWeb: boolean): ScreenClass {
  if (isWeb && width >= 1024) return "desktop";
  if (Math.min(width, height) >= 600) {
    return width > height ? "tabletLandscape" : "tabletPortrait";
  }
  const legacy = getLegacyWidthClass(width, height);
  return legacy === "tabletPortrait" || legacy === "tabletLandscape" || legacy === "desktop"
    ? "largePhone"
    : legacy;
}

/** SafeAreaView already applies insets to the rendered frame. Deduct them
 * here only for numeric layout calculations, not for additional padding. */
export function getSafeContentWidth(width: number, maxWidth: number, padding: number, left: number, right: number): number {
  return Math.min(maxWidth, Math.max(0, width - left - right - padding * 2));
}

export function getGridColumns(contentWidth: number, minColumnWidth: number, maxColumns: number, gap: number): number {
  return Math.max(1, Math.min(maxColumns, Math.floor((contentWidth + gap) / (minColumnWidth + gap))));
}

export function getGridItemWidth(contentWidth: number, columns: number, gap: number): number | "100%" {
  if (columns <= 1) return "100%";
  return Math.max(0, (contentWidth - gap * (columns - 1)) / columns);
}

/** Preserve historical phone landscape density; tablet/desktop cards
 * must meet the same 330 dp minimum in portrait and landscape. */
export function getHubGrid(contentWidth: number, gap: number, isLandscape: boolean, isWideViewport: boolean) {
  const columns = isLandscape && !isWideViewport
    ? contentWidth >= 900 ? 3 : contentWidth >= 640 ? 2 : 1
    : getGridColumns(contentWidth, 330, isLandscape ? 3 : 2, gap);
  return { columns, itemWidth: getGridItemWidth(contentWidth, columns, gap) };
}

/** Shared lesson frame. The width includes its horizontal padding, so the
 * readable content is capped at 800/880 dp. The parent SafeAreaView owns the
 * insets; do not subtract them again here. Phones retain their original styles. */
export function getPedagogicalFrame(isWideViewport: boolean, isLandscape: boolean, horizontalPadding: number) {
  if (!isWideViewport) return undefined;
  const contentMaxWidth = isLandscape ? 880 : 800;
  return {
    width: "100%" as const,
    maxWidth: contentMaxWidth + horizontalPadding * 2,
    alignSelf: "center" as const,
    paddingHorizontal: horizontalPadding,
  };
}
