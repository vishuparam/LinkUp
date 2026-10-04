import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Reveal } from "../Motion";
import { demoOpportunities } from "../../data/demo";

function Tilt({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 140, damping: 22 });
  const rotateY = useSpring(y, { stiffness: 140, damping: 22 });
  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        x.set((-(event.clientY - box.top - box.height / 2) / box.height) * 5);
        y.set(((event.clientX - box.left - box.width / 2) / box.width) * 5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function LandingSections() {
  const reduced = useReducedMotion();
  return (
    <>
      <section className="possibility-section" id="landing-discover">
        <div className="landing-section-inner">
          <Reveal>
            <p className="landing-label">03 / OUTSIDE YOUR USUAL CIRCLE</p>
            <h2>
              Find what your
              <br />
              <em>idea is missing.</em>
            </h2>
          </Reveal>
          <div className="possibility-panels">
            {[
              [
                "01",
                "DISCOVER",
                "A spark worth following.",
                "Projects, nonprofits, and student companies. Start with what makes you curious.",
                "/discover",
                "Explore projects",
              ],
              [
                "02",
                "CONNECT",
                "Your skills. Their next step.",
                "Find the people who bring a different perspective—and the piece you didn’t have.",
                "/discover",
                "Find a team",
              ],
              [
                "03",
                "BUILD",
                "Something you can point to.",
                "Give your idea a starting point. Leave room for someone else to make it better.",
                "/create",
                "Share an idea",
              ],
            ].map(([number, title, lead, copy, route, action], i) => (
              <Reveal key={title} delay={i * 0.09}>
                <motion.div
                  className="possibility-panel"
                  whileHover={reduced ? undefined : { y: -8 }}
                >
                  <div className="panel-index">
                    <span>{number}</span>
                    <span aria-hidden="true">↗</span>
                  </div>
                  <div className={`panel-orbit orbit-${i}`} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <h3>{title}</h3>
                  <strong>{lead}</strong>
                  <p>{copy}</p>
                  <Link className="text-link" to={route}>
                    {action} <span aria-hidden="true">↗</span>
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="project-wall-section">
        <div className="landing-section-inner">
          <Reveal>
            <div className="wall-heading">
              <div>
                <p className="landing-label">
                  04 / AN ECOSYSTEM OF POSSIBILITIES
                </p>
                <h2>
                  Small starts.
                  <br />
                  <em>Unreasonably big potential.</em>
                </h2>
              </div>
              <p>
                Five fictional projects.
                <br />
                Different skills. Shared ambition.
              </p>
            </div>
          </Reveal>
          <div className="project-wall">
            {demoOpportunities.map((item, i) => (
              <Reveal
                key={item.id}
                className={`wall-slot wall-slot-${i}`}
                delay={i * 0.045}
              >
                <Tilt className={`wall-card wall-tone-${i}`}>
                  <div className="wall-card-top">
                    <span>
                      {item.type} / {String(i + 1).padStart(3, "0")}
                    </span>
                    <span aria-hidden="true">↗</span>
                  </div>
                  <div className="wall-art" aria-hidden="true">
                    {["↗", "✳", "◈", "◎", "≈"][i]}
                    <span>{item.field}</span>
                  </div>
                  <h3>
                    <Link to={`/projects/${item.id}`}>{item.name}</Link>
                  </h3>
                  <p>{item.shortDescription}</p>
                  <div className="wall-skills">
                    {item.skillsNeeded.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  <Link className="wall-link" to={`/projects/${item.id}`}>
                    Meet the idea <span aria-hidden="true">↗</span>
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </div>
          <Link className="button scene-button" to="/discover">
            Enter the ecosystem <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="connection-story">
        <div className="landing-section-inner">
          <Reveal>
            <p className="landing-label">05 / THAT'S HOW IT STARTS</p>
            <h2>
              The right person.
              <br />
              <em>A whole new possibility.</em>
            </h2>
            <p className="connection-intro">
              A fictional connection. A very real kind of possibility.
            </p>
          </Reveal>
          <div className="connection-example">
            <Reveal className="example-person">
              <span className="example-avatar">MC</span>
              <span className="landing-label">STUDENT / ROBOTICS</span>
              <h3>Maya Chen</h3>
              <p>
                Curious about the world.
                <br />
                Ready to build for it.
              </p>
            </Reveal>
            <div className="skills-bridge">
              <svg
                aria-hidden="true"
                viewBox="0 0 400 240"
                preserveAspectRatio="none"
              >
                {[45, 120, 195].map((y, i) => (
                  <motion.path
                    key={y}
                    d={`M 0 120 C 90 120 90 ${y} 200 ${y} S 300 120 400 120`}
                    fill="none"
                    stroke="#66927a"
                    strokeWidth="1"
                    initial={reduced ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: reduced ? 0 : 1,
                      delay: reduced ? 0 : i * 0.15,
                    }}
                  />
                ))}
              </svg>
              <div>
                {["Python", "CAD", "Electronics"].map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
            <Reveal className="example-project">
              <span className="landing-label">PROJECT / FICTIONAL EXAMPLE</span>
              <h3>
                Clean Water
                <br />
                Sensor
              </h3>
              <p>An idea finds its missing skills.</p>
              <span className="connection-status">● CONNECTION MADE</span>
            </Reveal>
          </div>
          <Reveal className="second-connection">
            <span className="example-avatar">AR</span>
            <p>
              <strong>Alex joins with design + storytelling.</strong>
              <br />
              One connection becomes a team.
            </p>
            <span aria-hidden="true">↗</span>
          </Reveal>
        </div>
      </section>
      <section className="network-final">
        <div className="cta-orbits" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <Reveal>
          <p className="landing-label">
            YOUR NEXT CHAPTER IS A CONNECTION AWAY.
          </p>
          <h2>Don't build alone.</h2>
          <Link className="huge-cta" to="/discover">
            LINK UP <span aria-hidden="true">↗</span>
          </Link>
          <p>Someone out there is building what you're looking for.</p>
        </Reveal>
      </section>
    </>
  );
}
