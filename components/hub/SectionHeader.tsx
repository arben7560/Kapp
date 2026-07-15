import React from "react";
import {
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";

import { AppText } from "@/components/app-text";
import { SeoulMidnightGlass } from "@/constants/theme";

export type SectionHeaderProps = {
  title: string;
  style?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
};

export function SectionHeader({
  title,
  style,
  trailing,
}: SectionHeaderProps) {
  return (
    <View style={[styles.root, style]}>
      <AppText
        accessibilityRole="header"
        variant="sectionLabel"
        tone="soft"
        style={styles.title}
      >
        {title}
      </AppText>
      <View pointerEvents="none" style={styles.line} />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  title: {
    flexShrink: 1,
  },
  line: {
    flex: 1,
    minWidth: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: SeoulMidnightGlass.colors.lineSoft,
  },
});
