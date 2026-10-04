import { Link } from "react-router-dom";
import { Reveal } from "../Motion";
import { demoOpportunities } from "../../data/demo";

export function LandingSections() {
  const project = demoOpportunities[0];
  return (
    <section className="product-reveal" id="landing-discover">
      <div className="product-introduction">
        <Reveal>
          <p className="portal-eyebrow">
            TURN YOUR NEXT IDEA INTO SOMETHING REAL
          </p>
          <h2>
            Find your people.
            <br />
            Build your idea.
          </h2>
          <p>
            Discover student projects, bring your skills,
            <br className="desktop-break" /> and find the mentorship to move
            forward.
          </p>
          <Link className="portal-cta" to="/discover">
            DISCOVER PROJECTS
          </Link>
          <Link className="create-note" to="/create">
            Have an idea already? Create a project.
          </Link>
        </Reveal>
      </div>
      <Reveal className="featured-project">
        <article>
          <div className="featured-cover">
            <h3>{project.name}</h3>
            <p>
              A BETTER COMMUNITY,
              <br />
              BUILT TOGETHER.
            </p>
          </div>
          <div className="featured-details">
            <p className="portal-eyebrow">STUDENT PROJECT / RECRUITING</p>
            <h4>Grow something close to home.</h4>
            <p>{project.shortDescription}</p>
            <ul className="featured-skills" aria-label="Skills needed">
              {project.skillsNeeded.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
            <div className="featured-actions">
              <span>
                Looking for {project.rolesNeeded.length} collaborators
              </span>
              <Link className="portal-cta" to={`/projects/${project.id}`}>
                VIEW PROJECT
              </Link>
            </div>
          </div>
        </article>
        <p className="project-caption">FICTIONAL DEMO PROJECT</p>
      </Reveal>
      <div className="product-journey">
        {[
          ["Discover", "Find a project worth joining.", "/discover"],
          ["Create", "Give your idea a starting point.", "/create"],
          [
            "Mentor Match",
            "Guidance for the next step. Coming soon.",
            "/mentor-match",
          ],
          [
            "LinkedIn Export",
            "Show what you have built. Coming soon.",
            "/linkedin-export",
          ],
        ].map(([title, copy, route]) => (
          <Link to={route} key={title}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
