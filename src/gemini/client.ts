import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { extractGroundingSources } from '../mentor/grounding.js';
import { MentorError } from '../mentor/errors.js';
import { safety } from '../mentor/prompts.js';
import { retry } from '../utils/retry.js';
import type { Config } from '../mentor/config.js';
import type { GeminiClient } from '../mentor/types.js';
export function createGeminiClient(config: Config, apiKey = process.env.GEMINI_API_KEY): GeminiClient {
  let sdk: GoogleGenAI | undefined;
  const getSdk = () => {
    if (!apiKey?.trim()) throw new MentorError('SERVER_CONFIGURATION_ERROR', 503, 'Set GEMINI_API_KEY in the server environment to run mentor searches.');
    return sdk ??= new GoogleGenAI({apiKey});
  };
  const call = async (instruction: string, data: unknown, signal: AbortSignal, schema?: z.ZodType) => retry(async () => {
    const response = await getSdk().interactions.create({
      model: config.model, store: false, stream: false,
      system_instruction: `${safety}\n${instruction}`,
      input: JSON.stringify({untrustedData: data}),
      ...(schema ? {response_format: {type: 'text' as const, mime_type: 'application/json', schema: z.toJSONSchema(schema)}} : {tools: [{type: 'google_search' as const}]}),
    }, {signal, maxRetries: 0, retries: {strategy: 'none'}, timeout: config.timeoutMs});
    if (response.status !== 'completed') throw new MentorError('GEMINI_ERROR', 502, 'Gemini returned an incomplete response.');
    return response;
  }, signal);
  return {
    async structured<T>(_stage: string, instruction: string, data: unknown, schema: z.ZodType<T>, signal: AbortSignal): Promise<T> {
      const response = await call(instruction, data, signal, schema);
      try { return schema.parse(JSON.parse(response.output_text ?? '')); }
      catch { throw new MentorError('GEMINI_ERROR', 502, 'Gemini returned invalid structured output.'); }
    },
    async research(_stage, instruction, data, signal) {
      const response = await call(instruction, data, signal);
      return {text: response.output_text ?? '', grounding: extractGroundingSources(response)};
    },
  };
}
