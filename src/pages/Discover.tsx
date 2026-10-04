import { useState } from "react";
import { PageContainer } from "../components/PageContainer";
import { SearchInput } from "../components/SearchInput";
import { OpportunityGrid } from "../components/OpportunityGrid";
import { Button } from "../components/Button";
import { useDemo } from "../context/DemoContext";
export function Discover() {
  const { opportunities } = useDemo();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [field, setField] = useState("All");
  const [skill, setSkill] = useState("All");
  const fields = [...new Set(opportunities.map((item) => item.field))].sort();
  const skills = [
    ...new Set(opportunities.flatMap((item) => item.skillsNeeded)),
  ].sort();
  const visible = opportunities.filter((item) => {
    const text = [
      item.name,
      item.shortDescription,
      item.field,
      ...item.skillsNeeded,
      ...item.rolesNeeded,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (type === "All" || item.type === type) &&
      (field === "All" || item.field === field) &&
      (skill === "All" || item.skillsNeeded.includes(skill)) &&
      text.includes(query.trim().toLowerCase())
    );
  });
  const filtered =
    query !== "" || type !== "All" || field !== "All" || skill !== "All";
  return (
    <PageContainer
      title="Find your people. Build your thing."
      description="Good ideas need different kinds of people. Find a team that needs someone like you."
    >
      <div className="filter-panel">
        <div className="filter-row">
          <SearchInput value={query} onChange={setQuery} />
          <div>
            <label className="label" htmlFor="field-filter">
              Field
            </label>
            <select
              id="field-filter"
              value={field}
              onChange={(event) => setField(event.target.value)}
            >
              <option value="All">All fields</option>
              {fields.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="skill-filter">
              Skill
            </label>
            <select
              id="skill-filter"
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
            >
              <option value="All">All skills</option>
              {skills.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-bottom">
          <div className="type-tabs" role="group" aria-label="Opportunity type">
            {["All", "Project", "Nonprofit", "Company"].map((value) => (
              <button
                key={value}
                className={type === value ? "selected" : ""}
                aria-pressed={type === value}
                onClick={() => setType(value)}
              >
                {value === "All" ? "All opportunities" : value}
              </button>
            ))}
          </div>
          {filtered && (
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setType("All");
                setField("All");
                setSkill("All");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
      <div className="results-heading">
        <p role="status">
          <strong>{visible.length}</strong>{" "}
          {visible.length === 1 ? "opportunity" : "opportunities"} to explore
        </p>
        <span>Curiosity looks good on you.</span>
      </div>
      <OpportunityGrid
        opportunities={visible}
        emptyMessage="No matches yet. Try another search or clear your filters."
      />
    </PageContainer>
  );
}
