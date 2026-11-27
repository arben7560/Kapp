/** Preserve a phone-sized cover composition; very wide cards get subdued
 * side extensions rather than zooming a portrait or landscape asset excessively. */
export function getCardImageFrame(width: number, height: number) {
  const availableWidth = Math.max(0, width);
  const availableHeight = Math.max(0, height);
  const centralWidth = Math.min(availableWidth, Math.max(400, availableHeight * 2.1));
  const extension = availableWidth - centralWidth;
  const fade = Math.min(72, extension * 0.9, centralWidth * 0.12);
  return { centralWidth, fade };
}
