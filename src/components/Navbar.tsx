import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "./Icon";
const links = [
  ["/discover", "Discover"],
  ["/create", "Create"],
  ["/mentor-match", "Mentor Match"],
  ["/linkedin-export", "LinkedIn Export"],
];
export function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const media = matchMedia("(min-width: 1200px)");
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  const navigation = (
    <>
      {links.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          {label}
        </NavLink>
      ))}
    </>
  );
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="LinkUp home">
          LinkUp
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation}
        </nav>
        <NavLink
          to="/profile"
          className="profile-control"
          aria-label="Profile"
          title="Your profile"
        >
          <Icon name="profile" />
        </NavLink>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mobile-nav"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            {navigation}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
