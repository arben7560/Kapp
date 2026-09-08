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
  const advanceLockRef = useRef(false);

  const clearTypingTimer = useCallback(() => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
  }, []);

  const resetDialogue = useCallback(() => {
    clearTypingTimer();
    advanceLockRef.current = false;
    setVisibleMessages(1);
    setIsTyping(false);
  }, [clearTypingTimer]);

  useEffect(() => {
    advanceLockRef.current = false;
  }, [isTyping, visibleMessages]);

  useEffect(() => clearTypingTimer, [clearTypingTimer]);

  const advanceDialogue = useCallback(() => {
    if (isTyping || advanceLockRef.current) return;

    Vibration.vibrate(8);

    if (visibleMessages >= messages.length) {
      stopAudio();
      setSelectedAudio(null);
      resetDialogue();
      return;
    }

    const nextMessage = messages[visibleMessages];
    const nextMessageId = `${sceneId}-dialogue-${visibleMessages}`;
    advanceLockRef.current = true;

    if (nextMessage.side === "server") {
      setIsTyping(true);

      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((current) => Math.min(current + 1, messages.length));
        playAudio(nextMessage.audio, nextMessageId);
      }, 600 + Math.floor(Math.random() * 301));
      return;
    }

    setVisibleMessages((current) => Math.min(current + 1, messages.length));
    playAudio(nextMessage.audio, nextMessageId);
  }, [
    isTyping,
    messages,
    playAudio,
    resetDialogue,
    sceneId,
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
