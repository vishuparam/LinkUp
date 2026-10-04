import { analysisSchema } from './schemas.js';
import { prompts } from './prompts.js';
import type { MentorClient, MentorInput } from './types.js';
export async function analyzeProject(client: MentorClient, input: MentorInput, signal: AbortSignal) {
  const analysis = analysisSchema.parse(await client.structured('analysis', prompts.analysis, input, analysisSchema, signal));
  analysis.locationRequirement = {requestedLocation: input.location ?? null, importance: !input.remoteAllowed ? 'in_person_required' : input.locationImportance, remoteAllowed: input.remoteAllowed};
  analysis.researchRequired = input.researchRequired ?? analysis.researchRequired;
  return analysis;
}
