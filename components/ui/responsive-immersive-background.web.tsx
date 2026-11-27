import type { ReactNode } from "react";
import {
  ImageBackground,
  type ImageBackgroundProps,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { getWebImmersiveSceneWidth } from "../../constants/responsive-layout";

type Props = ImageBackgroundProps & { children?: ReactNode };

/** A centered cover image keeps portrait scenes readable on desktop while a
 * subdued full-bleed copy maintains the immersive background at the sides. */
export function ResponsiveImmersiveBackground({ children, style, ...props }: Props) {
  const { width, height } = useWindowDimensions();

  if (width < 1024) {
    return (
      <ImageBackground {...props} style={[style, styles.webRoot]}>
        {children}
      </ImageBackground>
    );
  }

  const sceneWidth = getWebImmersiveSceneWidth(width, height);

  return (
    <View style={[style, styles.webRoot]} pointerEvents={props.pointerEvents}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <ImageBackground {...props} blurRadius={16} style={styles.fill} imageStyle={styles.backdropImage} />
        <View style={[styles.sceneFrame, { maxWidth: sceneWidth }]}>
          <ImageBackground {...props} style={styles.fill} />
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: { overflow: "hidden", minHeight: 0, minWidth: 0 },
  fill: { ...StyleSheet.absoluteFillObject },
  backdropImage: { opacity: 0.3 },
  sceneFrame: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
    alignSelf: "center",
  },
});
