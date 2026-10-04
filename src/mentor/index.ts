import { randomUUID } from 'node:crypto';
import { inputSchema } from './schemas.js';
import { getConfig, type Config } from './config.js';
import { createGeminiClient } from '../gemini/client.js';
import { analyzeProject } from './analyze-project.js';
import { generateSearchPlan } from './search-plan.js';
import { discoverCandidates } from './discover-candidates.js';
import { verifyCandidates } from './verify-candidates.js';
import { getScoringWeights, scoreCandidates } from './score-candidates.js';
import { rankCandidates } from './rank-candidates.js';
import { generateExplanations } from './generate-explanations.js';
import { MentorError, timeoutError } from './errors.js';
import { logProgress, type Progress } from '../utils/logger.js';
import { unique } from '../utils/normalize.js';
import type { GeminiClient, Grounding } from './types.js';
export type EngineOptions = {client?: GeminiClient; config?: Config; requestId?: string; signal?: AbortSignal; onProgress?: (event: Progress) => void};
export async function findMentors(raw: unknown, options: EngineOptions = {}) {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) throw new MentorError('INVALID_REQUEST', 400, 'Invalid project input. Check required fields and limits.');
  const input = parsed.data;
  const config = options.config ?? getConfig();
  const client = options.client ?? createGeminiClient(config);
  const requestId = options.requestId ?? randomUUID();
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, {once: true});
  if (options.signal?.aborted) abort();
  const signal = controller.signal;
  const timer = setTimeout(abort, config.timeoutMs);
  const notify = (event: Progress) => { logProgress(requestId, event); options.onProgress?.(event); };
  let rejectDeadline: (() => void) | undefined;
  const deadline = new Promise<never>((_, reject) => { rejectDeadline = () => reject(timeoutError()); signal.addEventListener('abort', rejectDeadline, {once: true}); if (signal.aborted) rejectDeadline(); });
  const run = async () => {
    const stage = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      if (signal.aborted) throw timeoutError();
      notify({stage: name}); const started = Date.now(); const value = await fn();
      if (signal.aborted) throw timeoutError();
      notify({stage: name, durationMs: Date.now() - started}); return value;
    };
    const analysis = await stage('analysis', () => analyzeProject(client, input, signal));
    const plan = await stage('plan', () => generateSearchPlan(client, analysis, signal));
    const discovery = await stage('discovery', () => discoverCandidates(client, analysis, plan, signal));
    notify({stage: 'discovered', candidateCount: discovery.candidates.length});
    const groundings: Grounding[] = [discovery.research.grounding];
    const verified = discovery.candidates.length ? await stage('verification', () => verifyCandidates(client, discovery.candidates, analysis, signal)) : null;
    if (verified) groundings.push(verified.research.grounding);
    const candidates = verified?.candidates ?? [];
    notify({stage: 'verified', verifiedCandidateCount: candidates.length});
    const scored = candidates.length ? await stage('scoring', () => scoreCandidates(client, candidates, analysis, input, signal)) : [];
    const ranked = rankCandidates(scored, analysis, config.minScore);
    const mentors = ranked.length ? await stage('explanations', () => generateExplanations(client, ranked, analysis, signal)) : [];
    return {mentors, meta: {requestId, candidateCount: discovery.candidates.length, verifiedCandidateCount: candidates.length, returnedCount: mentors.length,
      plannedSearchQueries: plan.queries, searchQueries: unique(groundings.flatMap(g => g.searchQueries)), scoringWeights: getScoringWeights(analysis.locationRequirement.importance),
      grounding: groundings.map(g => ({...g, citations: g.citations.map(({text: _text, ...citation}) => citation)})),
    }, ...(mentors.length ? {} : {message: 'No sufficiently verified mentor matches were found for this search. Try broadening the location or mentor preferences.'})};
  };
  try { return await Promise.race([run(), deadline]); }
  finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); if (rejectDeadline) signal.removeEventListener('abort', rejectDeadline); }
}
export type MentorResponse = Awaited<ReturnType<typeof findMentors>>;
