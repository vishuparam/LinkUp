import { PageContainer } from "../components/PageContainer";

// Owned by the teammate working on the mentor-match branch.
export function MentorMatch() {
  return (
    <PageContainer
      title="Mentor Match"
      description="A little guidance can unlock a big idea."
    >
      <div className="panel placeholder">
        <span className="placeholder-symbol" aria-hidden="true">
          ✳
        </span>
        <p className="eyebrow mb-3">A NEW CONNECTION, COMING SOON</p>
        <h2 className="text-2xl font-semibold">
          Big questions. A little guidance.
        </h2>
        <p className="mt-4 leading-relaxed text-stone-600">
          A future space to connect with mentors. This page is a placeholder.
        </p>
      </div>
    </PageContainer>
  );
}
