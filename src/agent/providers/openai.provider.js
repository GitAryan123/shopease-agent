import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../../constants/index.js";
import { createLLMError } from "../../utils/errors.js";
import { toolDeclarations } from "../../constants/tools.js";
import { safeParse } from "../../utils/helpers.js";

function createOpenAIProvider(apiKey, modelName = "gpt-4o-mini") {
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured.");
    }

    const client = new OpenAI({ apiKey });

    function toOpenAITools() {
        return toolDeclarations.map((t) => ({
            type: "function",
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
            },
        }));
    }

    function toOpenAIMessages(messages = []) {
        return messages
            .filter((message) => message?.role && (message?.content !== undefined || message?.toolCalls !== undefined))
            .map(({ role, content, toolCalls, toolCallId, name }) => {
                const formatted = { role };
                if (content !== undefined) formatted.content = content;
                if (name !== undefined) formatted.name = name;
                if (toolCallId !== undefined) formatted.tool_call_id = toolCallId;
                if (toolCalls !== undefined && toolCalls.length > 0) {
                    formatted.tool_calls = toolCalls.map((tc) => ({
                        id: tc.id,
                        type: "function",
                        function: {
                            name: tc.name,
                            arguments: JSON.stringify(tc.args || {}),
                        },
                    }));
                }
                return formatted;
            });
    }

    async function send(messages = []) {
        try {
            const completion = await client.chat.completions.create({
                model: modelName,
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT,
                    },
                    ...toOpenAIMessages(messages),
                ],
                tools: toOpenAITools(),
                temperature: 0.3,
            });

            const message = completion.choices?.[0]?.message;

            if (!message) {
                throw new Error("OpenAI returned an empty response.");
            }

            return {
                toolCalls: (message.tool_calls || []).map((tc) => ({
                    id: tc.id,
                    name: tc.function.name,
                    args: safeParse(tc.function.arguments) || {},
                })),
                text: message.content ?? "",
            };
        } catch (error) {
            console.error("OpenAI Provider Error:", error);
            throw createLLMError(
                "I'm having trouble processing your request. Please try again later.",
                error
            );
        }
    }

    return {
        name: "openai",
        send,
    };
}

export { createOpenAIProvider };