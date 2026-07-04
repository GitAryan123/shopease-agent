import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { SYSTEM_PROMPT } from "../../constants/index.js";
import { createLLMError } from "../../utils/errors.js";
import { safeParse } from "../../utils/helpers.js";
import { toolDeclarations } from "../../constants/tools.js";

export function createGeminiProvider(
    apiKey,
    modelName = "gemini-2.5-flash"
) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    const client = new GoogleGenAI({ apiKey });

    function _toGeminiTools() {
        return [
            {
                functionDeclarations: toolDeclarations.map(
                    ({ name, description, parameters }) => ({
                        name,
                        description,
                        parameters,
                    })
                ),
            },
        ];
    }

    function _toGeminiHistory(messages = []) {
        const history = [];

        for (const message of messages) {
            switch (message.role) {
                case "system":
                    // System prompt is supplied separately.
                    break;

                case "user":
                    history.push({
                        role: "user",
                        parts: [{ text: message.content }],
                    });
                    break;

                case "assistant":
                    if (message.toolCalls?.length) {
                        history.push({
                            role: "model",
                            parts: message.toolCalls.map((toolCall) => ({
                                functionCall: {
                                    name: toolCall.name,
                                    args: toolCall.args,
                                },
                            })),
                        });
                    } else {
                        history.push({
                            role: "model",
                            parts: [{ text: message.content ?? "" }],
                        });
                    }
                    break;

                case "tool":
                    history.push({
                        role: "function",
                        parts: [
                            {
                                functionResponse: {
                                    name: message.name,
                                    response:
                                        safeParse(message.content ?? ""),
                                },
                            },
                        ],
                    });
                    break;
            }
        }

        return history;
    }

    async function send(messages = []) {
        try {
            const response = await client.models.generateContent({
                model: modelName,
                contents: _toGeminiHistory(messages),
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    tools: _toGeminiTools(),
                },
            });

            const parts =
                response.candidates?.[0]?.content?.parts ?? [];

            const toolCalls = [];
            let text = "";

            for (const part of parts) {
                if (part.functionCall) {
                    toolCalls.push({
                        id: uuidv4(),
                        name: part.functionCall.name,
                        args: part.functionCall.args ?? {},
                    });
                }

                if (part.text) {
                    text += part.text;
                }
            }

            return {
                text,
                toolCalls,
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