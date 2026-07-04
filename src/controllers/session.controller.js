
import sessionStore from '../repositories/session.repository.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { validateSessionId } from '../utils/validation.js';


export const createSession = asyncHandler(async (req, res) => {
  const session = sessionStore.createSession(req.body || {});
  sendSuccess(res, {
    sessionId: session.id,
    createdAt: session.createdAt,
  }, 201);
});

export const getSessionChat = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  validateSessionId(sessionId);
  
  const messages = sessionStore.listMessages(sessionId);
  sendSuccess(res, { sessionId, messages });
});

