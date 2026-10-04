import { NavLink, Link } from 'react-router-dom';

const links = [
  ['/discover', 'Discover'], ['/saved', 'Saved'], ['/create', 'Create'],
  ['/your-projects', 'Your Projects'], ['/profile', 'Profile'],
  ['/mentor-match', 'Mentor Match'], ['/linkedin-export', 'LinkedIn Export'],
];

export function Navbar() {
  return <header className="border-b border-stone-200 bg-white">
    <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-emerald-900" aria-label="LinkUp home">LinkUp<span className="text-emerald-500">.</span></Link>
        <span className="text-xs text-stone-500">Student ideas. Shared ambition.</span>
      </div>
      <nav aria-label="Main navigation" className="mt-4 flex flex-wrap gap-1">
        {links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-emerald-50 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`}>{label}</NavLink>)}
      </nav>
    </div>
  </header>;
}
