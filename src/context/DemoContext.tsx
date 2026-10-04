import { createContext, useContext, useState, type ReactNode } from 'react';
import { demoOpportunities } from '../data/demo';
import type { Opportunity } from '../types';

type DemoState = {
  opportunities: Opportunity[];
  savedIds: string[];
  toggleSaved: (id: string) => void;
  addOpportunity: (opportunity: Opportunity) => void;
};

const DemoContext = createContext<DemoState | null>(null);

// State is intentionally in memory: refreshing restores the fictional demo.
export function DemoProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState(demoOpportunities);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  function toggleSaved(id: string) {
    setSavedIds(current => current.includes(id) ? current.filter(saved => saved !== id) : [...current, id]);
  }
  function addOpportunity(opportunity: Opportunity) {
    setOpportunities(current => [opportunity, ...current]);
  }
  return <DemoContext.Provider value={{ opportunities, savedIds, toggleSaved, addOpportunity }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
}
