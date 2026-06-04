import { useRef } from "react";
import { Animated, Easing } from "react-native";

export function useImmersiveTransition() {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const playTransition = (onComplete: () => void) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0.92,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayScale, {
          toValue: 1.08,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete();
    });
  };

  const resetTransition = () => {
    overlayOpacity.setValue(0);
    overlayScale.setValue(1);
    contentOpacity.setValue(1);
  };

  return {
    overlayOpacity,
    overlayScale,
    contentOpacity,
    playTransition,
    resetTransition,
  };
}
