import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <div className="flex min-h-screen flex-col">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Navbar />
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14"><Outlet /></main>
    <footer className="border-t border-stone-200 px-5 py-6 text-center text-xs leading-relaxed text-stone-500">LinkUp · Frontend demo · All sample people and opportunities are fictional.</footer>
  </div>;
}
