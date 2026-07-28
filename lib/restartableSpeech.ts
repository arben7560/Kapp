export type RestartableSpeechOptions = {
  language: string;
  rate: number;
  pitch?: number;
};

type SpeechApi = {
  speak: (text: string, options: RestartableSpeechOptions) => void;
  stop: () => Promise<void>;
};

export type RestartableSpeechController = {
  speak: (
    value: string,
    options: RestartableSpeechOptions,
  ) => Promise<void>;
  stop: () => Promise<void>;
};

export function createRestartableSpeechController(
  speechApi: SpeechApi,
): RestartableSpeechController {
  let requestId = 0;
  let operation = Promise.resolve();

  const stopEngine = async () => {
    try {
      await speechApi.stop();
    } catch {
      // A failed stop should not permanently block later playback attempts.
    }
  };

  return {
    speak(value, options) {
      const currentRequestId = ++requestId;
      const segments = value
        .split("|")
        .map((segment) => segment.trim())
        .filter(Boolean);

      operation = operation.then(async () => {
        await stopEngine();
        if (currentRequestId !== requestId) return;

        segments.forEach((segment) => {
          speechApi.speak(segment, options);
        });
      });

      return operation;
    },
    stop() {
      requestId += 1;
      operation = operation.then(stopEngine);
      return operation;
    },
  };
}
