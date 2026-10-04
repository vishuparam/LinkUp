import { Icon } from "./Icon";
export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="search-control">
      <label className="sr-only" htmlFor="opportunity-search">
        Search opportunities
      </label>
      <Icon name="search" />
      <input
        id="opportunity-search"
        type="search"
        placeholder="Search projects, skills, or interests"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
