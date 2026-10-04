import { explanationsSchema } from './schemas.js';
import { prompts } from './prompts.js';
import type { MentorClient, ProjectAnalysis, ScoredCandidate } from './types.js';
import { MentorError } from './errors.js';
export async function generateExplanations(client: MentorClient, candidates: ScoredCandidate[], analysis: ProjectAnalysis, signal: AbortSignal) {
  const options = candidates.map(c => ({id: c.id, statements: [
    {id: 'skills', text: `Potential mentor with verified expertise in ${c.expertise.join(', ')}.`},
    {id: 'research', text: `Verified research areas include ${c.researchAreas.join(', ')}.`},
    {id: 'overlap', text: `Expertise matching this project's needs: ${c.matchBreakdown.skills.matched.join(', ')}.`},
  ].filter(s => s.id === 'skills' ? c.expertise.length : s.id === 'research' ? c.researchAreas.length : c.matchBreakdown.skills.matched.length)}));
  const result = explanationsSchema.parse(await client.structured('explanations', prompts.explanations, {candidates, analysis, options}, explanationsSchema, signal));
  return candidates.map((c, i) => {
    const choices = result.explanations.filter(e => e.id === c.id);
    const statements = options.find(o => o.id === c.id)!.statements;
    if (choices.length !== 1 || choices[0]!.statementIds.some(id => !statements.some(s => s.id === id))) throw new MentorError('GROQ_ERROR', 502, 'Groq returned unsupported explanation references.');
    const whyMatch = [...new Set(choices[0]!.statementIds)].map(id => statements.find(s => s.id === id)!.text).join(' ');
    const limitations = ['This is a potential match; availability and willingness to mentor have not been confirmed.'];
    if (!c.publicEmail) limitations.push('A public professional email could not be verified. Use the professional profile/contact page.');
    if (c.verificationStatus === 'partially_verified') limitations.push('Current role or affiliation could not be fully confirmed.');
    if (analysis.locationRequirement.importance !== 'none') {
      if (c.locationCompatibility === 'uncertain') limitations.push('Geographic compatibility is uncertain.');
      if (c.locationCompatibility === 'incompatible') limitations.push('Outside the preferred area; remote mentorship would need to be discussed.');
    }
    const emailSource = c.evidence.find(e => e.field === 'email' && e.value === c.publicEmail);
    return {rank: i + 1, id: c.id, name: c.name, matchScore: c.matchScore, title: c.jobTitle,
      organization: c.organization, location: c.location, expertise: c.expertise, researchAreas: c.researchAreas,
      matchingExpertise: c.matchBreakdown.skills.matched, whyMatch, limitations,
      verificationStatus: c.verificationStatus, contactStatus: c.contactStatus,
      contact: {type: c.publicEmail ? 'public_professional_email' : c.contactStatus, value: c.publicEmail ?? c.contactUrl ?? c.profileUrl, sourceUrl: emailSource?.sourceUrl ?? c.contactUrl ?? c.profileUrl},
      publicEmail: c.publicEmail, profileUrl: c.profileUrl, contactUrl: c.contactUrl, sources: c.sources,
      evidence: c.evidence, matchBreakdown: c.matchBreakdown,
    };
  });
}
