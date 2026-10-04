import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NetworkFallback } from "./NetworkFallback";
import type { SceneControls } from "./NetworkScene";
import { demoOpportunities } from "../../data/demo";
const NetworkScene = lazy(() => import("./NetworkScene"));
gsap.registerPlugin(ScrollTrigger);

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function LandingExperience() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const controls = useRef<SceneControls>({
    progress: 0,
    pointerX: 0,
    pointerY: 0,
  });
  const reduced = useReducedMotion();
  const [compact, setCompact] = useState(
    () => matchMedia("(max-width: 767px)").matches,
  );
  const [webgl, setWebgl] = useState(supportsWebGL);
  const [active, setActive] = useState(true);
  const simple = compact || !!reduced;
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setActive(entry.isIntersecting),
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!root.current || !stage.current) return;
    controls.current.progress = simple ? 0.55 : 0;
    const context = gsap.context(() => {
      if (simple) return;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + window.innerHeight * 2.6,
          pin: stage.current,
          pinSpacing: true,
          scrub: 0.35,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          controls.current.progress = timeline.progress();
          if (stage.current)
            stage.current.dataset.progress = timeline.progress().toFixed(3);
        },
      });
      timeline
        .to(".entry-copy", { autoAlpha: 0, y: -45, duration: 0.18 }, 0.04)
        .fromTo(
          ".connection-copy",
          { autoAlpha: 0, y: 35 },
          { autoAlpha: 1, y: 0, duration: 0.14 },
          0.2,
        )
        .fromTo(
          ".network-role",
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, stagger: 0.03, duration: 0.14 },
          0.28,
        )
        .to(".connection-copy", { autoAlpha: 0, y: -35, duration: 0.12 }, 0.61)
        .to(".network-role", { autoAlpha: 0, duration: 0.1 }, 0.67)
        .fromTo(
          ".bridge-copy",
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.14 },
          0.72,
        )
        .fromTo(
          ".bridge-card",
          { autoAlpha: 0, y: 100, scale: 0.65, rotate: -8 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            stagger: 0.035,
            duration: 0.17,
          },
          0.76,
        )
        .to(".network-canvas", { opacity: 0.24, duration: 0.2 }, 0.8)
        .to({}, { duration: 0.02 }, 0.98);
    }, root);
    return () => context.revert();
  }, [simple]);
  return (
    <section
      ref={root}
      className={`network-experience ${simple ? "simple-experience" : ""}`}
      aria-label="A network coming to life"
    >
      <div
        ref={stage}
        className="network-stage"
        data-progress="0"
        onPointerMove={(event) => {
          if (simple || event.pointerType !== "mouse") return;
          const box = event.currentTarget.getBoundingClientRect();
          controls.current.pointerX = (event.clientX / box.width - 0.5) * 2;
          controls.current.pointerY =
            ((event.clientY - box.top) / box.height - 0.5) * 2;
        }}
        onPointerLeave={() => {
          controls.current.pointerX = 0;
          controls.current.pointerY = 0;
        }}
      >
        <div className="network-canvas" aria-hidden="true">
          {webgl && !reduced ? (
            <Suspense fallback={<NetworkFallback />}>
              <NetworkScene
                controls={controls}
                compact={compact}
                active={active}
                onFailure={() => setWebgl(false)}
              />
            </Suspense>
          ) : (
            <NetworkFallback />
          )}
        </div>
        <div className="scene-vignette" aria-hidden="true" />
        <div className="scene-topline">
          <span>LINKUP / STUDENT NETWORK</span>
          <span>IDEAS HAVE NO ZIP CODE.</span>
        </div>
        <div className="entry-copy">
          <p className="scene-kicker">
            THE NEXT CONNECTION CHANGES EVERYTHING.
          </p>
          <h1>
            {["Your idea is bigger", "than your network."].map((line, i) => (
              <span className="type-mask" key={line}>
                <motion.span
                  initial={reduced ? false : { y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.16,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <span className="type-mask extend-line">
            <motion.span
              initial={reduced ? false : { y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              Let's extend it.
            </motion.span>
          </span>
          <p className="scene-description">
            Find students with the skills your project is missing.
            <br />A place for high-school ideas to become real teams.
          </p>
          <div className="scene-actions">
            <Link className="button scene-button" to="/discover">
              Explore LinkUp <span aria-hidden="true">↗</span>
            </Link>
            <Link className="button scene-button-outline" to="/create">
              Share an Idea <span aria-hidden="true">+</span>
            </Link>
          </div>
        </div>
        <div className="connection-copy">
          <span className="scene-kicker">
            01 / ONE CONNECTION BECOMES A TEAM
          </span>
          <h2>
            You bring the idea.
            <br />
            <em>They bring the missing piece.</em>
          </h2>
        </div>
        <div className="network-roles" aria-hidden="true">
          {["Developer", "Designer", "Researcher", "Founder", "Mentor"].map(
            (role, i) => (
              <span key={role} className={`network-role role-${i}`}>
                <i />
                {role}
                <small>CONNECTED / 0{i + 1}</small>
              </span>
            ),
          )}
        </div>
        <div className="scene-annotations" aria-hidden="true">
          <span>
            STUDENT / 014
            <br />
            40.71° N / EVERYWHERE
          </span>
          <span>
            DESIGN + CODE
            <br />
            REMOTE / POSSIBLE
          </span>
        </div>
        <div className="product-bridge">
          <div className="bridge-copy">
            <p className="scene-kicker">02 / THE NETWORK BECOMES REAL</p>
            <h2>
              Not just connections.
              <br />
              <em>Something to build.</em>
            </h2>
          </div>
          <div className="bridge-cards">
            {demoOpportunities.slice(0, 3).map((item, i) => (
              <Link
                to={`/projects/${item.id}`}
                key={item.id}
                className={`bridge-card bridge-${i}`}
              >
                <span>{item.type} / OPEN IDEA</span>
                <h3>{item.name}</h3>
                <p>Needs: {item.rolesNeeded[0]}</p>
                <strong aria-hidden="true">↗</strong>
              </Link>
            ))}
          </div>
        </div>
        <div className="scene-bottom">
          <span>ONE STUDENT → ONE CONNECTION → AN ENTIRE TEAM</span>
          <a href="#landing-discover">
            {simple ? "Explore the possibilities" : "Scroll to connect"}{" "}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
