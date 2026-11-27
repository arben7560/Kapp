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

/** A centered cover image keeps portrait scenes readable on tablets and desktop while a
 * subdued full-bleed copy maintains the immersive background at the sides. */
export function ResponsiveImmersiveBackground({ children, style, ...props }: Props) {
  const { width, height } = useWindowDimensions();
  // RN Web otherwise renders bundled images at their intrinsic pixel dimensions.
  const imageStyle = [props.imageStyle, styles.imageFill];

  if (width < 600) {
    return (
      <ImageBackground {...props} style={[style, styles.webRoot]} imageStyle={imageStyle}>
        {children}
      </ImageBackground>
    );
  }

  const sceneWidth = getWebImmersiveSceneWidth(width, height);

  return (
    <View style={[style, styles.webRoot]} pointerEvents={props.pointerEvents}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <ImageBackground {...props} blurRadius={16} style={styles.fill} imageStyle={[...imageStyle, styles.backdropImage]} />
        <View style={[styles.sceneFrame, { left: (width - sceneWidth) / 2, width: sceneWidth }]}>
          <ImageBackground {...props} style={styles.fill} imageStyle={imageStyle} />
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: { overflow: "hidden", minHeight: 0, minWidth: 0 },
  fill: { ...StyleSheet.absoluteFillObject },
  imageFill: { width: "100%", height: "100%" },
  backdropImage: { opacity: 0.3 },
  sceneFrame: {
    position: "absolute",
    top: 0,
    height: "100%",
  },
});
