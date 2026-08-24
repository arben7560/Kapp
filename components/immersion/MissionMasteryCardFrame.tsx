import { useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useStore } from "../../_store";
import {
  isImmersionMissionMastered,
  normalizeMissionMasteryMode,
  type MissionMasteryScene,
} from "../../lib/immersion/missionMastery";
import { AppText } from "../app-text";

type MissionMasteryCardFrameProps = {
  scene: MissionMasteryScene;
  missionId: string;
  accent: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function MissionMasteryCardFrame({
  scene,
  missionId,
  accent,
  children,
  style,
}: MissionMasteryCardFrameProps) {
  const params = useLocalSearchParams();
  const { progress } = useStore();
  const mode = normalizeMissionMasteryMode(
    params.mode as string | string[] | undefined,
  );
  const mastered = isImmersionMissionMastered(
    progress.completed,
    scene,
    mode,
    missionId,
  );

  return (
    <View style={[styles.frame, style]}>
      {children}

      {mastered ? (
        <View
          pointerEvents="none"
          style={[
            styles.masteryBadge,
            {
              borderColor: `${accent}66`,
              backgroundColor: `${accent}20`,
              shadowColor: accent,
            },
          ]}
        >
          <Check size={11} strokeWidth={2.7} color={accent} />
          <AppText
            variant="caption"
            lineContract="singleLine"
            style={[styles.masteryText, { color: accent }]}
          >
            MAÎTRISÉE
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: "relative",
  },
  masteryBadge: {
    position: "absolute",
    left: 16,
    bottom: 16,
    zIndex: 3,
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 3,
  },
  masteryText: {
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: "700",
  },
});
