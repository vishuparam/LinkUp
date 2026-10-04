import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageContainer } from "../components/PageContainer";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { useDemo } from "../context/DemoContext";
import { demoUser } from "../data/demo";
export function ProjectDetails() {
  const { id } = useParams();
  const { opportunities, savedIds, toggleSaved } = useDemo();
  const [applyNotice, setApplyNotice] = useState(false);
  const item = opportunities.find((opportunity) => opportunity.id === id);
  if (!item)
    return (
      <PageContainer
        title="Opportunity not found"
        description="This opportunity may have been a demo that reset on refresh."
      >
        <Link className="button button-primary" to="/discover">
          Back to Discover
        </Link>
      </PageContainer>
    );
  const saved = savedIds.includes(item.id);
  return (
    <section>
      <Link to="/discover" className="text-link">
        Back to Discover
      </Link>
      <div className="detail-grid">
        <article className="panel">
          <div className="detail-header">
            <div className="flex flex-wrap gap-2">
              <Tag>{item.type}</Tag>
              <Tag>{item.field}</Tag>
            </div>
            <h1>{item.name}</h1>
            <p>{item.shortDescription}</p>
          </div>
          <div className="detail-section">
            <h2>About the idea</h2>
            <p>{item.fullDescription}</p>
          </div>
          <div className="detail-section">
            <h2>Roles needed</h2>
            <ul className="list-inside list-disc">
              {item.rolesNeeded.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
          <div className="detail-section">
            <h2>Skills that could help</h2>
            <div className="flex flex-wrap gap-2">
              {item.skillsNeeded.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
          {!!item.applicationQuestions?.length && (
            <div className="detail-section">
              <h2>A few things the team would love to know</h2>
              <p>Future applications may include these questions:</p>
              <ol className="mt-3 list-inside list-decimal">
                {item.applicationQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ol>
            </div>
          )}
        </article>
        <aside className="panel detail-side">
          <p className="eyebrow">MEET THE BUILDER</p>
          <div className="card-person mt-5">
            <span className="avatar">
              {item.creator.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </span>
            <div>
              <h2 className="text-base font-semibold">{item.creator.name}</h2>
              <small>Grade {item.creator.grade} · Demo student</small>
            </div>
          </div>
          <dl className="detail-facts">
            <div>
              <dt>Location</dt>
              <dd>{item.location}</dd>
            </div>
            <div>
              <dt>How we work</dt>
              <dd>{item.remote ? "Remote welcome" : "In person"}</dd>
            </div>
            <div>
              <dt>Field</dt>
              <dd>{item.field}</dd>
            </div>
            <div>
              <dt>Opportunity</dt>
              <dd>{item.type}</dd>
            </div>
          </dl>
          <Button
            onClick={() => setApplyNotice(true)}
            aria-describedby="application-note"
          >
            Apply to join
          </Button>
          <Button
            variant="secondary"
            aria-pressed={saved}
            onClick={() => toggleSaved(item.id)}
          >
            {saved ? "Saved" : "Save opportunity"}
          </Button>
          {item.creator.id === demoUser.id && <Link className="button button-secondary" to={`/mentor-match?projectId=${encodeURIComponent(item.id)}`}>Find a mentor for this idea</Link>}
          <p
            id="application-note"
            className="text-xs leading-relaxed text-stone-500"
          >
            Demo preview only. Applications are not sent.
            {!!item.applicationQuestions?.length &&
              " This team has application questions."}
          </p>
          {applyNotice && (
            <p role="status" className="demo-notice mt-4">
              You're exploring a fictional opportunity. Applying will be
              available in a future version; nothing has been submitted.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
