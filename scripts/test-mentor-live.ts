import { findMentors } from '../src/mentor/index.js';
import { publicError } from '../src/mentor/errors.js';
const labels: Record<string, string> = {analysis: 'Analyzing project...', plan: 'Creating mentor search strategy...', discovery: 'Searching public professional sources...', verification: 'Verifying candidates...', scoring: 'Calculating match scores...', explanations: 'Selecting top matches...'};
if (!process.env.GEMINI_API_KEY?.trim()) {
  console.error('Set GEMINI_API_KEY locally in .env.local or your shell environment. Do not put it in source code.');
  process.exitCode = 1;
} else {
  try {
    const response = await findMentors({
      projectTitle: 'AI Diabetic Retinopathy Detection',
      projectDescription: 'I am building a CNN that detects diabetic retinopathy from retinal images and need help improving the model and designing a strong science-fair research methodology.',
      skills: ['Python', 'Machine Learning', 'Computer Vision'], skillsNeeded: ['Medical Imaging', 'Research Methodology'],
      mentorType: 'Researcher', researchRequired: true, location: 'United States', locationImportance: 'low', remoteAllowed: true, competitionContext: 'ISEF',
    }, {onProgress: e => {
      if (e.durationMs === undefined && labels[e.stage]) console.info(labels[e.stage]);
      if (e.candidateCount !== undefined) console.info(`Candidates discovered: ${e.candidateCount}`);
      if (e.verifiedCandidateCount !== undefined) console.info(`Verified candidates: ${e.verifiedCandidateCount}`);
    }});
    console.info('\nTOP POTENTIAL MENTORS');
    if (!response.mentors.length) console.info(response.message);
    for (const m of response.mentors) {
      console.info(`\n${m.rank}. ${m.name} — ${m.matchScore}%\n${m.title ?? 'Role unconfirmed'} | ${m.organization ?? 'Affiliation unconfirmed'}\nExpertise: ${m.matchingExpertise.join(', ') || m.expertise.join(', ')}\n${m.whyMatch}\nEmail: ${m.publicEmail ?? 'Not verified'}\nProfile: ${m.profileUrl ?? m.contactUrl}\nContact: ${m.contactUrl}\nLimitations: ${m.limitations.join(' ')}\nSources:\n${m.sources.map(s => `- ${s.title ?? s.type}: ${s.url}`).join('\n')}`);
    }
  } catch (error) { const e = publicError(error); console.error(`${e.code}: ${e.message}`); process.exitCode = 1; }
}
