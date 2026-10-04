import { Link } from 'react-router-dom';
import type { Opportunity } from '../types';
import { useDemo } from '../context/DemoContext';
import { Button } from './Button';
import { Tag } from './Tag';

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const { savedIds, toggleSaved } = useDemo();
  const saved = savedIds.includes(opportunity.id);
  return <article className="panel flex h-full flex-col">
    <div className="flex flex-wrap items-center gap-2"><Tag>{opportunity.type}</Tag><span className="text-xs text-stone-500">{opportunity.field}</span></div>
    <h2 className="mt-5 text-xl font-bold"><Link className="hover:text-emerald-700" to={`/projects/${opportunity.id}`}>{opportunity.name}</Link></h2>
    <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{opportunity.shortDescription}</p>
    <div className="my-5 flex flex-wrap gap-2">{opportunity.skillsNeeded.map(skill => <Tag key={skill}>{skill}</Tag>)}</div>
    <p className="text-xs text-stone-500">{opportunity.remote ? 'Remote · ' : 'In person · '}{opportunity.location}</p>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
      <Link className="text-sm font-semibold text-emerald-800 hover:underline" to={`/projects/${opportunity.id}`}>View opportunity →</Link>
      <Button variant="secondary" aria-label={`${saved ? 'Unsave' : 'Save'} ${opportunity.name}`} aria-pressed={saved} onClick={() => toggleSaved(opportunity.id)}>{saved ? 'Saved ✓' : 'Save'}</Button>
    </div>
  </article>;
}
