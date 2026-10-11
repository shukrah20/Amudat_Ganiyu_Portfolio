function toEmbedUrl(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id && /^[\w-]{6,20}$/.test(id)) {
        return `https://www.youtube-nocookie.com/embed/${id}`;
      }
    }

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (/^[\w-]{6,20}$/.test(id)) {
        return `https://www.youtube-nocookie.com/embed/${id}`;
      }
    }

    if (host === "loom.com") {
      const m = u.pathname.match(/^\/(?:share|embed)\/([\w-]+)/);
      if (m) return `https://www.loom.com/embed/${m[1]}`;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export default function VideoEmbed({ url, title }) {
  const src = toEmbedUrl(url);

  if (!src) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-accent-ink underline">
        Watch the walkthrough
      </a>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-card">
      <iframe
        src={src}
        title={`${title} (video walkthrough)`}
        loading="lazy"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}