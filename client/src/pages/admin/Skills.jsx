import { useEffect, useState } from "react";
import { api } from "../../api.js";

export default function Skills() {
  const [groups, setGroups] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    api.skills().then(setGroups).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      await api.addSkill({ name, category });
      setName("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(skill) {
    try {
      await api.deleteSkill(skill.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const categories = groups ? Object.keys(groups) : [];

  return (
    <section>
      <h1>Skills</h1>

      <form onSubmit={add} className="panel inline-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Skill, e.g. DAX"
          required
          maxLength={60}
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category, e.g. BI Tools"
          list="skill-categories"
          required
          maxLength={60}
        />
        <datalist id="skill-categories">
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>
        <button className="btn btn-sm">Add skill</button>
      </form>

      {error && <p className="error">{error}</p>}
      {!groups && !error && <p className="muted">Loading…</p>}

      {groups &&
        Object.entries(groups).map(([cat, items]) => (
          <div key={cat} className="skill-group">
            <h4>{cat}</h4>
            <div className="chips">
              {items.map((s) => (
                <span key={s.id} className="chip">
                  {s.name}
                  <button className="chip-x" onClick={() => remove(s)} aria-label={`Remove ${s.name}`}>×</button>
                </span>
              ))}
            </div>
          </div>
        ))}
    </section>
  );
}