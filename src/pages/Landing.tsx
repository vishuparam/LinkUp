import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Reveal } from "../components/Motion";
import { OpportunityGrid } from "../components/OpportunityGrid";
import { demoOpportunities } from "../data/demo";
export function Landing() {
  const hero = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const drift = useTransform(scrollYProgress, [0, 1], [0, -65]);
  return (
    <>
      <section className="hero" ref={hero}>
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">
              <span className="live-dot" /> BIG IDEAS. NEW CONNECTIONS.
            </p>
            <h1>
              Your next big idea
              <br />
              shouldn't depend on
              <br />
              <span>who you already know.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="hero-description">
              A place for high-school students to discover projects, find their
              people, and turn <em>what if</em> into something real.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/discover">
                Explore Projects <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-secondary" to="/create">
                Share an Idea <span aria-hidden="true">+</span>
              </Link>
            </div>
            <p className="hero-note">
              You don't need a network. Just a starting point.
            </p>
          </Reveal>
        </div>
        <motion.div className="hero-cards" style={{ y: reduced ? 0 : drift }}>
          <span className="orbit-label">YOUR PEOPLE ARE OUT THERE</span>
          {demoOpportunities.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              className={`floating-card floating-${index} tone-${item.type.toLowerCase()}`}
              initial={reduced ? false : { opacity: 0, y: 24, rotate: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: reduced ? 0 : [-7, 6, -3][index],
              }}
              transition={{
                duration: reduced ? 0 : 0.6,
                delay: reduced ? 0 : 0.15 + index * 0.12,
              }}
              whileHover={reduced ? undefined : { rotate: 0, scale: 1.03 }}
            >
              <Link to={`/projects/${item.id}`}>
                <div className="card-top">
                  <span className="opportunity-mark" aria-hidden="true">
                    {["↗", "✳", "◈"][index]}
                  </span>
                  <span className="type-badge">{item.type}</span>
                </div>
                <h2>{item.name}</h2>
                <p>Looking for</p>
                <div className="mini-skills">
                  {item.skillsNeeded.slice(0, 2).join(" · ")}
                </div>
                <span className="mini-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </motion.div>
          ))}
          <span className="orbit-spark" aria-hidden="true">
            ✳
          </span>
        </motion.div>
        <div className="hero-bottom">
          <span>BUILT FOR THE NEXT GENERATION OF BUILDERS</span>
          <a href="#why-linkup">
            There's more below <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <section id="why-linkup" className="story-section section-wrap">
        <Reveal className="story-copy">
          <p className="eyebrow">01 / THE RIGHT CONNECTION CHANGES THINGS</p>
          <h2>
            Ideas are everywhere.
            <br />
            <span className="muted-heading">Teams aren't.</span>
          </h2>
          <p>
            You have the idea. Someone else has the skill. LinkUp gives you a
            place to find each other—and a reason to start.
          </p>
          <Link className="text-link" to="/discover">
            Meet your next possibility <span aria-hidden="true">↗</span>
          </Link>
        </Reveal>
        <Reveal className="connection-board">
          <div className="connection-node">
            <span className="avatar">AR</span>
            <div>
              <strong>The idea person</strong>
              <small>“What if we made this?”</small>
            </div>
            <span className="connection-chip">Vision</span>
          </div>
          <div className="connection-line" aria-hidden="true">
            <span>+</span>
          </div>
          <div className="connection-node">
            <span className="avatar lavender">MC</span>
            <div>
              <strong>The missing skill</strong>
              <small>“I know how to help.”</small>
            </div>
            <span className="connection-chip">Design</span>
          </div>
          <div className="connection-line" aria-hidden="true">
            <span>↓</span>
          </div>
          <div className="connection-result">
            <span aria-hidden="true">✳</span>
            <div>
              <strong>Something neither could build alone.</strong>
              <small>That's where LinkUp comes in.</small>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="steps-section">
        <div className="section-wrap">
          <Reveal>
            <p className="eyebrow">02 / LESS SCROLLING. MORE STARTING.</p>
            <h2>Find what you're missing.</h2>
          </Reveal>
          <div className="steps-grid">
            {[
              [
                "01",
                "Discover",
                "Find an idea that pulls you in.",
                "Explore student projects, nonprofits, and companies. Follow your curiosity.",
              ],
              [
                "02",
                "Collaborate",
                "Different skills. Shared ambition.",
                "Find teams looking for what you bring, and people you can learn alongside.",
              ],
              [
                "03",
                "Build",
                "Make something you can point to.",
                "Start small. Try things. Turn a shared idea into work you’re proud of.",
              ],
            ].map(([number, title, lead, description], index) => (
              <Reveal key={title} delay={index * 0.08} className="step-card">
                <div className="step-number">
                  {number}
                  <span aria-hidden="true">↗</span>
                </div>
                <h3>{title}</h3>
                <strong>{lead}</strong>
                <p>{description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="featured-section section-wrap">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / YOUR STARTING POINT</p>
              <h2>
                Find something
                <br />
                worth building.
              </h2>
            </div>
            <div>
              <p className="section-aside">
                A few fictional ideas.
                <br />A whole lot of possibility.
              </p>
              <Link className="button button-primary" to="/discover">
                Explore Opportunities <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <OpportunityGrid opportunities={demoOpportunities.slice(0, 3)} />
        </Reveal>
      </section>
    </>
  );
}
