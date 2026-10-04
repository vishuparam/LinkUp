import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { OpportunityGrid } from '../components/OpportunityGrid';
import { useDemo } from '../context/DemoContext';
import { demoUser } from '../data/demo';

export function YourProjects() {
  const { opportunities } = useDemo();
  return <PageContainer title="Your ideas, taking shape" description="Opportunities created by Alex Rivera, our fictional demo student.">
    <Link to="/create" className="button button-primary mb-6">Create an opportunity</Link>
    <OpportunityGrid opportunities={opportunities.filter(opportunity => opportunity.creator.id === demoUser.id)} />
  </PageContainer>;
}
