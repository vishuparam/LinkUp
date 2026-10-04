export function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="flex-1">
    <label className="label" htmlFor="opportunity-search">Search opportunities</label>
    <input id="opportunity-search" type="search" placeholder="Try design, science, or React…" value={value} onChange={event => onChange(event.target.value)} />
  </div>;
}
