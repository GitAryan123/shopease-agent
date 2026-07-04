import { Router } from 'express';
import { createSession, getSessionChat } from '../controllers/session.controller.js';
import { handleChatTurn } from '../controllers/chat.controller.js';

const router = Router();

router.post('/sessions', createSession);
router.get('/sessions/:sessionId/chat', getSessionChat);
router.post('/sessions/:sessionId/chat', handleChatTurn);

export default router;

