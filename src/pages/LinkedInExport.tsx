import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageContainer } from "../components/PageContainer";
import { useDemo } from "../context/DemoContext";
import { demoUser } from "../data/demo";
import { adaptLinkUpData, LinkedInLaunch } from "../features/linkedinLaunch";
import { linkedInLaunchDemoUser } from "../features/linkedinLaunch/demo";
import type { SourceMentor } from "../features/linkedinLaunch/types";
import type { User } from "../types";

/** Optional props let a future authenticated app provide the current user and Mentor Match data. */
export function LinkedInExport({
  user = demoUser,
  mentors,
}: {
  user?: User;
  mentors?: SourceMentor[];
}) {
  const { opportunities } = useDemo();
  const [fullExample, setFullExample] = useState(false);
  const linkUpSource = useMemo(
    () => adaptLinkUpData(user, opportunities),
    [user, opportunities],
  );
  const isFictionalProfile = user.id === demoUser.id;

  return (
    <PageContainer
      title="LinkedIn Export"
      description="Give the things you build a place in your story."
    >
      <div className="panel placeholder mb-8">
        <span className="placeholder-symbol" aria-hidden="true">
          ↗
        </span>
        <p className="eyebrow mb-3">BUILD NOW. SHARE WHEN YOU'RE READY.</p>
        <h2 className="text-2xl font-semibold">Built something? Let it speak.</h2>
        <p className="mt-4 leading-relaxed text-stone-600">
          Turn your LinkUp history into a profile kit. Review each section, copy
          what you want, and add it to LinkedIn yourself.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3" role="group" aria-label="Profile kit source">
        <Button
          variant={fullExample ? "secondary" : "primary"}
          aria-pressed={!fullExample}
          onClick={() => setFullExample(false)}
        >
          LinkUp profile
        </Button>
        <Button
          variant={fullExample ? "primary" : "secondary"}
          aria-pressed={fullExample}
          onClick={() => setFullExample(true)}
        >
          Full example
        </Button>
      </div>

      {fullExample ? (
        <LinkedInLaunch
          key="full-example"
          user={linkedInLaunchDemoUser}
          sourceLabel="Full fictional example with projects, leadership, an award, nonprofit work, and mentorship."
        />
      ) : (
        <LinkedInLaunch
          key="linkup-profile"
          user={linkUpSource}
          mentors={mentors}
          sourceLabel={`${isFictionalProfile ? "Fictional LinkUp profile. " : ""}Ideas created in this session appear here; openings and needed skills are not claimed as your own work.`}
        />
      )}
    </PageContainer>
  );
}
