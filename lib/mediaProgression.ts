type RequiredVideoStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "playing"
  | "interrupted"
  | "ended"
  | "error";

export function canAdvanceAfterRequiredVideo({
  hasRequiredVideo,
  status,
}: {
  hasRequiredVideo: boolean;
  status: RequiredVideoStatus;
}) {
  return !hasRequiredVideo || status === "ended";
}
