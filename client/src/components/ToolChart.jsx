import { Link } from "react-router-dom";

export default function ToolChart({ projects }) {
  // Count how many projects use each tool
  const counts = new Map();
  for (const p of projects) {
    for (const t of p.tools) counts.set(t, (counts.get(t) || 0) + 1);
  }

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);

  if (rows.length === 0) return null;
  const max = rows[0][1];

  return (
    <figure className="rounded-lg border border-line bg-card p-6">
      <figcaption className="font-display text-lg font-semibold tracking-tight">
        Tools across my projects
      </figcaption>
      <p className="mt-1 text-sm text-muted">Select a tool to see the projects that use it.</p>

      <ul className="mt-6 space-y-4">
        {rows.map(([tool, n], i) => (
          <li key={tool}>
            <Link to={`/projects?tool=${encodeURIComponent(tool)}`} className="group block">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium group-hover:underline">{tool}</span>
                <span className="tabular-nums text-muted">
                  {n} {n === 1 ? "project" : "projects"}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full rounded-sm bg-line/60" aria-hidden="true">
                <div
                  className="bar h-full rounded-sm bg-data group-hover:brightness-110"
                  style={{ width: `${(n / max) * 100}%`, "--i": i }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </figure>
  );
}