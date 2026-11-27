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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SeoulMidnightGlass } from "@/constants/theme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import {
  getDialogCardWidth,
  getTabletDialogFrame,
} from "../../constants/responsive-layout";

export type AppDialogProps = React.PropsWithChildren<{
  visible: boolean;
  onRequestClose: () => void;
  accentColor?: string;
  animationType?: ModalProps["animationType"];
  accessibilityLabel?: string;
  maxWidth?: number;
  maxHeight?: number;
  fillAvailableHeight?: boolean;
  respectHorizontalSafeArea?: boolean;
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
  maxHeight,
  fillAvailableHeight = false,
  respectHorizontalSafeArea = true,
  scrollable = true,
  cardStyle,
  contentContainerStyle,
  children,
}: AppDialogProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveLayout();
  const tabletFrame = getTabletDialogFrame(width, height, responsive.isTablet || responsive.isDesktop,
    respectHorizontalSafeArea ? insets.left : 0, respectHorizontalSafeArea ? insets.right : 0,
    insets.top, insets.bottom, maxWidth, maxHeight ?? height);
  const isCompact = width <= 380 || height <= 680;
  const edgeInset = isCompact ? 12 : 24;
  const leftInset = respectHorizontalSafeArea
    ? Math.max(edgeInset, insets.left + 8)
    : edgeInset;
  const rightInset = respectHorizontalSafeArea
    ? Math.max(edgeInset, insets.right + 8)
    : edgeInset;
  const topInset = Math.max(edgeInset, insets.top + 8);
  const bottomInset = Math.max(edgeInset, insets.bottom + 8);
  const availableCardHeight = Math.max(160, height - topInset - bottomInset);
  const cardMaxHeight = tabletFrame?.maxHeight ?? (maxHeight
    ? Math.min(availableCardHeight, maxHeight)
    : availableCardHeight);
  // A numeric width keeps the card inside the modal's padded viewport on web,
  // where a percentage width can be resolved against the unpadded root.
  const cardWidth = tabletFrame?.width ?? getDialogCardWidth(
    width, leftInset, rightInset, maxWidth,
  );

  const content = scrollable ? (
    <ScrollView
      style={[styles.scroller, tabletFrame && { flexShrink: 1 }]}
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
      supportedOrientations={responsive.isTablet || responsive.isDesktop ? ["portrait", "portrait-upside-down", "landscape-left", "landscape-right"] : undefined}
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View
        style={[
          styles.root,
          {
            paddingLeft: tabletFrame?.leftInset ?? leftInset,
            paddingRight: tabletFrame?.rightInset ?? rightInset,
            paddingTop: tabletFrame?.topInset ?? topInset,
            paddingBottom: tabletFrame?.bottomInset ?? bottomInset,
          },
        ]}
      >
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
            {
              maxHeight: cardMaxHeight,
              width: cardWidth,
              maxWidth: cardWidth,
              height: fillAvailableHeight ? cardMaxHeight : undefined,
            },
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
    flexShrink: 1,
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
