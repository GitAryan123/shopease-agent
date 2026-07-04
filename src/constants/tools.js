export const toolDeclarations = [
    {
        name: 'search_knowledge_base',
        description:
            'Search the ShopEase FAQ knowledge base for articles relevant to a customer question (returns policy, shipping, payments, cancellations, account issues, etc).',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The customer question or keywords to search for.',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_order_status',
        description:
            'Look up an order by its ID and return its current status, dates, items, and total.',
        parameters: {
            type: 'object',
            properties: {
                order_id: {
                    type: 'string',
                    description: "The order ID, e.g. 'ORD-1001'.",
                },
            },
            required: ['order_id'],
        },
    },
    {
        name: 'check_refund_eligibility',
        description:
            'Check whether an order is eligible for a refund based on delivery status, the 30-day refund window, and whether it was already refunded.',
        parameters: {
            type: 'object',
            properties: {
                order_id: {
                    type: 'string',
                    description: "The order ID, e.g. 'ORD-1001'.",
                },
            },
            required: ['order_id'],
        },
    },
    {
        name: 'escalate_to_human',
        description:
            'Escalate the current conversation to a human support agent when the issue cannot be resolved automatically (e.g. complex complaints, angry customers, fraud concerns, or anything outside policy). Creates a ticket.',
        parameters: {
            type: 'object',
            properties: {
                summary: {
                    type: 'string',
                    description: 'A concise summary of the issue for the human agent.',
                },
                priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'urgent'],
                    description: 'Urgency of the escalation.',
                },
            },
            required: ['summary'],
        },
    },
];