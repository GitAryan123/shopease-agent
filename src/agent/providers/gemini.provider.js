import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../../constants/index.js";
import { createLLMError } from "../../utils/errors.js";

export function createGeminiProvider(
    apiKey,
    modelName = "gemini-2.5-flash"
) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const client = new GoogleGenAI({ apiKey });

    function _toGeminiMessages(messages = []) {
        return messages
            .filter((message) => message?.role && message?.content)
            .map(({ role, content }) => ({
                role: role === "assistant" ? "model" : role,
                parts: [{ text: content }],
            }));
    }

    async function send(messages = []) {
        try {
            const response = await client.models.generateContent({
                model: modelName,
                contents: _toGeminiMessages(messages),
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                },
            });

            return {
                toolCalls: [],
                text: response.text ?? "",
            };
        } catch (error) {
            throw createLLMError(
                "I'm having trouble processing your request. Please try again.",
                error
            );
        }
    }

    return {
        name: "gemini",
        send,
    };
}

