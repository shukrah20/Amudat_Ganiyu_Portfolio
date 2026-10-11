import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../api.js";
import Field from "../../components/admin/Field.jsx";
import UploadField from "../../components/admin/UploadField.jsx";
import MediaManager from "../../components/admin/MediaManager.jsx";

const EMPTY = {
  title: "",
  slug: "",
  summary: "",
  toolsText: "",
  body_md: "",
  report_embed_url: "",
  repo_url: "",
  cover_image_url: "",
  status: "draft",
};

const TEMPLATE = `## Business problem
What question or problem was this project trying to answer?

## Data
Where did the data come from? How big was it? Anything messy about it?

## Approach
How did you clean, model and analyse it? Mention the tools and key techniques.

## Key findings
- Finding 1
- Finding 2
- Finding 3

## What I learned
What would you do differently next time?
`;

export default function ProjectEditor() {
  const { id } = useParams(); // undefined on /admin/projects/new
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("write");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    api
      .adminProject(id)
      .then((p) => {
        setForm({
          title: p.title,
          slug: p.slug,
          summary: p.summary || "",
          toolsText: (p.tools || []).join(", "),
          body_md: p.body_md || "",
          report_embed_url: p.report_embed_url || "",
          repo_url: p.repo_url || "",
          cover_image_url: p.cover_image_url || "",
          status: p.status,
        });
        setMedia(p.media || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");

    const payload = {
      ...form,
      tools: form.toolsText.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (isNew) {
        const created = await api.createProject(payload);
        navigate(`/admin/projects/${created.id}`, { replace: true });
      } else {
        const updated = await api.updateProject(id, payload);
        setForm((f) => ({ ...f, slug: updated.slug }));
        setMsg("Saved ✓");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <section>
      <Link to="/admin/projects" className="muted">← All projects</Link>
      <h1>{isNew ? "New project" : "Edit project"}</h1>

      <form onSubmit={save} className="panel">
        <Field label="Title">
          <input value={form.title} onChange={set("title")} required maxLength={160} />
        </Field>

        <Field
          label="URL slug"
          hint={
            isNew
              ? "Leave empty to generate it from the title."
              : "Changing this changes the project's public web address."
          }
        >
          <input value={form.slug} onChange={set("slug")} placeholder="sales-dashboard" />
        </Field>

        <Field label="Short summary" hint="Shown on the project card. One or two sentences.">
          <textarea rows={2} value={form.summary} onChange={set("summary")} maxLength={500} />
        </Field>

        <Field label="Tools used" hint="Separate with commas: Power BI, SQL, Excel">
          <input value={form.toolsText} onChange={set("toolsText")} />
        </Field>

        <UploadField
          label="Cover image"
          value={form.cover_image_url}
          onChange={setValue("cover_image_url")}
          hint="Shown on the project card. A cropped dashboard screenshot works well."
        />

        <div className="field">
          <div className="row-between">
            <span className="field-label">Write-up (Markdown)</span>
            <div className="tabs">
              <button type="button" className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>Write</button>
              <button type="button" className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>Preview</button>
            </div>
          </div>

          {tab === "write" ? (
            <>
              <textarea
                rows={16}
                value={form.body_md}
                onChange={set("body_md")}
                className="mono"
                maxLength={50000}
              />
              {!form.body_md && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setForm((f) => ({ ...f, body_md: TEMPLATE }))}
                >
                  Insert case-study template
                </button>
              )}
              <small className="muted">
                Use ## for headings, - for bullet points, **bold** for emphasis.
              </small>
            </>
          ) : (
            <div className="md-preview preview">
              {form.body_md ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body_md}</ReactMarkdown>
              ) : (
                <p className="muted">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        <Field label="GitHub / repository link (optional)">
          <input type="url" value={form.repo_url} onChange={set("repo_url")} placeholder="https://github.com/..." />
        </Field>

        <Field
          label="Live Power BI link (optional)"
          hint="Only works if the report can be published publicly. Leave empty otherwise."
        >
          <input type="url" value={form.report_embed_url} onChange={set("report_embed_url")} placeholder="https://app.powerbi.com/..." />
        </Field>

        <Field label="Status" hint="Drafts are hidden from the public site.">
          <select value={form.status} onChange={set("status")}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (visible)</option>
          </select>
        </Field>

        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}

        <div className="row-between">
          <button className="btn" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create project" : "Save changes"}
          </button>
          {!isNew && form.status === "published" && (
            <Link to={`/projects/${form.slug}`} target="_blank">View on site ↗</Link>
          )}
        </div>
      </form>

      {isNew ? (
        <p className="muted">Save the project first, then you can add screenshots, videos and links.</p>
      ) : (
        <MediaManager projectId={id} items={media} onChange={setMedia} />
      )}
    </section>
  );
}