// app/index.tsx
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

const BG0 = "#070812";
const TXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.70)";

export default function Intro() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  // outro
  const outOpacity = useRef(new Animated.Value(1)).current;
  const outScale = useRef(new Animated.Value(1)).current;
  const outTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1) entrée douce
    // entrée plus douce
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 2) petite pause, puis sortie + navigation
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(outOpacity, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(outScale, {
          toValue: 1.02,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(outTranslateY, {
          toValue: -14,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) router.replace("/(tabs)");
      });
    }, 1800); // durée visible avant transition (ajuste)

    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={[BG0, "#0b0b1d", "#0b0f22"]} style={{ flex: 1 }}>
      {/* glows */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -120,
          left: -90,
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: "rgba(124,58,237,0.20)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -160,
          right: -120,
          width: 340,
          height: 340,
          borderRadius: 999,
          backgroundColor: "rgba(34,211,238,0.16)",
        }}
      />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Animated.View
          style={{
            alignItems: "center",
            transform: [
              { translateY },
              { scale },
              { translateY: outTranslateY },
              { scale: outScale },
            ],
            opacity: Animated.multiply(opacity, outOpacity),
          }}
        >
          <Text style={{ fontSize: 44, marginBottom: 10 }}>🇰🇷</Text>

          <Text
            style={{
              color: TXT,
              fontSize: 34,
              fontWeight: "900",
              letterSpacing: 0.2,
            }}
          >
            K-App
          </Text>

          <Text
            style={{
              color: MUTED,
              fontSize: 14,
              marginTop: 10,
              lineHeight: 20,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            Apprends le coréen comme si tu vivais à Séoul.
            {"\n"}Hangul • Dialogues • Prononciation
          </Text>

          {/* petit “trait” esthétique */}
          <View
            style={{
              width: 88,
              height: 4,
              borderRadius: 999,
              marginTop: 18,
              backgroundColor: "rgba(34,211,238,0.35)",
              borderWidth: 1,
              borderColor: "rgba(34,211,238,0.45)",
            }}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
