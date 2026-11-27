import { useState, type CSSProperties, type ReactNode } from "react";
import {
  ImageBackground,
  type ImageBackgroundProps,
  type LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  getWebImmersiveSceneFade,
  getWebImmersiveSceneWidth,
} from "../../constants/responsive-layout";

type Props = ImageBackgroundProps & { children?: ReactNode };

/** Keep the content mounted while the measured background frame adapts.
 * A CSS mask blends the centered cover scene into the subdued side extension. */
export function ResponsiveImmersiveBackground({ children, style, onLayout, ...props }: Props) {
  const window = useWindowDimensions();
  const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
  const width = frame?.width ?? window.width;
  const height = frame?.height ?? window.height;
  const sceneWidth = getWebImmersiveSceneWidth(width, height);
  const fade = getWebImmersiveSceneFade(width, sceneWidth);
  const hasExtension = sceneWidth < width;
  // RN Web otherwise renders bundled images at their intrinsic pixel dimensions.
  const imageStyle = [props.imageStyle, styles.imageFill];
  const sourceOpacity = StyleSheet.flatten(props.imageStyle)?.opacity;
  const backdropOpacity = 0.45 * (typeof sourceOpacity === "number" ? sourceOpacity : 1);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
    if (nextWidth > 0 && nextHeight > 0) {
      setFrame(previous =>
        previous?.width === nextWidth && previous.height === nextHeight
          ? previous
          : { width: nextWidth, height: nextHeight },
      );
    }
    onLayout?.(event);
  };

  const edgeMask = fade > 0
    ? `linear-gradient(to right, transparent, black ${fade}px, black calc(100% - ${fade}px), transparent)`
    : undefined;
  // Use the DOM style directly in this Web-only file for reliable CSS masking.
  const sceneStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: sceneWidth,
    maxWidth: "100%",
    pointerEvents: "none",
    maskImage: edgeMask,
    WebkitMaskImage: edgeMask,
  };

  return (
    <View style={[style, styles.webRoot]} pointerEvents={props.pointerEvents} onLayout={handleLayout}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {hasExtension && (
          <ImageBackground
            {...props}
            blurRadius={16}
            style={styles.fill}
            imageStyle={[...imageStyle, { opacity: backdropOpacity }]}
          />
        )}
        <div aria-hidden="true" style={sceneStyle}>
          <ImageBackground {...props} style={styles.fill} imageStyle={imageStyle} />
        </div>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: { overflow: "hidden", minHeight: 0, minWidth: 0 },
  fill: { ...StyleSheet.absoluteFillObject },
  imageFill: { width: "100%", height: "100%" },
});
