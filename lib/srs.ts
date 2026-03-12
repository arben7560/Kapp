export type SRSData = {
  lastSeen: number;
  interval: number;
};

export function nextInterval(correct: boolean, current: number) {
  if (!correct) return 1;

  if (current === 0) return 1;
  if (current === 1) return 3;
  if (current === 3) return 7;
  if (current === 7) return 14;

  return current * 2;
}

export function shouldReview(lastSeen: number, interval: number) {
  const now = Date.now();
  const days = (now - lastSeen) / (1000 * 60 * 60 * 24);

  return days >= interval;
}
