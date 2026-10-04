import { z } from 'zod';
import { MentorError } from '../mentor/errors.js';
import { safety } from '../mentor/prompts.js';
import { retry } from '../utils/retry.js';
import type { Config } from '../mentor/config.js';
import type { MentorClient } from '../mentor/types.js';
import { extractGroqGrounding } from './grounding.js';

const outputText = (response: unknown): string => {
  const root = response && typeof response === 'object' ? response as Record<string, unknown> : {};
  const output = Array.isArray(root.output) ? root.output : [];
  return output.flatMap(item => {
    const content = item && typeof item === 'object' && Array.isArray((item as {content?: unknown}).content) ? (item as {content: unknown[]}).content : [];
    return content.filter((part): part is {type: string; text: string} => Boolean(part && typeof part === 'object' && (part as {type?: unknown}).type === 'output_text' && typeof (part as {text?: unknown}).text === 'string')).map(part => part.text);
  }).join('\n');
};

export function createGroqClient(config: Config, apiKey = process.env.GROQ_API_KEY): MentorClient {
  const call = async (stage: string, instruction: string, data: unknown, signal: AbortSignal, schema?: z.ZodType): Promise<unknown> => retry(async () => {
    if (!apiKey?.trim()) throw new MentorError('SERVER_CONFIGURATION_ERROR', 503, 'Set GROQ_API_KEY in the server environment to run mentor searches.');
    const response = await fetch('https://api.groq.com/openai/v1/responses', {
      method: 'POST',
      headers: {'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: config.model, stream: false,
        input: [
          {role: 'system', content: `${safety}\n${instruction}${schema ? '' : '\nWrite one factual claim per line, place its inline citation immediately after the claim, and repeat the person name on each line. Do not put an uncited claim on a cited line.'}`},
          {role: 'user', content: JSON.stringify({untrustedData: data})},
        ],
        ...(schema ? {text: {format: {type: 'json_schema', name: stage.replace(/[^a-zA-Z0-9_-]/g, '_'), schema: z.toJSONSchema(schema), strict: true}}} : {tools: [{type: 'browser_search'}], tool_choice: 'required', reasoning: {effort: 'low'}}),
      }),
      signal,
    });
    if (!response.ok) {
      const problem = await response.text();
      if (response.status === 401 || response.status === 403 || /incorrect api key|invalid api key/i.test(problem))
        throw new MentorError('SERVER_CONFIGURATION_ERROR', 503, 'Groq rejected the API key or account access. Check GROQ_API_KEY.');
      throw {status: response.status};
    }
    const payload: unknown = await response.json();
    const result = payload && typeof payload === 'object' ? payload as {status?: unknown; output?: unknown} : {};
    const items = Array.isArray(result.output) ? result.output as Array<{type?: unknown; status?: unknown}> : [];
    const researchComplete = !schema && result.status === 'incomplete'
      && items.some(item => item.type === 'message' && item.status === 'completed')
      && items.some(item => item.type === 'mcp_call' && item.status === 'completed')
      && items.every(item => item.type !== 'message' && item.type !== 'mcp_call' || item.status === 'completed')
      && outputText(payload).trim().length > 0;
    if (result.status !== 'completed' && !researchComplete)
      throw new MentorError('GROQ_ERROR', 502, 'Groq returned an incomplete response.');
    return payload;
  }, signal);
  return {
    async structured<T>(stage: string, instruction: string, data: unknown, schema: z.ZodType<T>, signal: AbortSignal): Promise<T> {
      const response = await call(stage, instruction, data, signal, schema);
      try { return schema.parse(JSON.parse(outputText(response))); }
      catch { throw new MentorError('GROQ_ERROR', 502, 'Groq returned invalid structured output.'); }
    },
    async research(stage, instruction, data, signal) {
      const response = await call(stage, instruction, data, signal);
      return {text: outputText(response), grounding: extractGroqGrounding(response)};
    },
  };
}
