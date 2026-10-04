import { Link } from 'react-router-dom';
import { OpportunityGrid } from '../components/OpportunityGrid';
import { useDemo } from '../context/DemoContext';

export function Landing() {
  const { opportunities } = useDemo();
  return <>
    <section className="mb-12 rounded-3xl bg-emerald-50 p-7 sm:p-12">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">For students, by students</p>
      <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Big ideas start<br />with a small team.</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">Find a project you care about. Meet students with different skills. Build something that matters, together.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link className="button button-primary" to="/discover">Find your next project →</Link><Link className="button button-secondary" to="/create">Share an idea</Link></div>
    </section>
    <section aria-labelledby="featured-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 id="featured-heading" className="text-2xl font-bold">A little inspiration</h2><p className="mt-2 text-sm text-stone-500">Fictional opportunities to explore the demo.</p></div><Link className="text-sm font-semibold text-emerald-800 hover:underline" to="/discover">Explore all opportunities →</Link></div>
      <OpportunityGrid opportunities={opportunities.slice(0, 3)} />
    </section>
  </>;
}
