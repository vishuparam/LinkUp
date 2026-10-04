import { useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Tag } from '../../components/Tag';
import { linkedInLaunchDemoUser } from './demo';
import { allSectionsText, copyText, sectionLabels, sectionText, type KitSection } from './export';
import { generateLinkedInProfile } from './generate';
import type { LinkedInLaunchSource, LinkedInProfileKit, ProfileEntry, SourceMentor } from './types';

export interface LinkedInLaunchProps {
  user?: LinkedInLaunchSource;
  /** Mentor Match may pass explicitly shareable facts later. */
  mentors?: SourceMentor[];
  sourceLabel?: string;
  kit?: LinkedInProfileKit;
}

const order: KitSection[] = ['headline', 'about', 'experience', 'projects', 'skills', 'honors', 'volunteering', 'mentorship', 'suggestedPost'];
const emptyMessages: Partial<Record<KitSection, string>> = {
  experience: 'Experiences added to LinkUp can appear here.',
  projects: 'No projects included in this kit. Select an idea above and generate again, or add an idea to LinkUp.',
  skills: 'Add skills to your profile or projects to see them here.',
  honors: 'Awards and achievements added to LinkUp can appear here.',
  volunteering: 'Nonprofit and volunteer work added to LinkUp can appear here.',
  mentorship: 'Shareable learning details from Mentor Match can appear here.',
};

function EntryList({ entries }: { entries: ProfileEntry[] }) {
  return <div className="divide-y divide-stone-200">{entries.map((entry, index) =>
    <article className="py-4 first:pt-0 last:pb-0" key={`${entry.title}-${index}`}>
      <h3 className="font-semibold text-stone-900">{entry.title}</h3>
      {entry.organization && <p className="text-sm text-stone-700">{entry.organization}</p>}
      {entry.role && <p className="text-sm text-stone-600">Role: {entry.role}</p>}
      {entry.dates && <p className="text-sm text-stone-500">{entry.dates}</p>}
      {entry.location && <p className="text-sm text-stone-500">{entry.location}</p>}
      {entry.description && <p className="mt-2 leading-relaxed text-stone-700">{entry.description}</p>}
      {entry.skills.length > 0 && <p className="mt-2 text-sm text-stone-600">Skills: {entry.skills.join(', ')}</p>}
      {entry.links && <div className="mt-2 flex flex-wrap gap-4">{entry.links.map(link =>
        <a className="text-link" href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>{link.label}</a>)}</div>}
    </article>)}</div>;
}

export function LinkedInLaunch({ user, mentors, sourceLabel, kit: generatedKit }: LinkedInLaunchProps) {
  const source = user || linkedInLaunchDemoUser;
  const fallbackKit = useMemo(() => generateLinkedInProfile({ ...source, mentors: mentors ?? source.mentors }), [source, mentors]);
  const kit = generatedKit || fallbackKit;
  const [copied, setCopied] = useState<KitSection | 'all' | null>(null);
  const [error, setError] = useState('');

  async function handleCopy(section: KitSection | 'all') {
    try {
      await copyText(section === 'all' ? allSectionsText(kit) : sectionText(kit, section));
      setCopied(section);
      setError('');
    } catch {
      setError('Clipboard access failed. You can select and copy the text manually.');
    }
  }

  function content(section: KitSection) {
    switch (section) {
      case 'experience': return <EntryList entries={kit.experience} />;
      case 'projects': return <EntryList entries={kit.projects} />;
      case 'volunteering': return <EntryList entries={kit.volunteering} />;
      case 'honors': return <div className="divide-y divide-stone-200">{kit.honors.map((honor, index) =>
        <article className="py-4 first:pt-0 last:pb-0" key={`${honor.title}-${index}`}>
          <h3 className="font-semibold">{honor.title}</h3>
          {honor.issuer && <p className="text-sm text-stone-600">{honor.issuer}</p>}
          {honor.date && <p className="text-sm text-stone-500">{honor.date}</p>}
          {honor.description && <p className="mt-2 text-stone-700">{honor.description}</p>}
        </article>)}</div>;
      case 'skills': return <div className="flex flex-wrap gap-2">{kit.skills.map(skill => <Tag key={skill}>{skill}</Tag>)}</div>;
      case 'mentorship': return <div className="space-y-3">{kit.mentorship.map((item, index) => <p key={index}>{item}</p>)}</div>;
      default: return <p className="whitespace-pre-line leading-relaxed">{sectionText(kit, section)}</p>;
    }
  }

  return <div className="max-w-4xl space-y-5">
    <p className="demo-notice">{sourceLabel || (!user ? 'Fictional LinkedIn Launch example' : 'Review each section before copying it to LinkedIn.')}</p>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => handleCopy('all')}>{copied === 'all' ? 'Copied!' : 'Copy all'}</Button>
      <a className="button button-secondary" href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">Open LinkedIn</a>
    </div>
    <p className="sr-only" aria-live="polite">{copied ? `${copied === 'all' ? 'All sections' : sectionLabels[copied]} copied` : ''}</p>
    {order.map(section => {
      const text = sectionText(kit, section);
      return <section className="panel" key={section}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{sectionLabels[section]}</h2>
          {text && <Button variant="secondary" onClick={() => handleCopy(section)}>{copied === section ? 'Copied!' : 'Copy'}</Button>}
        </div>
        {text ? content(section) : <p className="text-stone-500">{emptyMessages[section] || 'Add more details to your LinkUp profile to fill this section.'}</p>}
      </section>;
    })}
  </div>;
}
