import { afterEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createGroqClient } from '../src/groq/client.js';
import { getConfig } from '../src/mentor/config.js';
import { retry } from '../src/utils/retry.js';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
afterEach(() => {vi.useRealTimers(); fetchMock.mockReset();});

it('fails usefully without an Groq key', async () => {
  const client = createGroqClient(getConfig({}), '');
  await expect(client.research('discovery', 'search', {}, new AbortController().signal)).rejects.toMatchObject({code: 'SERVER_CONFIGURATION_ERROR'});
  expect(fetchMock).not.toHaveBeenCalled();
});
it('uses configured Groq model, required browser search, and cancellation', async () => {
  fetchMock.mockResolvedValue(Response.json({status: 'completed', output: []}));
  const signal = new AbortController().signal;
  await createGroqClient({...getConfig({}), model: 'configured-model'}, 'test-only').research('discovery', 'search', {projectDescription: 'A retinal imaging research project'}, signal);
  const [url, options] = fetchMock.mock.calls[0]!;
  const body = JSON.parse(options.body);
  expect(url).toBe('https://api.groq.com/openai/v1/responses');
  expect(options.signal).toBe(signal);
  expect(body).toMatchObject({model: 'configured-model', tools: [{type: 'browser_search'}], tool_choice: 'required'});
  expect(body).not.toHaveProperty('store');
  expect(body.input[1].content).toContain('A retinal imaging research project');
});
it('reports a rejected key without exposing its value', async () => {
  fetchMock.mockResolvedValue(new Response('{"error":"Incorrect API key provided."}', {status: 400}));
  const promise = createGroqClient(getConfig({}), 'test-only').research('discovery', 'search', {}, new AbortController().signal);
  await expect(promise).rejects.toMatchObject({code: 'SERVER_CONFIGURATION_ERROR'});
});
it('accepts an incomplete envelope when browser calls and the message completed', async () => {
  fetchMock.mockResolvedValue(Response.json({status: 'incomplete', output: [
    {type: 'mcp_call', name: 'browser.open', status: 'completed', output: 'L0: \nL1: URL: https://university.edu/person\nL2: A researcher profile'},
    {type: 'message', status: 'completed', content: [{type: 'output_text', text: 'A researcher profile【0†L2-L2】'}]},
  ]}));
  const result = await createGroqClient(getConfig({}), 'test-only').research('discovery', 'search', {}, new AbortController().signal);
  expect(result.grounding.citations).toHaveLength(1);
});
it('rejects an incomplete browser call', async () => {
  fetchMock.mockResolvedValue(Response.json({status: 'incomplete', output: [
    {type: 'mcp_call', status: 'incomplete'},
    {type: 'message', status: 'completed', content: [{type: 'output_text', text: 'Unverified claim'}]},
  ]}));
  await expect(createGroqClient(getConfig({}), 'test-only').research('discovery', 'search', {}, new AbortController().signal)).rejects.toMatchObject({code: 'GROQ_ERROR'});
});
it('rejects malformed structured JSON safely', async () => {
  fetchMock.mockResolvedValue(Response.json({status: 'completed', output: [{type: 'message', content: [{type: 'output_text', text: '{invalid secret'}]}]}));
  await expect(createGroqClient(getConfig({}), 'test-only').structured('analysis', 'analyze', {}, z.object({x: z.string()}), new AbortController().signal)).rejects.toMatchObject({code: 'GROQ_ERROR'});
});
it('does not repeat a rate-limited request', async () => {
  const fn = vi.fn().mockRejectedValue({status: 429, message: 'secret'});
  await expect(retry(fn, new AbortController().signal)).rejects.toMatchObject({code: 'GROQ_RATE_LIMITED'});
  expect(fn).toHaveBeenCalledTimes(1);
});
it('does not retry permanent upstream errors', async () => { const fn = vi.fn().mockRejectedValue({status: 400}); await expect(retry(fn, new AbortController().signal)).rejects.toMatchObject({code: 'GROQ_ERROR'}); expect(fn).toHaveBeenCalledTimes(1); });
it('aborts retry backoff', async () => { const c = new AbortController(); const fn = vi.fn().mockRejectedValue({status: 503}); const p = retry(fn, c.signal); c.abort(); await expect(p).rejects.toMatchObject({code: 'SEARCH_TIMEOUT'}); });
