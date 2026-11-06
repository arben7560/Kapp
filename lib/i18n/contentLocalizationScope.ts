/** A localized display scope; route identities never depend on the UI language. */
export type ContentLocalizationScope = Readonly<{
  namespace: "vocabulary" | "counting" | "classifiers";
  module: string;
}>;

/** Pure route mapping, shared by all translated legacy lesson screens. */
export function getContentLocalizationScope(
  pathname: string,
): ContentLocalizationScope | null {
  const segments = pathname.split("/").filter(Boolean);
  const roots = [
    { route: "voc", namespace: "vocabulary" },
    { route: "comptage", namespace: "counting" },
    { route: "classificateur", namespace: "classifiers" },
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
