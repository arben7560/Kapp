export type RemovableAudioSubscription = {
  remove: () => void;
};

export type ReleasableAudioPlayer = {
  pause: () => void;
  remove: () => void;
};

export function releaseAudioResources(
  player: ReleasableAudioPlayer | null,
  listener: RemovableAudioSubscription | null,
) {
  try {
    listener?.remove();
  } catch {
    // A native subscription may already have been removed.
  }

  try {
    player?.pause();
  } catch {
    // A failed player can reject pause while still requiring release.
  }

  try {
    player?.remove();
  } catch {
    // A native player may already have been released.
  }
}
