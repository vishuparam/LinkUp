import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { demoOpportunities, demoUser } from '../data/demo';
import type { Opportunity } from '../types';

const createdKey = 'linkup-created-opportunities-v1';

function loadCreated(): Opportunity[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(createdKey) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item): item is Opportunity => Boolean(item && typeof item === 'object'
      && typeof item.id === 'string' && typeof item.name === 'string'
      && typeof item.shortDescription === 'string' && typeof item.fullDescription === 'string'
      && typeof item.field === 'string' && typeof item.location === 'string'
      && Array.isArray(item.skillsNeeded) && Array.isArray(item.rolesNeeded)
      && typeof item.remote === 'boolean' && ['Project', 'Nonprofit', 'Company'].includes(item.type)))
      .map(item => ({...item, creator: demoUser}));
  } catch { return []; }
}

type DemoState = {
  opportunities: Opportunity[];
  savedIds: string[];
  toggleSaved: (id: string) => void;
  addOpportunity: (opportunity: Opportunity) => void;
};

const DemoContext = createContext<DemoState | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [created, setCreated] = useState<Opportunity[]>(loadCreated);
  const opportunities = [...created, ...demoOpportunities];
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => { try { localStorage.setItem(createdKey, JSON.stringify(created)); } catch { /* Private browsing may disable storage. */ } }, [created]);
  function toggleSaved(id: string) {
    setSavedIds(current => current.includes(id) ? current.filter(saved => saved !== id) : [...current, id]);
  }
  function addOpportunity(opportunity: Opportunity) {
    setCreated(current => [opportunity, ...current]);
  }
  return <DemoContext.Provider value={{ opportunities, savedIds, toggleSaved, addOpportunity }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
}
