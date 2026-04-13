export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  message: string;
  isEmergency: boolean;
}

const FALLBACK: ChatReply = {
  message:
    "I apologize, but I'm having trouble processing your message. Please try again or continue to the assessment.",
  isEmergency: false,
};

export async function sendChatMessage(messages: ChatTurn[]): Promise<ChatReply> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as Partial<ChatReply>;
    if (typeof data.message !== 'string' || typeof data.isEmergency !== 'boolean') {
      return FALLBACK;
    }
    return { message: data.message, isEmergency: data.isEmergency };
  } catch (error) {
    console.error('[chat-client] request failed:', error);
    return FALLBACK;
  }
}
