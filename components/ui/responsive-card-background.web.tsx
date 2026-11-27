import { useState, type CSSProperties } from "react";
import {
  ImageBackground,
  type ImageBackgroundProps,
  type LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import { getCardImageFrame } from "./responsive-card-image-layout";

/** Decorative card image: measure the card, never the browser viewport.
 * Keep cover and center positioning, but bound excessive cropping on wide cards. */
export function ResponsiveCardBackground({ style, imageStyle, onLayout, pointerEvents, ...props }: ImageBackgroundProps) {
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const { centralWidth, fade } = getCardImageFrame(frame.width, frame.height);
  const hasExtension = frame.width > 0 && frame.height > 0 && centralWidth < frame.width;
  const fittedImage = [imageStyle, styles.imageFill];
  const opacity = StyleSheet.flatten(imageStyle)?.opacity;
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setFrame(previous => previous.width === width && previous.height === height ? previous : { width, height });
    }
    onLayout?.(event);
  };
  const edgeMask = hasExtension
    ? `linear-gradient(to right, transparent, black ${fade}px, black calc(100% - ${fade}px), transparent)`
    : undefined;
  const centerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: hasExtension ? centralWidth : "100%",
    maxWidth: "100%",
    pointerEvents: "none",
    maskImage: edgeMask,
    WebkitMaskImage: edgeMask,
  };

  return (
    <View style={[style, styles.clip]} pointerEvents={pointerEvents ?? "none"} onLayout={handleLayout}>
      {hasExtension && (
        <ImageBackground
          {...props}
          resizeMode="cover"
          blurRadius={12}
          style={styles.fill}
          imageStyle={[...fittedImage, { opacity: 0.65 * (typeof opacity === "number" ? opacity : 1) }]}
        />
      )}
      <div aria-hidden="true" style={centerStyle}>
        <ImageBackground {...props} resizeMode="cover" style={styles.fill} imageStyle={fittedImage} />
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden", minWidth: 0, minHeight: 0 },
  fill: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  // Explicit dimensions override the intrinsic bundled-image size on RN Web.
  imageFill: { width: "100%", height: "100%" },
});
