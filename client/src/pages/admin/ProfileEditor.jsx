import { useEffect, useState } from "react";
import { api } from "../../api.js";
import Field from "../../components/admin/Field.jsx";
import UploadField from "../../components/admin/UploadField.jsx";

const ABOUT_TEMPLATE = `## My story
How you got into data, in a few sentences.

## What I do
The kinds of problems you like working on, and the tools you use.

## Education and experience
- Degree or course, institution, year
- Role, organisation, what you did

## What I'm learning now
- Python
- Advanced DAX

## Outside work
A line or two about you.
`;

const EMPTY = {
    full_name: "",
    headline: "",
    bio: "",
    about_md: "",
    location: "",
    email: "",
    avatar_url: "",
    linkedin_url: "",
    github_url: "",
    resume_url: "",
};

export default function ProfileEditor() {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api
            .profile()
            .then((p) => {
                const clean = { ...EMPTY };
                for (const key of Object.keys(EMPTY)) clean[key] = p?.[key] ?? "";
                setForm(clean);
            })
            .catch(() => setForm(EMPTY));
    }, []);

    if (!form) return <p className="muted">Loading…</p>;

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setMsg("");
        try {
            await api.saveProfile(form);
            setMsg("Saved ✓");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <section>
            <h1>Profile</h1>
            <form onSubmit={save} className="panel">
                <UploadField
                    label="Profile picture"
                    value={form.avatar_url}
                    onChange={setValue("avatar_url")}
                    hint="A square photo works best (JPG, PNG or WebP, up to 4MB)."
                />

                <Field label="Full name">
                    <input value={form.full_name} onChange={set("full_name")} required maxLength={120} />
                </Field>

                <Field label="Headline" hint="e.g. Data Analyst | Power BI | SQL">
                    <input value={form.headline} onChange={set("headline")} maxLength={200} />
                </Field>

                <Field label="Short bio" hint="Shown on the home page. One or two sentences.">
                    <textarea rows={3} value={form.bio} onChange={set("bio")} maxLength={4000} />
                </Field>
                <Field
                    label="About page"
                    hint="Your full story, in Markdown: ## for headings, - for bullet points. Leave empty to show the short bio instead."
                >
                    <textarea
                        rows={14}
                        value={form.about_md}
                        onChange={set("about_md")}
                        className="mono"
                        maxLength={20000}
                    />
                    {!form.about_md && (
                        <button
                            type="button"
                            className="link-btn"
                            onClick={() => setForm((f) => ({ ...f, about_md: ABOUT_TEMPLATE }))}
                        >
                            Insert template
                        </button>
                    )}
                </Field>

                <Field label="Location">
                    <input value={form.location} onChange={set("location")} maxLength={120} />
                </Field>

                <Field label="Contact email">
                    <input type="email" value={form.email} onChange={set("email")} />
                </Field>

                <Field label="LinkedIn URL">
                    <input type="url" value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/..." />
                </Field>

                <Field label="GitHub URL">
                    <input type="url" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/..." />
                </Field>

                <UploadField
                    label="Résumé (PDF)"
                    value={form.resume_url}
                    onChange={setValue("resume_url")}
                    accept="application/pdf"
                    isImage={false}
                />

                {error && <p className="error">{error}</p>}
                {msg && <p className="success">{msg}</p>}

                <button className="btn" disabled={saving}>
                    {saving ? "Saving…" : "Save profile"}
                </button>
            </form>
        </section>
    );
}