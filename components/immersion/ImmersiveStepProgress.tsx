import { StyleSheet, View } from "react-native";

import { AppText } from "../app-text";

type Props = Readonly<{
  steps: readonly string[];
  activeIndex: number;
  accent: string;
}>;

export function ImmersiveStepProgress({ steps, activeIndex, accent }: Props) {
  const isDense = steps.length >= 5;

  return (
    <View style={styles.container}>
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
