import type { ReactNode } from 'react';

export function PageContainer({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section>
    <div className="mb-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 leading-relaxed text-stone-600">{description}</p>}
    </div>
    {children}
  </section>;
}
