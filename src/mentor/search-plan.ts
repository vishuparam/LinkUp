import { planSchema } from './schemas.js';
import { prompts } from './prompts.js';
import { normalize } from '../utils/normalize.js';
import { MentorError } from './errors.js';
import type { MentorClient, ProjectAnalysis } from './types.js';
export async function generateSearchPlan(client: MentorClient, analysis: ProjectAnalysis, signal: AbortSignal) {
  const plan = planSchema.parse(await client.structured('plan', prompts.plan, analysis, planSchema, signal));
  if (new Set(plan.queries.map(normalize)).size !== plan.queries.length) throw new MentorError('GROQ_ERROR', 502, 'Groq returned a redundant search strategy.');
  return plan;
}
