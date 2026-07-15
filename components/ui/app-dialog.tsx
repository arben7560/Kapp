import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  type ModalProps,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  useWindowDimensions,
  type ViewStyle,
  View,
} from "react-native";

import { SeoulMidnightGlass } from "@/constants/theme";

export type AppDialogProps = React.PropsWithChildren<{
  visible: boolean;
  onRequestClose: () => void;
  accentColor?: string;
  animationType?: ModalProps["animationType"];
  accessibilityLabel?: string;
  maxWidth?: number;
  scrollable?: boolean;
  cardStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function AppDialog({
  visible,
  onRequestClose,
  accentColor = SeoulMidnightGlass.colors.cyan,
  animationType = "fade",
  accessibilityLabel = "Boîte de dialogue",
  maxWidth = 460,
  scrollable = true,
  cardStyle,
  contentContainerStyle,
  children,
}: AppDialogProps) {
  const { height, width } = useWindowDimensions();
  const isCompact = width <= 380 || height <= 680;
  const edgeInset = isCompact ? 12 : 24;
  const cardMaxHeight = Math.max(220, height - edgeInset * 2);

  const content = scrollable ? (
    <ScrollView
      style={styles.scroller}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={[styles.root, { padding: edgeInset }]}>
        <Pressable
          accessible={false}
          onPress={onRequestClose}
          style={StyleSheet.absoluteFill}
        />

        <View
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel}
          style={[
            styles.card,
            { maxHeight: cardMaxHeight, maxWidth },
            cardStyle,
          ]}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[
              colorWithAlpha(accentColor, "24"),
              "rgba(255,255,255,0.04)",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {content}
        </View>
      </View>
    </Modal>
  );
}

export type DialogActionsProps = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function DialogActions({ children, style }: DialogActionsProps) {
  return <View style={[styles.actions, style]}>{children}</View>;
}

function colorWithAlpha(color: string, alpha: string) {
  return /^#[\da-f]{6}$/i.test(color)
    ? `${color}${alpha}`
    : "rgba(34,211,238,0.14)";
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  card: {
    width: "100%",
    borderRadius: SeoulMidnightGlass.radii.card,
    borderWidth: 1,
    borderColor: SeoulMidnightGlass.colors.line,
    backgroundColor: "rgba(8,10,18,0.98)",
    overflow: "hidden",
  },
  scroller: {
    width: "100%",
  },
  content: {
    padding: 20,
  },
  actions: {
    width: "100%",
    gap: 10,
  },
});
