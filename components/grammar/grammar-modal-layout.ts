const COMPACT_WIDTH_MAX = 380;
const SHORT_HEIGHT_MAX = 700;
const VERY_SHORT_HEIGHT_MAX = 500;
const WIDE_LAYOUT_MIN_WIDTH = 768;
const WIDE_LAYOUT_MIN_HEIGHT = 600;

/** Shared viewport rules for every grammar explanation variant. */
export function getGrammarModalLayout(width: number, height: number) {
  const isLandscape = width > height;
  const isCompactWidth = width <= COMPACT_WIDTH_MAX;
  const isShortHeight = height <= SHORT_HEIGHT_MAX;
  const isVeryShortHeight = height <= VERY_SHORT_HEIGHT_MAX;

  return {
    width,
    height,
    isLandscape,
    isCompactWidth,
    isShortHeight,
    isVeryShortHeight,
    useWideLayout:
      width >= WIDE_LAYOUT_MIN_WIDTH && height >= WIDE_LAYOUT_MIN_HEIGHT,
    useHorizontalFooter: isLandscape && isVeryShortHeight,
  };
}

export type GrammarModalLayout = ReturnType<typeof getGrammarModalLayout>;
