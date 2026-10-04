import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import type { Opportunity } from "../types";
import { useDemo } from "../context/DemoContext";
import { Button } from "./Button";
import { Tag } from "./Tag";
export function OpportunityCard({
  opportunity: item,
}: {
  opportunity: Opportunity;
}) {
  const { savedIds, toggleSaved } = useDemo();
  const saved = savedIds.includes(item.id);
  const reduced = useReducedMotion();
  return (
    <motion.article
      className={`opportunity-card tone-${item.type.toLowerCase()}`}
      whileHover={reduced ? undefined : { y: -5 }}
      transition={{ duration: 0.18 }}
    >
      <div className="card-top">
        <span className="opportunity-mark" aria-hidden="true">
          {item.type === "Project"
            ? "↗"
            : item.type === "Nonprofit"
              ? "✳"
              : "◈"}
        </span>
        <span className="type-badge">{item.type}</span>
      </div>
      <p className="card-field">{item.field}</p>
      <h2>
        <Link to={`/projects/${item.id}`}>{item.name}</Link>
      </h2>
      <p className="card-description">{item.shortDescription}</p>
      <div className="card-skills">
        {item.skillsNeeded.map((skill) => (
          <Tag key={skill}>{skill}</Tag>
        ))}
      </div>
      <div className="card-person">
        <span className="avatar avatar-small">
          {item.creator.name
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </span>
        <span>
          {item.creator.name}
          <small>
            {item.remote ? "Remote" : "In person"} · {item.location}
          </small>
        </span>
      </div>
      <div className="card-actions">
        <Link className="text-link" to={`/projects/${item.id}`}>
          View opportunity <span aria-hidden="true">↗</span>
        </Link>
        <Button
          variant="secondary"
          className={saved ? "is-saved" : ""}
          aria-label={`${saved ? "Unsave" : "Save"} ${item.name}`}
          aria-pressed={saved}
          onClick={() => toggleSaved(item.id)}
        >
          {saved ? "Saved ✓" : "Save +"}
        </Button>
      </div>
    </motion.article>
  );
}
