import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../../constants/index.js";
import { createLLMError } from "../../utils/errors.js";

function createOpenAIProvider(apiKey, modelName = "gpt-4o-mini") {
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured.");
    }

    const client = new OpenAI({ apiKey });

    function toOpenAIMessages(messages = []) {
        return messages
            .filter((message) => message?.role && message?.content)
            .map(({ role, content }) => ({
                role,
                content,
            }));
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
                temperature: 0.3,
            });

            const message = completion.choices?.[0]?.message;

            if (!message) {
                throw new Error("OpenAI returned an empty response.");
            }

            return {
                toolCalls: message.tool_calls ?? [],
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