import { v4 as uuidv4 } from 'uuid';
import sessionStore from '../repositories/session.repository.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { runAgentTurn } from '../agent/agent.js';


export const handleChatTurn = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    const error = new Error('Request body must include a non-empty "message" string.');
    error.statusCode = 400;
    throw error;
  }

  const session = sessionStore.requireSession(sessionId);

  let responded = false;
  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      const error = new Error('Agent response timed out.');
      error.statusCode = 504;
      throw error;
    }
  }, 50000);


  const messageId = uuidv4();

  try {
    const { newMessages, finalText, provider } = await runAgentTurn(session, message.trim());

    // Persist all new messages 
    for (const m of newMessages) {
      sessionStore.addMessage(sessionId, m);
    }

    if (!responded) {
      responded = true;
      clearTimeout(timeout);
      sendSuccess(res, {
        sessionId,
        reply: finalText,
        provider,
        escalations: sessionStore.getSession(sessionId).escalations,
      });
    }
  } catch (err) {
    if (!responded) {
      responded = true;
      clearTimeout(timeout);
      throw err;
    }
  }
});

