import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import { fillCrop } from "../images.js";
import Status from "../components/Status.jsx";

const h2 = "font-display text-2xl font-semibold tracking-tight";

export default function About() {
  const profile = useFetch(api.profile, []);
  const skills = useFetch(api.skills, []);

  if (profile.loading || profile.error) {
    return <Status loading={profile.loading} error={profile.error} />;
  }

  const p = profile.data;
  if (!p) {
    return <p className="py-16 text-muted">No profile yet. Add one in the admin area.</p>;
  }

  const story = p.about_md || p.bio;

  return (
    <div className="py-12 md:py-16">
      <section className="grid gap-10 md:grid-cols-[18rem_1fr] md:gap-14">
        {p.avatar_url && (
          <img
            src={fillCrop(p.avatar_url, 720, 900)}
            alt={p.full_name}
            className="aspect-[4/5] w-full max-w-[18rem] rounded-lg object-cover ring-1 ring-line"
          />
        )}

        <div className={p.avatar_url ? "" : "md:col-span-2"}>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">About me</h1>
          <p className="mt-3 text-xl text-muted">{p.headline}</p>
          {p.location && <p className="mt-1 text-sm text-muted">{p.location}</p>}

          {story && (
            <div className="prose mt-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{story}</ReactMarkdown>
            </div>
          )}
        </div>
      </section>

      <section className="mt-20">
        <h2 className={h2}>Skills</h2>
        <Status loading={skills.loading} error={skills.error} />
        {skills.data && (
          <dl className="mt-6 border-b border-line">
            {Object.entries(skills.data).map(([category, items]) => (
              <div
                key={category}
                className="grid gap-1 border-t border-line py-4 sm:grid-cols-[11rem_1fr] sm:gap-8"
              >
                <dt className="font-medium">{category}</dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-1 text-muted">
                  {items.map((s) => (
                    <span key={s.id}>{s.name}</span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-20">
        <h2 className={h2}>Get in touch</h2>
        <p className="mt-3 max-w-prose text-muted">
          The best way to reach me is by email. I read every message.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {p.email && (
            <a href={`mailto:${p.email}`} className="cta">Email me</a>
          )}
          {p.linkedin_url && (
            <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="cta-quiet">LinkedIn</a>
          )}
          {p.github_url && (
            <a href={p.github_url} target="_blank" rel="noreferrer" className="cta-quiet">GitHub</a>
          )}
          {p.resume_url && (
            <a href={p.resume_url} target="_blank" rel="noreferrer" className="cta-quiet">Download résumé</a>
          )}
        </div>
      </section>
    </div>
  );
}