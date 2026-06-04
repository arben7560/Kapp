export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const conversations = new Map<string, ChatMessage[]>();

const MAX_MESSAGES = 10;

export function getConversationHistory(userId: string): ChatMessage[] {
  return conversations.get(userId) ?? [];
}

export function addMessageToHistory(
  userId: string,
  message: ChatMessage,
): void {
  const history = conversations.get(userId) ?? [];

  history.push(message);

  const trimmedHistory = history.slice(-MAX_MESSAGES);

  conversations.set(userId, trimmedHistory);
}

export function clearConversationHistory(userId: string): void {
  conversations.delete(userId);
}
