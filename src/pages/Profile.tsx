import { Link } from "react-router-dom";
import { PageContainer } from "../components/PageContainer";
import { Tag } from "../components/Tag";
import { OpportunityGrid } from "../components/OpportunityGrid";
import { useDemo } from "../context/DemoContext";
import { demoUser } from "../data/demo";
export function Profile() {
  const { opportunities } = useDemo();
  return (
    <PageContainer
      title="Your profile"
      description="A little about you. A lot of possibility."
    >
      <article className="profile-card">
        <div className="profile-banner" aria-hidden="true" />
        <div className="profile-content">
          <span className="avatar profile-avatar">AR</span>
          <div className="profile-columns">
            <div>
              <span className="eyebrow">DEMO PROFILE</span>
              <h2>{demoUser.name}</h2>
              <p>Grade {demoUser.grade} · Here to learn by doing</p>
              <p>{demoUser.bio}</p>
            </div>
            <div>
              <h3>WHAT I BRING</h3>
              <div className="flex flex-wrap gap-2">
                {demoUser.skills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
              <h3 className="mt-6">WHAT I'M CURIOUS ABOUT</h3>
              <div className="flex flex-wrap gap-2">
                {demoUser.interests.map((interest) => (
                  <Tag key={interest}>{interest}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
      <div className="profile-tools">
        <Link to="/saved">Saved opportunities</Link>
        <Link to="/your-projects">Your projects</Link>
      </div>
      <div className="results-heading">
        <h2 className="text-xl font-semibold text-stone-900">
          Things I'm building
        </h2>
      </div>
      <OpportunityGrid
        opportunities={opportunities.filter(
          (item) => item.creator.id === demoUser.id,
        )}
      />
    </PageContainer>
  );
}
