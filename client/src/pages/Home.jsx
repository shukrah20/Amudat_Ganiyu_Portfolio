import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Status from "../components/Status.jsx";
import ProjectRow from "../components/ProjectRow.jsx";
import ToolChart from "../components/ToolChart.jsx";

export default function Home() {
  const profile = useFetch(api.profile, []);
  const projects = useFetch(api.projects, []);

  if (profile.loading || profile.error) {
    return <Status loading={profile.loading} error={profile.error} />;
  }

  const p = profile.data;
  if (!p) {
    return <p className="py-16 text-muted">No profile yet. Add one in the admin area.</p>;
  }

  return (
    <>
      <section className="grid gap-10 py-10 md:grid-cols-[1.1fr_1fr] md:items-center md:py-14">
        <div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            {p.full_name}
          </h1>
          <p className="mt-4 text-xl">{p.headline}</p>
          <p className="mt-5 max-w-prose leading-relaxed text-muted">{p.bio}</p>
          {p.location && <p className="mt-3 text-sm text-muted">{p.location}</p>}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/projects" className="cta">View projects</Link>
            {p.resume_url && (
              <a href={p.resume_url} target="_blank" rel="noreferrer" className="cta-quiet">
                Download résumé
              </a>
            )}
            <Link to="/about" className="px-1 text-sm font-medium text-accent-ink hover:underline">
              About me
            </Link>
          </div>
        </div>

        {projects.data && <ToolChart projects={projects.data} />}
      </section>

      <section className="mt-8 md:mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Selected projects</h2>
          <Link to="/projects" className="text-sm font-medium text-accent-ink hover:underline">
            See all projects
          </Link>
        </div>
        <Status loading={projects.loading} error={projects.error} />
        {projects.data && (
          <ul className="mt-6 border-b border-line">
            {projects.data.slice(0, 3).map((proj) => (
              <ProjectRow key={proj.id} project={proj} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}