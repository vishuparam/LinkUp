import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const assets = "/assets/linkup-hero/";

// The video is a finite camera move. Scroll seeks it forward AND backward; it never loops.
export function LandingExperience() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef(0);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [compact, setCompact] = useState(
    () => matchMedia("(max-width: 900px)").matches,
  );
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const simple = compact || !!reduced;
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 95, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 95, damping: 24 });
  useEffect(() => {
    const query = matchMedia("(max-width: 900px)");
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(motionQuery.matches);
    motionQuery.addEventListener("change", updateMotion);
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);
  useEffect(() => {
    if (simple) {
      x.set(0);
      y.set(0);
      return;
    }
    let frame = 0;
    const seek = () => {
      const media = video.current;
      if (document.hidden || !media || media.readyState < 1 || media.seeking)
        return;
      const time = Math.min(
        media.duration - 0.04,
        progress.current * media.duration,
      );
      if (Number.isFinite(time) && Math.abs(media.currentTime - time) > 0.035)
        media.currentTime = time;
    };
    const requestSeek = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        seek();
      });
    };
    const media = video.current;
    media?.addEventListener("seeked", requestSeek);
    document.addEventListener("visibilitychange", requestSeek);
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress.current = self.progress;
            if (self.progress > 0.08) {
              x.set(0);
              y.set(0);
            }
            root.current?.setAttribute(
              "data-scroll-progress",
              self.progress.toFixed(3),
            );
            requestSeek();
          },
        },
      });
      timeline
        .to(".hero-copy", { opacity: 0, y: -35, duration: 0.25 })
        .to(
          ".portal-window",
          {
            left: "4.45%",
            top: "13%",
            width: "91.1%",
            height: "79%",
            borderRadius: 40,
            duration: 0.45,
          },
          0,
        )
        .to(".portal-media", { height: "118%", right: "4%", duration: 0.45 }, 0)
        .to(".portal-shade", { opacity: 1, duration: 0.3 }, 0.15)
        .to(".transition-copy", { autoAlpha: 1, y: 0, duration: 0.25 }, 0.25)
        .to(
          ".portal-stage",
          { backgroundColor: "#f5f5ef", duration: 0.2 },
          0.78,
        )
        .to(
          [".portal-window", ".transition-copy", ".hero-baseline"],
          { autoAlpha: 0, duration: 0.2 },
          0.78,
        );
    }, root);
    requestSeek();
    return () => {
      context.revert();
      cancelAnimationFrame(frame);
      media?.removeEventListener("seeked", requestSeek);
      document.removeEventListener("visibilitychange", requestSeek);
    };
  }, [simple, ready, x, y]);
  return (
    <section
      ref={root}
      className={`portal-experience ${simple ? "portal-simple" : ""}`}
      aria-label="LinkUp introduction"
    >
      <div className="portal-stage">
        <div className="hero-copy">
          <p className="portal-eyebrow">FOR STUDENTS. BY STUDENTS.</p>
          <h1>
            {["YOUR IDEA IS", "BIGGER THAN", "YOUR NETWORK."].map((line, i) => (
              <span className="headline-mask" key={line}>
                <motion.span
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.7,
                    delay: reduced ? 0 : i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <p className="hero-support">
            Find the people, skills, and mentorship
            <br className="desktop-break" /> your idea is missing.
          </p>
          <Link className="portal-cta" to="/discover">
            EXPLORE LINKUP
          </Link>
        </div>
        <div className="portal-window">
          <motion.div
            className="portal-media"
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            onPointerMove={(event) => {
              if (
                simple ||
                event.pointerType !== "mouse" ||
                progress.current > 0.08
              )
                return;
              const box = event.currentTarget.getBoundingClientRect();
              x.set(
                Math.max(
                  -6,
                  Math.min(
                    6,
                    (-(event.clientY - box.top - box.height / 2) / box.height) *
                      12,
                  ),
                ),
              );
              y.set(
                Math.max(
                  -6,
                  Math.min(
                    6,
                    ((event.clientX - box.left - box.width / 2) / box.width) *
                      12,
                  ),
                ),
              );
            }}
            onPointerLeave={() => {
              x.set(0);
              y.set(0);
            }}
          >
            {simple || failed ? (
              <img
                className="portal-poster"
                src={`${assets}linkup-portal-motion-poster.jpg`}
                alt="An emerald-lit architectural doorway"
              />
            ) : (
              <video
                ref={video}
                muted
                playsInline
                preload="auto"
                poster={`${assets}linkup-portal-motion-poster.jpg`}
                aria-label="Emerald doorway camera journey controlled by scrolling"
                onLoadedMetadata={() => setReady(true)}
                onError={() => setFailed(true)}
              >
                <source
                  src={`${assets}linkup-portal-motion.mp4`}
                  type="video/mp4"
                  onError={() => setFailed(true)}
                />
              </video>
            )}
          </motion.div>
          <div className="portal-shade" />
        </div>
        <div className="transition-copy">
          <p className="portal-eyebrow">THE NEXT STEP IS TOGETHER</p>
          <h2>
            Big ideas.
            <br />
            Right people.
          </h2>
          <p>A collaborator. A mentor. A place to begin.</p>
        </div>
        <div className="hero-baseline">
          <span>Ideas need people.</span>
          <span>SCROLL TO CONNECT</span>
        </div>
      </div>
    </section>
  );
}
