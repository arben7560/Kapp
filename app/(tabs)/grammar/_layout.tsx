import { Slot, usePathname } from "expo-router";

import { ContentLocalizationProvider } from "../../../lib/i18n/ContentLocalizationProvider";

/** Same language-reactive, display-only bridge as Vocabulaire and Comptage.
 * Neither the route identity nor a running grammar exercise is remounted. */
export default function GrammarLayout() {
  const pathname = usePathname();

  return (
    <ContentLocalizationProvider pathname={pathname}>
      <Slot />
    </ContentLocalizationProvider>
  );
}
