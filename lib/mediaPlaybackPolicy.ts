export function shouldStartVideoPlayback({
  appState,
  hasSource,
  isFocused,
  nativeReady = true,
  resumeRequired,
  shouldPlay,
}: {
  appState: string | null | undefined;
  hasSource: boolean;
  isFocused: boolean;
  nativeReady?: boolean;
  resumeRequired: boolean;
  shouldPlay: boolean;
}) {
  return (
    hasSource &&
    shouldPlay &&
    isFocused &&
    appState === "active" &&
    nativeReady &&
    !resumeRequired
  );
}
