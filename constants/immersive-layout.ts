export const IMMERSIVE_CONTENT_MAX_WIDTH = 760;
export const IMMERSIVE_MIN_TOUCH_TARGET = 44;

export const IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO = 0.82;
export const IMMERSIVE_MEDIA_VIEWPORT_HEIGHT_RATIO = 0.54;
export const IMMERSIVE_MEDIA_LOAD_TIMEOUT_MS = 8_000;

export const IMMERSIVE_VIDEO_VIEW_PROPS = {
  contentFit: "cover" as const,
  surfaceType: "textureView" as const,
  useExoShutter: false,
  nativeControls: false,
  allowsPictureInPicture: false,
};

export function getImmersiveBottomPadding(
  bottomInset: number,
  minimum = 22,
  spacing = 8,
) {
  return Math.max(minimum, bottomInset + spacing);
}

type PortraitMediaLayoutOptions = Readonly<{
  contentWidth: number;
  viewportHeight: number;
  maxHeight?: number;
  widthRatio?: number;
  aspectRatio?: number;
}>;

/** Keeps portrait media stable across phones and tablets without over-cropping it. */
export function getImmersivePortraitMediaLayout({
  contentWidth,
  viewportHeight,
  maxHeight = 480,
  widthRatio = 0.88,
  aspectRatio = IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO,
}: PortraitMediaLayoutOptions) {
  const heightLimit = Math.min(
    viewportHeight * IMMERSIVE_MEDIA_VIEWPORT_HEIGHT_RATIO,
    maxHeight,
  );
  const width = Math.min(contentWidth * widthRatio, heightLimit * aspectRatio);

  return {
    width,
    height: width / aspectRatio,
  };
}
