import { Link } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';

export function NotFound() {
  return <PageContainer title="This page hasn't been built" description="Let's get you back to the opportunities."><Link className="button button-primary" to="/discover">Explore Discover</Link></PageContainer>;
}
