import { Slot, usePathname } from "expo-router";

import { ContentLocalizationProvider } from "../../../lib/i18n/ContentLocalizationProvider";

/**
 * Route-local localization: the root navigator is never wrapped or
 * remounted when OAuth deep links, user sessions or app language change.
 * This preserves the existing screen routes, exercises and navigation stack.
 */
export default function ClassifiersLayout() {
  const pathname = usePathname();

  return (
    <ContentLocalizationProvider pathname={pathname}>
      <Slot />
    </ContentLocalizationProvider>
  );
}
