import { Link } from "react-router-dom";
import type { Opportunity } from "../types";
import { useDemo } from "../context/DemoContext";
import { Button } from "./Button";
import { Tag } from "./Tag";
import { Icon } from "./Icon";
function gradeLabel(grade: number) {
  const suffix =
    grade % 100 >= 11 && grade % 100 <= 13
      ? "th"
      : { 1: "st", 2: "nd", 3: "rd" }[grade % 10] || "th";
  return grade + suffix + " grade";
}
export function OpportunityCard({
  opportunity: item,
}: {
  opportunity: Opportunity;
}) {
  const { savedIds, toggleSaved } = useDemo();
  const saved = savedIds.includes(item.id);
  return (
    <article className={"opportunity-card tone-" + item.type.toLowerCase()}>
      <div className="card-top">
        <div>
          <h2>
            <Link to={"/projects/" + item.id}>{item.name}</Link>
          </h2>
          <p className="card-author">
            Posted by {item.creator.name}
            <span className="metadata-separator"> / </span>
            {gradeLabel(item.creator.grade)}
          </p>
        </div>
        <span className="type-badge">{item.type}</span>
      </div>
      <p className="card-description">{item.shortDescription}</p>
      <dl className="card-metadata">
        <div>
          <dt>Looking for</dt>
          <dd>{item.rolesNeeded.join(", ")}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{item.remote ? "Remote" : item.location}</dd>
        </div>
        <div>
          <dt>Field</dt>
          <dd>{item.field}</dd>
        </div>
      </dl>
      <div className="card-skills">
        {item.skillsNeeded.slice(0, 3).map((skill) => (
          <Tag key={skill}>{skill}</Tag>
        ))}
        {item.skillsNeeded.length > 3 && (
          <span className="more-skills">
            {item.skillsNeeded.length - 3} more skills
          </span>
        )}
      </div>
      <div className="card-actions">
        <small className="posting-time">Demo listing</small>
        <div className="card-action-links">
          <Button
            variant="secondary"
            className={"card-save " + (saved ? "is-saved" : "")}
            aria-label={(saved ? "Unsave " : "Save ") + item.name}
            aria-pressed={saved}
            onClick={() => toggleSaved(item.id)}
          >
            <Icon name="bookmark" />
            {saved ? "Saved" : "Save"}
          </Button>
          <Link className="text-link" to={"/projects/" + item.id}>
            Learn more <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}
