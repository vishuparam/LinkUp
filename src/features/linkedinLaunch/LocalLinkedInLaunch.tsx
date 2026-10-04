import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../../components/Button';
import { Tag } from '../../components/Tag';
import { copyText, sectionText, type KitSection } from './export';
import type { LinkedInProfileKit } from './types';
import { buildLocalProfileKit, interestTemplates, skillOptions, type LaunchSkill } from './templates';
import './localLaunch.css';
const sections: { key: KitSection; label: string }[] = [
  { key: 'headline', label: 'Headline' }, { key: 'about', label: 'About' },
  { key: 'projects', label: 'Featured Project' }, { key: 'skills', label: 'Skills' },
  { key: 'suggestedPost', label: 'Suggested First Post' },
];
const loadingMessages = ['Preparing your selected interests…', 'Matching your project template…', 'Building your LinkedIn profile…'];
export function localKitText(kit: LinkedInProfileKit): string {
  return sections.map(section => `${section.label}\n${sectionText(kit, section.key)}`).join('\n\n---\n\n');
}
export function LocalLinkedInLaunch() {
  const [interestId, setInterestId] = useState('');
  const [skills, setSkills] = useState<LaunchSkill[]>([]);
  const [projectId, setProjectId] = useState('');
  const [kit, setKit] = useState<LinkedInProfileKit | null>(null);
  const [pendingKit, setPendingKit] = useState<LinkedInProfileKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [copied, setCopied] = useState<KitSection | 'all' | null>(null);
  const [copyError, setCopyError] = useState('');
  const reduced = useReducedMotion();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const interest = interestTemplates.find(item => item.id === interestId);
  const selectedProject = interest?.projects.find(item => item.id === projectId);
  const canGenerate = !!selectedProject && skills.length > 0 && !loading;
  useEffect(() => {
    if (!loading || !pendingKit) return;
    const progress = window.setInterval(() => setStage(current => Math.min(current + 1, 2)), 700);
    const finish = window.setTimeout(() => { setKit(pendingKit); setPendingKit(null); setLoading(false); }, 2100);
    return () => { window.clearInterval(progress); window.clearTimeout(finish); };
  }, [loading, pendingKit]);
  useEffect(() => { if (kit) resultHeading.current?.focus(); }, [kit]);
  useEffect(() => { if (!copied) return; const timer = window.setTimeout(() => setCopied(null), 1800); return () => window.clearTimeout(timer); }, [copied]);
  function clearKit() { setKit(null); setCopied(null); setCopyError(''); }
  function toggleSkill(skill: LaunchSkill) { setSkills(current => current.includes(skill) ? current.filter(item => item !== skill) : [...current, skill]); clearKit(); }
  function generate() {
    if (!canGenerate) return;
    clearKit(); setStage(0); setPendingKit(buildLocalProfileKit(interestId, skills, projectId)); setLoading(true);
  }
  async function copy(section: KitSection | 'all') {
    if (!kit) return;
    try { await copyText(section === 'all' ? localKitText(kit) : sectionText(kit, section)); setCopied(section); setCopyError(''); }
    catch { setCopyError('Clipboard access is unavailable. Select the text below and copy it manually.'); }
  }
  const hint = !interest ? 'Choose an interest to get started.' : !skills.length ? 'Choose at least one skill.' : !selectedProject ? 'Choose one project idea below.' : 'Your selections are ready. Generate a draft, then review it before sharing.';
  return <div className="ll-local">
    <section className="panel ll-setup" aria-labelledby="ll-setup-title">
      <div className="ll-intro"><p className="eyebrow">LINKEDIN LAUNCH / YOUR NEXT CHAPTER</p><h2 id="ll-setup-title">An idea. A direction. Your story.</h2><p>Choose what interests you. Turn a project idea into a profile draft you can make your own.</p></div>
      <div className="ll-interest"><label className="label" htmlFor="ll-interest">01 · What are you interested in?</label><select id="ll-interest" value={interestId} disabled={loading} onChange={event => { setInterestId(event.target.value); setProjectId(''); clearKit(); }}><option value="">Choose an area of interest</option>{interestTemplates.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="ll-skills"><div className="ll-step-heading"><h3>02 · Choose your skills</h3><span>{skills.length} selected</span></div><p>Select skills you’re learning or developing.</p><div className="ll-skill-chips" role="group" aria-label="Select your skills">{skillOptions.map(skill => <button type="button" className={`ll-skill ${skills.includes(skill) ? 'selected' : ''}`} aria-pressed={skills.includes(skill)} disabled={loading} onClick={() => toggleSkill(skill)} key={skill}>{skill}</button>)}</div></div>
      {interest && <div className="ll-projects"><div className="ll-step-heading"><h3>03 · Pick one project idea</h3><span>3 suggestions</span></div><p>These are starting points—not claims about work you’ve completed.</p><fieldset className="ll-project-grid"><legend className="sr-only">Suggested projects for {interest.label}</legend>{interest.projects.map((project, index) => <label className={`ll-project ${project.id === projectId ? 'selected' : ''}`} key={project.id}><span className="ll-project-number">0{index + 1}</span><input type="radio" name="ll-project" value={project.id} checked={projectId === project.id} disabled={loading} onChange={() => { setProjectId(project.id); clearKit(); }} /><strong>{project.name}</strong><span className="ll-project-description">{project.description}</span></label>)}</fieldset></div>}
      <div className="ll-generate"><Button onClick={generate} disabled={!canGenerate}>{loading ? 'Preparing your profile…' : 'Generate LinkedIn Profile'}</Button><p>{loading ? 'Using your selections and pre-written local templates.' : hint}</p></div>
      <p className="ll-local-note">Local templates. No AI service. Nothing is posted automatically.</p>
    </section>
    {loading && <div className="panel ll-loading" role="status"><div className="ll-dots" aria-hidden="true"><span /><span /><span /></div><p>{loadingMessages[stage]}</p><small>Preparing your five-section profile kit.</small></div>}
    {kit && !loading && <motion.section className="panel ll-kit" aria-labelledby="ll-kit-title" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="ll-kit-header"><div><p className="eyebrow">READY TO MAKE YOUR OWN</p><h2 id="ll-kit-title" ref={resultHeading} tabIndex={-1}>Your LinkedIn Profile Kit</h2></div><div className="ll-kit-actions"><Button onClick={() => copy('all')}>{copied === 'all' ? 'Copied!' : 'Copy All'}</Button><a className="button button-secondary" href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">Open LinkedIn ↗</a></div></div>
      <p className="ll-review">Review the draft and keep only statements that reflect your plans and skills. Transfer it to LinkedIn yourself.</p>
      {copyError && <p className="ll-copy-error" role="alert">{copyError}</p>}
      <p className="sr-only" role="status">{copied ? `${copied === 'all' ? 'Complete profile kit' : sections.find(item => item.key === copied)?.label} copied!` : ''}</p>
      {sections.map(section => <section className={`ll-kit-section ll-section-${section.key}`} key={section.key} aria-labelledby={`ll-section-${section.key}`}><div className="ll-section-header"><h3 id={`ll-section-${section.key}`}>{section.label}</h3><button className="ll-copy" type="button" onClick={() => copy(section.key)} aria-label={`Copy ${section.label}`}>{copied === section.key ? 'Copied!' : 'Copy'}</button></div>
        {section.key === 'skills' ? <div className="ll-result-skills">{kit.skills.map(skill => <Tag key={skill}>{skill}</Tag>)}</div> : section.key === 'projects' ? <div><h4>{kit.projects[0]?.title}</h4><p className="ll-featured-field">{kit.projects[0]?.organization}</p><p>{kit.projects[0]?.description}</p><p className="ll-featured-skills">Selected skills: {kit.projects[0]?.skills.join(' · ')}</p></div> : <p>{sectionText(kit, section.key)}</p>}
      </section>)}
    </motion.section>}
  </div>;
}
