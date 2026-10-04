import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageContainer } from "../components/PageContainer";
import { Tag } from "../components/Tag";
import { useDemo } from "../context/DemoContext";
import { demoUser } from "../data/demo";
import { adaptLinkUpData, LinkedInLaunch, requestLinkedInProfile } from "../features/linkedinLaunch";
import { getSelectableOpportunities } from "../features/linkedinLaunch/adapter";
import { linkedInLaunchDemoUser } from "../features/linkedinLaunch/demo";
import type { LinkedInProfileKit, SourceMentor } from "../features/linkedinLaunch/types";
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
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [generatedProjectIds, setGeneratedProjectIds] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState("");
  const [generatedGoal, setGeneratedGoal] = useState("");
  const [generation, setGeneration] = useState(0);
  const [kit, setKit] = useState<LinkedInProfileKit | null>(null);
  const [generationMode, setGenerationMode] = useState<'ai' | 'fallback' | null>(null);
  const [loading, setLoading] = useState(false);
  const selectableProjects = useMemo(
    () => getSelectableOpportunities(user, opportunities),
    [user, opportunities],
  );
  const linkUpSource = useMemo(
    () => ({ ...adaptLinkUpData(user, opportunities, generatedProjectIds), goals: generatedGoal ? [generatedGoal] : [] }),
    [user, opportunities, generatedProjectIds, generatedGoal],
  );
  const isFictionalProfile = user.id === demoUser.id;
  const selectionChanged = selectedProjectIds.length !== generatedProjectIds.length ||
    selectedProjectIds.some(id => !generatedProjectIds.includes(id)) || goalInput.trim() !== generatedGoal;

  function toggleProject(id: string) {
    setSelectedProjectIds(current => current.includes(id)
      ? current.filter(projectId => projectId !== id)
      : [...current, id]);
  }

  async function generateKit() {
    if (loading) return;
    setLoading(true);
    const selected = [...selectedProjectIds];
    const goal = goalInput.trim();
    const source = { ...adaptLinkUpData(user, opportunities, selected), goals: goal ? [goal] : [],
      mentors: mentors ?? [] };
    const result = await requestLinkedInProfile(source);
    setGeneratedProjectIds(selected);
    setGeneratedGoal(goal);
    setKit(result.kit);
    setGenerationMode(result.mode);
    setGeneration(current => current + 1);
    setLoading(false);
  }

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
          onClick={() => setFullExample(false)} disabled={loading}
        >
          LinkUp profile
        </Button>
        <Button
          variant={fullExample ? "primary" : "secondary"}
          aria-pressed={fullExample}
          onClick={() => setFullExample(true)} disabled={loading}
        >
          Full example
        </Button>
      </div>

      {!fullExample && <section className="panel mb-6 max-w-4xl" aria-labelledby="linkedin-project-selection">
        <h2 id="linkedin-project-selection" className="text-xl font-semibold">Choose ideas to include</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Only ideas created by this LinkUp profile are listed. Their requested roles and skills are not claimed as your experience.
        </p>
        {selectableProjects.length ? <div className="mt-5 grid gap-3">
          {selectableProjects.map(project => <label key={project.id} className="flex cursor-pointer items-start gap-4 rounded-xl border border-stone-200 bg-white p-4">
            <input type="checkbox" className="mt-1 shrink-0" checked={selectedProjectIds.includes(project.id)} onChange={() => toggleProject(project.id)} disabled={loading} />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2"><strong>{project.name}</strong><Tag>{project.type}</Tag></span>
              <span className="mt-1 block text-sm leading-relaxed text-stone-600">{project.shortDescription}</span>
            </span>
          </label>)}
        </div> : <p className="mt-4 text-sm text-stone-600">No ideas created by this profile yet. You can still generate the profile sections below.</p>}
        <div className="mt-5">
          <label className="label" htmlFor="linkedin-goal">What would you like your profile to highlight? (optional)</label>
          <input id="linkedin-goal" value={goalInput} maxLength={180} disabled={loading}
            onChange={event => setGoalInput(event.target.value)} placeholder="e.g. Exploring environmental research and community projects" />
          <p className="mt-2 text-xs text-stone-600">This one-time goal is used for this export and is not saved to your LinkUp profile.</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={generateKit} disabled={loading}>{loading ? 'Generating…' : 'Generate profile kit'}</Button>
          {selectionChanged && <span className="text-sm text-stone-600">Selection changed. Generate again to update the kit.</span>}
        </div>
      </section>}

      {!fullExample && loading && <p className="demo-notice mb-5" role="status">Writing a profile kit from your selected LinkUp information…</p>}
      {!fullExample && !loading && generationMode === 'fallback' && <p className="demo-notice mb-5" role="status">AI generation is unavailable, so this kit uses a local draft based on your LinkUp information.</p>}
      {!fullExample && !loading && generationMode === 'ai' && <p className="demo-notice mb-5" role="status">AI-written draft ready. Review every claim before copying it to LinkedIn.</p>}

      {fullExample ? (
        <LinkedInLaunch
          key="full-example"
          user={linkedInLaunchDemoUser}
          sourceLabel="Full fictional example with projects, leadership, an award, nonprofit work, and mentorship."
        />
      ) : (
        <LinkedInLaunch
          key={`linkup-profile-${generation}`}
          user={linkUpSource}
          mentors={mentors}
          kit={kit || undefined}
          sourceLabel={`${isFictionalProfile ? "Fictional LinkUp profile. " : ""}${generatedProjectIds.length ? `Kit generated from ${generatedProjectIds.length} selected idea${generatedProjectIds.length === 1 ? '' : 's'}.` : 'No projects selected; this kit contains profile information only.'}`}
        />
      )}
    </PageContainer>
  );
}
