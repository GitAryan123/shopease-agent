export const validateSessionId = (sessionId) => {
    if (!sessionId || sessionId === 'undefined') {
        const error = new Error('Session ID is required');
        error.statusCode = 400;
        throw error;
    }

    if (sessionId.length !== 36) {
        const error = new Error('Invalid session ID format');
        error.statusCode = 400;
        throw error;
    }
};

export const validateStringField = (value, fieldName) => {
    if (!value || typeof value !== 'string' || !value.trim()) {
        const error = new Error(`Request body must include a non-empty "${fieldName}" string.`);
        error.statusCode = 400;
        throw error;
    }
};