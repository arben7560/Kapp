import * as ScreenOrientation from "expo-screen-orientation";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Platform, useWindowDimensions } from "react-native";

const ANDROID_TABLET_MIN_SHORTEST_SIDE = 600;

const activePortraitLocks = new Set<symbol>();
let orientationQueue = Promise.resolve();

function applyRequestedOrientation() {
  orientationQueue = orientationQueue
    .catch(() => undefined)
    .then(() =>
      activePortraitLocks.size > 0
        ? ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP,
          )
        : ScreenOrientation.unlockAsync(),
    )
    .catch((error: unknown) => {
      console.warn("Impossible de mettre à jour l’orientation Android.", error);
    });
}

export function useAndroidPhonePortraitLock() {
  const { width, height } = useWindowDimensions();
  const isAndroidPhone =
    Platform.OS === "android" &&
    Math.min(width, height) < ANDROID_TABLET_MIN_SHORTEST_SIDE;

  useFocusEffect(
    useCallback(() => {
      if (!isAndroidPhone) return undefined;

      const lockId = Symbol("android-phone-portrait-lock");
      activePortraitLocks.add(lockId);
      applyRequestedOrientation();

      return () => {
        activePortraitLocks.delete(lockId);
        applyRequestedOrientation();
      };
    }, [isAndroidPhone]),
  );
}
