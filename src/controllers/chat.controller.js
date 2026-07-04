import { v4 as uuidv4 } from 'uuid';
import sessionStore from '../repositories/session.repository.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { runAgentTurn } from '../agent/agent.js';
import { CHAT_TIMEOUT_MS } from '../constants/index.js';
import { validateStringField, validateSessionId } from '../utils/validation.js';


export const handleChatTurn = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;
  const { message } = req.body || {};

  // Validate sessionId and message
  validateSessionId(sessionId);
  validateStringField(message, 'message');

  const session = sessionStore.requireSession(sessionId);

  let responded = false;
  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      const error = new Error('Agent response timed out.');
      error.statusCode = 504;
      next(error)
    }
  }, CHAT_TIMEOUT_MS);

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

