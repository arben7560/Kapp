export function buildProgressId(
  prefix: string,
  ...parts: Array<string | number | null | undefined>
) {
  return [prefix, ...parts]
    .filter((part) => part !== null && part !== undefined && `${part}`.trim())
    .join("_")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}
