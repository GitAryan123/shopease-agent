import { getOrders } from '../repositories/order.repository.js';

const REFUND_WINDOW_DAYS = 30;

export function getOrderStatus({ order_id }) {
  if (!order_id) {
    return { found: false, message: 'order_id is required.' };
  }
  const rawOrders = getOrders();
  const orders = rawOrders.map((order) => ({
    id: order.order_id,
    status: order.status,
    orderDate: order.order_date,
    deliveryDate: order.delivery_date,
    items: order.items,
    total: order.total,
    refunded: order.status === 'refunded' || order.status === 'cancelled' || !!order.refund_date,
  }));

  const order = orders.find(
    (o) => o.id.toLowerCase() === String(order_id).toLowerCase()
  );

  if (!order) {
    return { found: false, order_id, message: `No order found with ID ${order_id}.` };
  }

  return {
    found: true,
    order_id: order.id,
    status: order.status,
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    items: order.items,
    total: order.total,
    refunded: order.refunded,
  };
}

export function checkRefundEligibility({ order_id }) {
  if (!order_id) {
    return { eligible: false, message: 'order_id is required.' };
  }

  const rawOrders = getOrders();
  const orders = rawOrders.map((order) => ({
    id: order.order_id,
    status: order.status,
    orderDate: order.order_date,
    deliveryDate: order.delivery_date,
    items: order.items,
    total: order.total,
    refunded: order.status === 'refunded' || order.status === 'cancelled' || !!order.refund_date,
  }));

  const order = orders.find(
    (o) => o.id.toLowerCase() === String(order_id).toLowerCase()
  );

  if (!order) {
    return {
      eligible: false,
      order_id,
      reason: 'not_found',
      message: `No order found with ID ${order_id}.`,
    };
  }

  if (order.refunded) {
    return {
      eligible: false,
      order_id,
      reason: 'already_refunded',
      message: 'This order has already been refunded.',
    };
  }

  if (order.status !== 'delivered') {
    return {
      eligible: false,
      order_id,
      reason: 'not_delivered',
      status: order.status,
      message: `Order status is '${order.status}'. Only delivered orders are eligible for refund.`,
    };
  }

  if (!order.deliveryDate) {
    return {
      eligible: false,
      order_id,
      reason: 'no_delivery_date',
      message: 'Order has no recorded delivery date.',
    };
  }

  const deliveredAt = new Date(order.deliveryDate);
  const now = new Date();
  const daysSinceDelivery = Math.floor(
    (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceDelivery > REFUND_WINDOW_DAYS) {
    return {
      eligible: false,
      order_id,
      reason: 'window_expired',
      daysSinceDelivery,
      refundWindowDays: REFUND_WINDOW_DAYS,
      message: `Delivery was ${daysSinceDelivery} days ago, which exceeds the ${REFUND_WINDOW_DAYS}-day refund window.`,
    };
  }

  return {
    eligible: true,
    order_id,
    daysSinceDelivery,
    refundWindowDays: REFUND_WINDOW_DAYS,
    daysRemaining: REFUND_WINDOW_DAYS - daysSinceDelivery,
    message: `Order is eligible for refund. ${REFUND_WINDOW_DAYS - daysSinceDelivery
      } day(s) remaining in the refund window.`,
  };
}

export { REFUND_WINDOW_DAYS };
