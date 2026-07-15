import React from "react";
import { Animated, StyleSheet, View } from "react-native";

import { AppText } from "../app-text";

type CafeAvatarProps = {
  speaking?: boolean;
  compact?: boolean;
  immersive?: boolean;
};

export default function CafeAvatar({
  speaking = false,
  compact = false,
  immersive = false,
}: CafeAvatarProps) {
  const [pulse] = React.useState(() => new Animated.Value(0));

  React.useEffect(() => {
    if (!speaking) {
      pulse.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [pulse, speaking]);

  const size = compact ? 96 : immersive ? 170 : 140;
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });

  return (
    <Animated.View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] },
      ]}
    >
      <View style={styles.face}>
        <AppText
          accessibilityLabel="Café"
          variant="display"
          align="center"
        >
          ☕
        </AppText>
      </View>
      {speaking && <View style={styles.speakingDot} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  face: {
    width: "72%",
    height: "72%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(251,146,60,0.18)",
  },
  speakingDot: {
    position: "absolute",
    right: 22,
    bottom: 24,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#22D3EE",
  },
});
