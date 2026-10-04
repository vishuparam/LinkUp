import { afterEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
const create = vi.hoisted(() => vi.fn());
vi.mock('@google/genai', () => ({GoogleGenAI: class {interactions = {create};}}));
import { createGeminiClient } from '../src/gemini/client.js';
import { getConfig } from '../src/mentor/config.js';
import { retry } from '../src/utils/retry.js';
afterEach(() => {vi.useRealTimers(); create.mockReset();});
it('fails usefully without a key', async () => { const client = createGeminiClient(getConfig({}), ''); await expect(client.research('discovery', 'search', {}, new AbortController().signal)).rejects.toMatchObject({code: 'SERVER_CONFIGURATION_ERROR'}); expect(create).not.toHaveBeenCalled(); });
it('uses configured model, search tool, no storage, and cancellation', async () => {
  create.mockResolvedValue({status: 'completed', output_text: 'Results', steps: []});
  const signal = new AbortController().signal;
  await createGeminiClient({...getConfig({}), model: 'configured-model'}, 'test-only').research('discovery', 'search', {}, signal);
  expect(create).toHaveBeenCalledWith(expect.objectContaining({model: 'configured-model', store: false, tools: [{type: 'google_search'}]}), expect.objectContaining({signal, maxRetries: 0}));
});
it('rejects malformed structured JSON safely', async () => { create.mockResolvedValue({status: 'completed', output_text: '{invalid secret'}); await expect(createGeminiClient(getConfig({}), 'test-only').structured('analysis', 'analyze', {}, z.object({x: z.string()}), new AbortController().signal)).rejects.toMatchObject({code: 'GEMINI_ERROR'}); });
it('retries transient rate limits twice then returns sanitized error', async () => {
  vi.useFakeTimers(); const fn = vi.fn().mockRejectedValue({status: 429, message: 'secret'});
  const p = retry(fn, new AbortController().signal); const assertion = expect(p).rejects.toMatchObject({code: 'GEMINI_RATE_LIMITED'});
  await vi.runAllTimersAsync(); await assertion; expect(fn).toHaveBeenCalledTimes(3);
});
it('does not retry permanent upstream errors', async () => { const fn = vi.fn().mockRejectedValue({status: 400}); await expect(retry(fn, new AbortController().signal)).rejects.toMatchObject({code: 'GEMINI_ERROR'}); expect(fn).toHaveBeenCalledTimes(1); });
it('aborts retry backoff', async () => { const c = new AbortController(); const fn = vi.fn().mockRejectedValue({status: 503}); const p = retry(fn, c.signal); c.abort(); await expect(p).rejects.toMatchObject({code: 'SEARCH_TIMEOUT'}); });
