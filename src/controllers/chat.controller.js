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

  sendSuccess(res, {
    sessionId,
    messageId: '67890',
    message,
  });
});
