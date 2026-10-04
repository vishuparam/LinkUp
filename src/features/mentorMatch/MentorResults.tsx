import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Tag } from '../../components/Tag';
import type { MentorMatch } from '../../types/mentor';
export const matchingStages = ['Understanding your project', 'Identifying the expertise you need', 'Matching your project with our mentor directory', 'Checking mentor relevance', 'Considering your preferences', 'Ranking your strongest matches', 'Your mentor matches are ready'];
export function MatchingSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    // Ranking has already happened. This timing only presents its steps clearly.
    const interval = window.setInterval(() => setStage(current => Math.min(current + 1, 6)), reduced ? 100 : 700);
    const done = window.setTimeout(onComplete, reduced ? 800 : 4900);
    return () => { window.clearInterval(interval); window.clearTimeout(done); };
  }, [onComplete, reduced]);
  return <div className="panel mentor-loading">
    <div className="mentor-orbit" aria-hidden="true"><span /><span /><span /></div>
    <p className="eyebrow">CURATED DIRECTORY / LOCAL MATCHING</p>
    <h2>Finding the guidance your idea needs.</h2>
    <p role="status" className="sr-only">{matchingStages[stage]}</p>
    <ol className="mentor-stages" aria-label="Matching stages">
      {matchingStages.map((label, index) => <li key={label} className={index < stage ? 'complete' : index === stage ? 'active' : 'upcoming'} aria-current={index === stage ? 'step' : undefined}>
        <span aria-hidden="true">{index < stage ? '✓' : index === stage ? '•' : String(index + 1).padStart(2, '0')}</span>{label}
      </li>)}
    </ol>
  </div>;
}
function MatchScore({ score }: { score: number }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? score : 0);
  useEffect(() => {
    if (reduced) { setDisplay(score); return; }
    let frame = 0;
    const start = performance.now();
    const update = (time: number) => { const progress = Math.min(1, (time - start) / 450); setDisplay(Math.round(score * (1 - (1 - progress) ** 3))); if (progress < 1) frame = requestAnimationFrame(update); };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [score, reduced]);
  return <div className="mentor-score"><span aria-hidden="true">{display}%</span><span className="sr-only">{score}%</span><small>MATCH</small></div>;
}
export function MentorResultCard({ match, index }: { match: MentorMatch; index: number }) {
  const reduced = useReducedMotion();
  const m = match.mentor;
  const location = [m.location.city, m.location.state, m.location.country].filter(Boolean).join(', ');
  const contact = m.publicEmail ? `mailto:${m.publicEmail}` : m.contactUrl;
  return <motion.article className="panel mentor-result" initial={reduced ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: reduced ? 0 : 0.15 + index * 0.1 }}>
    <div className="mentor-result-top"><p className="eyebrow">POTENTIAL MENTOR / 0{index + 1}</p><MatchScore score={match.matchScore} /></div>
    <h3>{m.name}</h3><p className="mentor-role">{m.role}</p><p className="mentor-org">{m.organization}</p>
    <p className="mentor-location">{location || 'Professional location not listed'} · Remote availability unconfirmed</p>
    <div className="mentor-tags" aria-label="Expertise">{m.skills.slice(0, 4).map(skill => <Tag key={skill}>{skill}</Tag>)}</div>
    <div className="mentor-research"><h4>Research areas</h4><p>{m.researchAreas.join(' · ')}</p></div>
    <div className="mentor-why"><p className="eyebrow">WHY THIS MATCH</p><p>{match.whyMatch}</p></div>
    <div className="mentor-links">
      <a href={m.profileUrl} target="_blank" rel="noopener noreferrer">View professional profile <span aria-hidden="true">↗</span></a>
      {contact && <a href={contact} target="_blank" rel="noopener noreferrer">Contact <span aria-hidden="true">↗</span></a>}
      <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer">Source <span aria-hidden="true">↗</span></a>
    </div>
  </motion.article>;
}
