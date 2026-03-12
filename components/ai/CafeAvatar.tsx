import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";

const frames = [
  require("../../assets/ai/cafe/mouth_closed.png"),
  require("../../assets/ai/cafe/mouth_mid.png"),
  require("../../assets/ai/cafe/mouth_open.png"),
];

type Props = {
  speaking?: boolean;
  compact?: boolean;
  immersive?: boolean;
};

export default function CafeAvatar({
  speaking = false,
  compact = false,
  immersive = true,
}: Props) {
  const [frame, setFrame] = useState(0);

  const bob = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.12)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const cardWidth = compact ? 132 : immersive ? 220 : 185;
  const cardHeight = compact ? 182 : immersive ? 312 : 255;

  const mouthWidth = compact ? 36 : immersive ? 65 : 48;
  const mouthHeight = compact ? 10 : immersive ? 17 : 14;
  const mouthLeft = compact ? 47 : immersive ? 80 : 67;
  const mouthTop = compact ? 54 : immersive ? 78 : 74;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (speaking) {
      interval = setInterval(() => {
        setFrame((prev) => {
          if (prev === 0) return 1;
          if (prev === 1) return 2;
          return 1;
        });
      }, 90);
    } else {
      setFrame(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speaking]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -2,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [bob]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: speaking ? 0.28 : 0.12,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: speaking ? 1.02 : 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [speaking, glowOpacity, scale]);

  return (
    <Animated.View
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: [{ translateY: bob }, { scale }],
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: cardWidth + 26,
          height: cardHeight + 26,
          borderRadius: 30,
          backgroundColor: "rgba(168,85,247,0.18)",
          opacity: glowOpacity,
        }}
      />

      <View
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: speaking
            ? "rgba(168,85,247,0.42)"
            : "rgba(255,255,255,0.10)",
          backgroundColor: "rgba(255,255,255,0.03)",
          shadowColor: "#000",
          shadowOpacity: 0.24,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        }}
      >
        <Image
          source={require("../../assets/ai/cafe/minji_base.jpg")}
          style={{
            width: cardWidth,
            height: cardHeight,
            position: "absolute",
            top: 0,
            left: 0,
          }}
          resizeMode="cover"
        />

        <Image
          source={frames[frame]}
          style={{
            position: "absolute",
            width: mouthWidth,
            height: mouthHeight,
            left: mouthLeft,
            top: mouthTop,
          }}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}
