import { getPedagogicalFrame } from "../constants/responsive-layout";
import { useResponsiveLayout } from "./useResponsiveLayout";

/** Apply only to lesson content inside its existing SafeAreaView, never to
 * the background or the ScrollView viewport. */
export function usePedagogicalLayout() {
  const responsive = useResponsiveLayout();
  return getPedagogicalFrame(
    responsive.isTablet || responsive.isDesktop,
    responsive.isLandscape,
    responsive.horizontalPadding,
  );
}
