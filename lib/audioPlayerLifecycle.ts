export type RemovableAudioSubscription = {
  remove: () => void;
};

export type ReleasableAudioPlayer = {
  pause: () => void;
  remove: () => void;
};

export function pauseAudioResources(
  player: Pick<ReleasableAudioPlayer, "pause"> | null,
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
    // A failed player may reject pause while it is being recreated.
  }
}

export function releaseAudioResources(
  player: ReleasableAudioPlayer | null,
  listener: RemovableAudioSubscription | null,
) {
  pauseAudioResources(player, listener);

  try {
    player?.remove();
  } catch {
    // A native player may already have been released.
  }
}
