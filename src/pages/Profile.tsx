import { PageContainer } from '../components/PageContainer';
import { Tag } from '../components/Tag';
import { demoUser } from '../data/demo';

export function Profile() {
  return <PageContainer title="Your profile" description="A simple introduction to what you enjoy and what you can bring to a team.">
    <article className="panel max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Fictional demo profile</p>
      <h2 className="mt-4 text-2xl font-bold">{demoUser.name}</h2><p className="mt-1 text-sm text-stone-500">Grade {demoUser.grade}</p>
      <p className="mt-5 leading-relaxed text-stone-600">{demoUser.bio}</p>
      <h3 className="mb-3 mt-6 font-semibold">Skills</h3><div className="flex flex-wrap gap-2">{demoUser.skills.map(skill => <Tag key={skill}>{skill}</Tag>)}</div>
      <h3 className="mb-3 mt-6 font-semibold">Interests</h3><div className="flex flex-wrap gap-2">{demoUser.interests.map(interest => <Tag key={interest}>{interest}</Tag>)}</div>
    </article>
  </PageContainer>;
}
