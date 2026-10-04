import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../components/PageContainer";
import { Button } from "../components/Button";
import { useDemo } from "../context/DemoContext";
import { demoUser } from "../data/demo";
import type { MentorResponse } from "../mentor/index";

type SearchState = "idle" | "searching" | "done";

export function MentorMatch() {
  const { opportunities } = useDemo();
  const [searchParams, setSearchParams] = useSearchParams();
  const ownProjects = opportunities.filter(project => project.creator.id === demoUser.id);
  const selectedProject = ownProjects.find(project => project.id === searchParams.get("projectId"));
  const [state, setState] = useState<SearchState>("idle");
  const [result, setResult] = useState<MentorResponse | null>(null);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  function selectProject(id: string) {
    controller.current?.abort();
    setState("idle");
    setResult(null);
    setError("");
    setSearchParams(id ? { projectId: id } : {});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const location = value("location");
    const skillsNeeded = [...new Set(value("skillsNeeded").split(",").map((skill) => skill.trim()).filter(Boolean))];

    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setState("searching");
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/find-mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: value("projectTitle"),
          projectDescription: value("projectDescription"),
          skillsNeeded,
          ...(data.get("researchRequired") === "on" ? { researchRequired: true } : {}),
          ...(location ? { location, locationImportance: "medium" } : {}),
        }),
        signal: request.signal,
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = (payload as { error?: { message?: string } })?.error?.message;
        throw new Error(message || `Mentor search failed (${response.status}).`);
      }
      if (!payload || typeof payload !== "object" || !Array.isArray((payload as MentorResponse).mentors)) {
        throw new Error("The mentor service returned an unexpected response. Start the API server and try again.");
      }
      setResult(payload as MentorResponse);
      setState("done");
    } catch (cause) {
      if (request.signal.aborted) return;
      setError(cause instanceof SyntaxError
        ? "The mentor API is unavailable. Run the Vercel development server or use the deployed app."
        : cause instanceof Error ? cause.message : "Unable to complete the mentor search.");
      setState("idle");
    } finally {
      if (controller.current === request) controller.current = null;
    }
  }

  return (
    <PageContainer
      title="Find a mentor"
      description="Describe your project to search for people with relevant professional expertise."
    >
      <div className="mentor-layout">
        <form className="form-section" onSubmit={handleSubmit}>
          <h2>Tell us about your project</h2>
          <p className="form-hint">Choose an idea from Your Projects or describe a new one. You can edit the details before searching.</p>
          <div className="form-fields">
            <div>
              <label className="label" htmlFor="mentor-project-choice">Use an idea from Your Projects</label>
              <select id="mentor-project-choice" value={selectedProject?.id ?? ""} onChange={event => selectProject(event.target.value)}>
                <option value="">Describe a new idea</option>
                {ownProjects.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}
              </select>
            </div>
            <div className="form-fields" key={selectedProject?.id ?? "new-idea"}>
            <div>
              <label className="label" htmlFor="mentor-project-title">Project title *</label>
              <input id="mentor-project-title" name="projectTitle" required maxLength={200} defaultValue={selectedProject?.name ?? ""} placeholder="e.g. AI for retinal disease detection" />
            </div>
            <div>
              <label className="label" htmlFor="mentor-project-description">Project description *</label>
              <textarea id="mentor-project-description" name="projectDescription" required minLength={20} maxLength={6000} rows={7} defaultValue={selectedProject?.fullDescription ?? ""} placeholder="What are you building? What methods are you using, and where would a mentor help?" />
            </div>
            <div>
              <label className="label" htmlFor="mentor-skills">Expertise you need</label>
              <input id="mentor-skills" name="skillsNeeded" maxLength={1600} defaultValue={selectedProject?.skillsNeeded.join(", ") ?? ""} placeholder="e.g. medical imaging, research design" />
              <p className="mentor-field-hint">Separate skills with commas.</p>
            </div>
            <div>
              <label className="label" htmlFor="mentor-location">Preferred location</label>
              <input id="mentor-location" name="location" maxLength={160} defaultValue={selectedProject?.location ?? ""} placeholder="e.g. Chicago, Illinois" />
              <p className="mentor-field-hint">Leave blank to search anywhere. Remote matches are allowed.</p>
            </div>
            <label className="mentor-check"><input type="checkbox" name="researchRequired" /> I need a research mentor</label>
            </div>
            <Button type="submit" disabled={state === "searching"} className="form-submit">
              {state === "searching" ? "Searching for mentors…" : "Find potential mentors"}
            </Button>
          </div>
        </form>
        <aside className="form-aside">
          <p className="eyebrow">HOW MATCHING WORKS</p>
          <h2>Find people who know your subject.</h2>
          <p>The search uses your description to look for relevant professionals and checks public sources before showing potential matches.</p>
          <p className="mt-5">A match means their public work appears relevant. Their availability or willingness to mentor has not been confirmed.</p>
        </aside>
      </div>

      {error && <p className="mentor-message mentor-error" role="alert">{error}</p>}
      {state === "searching" && <p className="mentor-message" role="status">Searching and checking public sources. This can take a minute or more.</p>}
      {result && (
        <section className="mentor-results" aria-live="polite">
          <h2>Potential mentors</h2>
          {result.mentors.length === 0 && <p className="mentor-message">{result.message || "No sufficiently verified matches were found. Try a broader description or location."}</p>}
          <div className="mentor-cards">
            {result.mentors.map((mentor) => (
              <article className="panel mentor-card" key={mentor.id}>
                <div className="mentor-card-heading">
                  <div>
                    <p className="eyebrow">POTENTIAL MATCH {mentor.rank}</p>
                    <h3>{mentor.name}</h3>
                    <p>{[mentor.title, mentor.organization, mentor.location].filter(Boolean).join(" · ")}</p>
                  </div>
                  <strong className="mentor-score">{mentor.matchScore}% match</strong>
                </div>
                <p>{mentor.whyMatch}</p>
                {mentor.matchingExpertise.length > 0 && <p className="mentor-expertise"><strong>Relevant expertise:</strong> {mentor.matchingExpertise.join(", ")}</p>}
                <div className="mentor-links">
                  {(mentor.profileUrl || mentor.contactUrl) && <a className="text-link" href={(mentor.profileUrl || mentor.contactUrl)!} target="_blank" rel="noopener noreferrer">Professional profile ↗</a>}
                  {mentor.contactUrl && mentor.contactUrl !== mentor.profileUrl && <a className="text-link" href={mentor.contactUrl} target="_blank" rel="noopener noreferrer">Contact page ↗</a>}
                  {mentor.publicEmail && <a className="text-link" href={`mailto:${mentor.publicEmail}`}>Public professional email ↗</a>}
                </div>
                {mentor.sources.length > 0 && <details className="mentor-sources"><summary>View public sources</summary><ul>{mentor.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title || source.url}</a></li>)}</ul></details>}
                {mentor.limitations.length > 0 && <p className="mentor-limits">{mentor.limitations.join(" ")}</p>}
              </article>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
