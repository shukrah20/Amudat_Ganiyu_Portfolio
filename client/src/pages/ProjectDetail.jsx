import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../api.js";
import { useFetch } from "../useFetch.js";
import Status from "../components/Status.jsx";
import PowerBIEmbed from "../components/PowerBIEmbed.jsx";
import VideoEmbed from "../components/VideoEmbed.jsx";
import Gallery from "../components/Gallery.jsx";
import NotFound from "./NotFound.jsx";

const h2 = "font-display text-2xl font-semibold tracking-tight";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, loading, error } = useFetch(() => api.project(slug), [slug]);

  if (error?.status === 404) return <NotFound />;
  if (loading || error) return <Status loading={loading} error={error} />;

  const images = project.media.filter((m) => m.kind === "image");
  const videos = project.media.filter((m) => m.kind === "video");
  const snippets = project.media.filter((m) => m.kind === "sql");
  const links = project.media.filter((m) => m.kind === "link");

  const hasShowcase = project.report_embed_url || videos.length > 0 || images.length > 0;

  return (
    <article className="py-12 md:py-16">
      <Link to="/projects" className="text-sm text-muted hover:text-ink">
        Back to projects
      </Link>

      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-4 max-w-2xl text-xl text-muted">{project.summary}</p>
      <p className="mt-4 text-sm text-ink/80">{project.tools.join(", ")}</p>

      {hasShowcase && (
        <section className="mt-12">
          <h2 className={h2}>Visuals</h2>
          <div className="mt-5 space-y-6">
            {project.report_embed_url && (
              <PowerBIEmbed url={project.report_embed_url} title={project.title} />
            )}
            {videos.map((v) => (
              <figure key={v.id}>
                <VideoEmbed url={v.url} title={project.title} />
                {v.caption && <figcaption className="mt-2 text-sm text-muted">{v.caption}</figcaption>}
              </figure>
            ))}
            <Gallery images={images} />
          </div>
        </section>
      )}

      {project.body_md && (
        <section className="prose mt-12 prose-img:rounded-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.body_md}</ReactMarkdown>
        </section>
      )}

      {snippets.length > 0 && (
        <section className="mt-12">
          <h2 className={h2}>SQL</h2>
          <div className="mt-5 space-y-6">
            {snippets.map((s) => (
              <figure key={s.id}>
                <pre className="overflow-x-auto rounded-lg bg-[#0B1220] p-4 text-sm leading-relaxed text-[#E8EDF6]">
                  <code>{s.content}</code>
                </pre>
                {s.caption && <figcaption className="mt-2 text-sm text-muted">{s.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {(links.length > 0 || project.repo_url) && (
        <section className="mt-12">
          <h2 className={h2}>Files and code</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noreferrer" className="cta">
                View project on GitHub
              </a>
            )}
            {links.map((l) => (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="cta-quiet">
                {l.caption || "Open link"}
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}