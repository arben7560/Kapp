import { useCallback, useRef, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const TAP_MOVEMENT_THRESHOLD = 8;

type TouchPoint = Readonly<{
  pageX: number;
  pageY: number;
}>;

type Props = Readonly<{
  children: ReactNode;
  enabled: boolean;
  maxHeight?: number;
  accessibilityLabel?: string;
  accessibilityRole?: PressableProps["accessibilityRole"];
  accessibilityState?: PressableProps["accessibilityState"];
  "aria-disabled"?: boolean;
  "aria-expanded"?: boolean;
  disabled?: boolean;
  hitSlop?: PressableProps["hitSlop"];
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}>;

export function ImmersiveTranscriptViewport({
  children,
  enabled,
  maxHeight,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  "aria-disabled": ariaDisabled,
  "aria-expanded": ariaExpanded,
  disabled,
  hitSlop,
  onPress,
  style,
}: Props) {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const didMoveRef = useRef(false);

  const resetGesture = useCallback(() => {
    touchStartRef.current = null;
    didMoveRef.current = false;
  }, []);

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY, touches } = event.nativeEvent;
    touchStartRef.current = { pageX, pageY };
    didMoveRef.current = touches.length > 1;
  }, []);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    const touchStart = touchStartRef.current;
    if (!touchStart || didMoveRef.current) return;

    const { pageX, pageY, touches } = event.nativeEvent;
    if (
      touches.length > 1 ||
      Math.abs(pageX - touchStart.pageX) >= TAP_MOVEMENT_THRESHOLD ||
      Math.abs(pageY - touchStart.pageY) >= TAP_MOVEMENT_THRESHOLD
    ) {
      didMoveRef.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const shouldPress =
      touchStartRef.current !== null && !didMoveRef.current && !disabled;
    resetGesture();

    if (shouldPress) onPress();
  }, [disabled, onPress, resetGesture]);

  if (!enabled) {
    return (
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        aria-disabled={ariaDisabled}
        aria-expanded={ariaExpanded}
        hitSlop={hitSlop}
        disabled={disabled}
        onPress={onPress}
        style={style}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      accessible
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      aria-disabled={ariaDisabled}
      aria-expanded={ariaExpanded}
      hitSlop={hitSlop}
      onAccessibilityTap={disabled ? undefined : onPress}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetGesture}
      style={style}
    >
      <ScrollView
        nestedScrollEnabled
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        style={{ maxHeight }}
        onScrollBeginDrag={() => {
          didMoveRef.current = true;
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
