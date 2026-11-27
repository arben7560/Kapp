export const IMMERSIVE_CONTENT_MAX_WIDTH = 760;
export const IMMERSIVE_MIN_TOUCH_TARGET = 44;

export const IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO = 0.82;
export const IMMERSIVE_MEDIA_VIEWPORT_HEIGHT_RATIO = 0.54;
export const IMMERSIVE_PHONE_LANDSCAPE_MAX_HEIGHT = 600;
export const IMMERSIVE_PHONE_LANDSCAPE_INTERACTION_MAX_WIDTH = 560;

export const IMMERSIVE_VIDEO_VIEW_PROPS = {
  contentFit: "cover" as const,
  surfaceType: "textureView" as const,
  useExoShutter: false,
  nativeControls: false,
  allowsPictureInPicture: false,
};

export const IMMERSIVE_PHONE_LANDSCAPE_STYLES = {
  body: {
    flexDirection: "row" as const,
  },
  interactionScroll: {
    flex: 1,
  },
  interactionScrollContent: {
    paddingTop: 6,
  },
  topFixedSection: {
    paddingTop: 0,
  },
  transcriptCard: {
    borderRadius: 22,
    marginHorizontal: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  transcriptKorean: {
    marginBottom: 6,
  },
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

type PhoneLandscapeLayoutOptions = Readonly<{
  windowWidth: number;
  windowHeight: number;
  horizontalSafeArea?: number;
  topSafeArea?: number;
}>;

/**
 * Splits a phone landscape viewport into two balanced columns while keeping
 * the interaction column independently scrollable.
 */
export function getImmersivePhoneLandscapeLayout({
  windowWidth,
  windowHeight,
  horizontalSafeArea = 0,
  topSafeArea = 0,
}: PhoneLandscapeLayoutOptions) {
  const clamp = (value: number, minimum: number, maximum: number) =>
    Math.min(maximum, Math.max(minimum, value));
  const contentViewportWidth = Math.max(0, windowWidth - horizontalSafeArea);
  const horizontalPadding = Math.round(
    clamp(contentViewportWidth * 0.028, 14, 30),
  );
  const availableWidth = Math.max(
    0,
    contentViewportWidth - horizontalPadding * 2,
  );
  const columnGap = Math.round(clamp(availableWidth * 0.024, 14, 24));
  const columnsWidth = Math.max(0, availableWidth - columnGap);
  const primaryColumnWidth = Math.floor(columnsWidth / 2);
  const interactionColumnWidth = Math.max(
    0,
    columnsWidth - primaryColumnWidth,
  );
  const interactionContentWidth = Math.min(
    interactionColumnWidth,
    IMMERSIVE_PHONE_LANDSCAPE_INTERACTION_MAX_WIDTH,
  );
  const mediaHeight = Math.round(clamp(windowHeight * 0.45, 156, 286));
  const mediaWidth = Math.round(
    Math.min(
      primaryColumnWidth,
      mediaHeight * IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO,
    ),
  );
  const heightComfort = clamp((windowHeight - 360) / 240, 0, 1);
  const headerHeight = 44 + Math.max(6, topSafeArea * 0.15);
  const bodyHeight = Math.max(0, windowHeight - topSafeArea - headerHeight);
  const progressHeight = 42 + heightComfort * 24;
  const transcriptMaxHeight = Math.max(
    64,
    Math.floor(bodyHeight - progressHeight - mediaHeight - 8),
  );

  return {
    availableWidth,
    columnGap,
    horizontalPadding,
    interactionContentWidth,
    interactionColumnWidth,
    mediaHeight,
    mediaWidth,
    primaryColumnWidth,
    transcriptMaxHeight,
  };
}

export const IMMERSIVE_TABLET_LANDSCAPE_STYLES = {
  transcriptCard: {
    marginTop: 12,
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
  },
  interactionScrollContent: {
    paddingTop: 16,
  },
};

type LandscapeLayoutOptions = PhoneLandscapeLayoutOptions & Readonly<{
  isWideViewport: boolean;
  bottomSafeArea?: number;
}>;

/** A tablet split uses the same mounted scene tree as phone landscape.
 * Keep both columns inside the horizontal SafeAreaView, and reserve vertical
 * space for the header, progress, transcript chrome and bottom system bar. */
export function getImmersiveLandscapeLayout({
  windowWidth,
  windowHeight,
  horizontalSafeArea = 0,
  topSafeArea = 0,
  bottomSafeArea = 0,
  isWideViewport,
}: LandscapeLayoutOptions) {
  if (windowWidth <= windowHeight) return null;

  if (!isWideViewport) {
    if (windowHeight > IMMERSIVE_PHONE_LANDSCAPE_MAX_HEIGHT) return null;
    return {
      ...getImmersivePhoneLandscapeLayout({
        windowWidth,
        windowHeight,
        horizontalSafeArea,
        topSafeArea,
      }),
      mode: "phone" as const,
    };
  }

  const safeWidth = Math.max(0, windowWidth - horizontalSafeArea);
  const horizontalPadding = Math.max(
    24,
    Math.min(40, Math.round(safeWidth * 0.03)),
    Math.ceil((safeWidth - 1200) / 2),
  );
  const availableWidth = Math.max(0, safeWidth - horizontalPadding * 2);
  const columnGap = 24;
  const columnsWidth = Math.max(0, availableWidth - columnGap);
  const primaryColumnWidth = Math.floor(columnsWidth * 0.44);
  const interactionColumnWidth = columnsWidth - primaryColumnWidth;
  if (primaryColumnWidth < 300 || interactionColumnWidth < 360) return null;

  const headerHeight = 44 + Math.max(6, topSafeArea * 0.15);
  const bodyHeight = Math.floor(windowHeight - topSafeArea - bottomSafeArea - headerHeight);
  const progressBudget = 100;
  const transcriptChrome = 48;
  const minTranscriptHeight = 144;
  const mediaHeight = Math.floor(Math.min(
    480,
    bodyHeight * 0.55,
    bodyHeight - progressBudget - transcriptChrome - minTranscriptHeight,
    primaryColumnWidth / IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO,
  ));
  // Very small split-screen windows keep the original stacked layout.
  if (mediaHeight < 160) return null;

  return {
    mode: "tablet" as const,
    availableWidth,
    columnGap,
    horizontalPadding,
    interactionContentWidth: Math.min(interactionColumnWidth, 680),
    interactionColumnWidth,
    mediaHeight,
    mediaWidth: mediaHeight * IMMERSIVE_PORTRAIT_MEDIA_ASPECT_RATIO,
    primaryColumnWidth,
    transcriptMaxHeight: bodyHeight - progressBudget - transcriptChrome - mediaHeight,
  };
}
