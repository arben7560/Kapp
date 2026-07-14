import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export type ScreenClass =
  | "compactPhone"
  | "phone"
  | "largePhone"
  | "tabletPortrait"
  | "tabletLandscape"
  | "desktop";

type ResponsiveLayoutOptions = {
  maxWidth?: number;
  compactMaxWidth?: number;
};

type GridColumnOptions = {
  minColumnWidth?: number;
  maxColumns?: number;
  gap?: number;
};

const COMPACT_PHONE_MAX = 374;
const PHONE_MAX = 599;
const LARGE_PHONE_MAX = 767;
const TABLET_MAX = 1023;

function getScreenClass(width: number, height: number): ScreenClass {
  if (width <= COMPACT_PHONE_MAX) return "compactPhone";
  if (width <= PHONE_MAX) return "phone";
  if (width <= LARGE_PHONE_MAX) return "largePhone";
  if (width <= TABLET_MAX) {
    return width > height ? "tabletLandscape" : "tabletPortrait";
  }

  return "desktop";
}

function getHorizontalPadding(screenClass: ScreenClass) {
  switch (screenClass) {
    case "compactPhone":
    case "phone":
      return screenClass === "compactPhone" ? 20 : 24;
    case "largePhone":
      return 24;
    case "tabletPortrait":
      return 28;
    default:
      return 32;
  }
}

function getDefaultMaxWidth(screenClass: ScreenClass) {
  switch (screenClass) {
    case "compactPhone":
    case "phone":
    case "largePhone":
      return Number.POSITIVE_INFINITY;
    case "tabletPortrait":
      return 720;
    case "tabletLandscape":
      return 880;
    default:
      return 960;
  }
}

export function useResponsiveLayout(options: ResponsiveLayoutOptions = {}) {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const screenClass = getScreenClass(width, height);
    const isLandscape = width > height;
    const isCompact = screenClass === "compactPhone";
    const horizontalPadding = getHorizontalPadding(screenClass);
    const defaultMaxWidth =
      options.compactMaxWidth && isCompact
        ? options.compactMaxWidth
        : getDefaultMaxWidth(screenClass);
    const maxWidth = options.maxWidth ?? defaultMaxWidth;
    const availableWidth = Math.max(0, width - horizontalPadding * 2);
    const contentWidth = Math.min(availableWidth, maxWidth);
    const gridGap = isCompact ? 10 : 12;

    const getColumns = ({
      minColumnWidth = 320,
      maxColumns = 2,
      gap = gridGap,
    }: GridColumnOptions = {}) => {
      if (contentWidth < minColumnWidth * 2 + gap) return 1;

      return Math.max(
        1,
        Math.min(
          maxColumns,
          Math.floor((contentWidth + gap) / (minColumnWidth + gap)),
        ),
      );
    };

    const getGridItemWidth = (columns: number, gap = gridGap) => {
      if (columns <= 1) return "100%" as const;
      return (contentWidth - gap * (columns - 1)) / columns;
    };

    return {
      width,
      height,
      screenClass,
      isLandscape,
      isCompact,
      isTablet:
        screenClass === "tabletPortrait" || screenClass === "tabletLandscape",
      isDesktop: screenClass === "desktop",
      horizontalPadding,
      contentWidth,
      maxWidth,
      gridGap,
      getColumns,
      getGridItemWidth,
    };
  }, [height, options.compactMaxWidth, options.maxWidth, width]);
}
