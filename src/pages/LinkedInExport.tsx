import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { PageContainer } from '../components/PageContainer';
import { useDemo } from '../context/DemoContext';
import { demoUser } from '../data/demo';
import { adaptLinkUpData, LinkedInLaunch } from '../features/linkedinLaunch';
import { linkedInLaunchDemoUser } from '../features/linkedinLaunch/demo';
import type { SourceMentor } from '../features/linkedinLaunch/types';
import type { User } from '../types';

/** Optional props let a future authenticated app provide the current user and Mentor Match data. */
export function LinkedInExport({ user = demoUser, mentors }: { user?: User; mentors?: SourceMentor[] }) {
  const { opportunities } = useDemo();
  const [fullExample, setFullExample] = useState(false);
  const linkUpSource = useMemo(() => adaptLinkUpData(user, opportunities), [user, opportunities]);
  const isFictionalProfile = user.id === demoUser.id;

  return <PageContainer title="LinkedIn Launch" description="Turn the things you build on LinkUp into a profile kit you can review and copy when you're ready for LinkedIn.">
    <div className="mb-6 flex flex-wrap gap-3" role="group" aria-label="Profile kit source">
      <Button variant={!fullExample ? 'primary' : 'secondary'} aria-pressed={!fullExample} onClick={() => setFullExample(false)}>LinkUp profile</Button>
      <Button variant={fullExample ? 'primary' : 'secondary'} aria-pressed={fullExample} onClick={() => setFullExample(true)}>Full example</Button>
    </div>
    {fullExample
      ? <LinkedInLaunch key="full-example" user={linkedInLaunchDemoUser} sourceLabel="Full fictional example with projects, leadership, an award, nonprofit work, and mentorship." />
      : <LinkedInLaunch key="linkup-profile" user={linkUpSource} mentors={mentors} sourceLabel={`${isFictionalProfile ? 'Fictional LinkUp profile. ' : ''}Ideas created in this session appear here; openings and needed skills are not claimed as your own work.`} />}
  </PageContainer>;
}
