import { type StyleProp, type ViewStyle } from "react-native";
import { ResponsiveImmersiveBackground } from "./responsive-immersive-background.web";

/** Only for full-screen, bundled Expo Image backgrounds. Card images keep
 * their own Expo Image layout and contentFit. */
type Props = {
  source: number;
  style?: StyleProp<ViewStyle>;
  contentFit?: "cover";
  contentPosition?: "center";
};

export function ResponsiveImmersiveImage({ source, style }: Props) {
  return (
    <ResponsiveImmersiveBackground
      source={source}
      style={style}
      resizeMode="cover"
      pointerEvents="none"
    />
  );
}
