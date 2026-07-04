import sessionStore from '../repositories/session.repository.js';
import { v4 as uuidv4 } from 'uuid';

export function escalateToHuman({ summary, priority = 'medium', sessionId }) {
  if (!summary || !summary.trim()) {
    return { created: false, message: 'summary is required to escalate.' };
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  const normalizedPriority = validPriorities.includes(priority)
    ? priority
    : 'medium';

  const ticket = {
    ticketId: `ESC-${uuidv4().slice(0, 8).toUpperCase()}`,
    summary: summary.trim(),
    priority: normalizedPriority,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  if (sessionId) {
    try {
      sessionStore.addEscalation(sessionId, ticket);
    } catch (e) {
      // Session missing is non-fatal for the tool result itself.
      console.warn(`Failed to add escalation to session ${sessionId}: ${e.message}`);
    }
  }

  return {
    created: true,
    ticketId: ticket.ticketId,
    priority: ticket.priority,
    status: ticket.status,
    message: `Escalation ticket ${ticket.ticketId} created with priority '${ticket.priority}'. A human agent will follow up.`,
  };
}
