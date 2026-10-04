import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Navbar } from "./Navbar";
export function Layout() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  const main = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pathname === "/" ? "Build something together" : pathname.split("/")[1].replaceAll("-", " ")} | LinkUp`;
    if (previous.current !== pathname)
      main.current?.focus({ preventScroll: true });
    previous.current = pathname;
  }, [pathname]);
  return (
    <div className={`site-shell ${pathname === "/" ? "cinematic-shell" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main
        ref={main}
        tabIndex={-1}
        id="main-content"
        className={pathname === "/" ? "landing-main" : "app-main"}
      >
        <motion.div
          key={pathname}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <footer className="site-footer">
        <Link className="brand" to="/">
          LinkUp.
        </Link>
        <p>Less waiting. More making.</p>
        <span>
          Frontend demo · All sample people and opportunities are fictional.
        </span>
      </footer>
    </div>
  );
}
