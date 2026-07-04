import { toolImplementations } from './tools.js';
import { getProvider } from './providers/index.js';
import { MAX_TOOL_ITERATIONS } from '../constants/index.js';

export async function runAgentTurn(session, userText) {
  const provider = getProvider();

  const workingMessages = [...session.messages, { role: 'user', content: userText }];
  const newMessages = [{ role: 'user', content: userText }];

  let iterations = 0;
  let finalText = null;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations += 1;
    const { toolCalls, text } = await provider.send(workingMessages);

    if (!toolCalls || toolCalls.length === 0) {
      finalText =
        text && text.trim()
          ? text.trim()
          : "I'm sorry, I wasn't able to generate a response. Could you rephrase your question?";
      const assistantMsg = { role: 'assistant', content: finalText };
      workingMessages.push(assistantMsg);
      newMessages.push(assistantMsg);
      break;
    }

    const assistantToolMsg = {
      role: 'assistant',
      content: null,
      toolCalls,
    };
    workingMessages.push(assistantToolMsg);
    newMessages.push(assistantToolMsg);

    for (const call of toolCalls) {
      const impl = toolImplementations[call.name];
      let resultPayload;
      if (!impl) {
        resultPayload = { error: `Unknown tool: ${call.name}` };
      } else {
        try {
          const args =
            call.name === 'escalate_to_human'
              ? { ...call.args, sessionId: session.id }
              : call.args;
          resultPayload = await impl(args);
        } catch (err) {
          resultPayload = { error: err.message || String(err) };
        }
      }

      const toolMsg = {
        role: 'tool',
        name: call.name,
        toolCallId: call.id,
        content: JSON.stringify(resultPayload),
      };
      workingMessages.push(toolMsg);
      newMessages.push(toolMsg);
    }
  }

  if (finalText === null) {
    finalText =
      "I'm still working on that but I've hit my tool-call limit for this turn. Let me escalate this to a human agent.";
    const fallbackMsg = { role: 'assistant', content: finalText };
    newMessages.push(fallbackMsg);
  }

  return { newMessages, finalText, provider: provider.name };
}
