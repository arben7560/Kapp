import { useContext, useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  getLegacyWidthClass,
  getViewportClass,
  getSafeContentWidth,
  getGridColumns,
  getGridItemWidth as calculateGridItemWidth,
  getHubGrid as calculateHubGrid,
  type ScreenClass,
} from "../constants/responsive-layout";

export type { ScreenClass } from "../constants/responsive-layout";

type ResponsiveLayoutOptions = {
  maxWidth?: number;
  compactMaxWidth?: number;
};

type GridColumnOptions = {
  minColumnWidth?: number;
  maxColumns?: number;
  gap?: number;
};

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
  const insets = useContext(SafeAreaInsetsContext);
  const left = insets?.left ?? 0;
  const right = insets?.right ?? 0;

  return useMemo(() => {
    const screenClass = getViewportClass(width, height, Platform.OS === "web");
    // Keep established spacing and content caps independent of classification.
    const densityClass = getLegacyWidthClass(width, height);
    const isLandscape = width > height;
    const isCompact = densityClass === "compactPhone";
    const horizontalPadding = getHorizontalPadding(densityClass);
    const defaultMaxWidth =
      options.compactMaxWidth && isCompact
        ? options.compactMaxWidth
        : getDefaultMaxWidth(densityClass);
    const maxWidth = options.maxWidth ?? defaultMaxWidth;
    const availableWidth = Math.max(0, width - horizontalPadding * 2);
    const contentWidth = Math.min(availableWidth, maxWidth);
    const safeContentWidth = getSafeContentWidth(width, maxWidth, horizontalPadding, left, right);
    const gridGap = isCompact ? 10 : 12;
    const isTablet = screenClass === "tabletPortrait" || screenClass === "tabletLandscape";
    const isDesktop = screenClass === "desktop";

    const getColumns = ({
      minColumnWidth = 320,
      maxColumns = 2,
      gap = gridGap,
    }: GridColumnOptions = {}) =>
      getGridColumns(safeContentWidth, minColumnWidth, maxColumns, gap);

    const getGridItemWidth = (columns: number, gap = gridGap) =>
      calculateGridItemWidth(safeContentWidth, columns, gap);

    const getHubGrid = (gap = gridGap) =>
      calculateHubGrid(safeContentWidth, gap, isLandscape, isTablet || isDesktop);

    return {
      width,
      height,
      screenClass,
      isLandscape,
      isCompact,
      isTablet,
      isDesktop,
      horizontalPadding,
      contentWidth,
      safeContentWidth,
      maxWidth,
      gridGap,
      getColumns,
      getGridItemWidth,
      getHubGrid,
    };
  }, [height, left, options.compactMaxWidth, options.maxWidth, right, width]);
}
