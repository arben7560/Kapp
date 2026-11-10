/** A localized display scope; route identities never depend on the UI language. */
export type ContentLocalizationScope = Readonly<{
  namespace: "vocabulary" | "counting" | "classifiers" | "grammar" | "immersion";
  module: string;
}>;

/** Pure route mapping, shared by all translated legacy lesson screens. */
export function getContentLocalizationScope(
  pathname: string,
): ContentLocalizationScope | null {
  const segments = pathname.split("/").filter(Boolean);
  // Café screens use an independent display-only immersion catalogue.
  if (segments.includes("lesson") && ["cafe", "cafeMissions", "cafeIA"].includes(segments[segments.length - 1] ?? "")) {
    return { namespace: "immersion", module: "cafe" };
  }
  // Métro has its own presentation-only immersion catalogue (same bridge as Café).
  if (segments.includes("lesson") && ["metro", "metroMissions", "metroIA"].includes(segments[segments.length - 1] ?? "")) {
    return { namespace: "immersion", module: "metro" };
  }
  // Speak is a top-level tab but uses the same display-copy bridge as Vocabulaire.
  if (segments[segments.length - 1] === "speak") {
    return { namespace: "vocabulary", module: "speak" };
  }
  const roots = [
    { route: "voc", namespace: "vocabulary" },
    { route: "comptage", namespace: "counting" },
    { route: "classificateur", namespace: "classifiers" },
    { route: "grammar", namespace: "grammar" },
  ] as const;

  for (const root of roots) {
    const index = segments.lastIndexOf(root.route);
    if (index < 0) continue;
    const requested = segments[index + 1];
    return {
      namespace: root.namespace,
      module: requested && requested !== "index" ? requested : "hub",
    };
  }
  return null;
}
