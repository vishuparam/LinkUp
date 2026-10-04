import { useState } from 'react';
import { PageContainer } from '../components/PageContainer';
import { SearchInput } from '../components/SearchInput';
import { OpportunityGrid } from '../components/OpportunityGrid';
import { useDemo } from '../context/DemoContext';

export function Discover() {
  const { opportunities } = useDemo();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const visible = opportunities.filter(opportunity => {
    const searchText = [opportunity.name, opportunity.shortDescription, opportunity.field, ...opportunity.skillsNeeded, ...opportunity.rolesNeeded].join(' ').toLowerCase();
    return (type === 'All' || opportunity.type === type) && searchText.includes(query.trim().toLowerCase());
  });
  return <PageContainer title="Find your people. Build your thing." description="Explore student projects, nonprofits, and companies looking for a teammate like you.">
    <div className="panel mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
      <SearchInput value={query} onChange={setQuery} />
      <div><label className="label" htmlFor="type-filter">Opportunity type</label><select id="type-filter" value={type} onChange={event => setType(event.target.value)}>{['All', 'Project', 'Nonprofit', 'Company'].map(value => <option key={value}>{value}</option>)}</select></div>
    </div>
    <p className="mb-5 text-sm text-stone-500" role="status">{visible.length} {visible.length === 1 ? 'opportunity' : 'opportunities'} · Demo content</p>
    <OpportunityGrid opportunities={visible} emptyMessage="No matches yet. Try another search or opportunity type." />
  </PageContainer>;
}
