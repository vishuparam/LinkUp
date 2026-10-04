import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
const Landing = lazy(() =>
  import("./pages/Landing").then((module) => ({ default: module.Landing })),
);
import { Discover } from "./pages/Discover";
import { Saved } from "./pages/Saved";
import { Create } from "./pages/Create";
import { YourProjects } from "./pages/YourProjects";
import { Profile } from "./pages/Profile";
import { ProjectDetails } from "./pages/ProjectDetails";
import { MentorMatch } from "./pages/MentorMatch";
import { LinkedInExport } from "./pages/LinkedInExport";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Suspense
              fallback={
                <div
                  style={{
                    minHeight: "100svh",
                    background: "#090e0c",
                    color: "#c4ecae",
                    padding: "160px 6%",
                  }}
                >
                  Connecting your next possibility…
                </div>
              }
            >
              <Landing />
            </Suspense>
          }
        />
        <Route path="discover" element={<Discover />} />
        <Route path="saved" element={<Saved />} />
        <Route path="create" element={<Create />} />
        <Route path="your-projects" element={<YourProjects />} />
        <Route path="profile" element={<Profile />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="mentor-match" element={<MentorMatch />} />
        <Route path="linkedin-export" element={<LinkedInExport />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
