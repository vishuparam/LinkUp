import assert from 'node:assert/strict';
import test from 'node:test';
import { handleLinkedInApi } from '../server/linkedin/api.mjs';
import { sanitizeProfile } from '../server/linkedin/sanitize.mjs';
import { generateWithGroq } from '../server/linkedin/provider.mjs';

test('server whitelist drops credentials, hidden mentors, and contact details', () => {
  const profile = sanitizeProfile({ name: 'Sam', bio: 'Email sam@example.org', password: 'secret',
    mentors: [{ name: 'Hidden Mentor', email: 'hidden@example.org' },
      { name: 'Shareable Mentor', shareInExport: true, learningFocus: 'Design', phone: '555-123-4567' }],
    projects: [{ id: 'one', name: 'Garden', description: 'Call 555-123-4567', skillsNeeded: ['Founder'] }],
  });
  const output = JSON.stringify(profile);
  assert.doesNotMatch(output, /secret|sam@example|hidden@example|Hidden Mentor|555-123-4567|skillsNeeded/);
  assert.match(output, /Shareable Mentor/);
});

test('malformed model output fails safely without leaking provider details', async () => {
  const request = new Request('http://localhost/api/linkedin-launch/generate', { method: 'POST',
    body: JSON.stringify({ profile: { name: 'Sam', projects: [{ id: 'p', name: 'Garden' }] } }) });
  const response = await handleLinkedInApi(request, { provider: async () => ({ headline: 'Inventor', projects: [] }) });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'AI generation unavailable', reason: 'validation_failed' });
});

test('server rejects unsupported accomplishment claims and completed-work framing for an idea', async () => {
  const profile = { name: 'Sam', projects: [{ id: 'p', name: 'Garden Map', status: 'idea', description: 'Plan a garden map' }] };
  const draft = description => ({ headline: 'Student | Gardens', about: 'I am exploring gardens.',
    projects: [{ id: 'p', description }], skills: [], experienceDescriptions: [],
    volunteeringDescriptions: [], suggestedPost: 'I am exploring gardens.' });
  for (const description of ['Launched a garden map for families.', 'Built a garden map that served 10,000 families.']) {
    const response = await handleLinkedInApi(new Request('http://localhost/api/linkedin-launch/generate', {
      method: 'POST', body: JSON.stringify({ profile }),
    }), { provider: async () => draft(description) });
    assert.equal(response.status, 503);
  }
});

test('AI cannot move a number from one selected project to another', async () => {
  const profile = { name: 'Sam', projects: [
    { id: 'a', name: 'Crop Model', status: 'completed', description: 'Studied 12 crop varieties.' },
    { id: 'b', name: 'Garden Map', status: 'completed', description: 'Mapped local gardens.' },
  ] };
  const response = await handleLinkedInApi(new Request('http://localhost/api/linkedin-launch/generate', {
    method: 'POST', body: JSON.stringify({ profile }),
  }), { provider: async () => ({
    headline: 'Student | Crop research', about: 'I study crops and gardens.',
    projects: [
      { id: 'a', description: 'Studied 12 crop varieties.' },
      { id: 'b', description: 'Mapped 12 local gardens.' },
    ],
    skills: [], experienceDescriptions: [], volunteeringDescriptions: [], suggestedPost: 'I study crops and gardens.',
  }) });
  assert.equal(response.status, 503);
});

test('Groq adapter requests strict JSON schema output with server-side key', async () => {
  let sent;
  let endpoint;
  const draft = { headline: 'Student | Design', about: 'I study design.', projects: [], skills: [],
    experienceDescriptions: [], volunteeringDescriptions: [], suggestedPost: 'I am learning design.' };
  const result = await generateWithGroq({ name: 'Sam' }, { apiKey: 'test-only-key',
    fetchImpl: async (url, options) => {
      endpoint = url;
      sent = options;
      return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(draft) } }] }), { status: 200 });
    },
  });
  assert.deepEqual(result, draft);
  assert.equal(endpoint, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(sent.headers.Authorization, 'Bearer test-only-key');
  const body = JSON.parse(sent.body);
  assert.equal(body.model, 'openai/gpt-oss-20b');
  assert.equal(body.response_format.type, 'json_schema');
  assert.equal(body.response_format.json_schema.strict, true);
  assert.equal(body.messages[1].content, JSON.stringify({ name: 'Sam' }));
  assert.equal(body.input, undefined);
  assert.equal(body.store, undefined);
});

test('diagnostics identify Groq HTTP failure without logging the key or student data', async () => {
  const events = [];
  const log = (event, details = {}) => events.push({ event, details });
  const profile = { name: 'Private Student', bio: 'Private project details' };
  const response = await handleLinkedInApi(new Request('http://localhost/api/linkedin-launch/generate', {
    method: 'POST', body: JSON.stringify({ profile }),
  }), { log, provider: (input, options) => generateWithGroq(input, {
    ...options, apiKey: 'secret-test-key', model: 'openai/gpt-oss-20b',
    fetchImpl: async () => new Response(JSON.stringify({ error: {
      type: 'invalid_request_error', code: 'invalid_json_schema', param: 'response_format.json_schema',
      message: 'Potentially sensitive free-form error',
    } }), { status: 400 }),
  }) });
  assert.equal(response.status, 503);
  assert.deepEqual(events.map(item => item.event), [
    'endpoint_received', 'configuration', 'groq_request_attempted',
    'groq_http_response', 'groq_error', 'fallback',
  ]);
  assert.deepEqual(events[4].details, {
    status: 400, type: 'invalid_request_error', code: 'invalid_json_schema', param: 'response_format.json_schema',
  });
  assert.equal(events[5].details.reason, 'groq_http_400');
  assert.doesNotMatch(JSON.stringify(events), /secret-test-key|Private Student|Private project details|Potentially sensitive/);
});

test('malformed or truncated Groq completion falls back without using API quota', async () => {
  const profile = { name: 'Sam', projects: [] };
  const request = () => new Request('http://localhost/api/linkedin-launch/generate', {
    method: 'POST', body: JSON.stringify({ profile }),
  });
  for (const [finishReason, content, expected] of [
    ['length', '{', 'groq_finish_length'],
    ['stop', '{', 'invalid_output_json'],
  ]) {
    const events = [];
    const response = await handleLinkedInApi(request(), {
      log: (event, details = {}) => events.push({ event, details }),
      provider: (input, options) => generateWithGroq(input, { ...options, apiKey: 'test-only-key',
        fetchImpl: async () => new Response(JSON.stringify({ choices: [{ finish_reason: finishReason, message: { content } }] }), { status: 200 }),
      }),
    });
    assert.equal(response.status, 503);
    assert.equal(events.at(-1).details.reason, expected);
  }
});

test('validation failure and client-only fallback reasons are logged safely', async () => {
  const events = [];
  const log = (event, details = {}) => events.push({ event, details });
  const request = new Request('http://localhost/api/linkedin-launch/generate', {
    method: 'POST', body: JSON.stringify({ profile: { name: 'Sam', projects: [] } }),
  });
  const response = await handleLinkedInApi(request, { log, provider: async () => ({ headline: 'Student' }) });
  assert.equal(response.status, 503);
  assert.equal(events.find(item => item.event === 'validation_failed').details.reason, 'AI output did not match supplied records');
  assert.equal(events.find(item => item.event === 'fallback').details.stage, 'validation');
  const clientResponse = await handleLinkedInApi(new Request('http://localhost/api/linkedin-launch/diagnostic', {
    method: 'POST', body: JSON.stringify({ reason: 'client_invalid_kit', profile: 'must never be logged' }),
  }), { log });
  assert.equal(clientResponse.status, 200);
  assert.deepEqual(events.at(-1), { event: 'fallback', details: { stage: 'client', reason: 'client_invalid_kit' } });
  assert.doesNotMatch(JSON.stringify(events), /must never be logged/);
});
