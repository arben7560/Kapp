import { Platform } from "react-native";
import Svg, { Rect } from "react-native-svg";

/** Microsoft's four-square brand mark, sized to match the other provider icon. */
export function MicrosoftLogo() {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      {...(Platform.OS === "web"
        ? { "aria-hidden": true }
        : { accessibilityElementsHidden: true })}
    >
      <Rect x={0} y={0} width={9.5} height={9.5} fill="#F25022" />
      <Rect x={10.5} y={0} width={9.5} height={9.5} fill="#7FBA00" />
      <Rect x={0} y={10.5} width={9.5} height={9.5} fill="#00A4EF" />
      <Rect x={10.5} y={10.5} width={9.5} height={9.5} fill="#FFB900" />
    </Svg>
  );
}
