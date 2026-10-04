import type { ReactNode } from 'react';

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">{children}</span>;
}
