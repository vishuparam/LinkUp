import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { Button } from '../components/Button';
import { useDemo } from '../context/DemoContext';
import { demoUser } from '../data/demo';
import type { OpportunityType } from '../types';

export function Create() {
  const { addOpportunity } = useDemo();
  const navigate = useNavigate();
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? '').trim();
    const list = (name: string) => value(name).split(',').map(item => item.trim()).filter(Boolean);
    // Native required fields also reject whitespace-only entries before submission.
    const id = `demo-${crypto.randomUUID()}`;
    addOpportunity({ id, name: value('name'), type: value('type') as OpportunityType,
      shortDescription: value('shortDescription'), fullDescription: value('fullDescription'),
      field: value('field'), skillsNeeded: list('skills'), rolesNeeded: list('roles'),
      creator: demoUser, location: value('location'), remote: data.get('remote') === 'on',
      applicationQuestions: value('questions').split('\n').map(question => question.trim()).filter(Boolean),
    });
    navigate(`/projects/${id}`);
  }
  return <PageContainer title="Make room for your idea" description="Create a demo opportunity and help future teammates understand what you want to build. It stays in this browser session until refresh.">
    <form onSubmit={handleSubmit} className="panel max-w-3xl space-y-5">
      <p className="text-sm text-stone-500">Required fields are marked *. This demo does not publish anything online.</p>
      <div><label className="label" htmlFor="name">Opportunity name *</label><input id="name" name="name" required pattern=".*\S.*" maxLength={80} /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="type">Type *</label><select id="type" name="type"><option>Project</option><option>Nonprofit</option><option>Company</option></select></div>
        <div><label className="label" htmlFor="field">Field *</label><input id="field" name="field" required pattern=".*\S.*" placeholder="e.g. Environment" /></div>
      </div>
      <div><label className="label" htmlFor="shortDescription">Short description *</label><input id="shortDescription" name="shortDescription" required pattern=".*\S.*" maxLength={180} /></div>
      <div><label className="label" htmlFor="fullDescription">Full description *</label><textarea id="fullDescription" name="fullDescription" rows={5} required onChange={event => event.target.setCustomValidity(event.target.value.trim() ? '' : 'Please add a description.')} /></div>
      <div><label className="label" htmlFor="skills">Skills needed * (separate with commas)</label><input id="skills" name="skills" required pattern=".*[^\s,].*" placeholder="Design, Writing, React" /></div>
      <div><label className="label" htmlFor="roles">Roles needed * (separate with commas)</label><input id="roles" name="roles" required pattern=".*[^\s,].*" placeholder="Designer, Developer" /></div>
      <div><label className="label" htmlFor="location">Location *</label><input id="location" name="location" required pattern=".*\S.*" placeholder="City, region, or Anywhere" /></div>
      <label className="flex items-center gap-3 text-sm"><input className="h-4 w-4" name="remote" type="checkbox" defaultChecked />Open to remote teammates</label>
      <div><label className="label" htmlFor="questions">Application questions (optional, one per line)</label><textarea id="questions" name="questions" rows={3} /></div>
      <Button type="submit">Create demo opportunity</Button>
    </form>
  </PageContainer>;
}
