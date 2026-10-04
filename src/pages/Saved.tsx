import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { OpportunityGrid } from '../components/OpportunityGrid';
import { useDemo } from '../context/DemoContext';

export function Saved() {
  const { opportunities, savedIds } = useDemo();
  return <PageContainer title="Your next possibilities" description="Keep interesting opportunities together. Demo saves last until you refresh the page.">
    <OpportunityGrid opportunities={opportunities.filter(opportunity => savedIds.includes(opportunity.id))} emptyMessage="Nothing saved yet. Tap Save on an opportunity to keep it here." />
    <Link className="mt-6 inline-block text-sm font-semibold text-emerald-800 hover:underline" to="/discover">Browse opportunities →</Link>
  </PageContainer>;
}
