import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Status from "../components/Status.jsx";
import ProjectRow from "../components/ProjectRow.jsx";

export default function Projects() {
  const { data, loading, error } = useFetch(api.projects, []);
  const [params, setParams] = useSearchParams();
  const active = params.get("tool");

  const allTools = useMemo(() => {
    const set = new Set();
    data?.forEach((p) => p.tools.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [data]);

  const visible = active ? data?.filter((p) => p.tools.includes(active)) : data;

  const pick = (tool) => setParams(tool ? { tool } : {});
  const tab = (isActive) =>
    `border-b-2 py-1 text-sm font-medium transition-colors ${
      isActive ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
    }`;

  return (
    <section className="py-12 md:py-16">
      <h1 className="font-display text-4xl font-bold tracking-tight">Projects</h1>
      <Status loading={loading} error={error} />

      {data && (
        <>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2" role="group" aria-label="Filter by tool">
            <button type="button" className={tab(!active)} aria-pressed={!active} onClick={() => pick(null)}>
              All
            </button>
            {allTools.map((t) => (
              <button
                key={t}
                type="button"
                className={tab(active === t)}
                aria-pressed={active === t}
                onClick={() => pick(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <ul className="mt-8 border-b border-line">
            {visible.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </ul>

          {visible.length === 0 && <p className="mt-6 text-muted">No projects use {active} yet.</p>}
        </>
      )}
    </section>
  );
}