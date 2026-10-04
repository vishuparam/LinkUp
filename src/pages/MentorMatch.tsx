import { useState } from 'react';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { useDemo } from '../context/DemoContext';
import { demoUser } from '../data/demo';

type Mentor = {
  id: string; name: string; title: string | null; organization: string | null;
  matchScore: number; profileUrl: string | null; contactUrl: string | null;
  expertise: string[]; sources: { url: string; title: string | null }[];
};

export function MentorMatch() {
  const { opportunities } = useDemo();
  const projects = opportunities.filter(item => item.creator.id === demoUser.id);
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [message, setMessage] = useState('');

  async function search() {
    const project = projects.find(item => item.id === projectId);
    if (!project || loading) return;
    setLoading(true);
    setMentors(null);
    setMessage('');
    try {
      const response = await fetch('/api/find-mentors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project.name,
          projectDescription: [project.shortDescription, project.fullDescription].filter(Boolean).join(' '),
          skills: demoUser.skills,
          skillsNeeded: project.skillsNeeded,
          helpNeeded: project.rolesNeeded,
          location: project.location || undefined,
          locationImportance: 'none',
          remoteAllowed: true,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || 'Mentor search is unavailable.');
      setMentors(Array.isArray(result.mentors) ? result.mentors : []);
      setMessage(result.message || 'Mentor search complete.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Mentor search is unavailable.');
    } finally {
      setLoading(false);
    }
  }

  return <PageContainer title="Mentor Match" description="Find guidance for the ideas you're building.">
    <div className="panel max-w-4xl">
      <p className="eyebrow mb-3">FIND A MENTOR</p>
      <h2 className="text-2xl font-semibold">Start with your project</h2>
      <p className="mt-3 text-stone-600">Choose an idea you created on LinkUp. Mentor Match uses its description and requested help to look for relevant public professional profiles.</p>
      <label className="label mt-6 block" htmlFor="mentor-project">Your project</label>
      <select id="mentor-project" value={projectId} onChange={event => setProjectId(event.target.value)} disabled={loading}>
        <option value="">Choose a project</option>
        {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
      <div className="mt-5"><Button onClick={search} disabled={!projectId || loading}>{loading ? 'Finding mentors…' : 'Find mentors'}</Button></div>
      {!projects.length && <p className="mt-4 text-stone-600">Create a project first to search for mentors.</p>}
      {message && <p className="mt-5 text-stone-700" role="status">{message}</p>}
    </div>
    {mentors && mentors.length > 0 && <div className="mt-6 grid max-w-4xl gap-4">
      {mentors.map(mentor => <article className="panel" key={mentor.id}>
        <h3 className="text-xl font-semibold">{mentor.name}</h3>
        <p className="mt-1 text-stone-600">{[mentor.title, mentor.organization].filter(Boolean).join(' · ')} · {Math.round(mentor.matchScore)}% match</p>
        {mentor.expertise?.length > 0 && <p className="mt-3 text-sm text-stone-600">Expertise: {mentor.expertise.join(', ')}</p>}
        <div className="mt-3 flex flex-wrap gap-4">
          {mentor.profileUrl && <a className="text-link" href={mentor.profileUrl} target="_blank" rel="noopener noreferrer">Public profile</a>}
          {mentor.contactUrl && <a className="text-link" href={mentor.contactUrl} target="_blank" rel="noopener noreferrer">Contact page</a>}
          {mentor.sources?.slice(0, 3).map(source => <a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}>{source.title || 'Source'}</a>)}
        </div>
      </article>)}
    </div>}
  </PageContainer>;
}
