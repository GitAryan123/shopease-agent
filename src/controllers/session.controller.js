
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';


export const createSession = asyncHandler(async (req, res) => {
  const session = {
    id: '12345',
    createdAt: new Date().toISOString(),
  };

  sendSuccess(res, {
    sessionId: session.id,
    createdAt: session.createdAt,
  }, 201);
});

export const getSessionChat = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const messages = [];

  sendSuccess(res, { sessionId, messages });
});

