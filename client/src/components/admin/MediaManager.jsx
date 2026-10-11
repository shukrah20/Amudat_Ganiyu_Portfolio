import { useState } from "react";
import { api } from "../../api.js";

export default function MediaManager({ projectId, items, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // "add something else" form
  const [kind, setKind] = useState("video");
  const [value, setValue] = useState("");
  const [caption, setCaption] = useState("");

  async function addImages(e) {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;

    setBusy(true);
    setError("");
    let next = items;
    try {
      for (const file of files) {
        if (file.size > 4 * 1024 * 1024) throw new Error(`${file.name} is larger than 4MB`);
        const { url } = await api.upload(file);
        const row = await api.addMedia(projectId, { kind: "image", url });
        next = [...next, row];
        onChange(next); // show each image as soon as it lands
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function addOther(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body =
        kind === "sql"
          ? { kind, content: value, caption }
          : { kind, url: value, caption };
      const row = await api.addMedia(projectId, body);
      onChange([...items, row]);
      setValue("");
      setCaption("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveCaption(item, newCaption) {
    if ((item.caption || "") === newCaption) return;
    try {
      const row = await api.updateMedia(item.id, {
        kind: item.kind,
        url: item.url,
        content: item.content,
        caption: newCaption,
      });
      onChange(items.map((i) => (i.id === row.id ? row : i)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(item) {
    if (!confirm("Remove this item?")) return;
    try {
      await api.deleteMedia(item.id);
      onChange(items.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel">
      <h2>Screenshots, videos and links</h2>

      <ul className="media-list">
        {items.map((item) => (
          <li key={item.id} className="media-row">
            <div className="media-thumb">
              {item.kind === "image" && <img src={item.url} alt="" />}
              {item.kind === "video" && <span className="chip">Video</span>}
              {item.kind === "link" && <span className="chip">Link</span>}
              {item.kind === "sql" && <span className="chip">SQL</span>}
            </div>

            <div className="media-info">
              {item.kind === "sql" ? (
                <code className="muted">{item.content.slice(0, 80)}…</code>
              ) : item.kind !== "image" ? (
                <span className="muted media-url">{item.url}</span>
              ) : null}
              <input
                key={item.id + (item.caption || "")}
                defaultValue={item.caption || ""}
                placeholder="Caption (say what the viewer should notice)"
                onBlur={(e) => saveCaption(item, e.target.value)}
              />
            </div>

            <button className="link-btn danger" onClick={() => remove(item)}>
              Remove
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="muted">Nothing added yet.</li>}
      </ul>

      <div className="upload-actions">
        <label className="btn btn-sm">
          {busy ? "Working…" : "Upload screenshots"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={addImages}
            disabled={busy}
            hidden
          />
        </label>
      </div>

      <form onSubmit={addOther} className="media-add">
        <h3>Add a video, link or SQL snippet</h3>
        <select value={kind} onChange={(e) => { setKind(e.target.value); setValue(""); }}>
          <option value="video">Video (YouTube or Loom link)</option>
          <option value="link">Link (e.g. GitHub .pbix download)</option>
          <option value="sql">SQL snippet</option>
        </select>

        {kind === "sql" ? (
          <textarea
            rows={5}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="SELECT ..."
            required
          />
        ) : (
          <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://..."
            required
          />
        )}

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
        />
        <button className="btn btn-outline btn-sm" disabled={busy}>Add</button>
      </form>

      {error && <p className="error">{error}</p>}
    </section>
  );
}