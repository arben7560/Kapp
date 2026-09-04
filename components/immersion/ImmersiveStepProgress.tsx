import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "../app-text";

type Props = Readonly<{
  steps: readonly string[];
  activeIndex: number;
  accent: string;
  compactLandscapeHeight?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function ImmersiveStepProgress({
  steps,
  activeIndex,
  accent,
  compactLandscapeHeight,
  style,
}: Props) {
  const isDense = steps.length >= 5;
  const landscapeComfort =
    compactLandscapeHeight === undefined
      ? null
      : Math.min(1, Math.max(0, (compactLandscapeHeight - 360) / 240));
  const compactContainerStyle =
    landscapeComfort === null
      ? undefined
      : {
          marginTop: Math.round(landscapeComfort * 6),
          marginBottom: Math.round(8 + landscapeComfort * 14),
        };
  const compactDotStyle =
    landscapeComfort === null
      ? undefined
      : { marginBottom: Math.round(3 + landscapeComfort * 5) };

  return (
    <View style={[styles.container, compactContainerStyle, style]}>
      {steps.map((step, index) => {
        const active = index === activeIndex;
        const done = index <= activeIndex;

        return (
          <View key={step} style={styles.step}>
            <View
              style={[
                styles.dot,
                done && {
                  backgroundColor: accent,
                  opacity: active ? 1 : 0.7,
                },
                compactDotStyle,
              ]}
            />
            <AppText
              variant={
                isDense
                  ? active
                    ? "label"
                    : "caption"
                  : active
                    ? "bodyStrong"
                    : "bodySecondary"
              }
              tone={active ? "strong" : "muted"}
              script="latin"
              lineContract="singleLine"
              adjustsFontSizeToFit
              minimumFontScale={0.68}
              style={styles.label}
            >
              {step}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    marginTop: 6,
  },
  step: {
    minWidth: 0,
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 8,
  },
  label: {
    width: "100%",
    textAlign: "center",
  },
});
