import type { ReactNode } from "react";
import { ImageBackground, type ImageBackgroundProps } from "react-native";

type Props = ImageBackgroundProps & { children?: ReactNode };

/** Native keeps the original ImageBackground and its cover behavior. */
export function ResponsiveImmersiveBackground({ children, ...props }: Props) {
  return <ImageBackground {...props}>{children}</ImageBackground>;
}
