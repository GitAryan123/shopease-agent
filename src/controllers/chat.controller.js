import { v4 as uuidv4 } from 'uuid';
import sessionStore from '../repositories/session.repository.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";


export const handleChatTurn = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    const error = new Error('Request body must include a non-empty "message" string.');
    error.statusCode = 400;
    throw error;
  }

  const messageId = uuidv4();

  sessionStore.addMessage(sessionId, {
    id: messageId,
    sender: 'user',
    text: message,
  });

  sendSuccess(res, {
    sessionId,
    messageId,
    message,
  });
});

