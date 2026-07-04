

import { v4 as uuidv4 } from 'uuid';
import { getProvider } from './providers/providers.js';

export async function runAgentTurn(session, userText) {
  const provider = getProvider();

  // Basic ask agent without context: send only the current user message
  const messages = [
    { role: 'user', content: userText }
  ];

  const response = await provider.send(messages);
  const finalText = response.text || "I'm sorry, I couldn't generate a response.";

  const newMessages = [
    {
      id: uuidv4(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    },
    {
      id: uuidv4(),
      sender: 'assistant',
      text: finalText,
      timestamp: new Date().toISOString()
    }
  ];

  return {
    newMessages,
    finalText,
    provider: provider.name
  };
}


