import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../components/PageContainer";
import { Button } from "../components/Button";
import { useDemo } from "../context/DemoContext";
import { demoUser } from "../data/demo";
import type { OpportunityType } from "../types";
export function Create() {
  const { addOpportunity } = useDemo();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<{ id: string; value: string }[]>(
    [],
  );
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const list = (name: string) => [
      ...new Set(
        value(name)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
    const id = `demo-${crypto.randomUUID()}`;
    addOpportunity({
      id,
      name: value("name"),
      type: value("type") as OpportunityType,
      shortDescription: value("shortDescription"),
      fullDescription: value("fullDescription"),
      field: value("field"),
      skillsNeeded: list("skills"),
      rolesNeeded: list("roles"),
      creator: demoUser,
      location: value("location"),
      remote: data.get("remote") === "on",
      applicationQuestions: questions
        .map((question) => question.value.trim())
        .filter(Boolean),
    });
    navigate(`/projects/${id}`);
  }
  return (
    <PageContainer
      title="Make room for your idea"
      description="You don't need it all figured out. Start with an idea and tell your future teammates where they fit."
    >
      <div className="form-layout">
        <form onSubmit={handleSubmit}>
          <p className="form-hint">
            Required fields are marked *. This demo stays until refresh and does
            not publish anything online.
          </p>
          <section className="form-section">
            <h2>
              <span>01</span>Basic information
            </h2>
            <p className="form-hint">
              A name and a little context to help your idea get discovered.
            </p>
            <div className="form-fields">
              <div>
                <label className="label" htmlFor="name">
                  Opportunity name *
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  pattern=".*\S.*"
                  maxLength={80}
                  placeholder="Give your idea a name"
                />
              </div>
              <div className="form-two">
                <div>
                  <label className="label" htmlFor="type">
                    Type *
                  </label>
                  <select id="type" name="type">
                    <option>Project</option>
                    <option>Nonprofit</option>
                    <option>Company</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="field">
                    Field *
                  </label>
                  <input
                    id="field"
                    name="field"
                    required
                    pattern=".*\S.*"
                    placeholder="e.g. Environment"
                  />
                </div>
              </div>
            </div>
          </section>
          <section className="form-section">
            <h2>
              <span>02</span>What are you building?
            </h2>
            <p className="form-hint">
              Keep the short version clear. Use the full description to tell
              your story.
            </p>
            <div className="form-fields">
              <div>
                <label className="label" htmlFor="shortDescription">
                  Short description *
                </label>
                <input
                  id="shortDescription"
                  name="shortDescription"
                  required
                  pattern=".*\S.*"
                  maxLength={180}
                  placeholder="Your idea in one sentence"
                />
              </div>
              <div>
                <label className="label" htmlFor="fullDescription">
                  Full description *
                </label>
                <textarea
                  id="fullDescription"
                  name="fullDescription"
                  rows={5}
                  required
                  placeholder="What do you want to make, and why does it matter?"
                  onChange={(event) =>
                    event.target.setCustomValidity(
                      event.target.value.trim()
                        ? ""
                        : "Please add a description.",
                    )
                  }
                />
              </div>
            </div>
          </section>
          <section className="form-section">
            <h2>
              <span>03</span>Who are you looking for?
            </h2>
            <p className="form-hint">
              Different strengths make stronger teams. Separate entries with
              commas.
            </p>
            <div className="form-fields">
              <div>
                <label className="label" htmlFor="skills">
                  Skills needed *
                </label>
                <input
                  id="skills"
                  name="skills"
                  required
                  pattern=".*[^\s,].*"
                  placeholder="Design, Writing, React"
                />
              </div>
              <div>
                <label className="label" htmlFor="roles">
                  Roles needed *
                </label>
                <input
                  id="roles"
                  name="roles"
                  required
                  pattern=".*[^\s,].*"
                  placeholder="Designer, Developer"
                />
              </div>
            </div>
          </section>
          <section className="form-section">
            <h2>
              <span>04</span>Location
            </h2>
            <p className="form-hint">
              Around the corner or across the country?
            </p>
            <div className="form-fields">
              <div>
                <label className="label" htmlFor="location">
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  required
                  pattern=".*\S.*"
                  placeholder="City, region, or Anywhere"
                />
              </div>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input name="remote" type="checkbox" defaultChecked />
                Open to remote teammates
              </label>
            </div>
          </section>
          <section className="form-section">
            <h2>
              <span>05</span>Application options
            </h2>
            <p className="form-hint">
              Optional questions help teammates introduce themselves. Add up to
              five.
            </p>
            {questions.map((question, index) => (
              <div className="question-row" key={question.id}>
                <div>
                  <label className="label" htmlFor={question.id}>
                    Application question {index + 1}
                  </label>
                  <input
                    id={question.id}
                    value={question.value}
                    maxLength={250}
                    onChange={(event) =>
                      setQuestions((current) =>
                        current.map((item) =>
                          item.id === question.id
                            ? { ...item, value: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="What would you like to learn?"
                  />
                </div>
                <Button
                  variant="secondary"
                  aria-label={`Remove question ${index + 1}`}
                  onClick={() =>
                    setQuestions((current) =>
                      current.filter((item) => item.id !== question.id),
                    )
                  }
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              disabled={questions.length >= 5}
              onClick={() =>
                setQuestions((current) => [
                  ...current,
                  { id: crypto.randomUUID(), value: "" },
                ])
              }
            >
              + Add question
            </Button>
          </section>
          <Button className="form-submit" type="submit">
            Create demo opportunity <span aria-hidden="true">↗</span>
          </Button>
        </form>
        <aside className="form-aside">
          <p className="eyebrow">A NOTE BEFORE YOU START</p>
          <h2>
            Small starts.
            <br />
            Real possibilities.
          </h2>
          <p>
            The best opportunity descriptions tell people three things: what
            you're making, why you care, and how they can help.
          </p>
          <p className="mt-5">
            Be specific. Be welcoming. Leave room for someone else's ideas.
          </p>
          <div className="demo-notice mt-6">
            This is a frontend demo. Your opportunity appears in Discover and
            Your Projects, and resets on refresh.
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
