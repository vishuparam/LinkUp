import { LandingExperience } from "../components/landing/LandingExperience";
import { LandingSections } from "../components/landing/LandingSections";
import "../components/landing/landing.css";

export function Landing() {
  return (
    <div className="cinematic-landing">
      <LandingExperience />
      <LandingSections />
    </div>
  );
}
