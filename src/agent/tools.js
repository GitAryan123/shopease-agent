import { searchKnowledgeBase } from '../services/faq.service.js';
import { getOrderStatus, checkRefundEligibility } from '../services/order.service.js';
import { escalateToHuman } from '../services/escalation.service.js';

export const search_knowledge_base = searchKnowledgeBase;
export const get_order_status = getOrderStatus;
export const check_refund_eligibility = checkRefundEligibility;
export const escalate_to_human = escalateToHuman;

export const toolImplementations = {
  search_knowledge_base,
  get_order_status,
  check_refund_eligibility,
  escalate_to_human,
};


