import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { Tag } from '../components/Tag';
import { useDemo } from '../context/DemoContext';

export function ProjectDetails() {
  const { id } = useParams();
  const { opportunities, savedIds, toggleSaved } = useDemo();
  const opportunity = opportunities.find(item => item.id === id);
  if (!opportunity) return <PageContainer title="Opportunity not found" description="This opportunity may have been a demo that reset on refresh."><Link className="button button-primary" to="/discover">Back to Discover</Link></PageContainer>;
  const saved = savedIds.includes(opportunity.id);
  return <PageContainer title={opportunity.name} description={opportunity.shortDescription}>
    <Link to="/discover" className="mb-6 inline-block text-sm font-semibold text-emerald-800">← Back to Discover</Link>
    <div className="grid items-start gap-6 md:grid-cols-[2fr_1fr]">
      <article className="panel">
        <div className="flex flex-wrap gap-2"><Tag>{opportunity.type}</Tag><Tag>{opportunity.field}</Tag></div>
        <h2 className="mb-3 mt-7 text-xl font-bold">What we're building</h2><p className="whitespace-pre-line leading-relaxed text-stone-600">{opportunity.fullDescription}</p>
        <h2 className="mb-3 mt-7 text-xl font-bold">Skills that could help</h2><div className="flex flex-wrap gap-2">{opportunity.skillsNeeded.map(skill => <Tag key={skill}>{skill}</Tag>)}</div>
        <h2 className="mb-3 mt-7 text-xl font-bold">Room on the team</h2><ul className="list-inside list-disc space-y-2 text-stone-600">{opportunity.rolesNeeded.map(role => <li key={role}>{role}</li>)}</ul>
        {!!opportunity.applicationQuestions?.length && <><h2 className="mb-3 mt-7 text-xl font-bold">Questions for future applicants</h2><ul className="list-inside list-disc space-y-2 text-stone-600">{opportunity.applicationQuestions.map(question => <li key={question}>{question}</li>)}</ul></>}
      </article>
      <aside className="panel space-y-5">
        <div><h2 className="font-semibold">Created by {opportunity.creator.name}</h2><p className="mt-1 text-sm text-stone-500">Grade {opportunity.creator.grade} · Demo student</p></div>
        <p className="text-sm text-stone-600">{opportunity.location}<br />{opportunity.remote ? 'Remote teammates welcome' : 'In-person collaboration'}</p>
        <Button aria-pressed={saved} onClick={() => toggleSaved(opportunity.id)}>{saved ? 'Saved ✓' : 'Save opportunity'}</Button>
        <p className="text-xs leading-relaxed text-stone-500">Applications are planned for a later step. This foundation only shows opportunity information.</p>
      </aside>
    </div>
  </PageContainer>;
}
