import type { Opportunity } from "../types";
import { OpportunityCard } from "./OpportunityCard";

export function OpportunityGrid({
  opportunities,
  emptyMessage = "No opportunities yet.",
}: {
  opportunities: Opportunity[];
  emptyMessage?: string;
}) {
  return opportunities.length ? (
    <div className="opportunity-feed">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </div>
  ) : (
    <p className="panel text-stone-600" role="status">
      {emptyMessage}
    </p>
  );
}
