import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";

export default function ProjectsList() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminProjects().then(setItems).catch((e) => setError(e.message));
  }, []);

  async function move(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next); // update the screen first, then save
    try {
      await api.reorderProjects(next.map((p) => p.id));
    } catch (e) {
      setError(e.message);
      setItems(items); // put it back if saving failed
    }
  }

  async function toggleStatus(p) {
    const status = p.status === "published" ? "draft" : "published";
    try {
      const full = await api.adminProject(p.id);
      await api.updateProject(p.id, { ...full, status });
      setItems((list) => list.map((x) => (x.id === p.id ? { ...x, status } : x)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try {
      await api.deleteProject(p.id);
      setItems((list) => list.filter((x) => x.id !== p.id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="row-between">
        <h1>Projects</h1>
        <Link to="/admin/projects/new" className="btn">+ New project</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!items && !error && <p className="muted">Loading…</p>}

      {items && (
        <ul className="admin-list">
          {items.map((p, i) => (
            <li key={p.id} className="panel admin-row">
              <div className="order-btns">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
              </div>

              <div className="admin-row-main">
                <strong>{p.title}</strong>
                <span className={`badge ${p.status}`}>{p.status}</span>
                <div className="muted">{p.tools.join(" · ")}</div>
              </div>

              <div className="admin-row-actions">
                <Link to={`/admin/projects/${p.id}`} className="btn btn-outline btn-sm">Edit</Link>
                <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(p)}>
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button className="link-btn danger" onClick={() => remove(p)}>Delete</button>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="muted">No projects yet. Add your first one.</li>}
        </ul>
      )}
    </section>
  );
}