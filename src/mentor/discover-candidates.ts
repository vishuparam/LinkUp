import { candidatesSchema } from './schemas.js';
import { prompts } from './prompts.js';
import { deduplicateCandidates } from './deduplicate.js';
import type { MentorClient, ProjectAnalysis, SearchPlan } from './types.js';
export async function discoverCandidates(client: MentorClient, analysis: ProjectAnalysis, plan: SearchPlan, signal: AbortSignal) {
  const research = await client.research('discovery', prompts.discovery, {analysis, plan}, signal);
  if (!research.grounding.citations.some(c => c.text)) return {candidates: [], research};
  const extracted = candidatesSchema.parse(await client.structured('discovery-extraction', prompts.extraction, research, candidatesSchema, signal));
  return {candidates: deduplicateCandidates(extracted.candidates), research};
}
