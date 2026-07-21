import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Vibration } from "react-native";

type VocDialogueMessage = {
  side: "me" | "server";
  audio?: number;
};

type UseVocDialogueOptions<Message extends VocDialogueMessage> = {
  sceneId: string;
  messages: Message[];
  playAudio: (audioSource?: number, id?: string) => void;
  stopAudio: () => void;
  setSelectedAudio: Dispatch<SetStateAction<string | null>>;
};

export const VOC_DIALOGUE_COPY = {
  continue: "Toucher pour continuer",
  restart: "Toucher pour recommencer l’étape",
  typing: "Réponse en cours...",
} as const;

export function useVocDialogue<Message extends VocDialogueMessage>({
  sceneId,
  messages,
  playAudio,
  stopAudio,
  setSelectedAudio,
}: UseVocDialogueOptions<Message>) {
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAutoPlayNextMessageRef = useRef(false);

  const clearTypingTimer = useCallback(() => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
  }, []);

  const resetDialogue = useCallback(() => {
    clearTypingTimer();
    shouldAutoPlayNextMessageRef.current = false;
    setVisibleMessages(1);
    setIsTyping(false);
  }, [clearTypingTimer]);

  useEffect(() => {
    if (!shouldAutoPlayNextMessageRef.current || isTyping) return;

    shouldAutoPlayNextMessageRef.current = false;

    const currentMessageIndex = visibleMessages - 1;
    const currentMessage = messages[currentMessageIndex];

    if (!currentMessage) return;

    playAudio(
      currentMessage.audio,
      `${sceneId}-dialogue-${currentMessageIndex}`,
    );
  }, [isTyping, messages, playAudio, sceneId, visibleMessages]);

  useEffect(() => clearTypingTimer, [clearTypingTimer]);

  const advanceDialogue = useCallback(() => {
    if (isTyping) return;

    Vibration.vibrate(8);

    if (visibleMessages >= messages.length) {
      stopAudio();
      setSelectedAudio(null);
      resetDialogue();
      return;
    }

    const nextMessage = messages[visibleMessages];
    shouldAutoPlayNextMessageRef.current = true;

    if (nextMessage.side === "server") {
      setIsTyping(true);

      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((current) => Math.min(current + 1, messages.length));
      }, 600 + Math.floor(Math.random() * 301));
      return;
    }

    setVisibleMessages((current) => Math.min(current + 1, messages.length));
  }, [
    isTyping,
    messages,
    resetDialogue,
    setSelectedAudio,
    stopAudio,
    visibleMessages,
  ]);

  const isComplete = visibleMessages >= messages.length;

  return {
    advanceDialogue,
    hintText: isComplete
      ? VOC_DIALOGUE_COPY.restart
      : isTyping
        ? VOC_DIALOGUE_COPY.typing
        : VOC_DIALOGUE_COPY.continue,
    isTyping,
    resetDialogue,
    shouldHighlightHint: !isTyping && !isComplete,
    visibleMessages,
  };
}
