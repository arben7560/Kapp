import React from "react";
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { useResponsiveLayout } from "../../hooks/useResponsiveLayout";

type ResponsiveLayout = ReturnType<typeof useResponsiveLayout>;

export type GuidedMissionsGridLayout = {
  columns: number;
  gap: number;
  isLandscape: boolean;
  itemStyle?: StyleProp<ViewStyle>;
};

type GuidedMissionsScaffoldProps = {
  responsive: ResponsiveLayout;
  renderHeader: (isLandscape: boolean) => React.ReactNode;
  renderMissions: (layout: GuidedMissionsGridLayout) => React.ReactNode;
};

const LANDSCAPE_MAX_HEIGHT = 600;
const LANDSCAPE_MIN_CONTENT_WIDTH = 560;
const LANDSCAPE_MIN_CARD_WIDTH = 236;
const LANDSCAPE_MAX_SINGLE_CARD_WIDTH = 420;

export function GuidedMissionsScaffold({
  responsive,
  renderHeader,
  renderMissions,
}: GuidedMissionsScaffoldProps) {
  const insets = useSafeAreaInsets();
  const [measuredMissionsWidth, setMeasuredMissionsWidth] = React.useState(0);
  const landscapeContentWidth = Math.min(
    responsive.maxWidth,
    Math.max(
      0,
      responsive.width -
        insets.left -
        insets.right -
        responsive.horizontalPadding * 2,
    ),
  );
  const isLandscape =
    responsive.isLandscape &&
    responsive.height <= LANDSCAPE_MAX_HEIGHT &&
    landscapeContentWidth >= LANDSCAPE_MIN_CONTENT_WIDTH;
  const paneGap = responsive.height <= 380 ? 20 : 28;
  const introWidth = Math.min(
    292,
    Math.max(220, landscapeContentWidth * 0.34),
  );
  const estimatedMissionsWidth = Math.max(
    0,
    landscapeContentWidth - introWidth - paneGap,
  );
  const landscapeGap = responsive.height <= 380 ? 12 : 14;
  const missionContentWidth = isLandscape
    ? measuredMissionsWidth || estimatedMissionsWidth
    : responsive.contentWidth;
  const gap = isLandscape
    ? landscapeGap
    : Math.max(15, responsive.gridGap);
  const minCardWidth = isLandscape ? LANDSCAPE_MIN_CARD_WIDTH : 320;
  const columns =
    missionContentWidth >= minCardWidth * 2 + gap ? 2 : 1;
  const calculatedItemWidth =
    columns > 1
      ? (missionContentWidth - gap * (columns - 1)) / columns
      : missionContentWidth;
  const itemStyle: StyleProp<ViewStyle> =
    columns > 1
      ? { width: calculatedItemWidth }
      : isLandscape
        ? { width: "100%", maxWidth: LANDSCAPE_MAX_SINGLE_CARD_WIDTH }
        : undefined;
  const gridLayout: GuidedMissionsGridLayout = {
    columns,
    gap,
    isLandscape,
    itemStyle,
  };

  const handleMissionsLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const nextWidth = event.nativeEvent.layout.width;
      setMeasuredMissionsWidth((currentWidth) =>
        Math.abs(currentWidth - nextWidth) >= 1 ? nextWidth : currentWidth,
      );
    },
    [],
  );

  if (!isLandscape) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: responsive.horizontalPadding },
        ]}
      >
        <View style={[styles.contentFrame, { maxWidth: responsive.maxWidth }]}>
          {renderHeader(false)}
          {renderMissions(gridLayout)}
        </View>
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.landscapeShell,
        { paddingHorizontal: responsive.horizontalPadding },
      ]}
    >
      <View
        style={[
          styles.landscapeFrame,
          { gap: paneGap, maxWidth: responsive.maxWidth },
        ]}
      >
        <ScrollView
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          style={[styles.introPane, { width: introWidth }]}
          contentContainerStyle={styles.landscapePaneContent}
        >
          {renderHeader(true)}
        </ScrollView>

        <ScrollView
          bounces={false}
          nestedScrollEnabled
          onLayout={handleMissionsLayout}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          style={styles.missionsPane}
          contentContainerStyle={[
            styles.landscapePaneContent,
            styles.missionsContent,
          ]}
        >
          {renderMissions(gridLayout)}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentFrame: {
    width: "100%",
    alignSelf: "center",
  },
  content: {
    paddingTop: 0,
    paddingBottom: 96,
  },
  landscapeShell: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  landscapeFrame: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
  },
  introPane: {
    flexGrow: 0,
    flexShrink: 0,
  },
  missionsPane: {
    flex: 1,
    minWidth: 0,
  },
  landscapePaneContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  missionsContent: {
    flexGrow: 1,
  },
});
