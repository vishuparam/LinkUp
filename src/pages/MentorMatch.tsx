import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { useDemo } from '../context/DemoContext';
import { demoUser } from '../data/demo';
import { mentorDirectory } from '../data/mentorDirectory';
import { defaultMentorPreferences, findMentors, projectSearchInput } from '../services/mentorService';
import { prioritizedHelpAreas } from '../services/localMentorMatcher';
import type { LocationImportance, MentorPreferences, MentorSearchResult, PreferredMentorType } from '../types/mentor';
import { MatchingSequence, MentorResultCard } from '../features/mentorMatch/MentorResults';
import '../features/mentorMatch/mentorMatch.css';
const locationOptions: { value: LocationImportance; label: string; detail: string }[] = [
  { value: 'none', label: 'Not important — remote is fine', detail: 'Focus on expertise, wherever they work.' },
  { value: 'nearby', label: 'Prefer someone nearby', detail: 'A small bonus for your city or state.' },
  { value: 'important', label: 'Very important', detail: 'Give local professionals more weight.' },
  { value: 'in-person', label: 'In-person required', detail: 'Only consider professionals in your city.' },
];
const typeOptions: { value: PreferredMentorType; label: string }[] = [
  { value: 'any', label: 'No Preference' }, { value: 'academic', label: 'Professor / Researcher' },
  { value: 'technical', label: 'Engineer / Technical Professional' }, { value: 'founder', label: 'Entrepreneur / Founder' },
  { value: 'industry', label: 'Industry Professional' }, { value: 'medical', label: 'Medical / Scientific Professional' },
];
export function MentorMatch() {
  const { opportunities } = useDemo();
  const projects = opportunities.filter(item => item.creator.id === demoUser.id);
  const [params] = useSearchParams();
  const [projectId, setProjectId] = useState(() => params.get('projectId') ?? '');
  const [phase, setPhase] = useState<'select' | 'questions' | 'matching' | 'results'>('select');
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<MentorPreferences>(() => ({ ...defaultMentorPreferences, helpAreas: [] }));
  const [result, setResult] = useState<MentorSearchResult | null>(null);
  const [error, setError] = useState('');
  const [ranking, setRanking] = useState(false);
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const project = projects.find(item => item.id === projectId);
  const options = project ? prioritizedHelpAreas(projectSearchInput(project, preferences)) : [];
  useEffect(() => { if (phase !== 'select') heading.current?.focus(); }, [phase, step]);
  const complete = useCallback(() => setPhase('results'), []);
  function update<K extends keyof MentorPreferences>(key: K, value: MentorPreferences[K]) { setPreferences(current => ({ ...current, [key]: value })); setError(''); }
  function next() {
    if (step === 1 && !preferences.helpAreas.length) { setError('Choose at least one area you would like help with.'); return; }
    if (step === 2 && preferences.locationImportance !== 'none' && (!preferences.city.trim() || !preferences.state.trim())) { setError('Enter your city and state. No street address is needed.'); return; }
    setError(''); setStep(current => current + 1);
  }
  async function match() {
    if (!project || ranking) return;
    setRanking(true);
    try {
      const matches = await findMentors(project, preferences);
      setResult(matches); setPhase('matching');
    } finally { setRanking(false); }
  }
  function start() { if (!project) return; setStep(1); setError(''); setPhase('questions'); }
  return <PageContainer title="Mentor Match" description="Find guidance for the ideas you're building.">
    <div className="mentor-shell">
      <div className="mentor-directory-note"><span className="mentor-status-dot" aria-hidden="true" /><span>{mentorDirectory.length} sourced professionals · Local directory matching · No live AI required</span></div>
      {phase === 'select' && <div className="panel mentor-start">
        <p className="eyebrow">FIND A MENTOR</p><h2>Start with your project.</h2>
        <p>Choose an idea you created on LinkUp. We’ll match its subject and the guidance you need with public professional profiles.</p>
        <label className="label" htmlFor="mentor-project">Your project</label>
        <select id="mentor-project" value={projectId} onChange={event => { setProjectId(event.target.value); setResult(null); setPreferences({ ...defaultMentorPreferences, helpAreas: [] }); }}>
          <option value="">Choose a project</option>{projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        {project && <p className="mentor-project-summary">{project.shortDescription}</p>}
        <Button onClick={start} disabled={!project}>Find mentors</Button>
        {!projects.length && <p>Create a project first. <Link className="text-link" to="/create">Share your idea →</Link></p>}
      </div>}
      {phase === 'questions' && <div className="panel mentor-questions">
        <div className="mentor-question-header"><p className="eyebrow">YOUR PREFERENCES / {String(step).padStart(2, '0')}</p><span>Question {step} of 3</span></div>
        <p className="mentor-selected-project">For {project?.name}</p>
        <div className="mentor-step-track" aria-hidden="true">{[1, 2, 3].map(i => <span key={i} className={step >= i ? 'selected' : ''} />)}</div>
        <AnimatePresence mode="wait" initial={false}><motion.div key={step} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.16 }} onAnimationComplete={() => heading.current?.focus()}>
          <h2 ref={heading} tabIndex={-1}>{step === 1 ? 'What areas would you like your mentor to help with?' : step === 2 ? 'How important is it for your mentor to be near you?' : 'What type of mentor would be most helpful?'}</h2>
          {step === 1 && <><p className="mentor-hint">Choose as many as you need. Options related to your project appear first.</p><fieldset className="mentor-choice-grid"><legend className="sr-only">Requested help areas</legend>{options.map(area => <label className={`mentor-choice ${preferences.helpAreas.includes(area) ? 'selected' : ''}`} key={area}><input type="checkbox" checked={preferences.helpAreas.includes(area)} onChange={() => update('helpAreas', preferences.helpAreas.includes(area) ? preferences.helpAreas.filter(a => a !== area) : [...preferences.helpAreas, area])} /><span>{area}</span></label>)}</fieldset></>}
          {step === 2 && <><fieldset className="mentor-choice-grid"><legend className="sr-only">Location importance</legend>{locationOptions.map(option => <label className={`mentor-choice ${preferences.locationImportance === option.value ? 'selected' : ''}`} key={option.value}><input type="radio" name="mentor-location" value={option.value} checked={preferences.locationImportance === option.value} onChange={() => { update('locationImportance', option.value); update('remoteAllowed', option.value !== 'in-person'); }} /><span>{option.label}<small>{option.detail}</small></span></label>)}</fieldset>
            {preferences.locationImportance !== 'none' && <div className="mentor-city-fields"><label className="label" htmlFor="mentor-city">City<input id="mentor-city" autoComplete="address-level2" maxLength={80} value={preferences.city} onChange={event => update('city', event.target.value)} placeholder="e.g. Urbana" /></label><label className="label" htmlFor="mentor-state">State<input id="mentor-state" autoComplete="address-level1" maxLength={80} value={preferences.state} onChange={event => update('state', event.target.value)} placeholder="e.g. Illinois or IL" /></label><p>We compare published workplace locations, not travel distance. Availability for remote or in-person mentoring is unconfirmed.</p></div>}
          </>}
          {step === 3 && <><fieldset className="mentor-choice-grid"><legend className="sr-only">Preferred mentor type</legend>{typeOptions.map(option => <label className={`mentor-choice ${preferences.mentorType === option.value ? 'selected' : ''}`} key={option.value}><input type="radio" name="mentor-type" value={option.value} checked={preferences.mentorType === option.value} onChange={() => update('mentorType', option.value)} /><span>{option.label}</span></label>)}</fieldset><label className="label mentor-notes" htmlFor="mentor-notes">Anything else we should consider? <small>Optional</small><textarea id="mentor-notes" rows={3} maxLength={1500} value={preferences.notes} onChange={event => update('notes', event.target.value)} placeholder="I'd like someone experienced with medical AI or science competitions." /></label></>}
        </motion.div></AnimatePresence>
        {error && <p className="mentor-validation" role="alert">{error}</p>}
        <div className="mentor-question-actions"><Button variant="secondary" onClick={() => { setError(''); if (step === 1) setPhase('select'); else setStep(current => current - 1); }}>Back</Button>{step < 3 ? <Button onClick={next}>Continue →</Button> : <Button onClick={match} disabled={ranking}>Find my mentors →</Button>}</div>
      </div>}
      {phase === 'matching' && <><h2 className="sr-only" ref={heading} tabIndex={-1}>Matching your project with our directory</h2><MatchingSequence onComplete={complete} /></>}
      {phase === 'results' && result && <>
        <motion.div className="mentor-results-heading" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="eyebrow">GUIDANCE FOR {project?.name}</p><h2 ref={heading} tabIndex={-1}>{result.mentors.length ? 'Meet your potential mentors.' : 'Let’s widen the search.'}</h2>
          <p role="status">{result.message}</p><p className="mentor-disclaimer">These professionals have not agreed to mentor you, been contacted, or endorsed LinkUp. Scores measure subject relevance, not availability. Review their profiles before reaching out.</p>
          <div className="mentor-question-actions"><Button variant="secondary" onClick={start}>Adjust preferences</Button><Button variant="secondary" onClick={() => setPhase('select')}>Change project</Button></div>
        </motion.div>
        <div className="mentor-result-grid">{result.mentors.map((item, index) => <MentorResultCard key={item.mentor.id} match={item} index={index} />)}</div>
        <p className="mentor-source-note">Official profile snapshot checked October 4, 2026. Roles and contact details may change. Matching works offline; external profile links require internet access.</p>
      </>}
    </div>
  </PageContainer>;
}
