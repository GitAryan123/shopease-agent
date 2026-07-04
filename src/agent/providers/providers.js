import { createOpenAIProvider } from "./openai.provider.js";
import { createGeminiProvider } from "./gemini.provider.js";

let provider;

if (process.env.OPENAI_API_KEY) {
  provider = createOpenAIProvider(
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_MODEL
  );
} else if (process.env.GEMINI_API_KEY) {
  provider = createGeminiProvider(
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_MODEL
  );
} else {
  throw new Error(
    "No LLM provider configured. Set either OPENAI_API_KEY or GEMINI_API_KEY."
  );
}

export function getProvider() {
  return provider;
}

