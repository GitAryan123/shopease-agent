export function createLLMError(message, originalError) {
    const err = new Error(message);
    err.name = 'LLMError';
    err.statusCode = 503;
    err.originalError = originalError;
    return err;
}