import { v4 as uuidv4 } from 'uuid';

export function createSessionStore() {
  const sessions = new Map();

  function createSession(meta = {}) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const session = {
      id,
      messages: [],
      escalations: [],
      meta,
      createdAt: now,
      updatedAt: now,
    };
    sessions.set(id, session);
    return session;
  }

  function getSession(id) {
    return sessions.get(id) || null;
  }

  function requireSession(id) {
    const session = getSession(id);
    if (!session) {
      const err = new Error(`Session not found: ${id}`);
      err.statusCode = 404;
      throw err;
    }
    return session;
  }

  function addMessage(id, message) {
    const session = requireSession(id);
    session.messages.push({ ...message, timestamp: new Date().toISOString() });
    session.updatedAt = new Date().toISOString();
    return session;
  }

  function listMessages(id) {
    const session = requireSession(id);
    return session.messages;
  }

  function addEscalation(id, ticket) {
    const session = requireSession(id);
    session.escalations.push(ticket);
    session.updatedAt = new Date().toISOString();
    return ticket;
  }

  function listSessions() {
    return Array.from(sessions.values()).map((s) => ({
      id: s.id,
      messageCount: s.messages.length,
      escalationCount: s.escalations.length,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  function deleteSession(id) {
    return sessions.delete(id);
  }

  return {
    createSession,
    getSession,
    requireSession,
    addMessage,
    listMessages,
    addEscalation,
    listSessions,
    deleteSession,
  };
}

const sessionStore = createSessionStore();
export default sessionStore;
