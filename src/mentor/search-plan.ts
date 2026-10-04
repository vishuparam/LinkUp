import { planSchema } from './schemas.js';
import { prompts } from './prompts.js';
import { normalize } from '../utils/normalize.js';
import { MentorError } from './errors.js';
import type { GeminiClient, ProjectAnalysis } from './types.js';
export async function generateSearchPlan(client: GeminiClient, analysis: ProjectAnalysis, signal: AbortSignal) {
  const plan = planSchema.parse(await client.structured('plan', prompts.plan, analysis, planSchema, signal));
  if (new Set(plan.queries.map(normalize)).size !== plan.queries.length) throw new MentorError('GEMINI_ERROR', 502, 'Gemini returned a redundant search strategy.');
  return plan;
}
