import { useEffect, useState } from "react";

export default function Gallery({ images }) {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpen(i)}
            className="group cursor-zoom-in overflow-hidden rounded-lg border border-line bg-card text-left transition-colors hover:border-ink/40"
          >
            <img
              src={m.url}
              alt={m.caption || "Dashboard screenshot"}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover object-top"
            />
            {m.caption && <span className="block p-3 text-sm text-muted">{m.caption}</span>}
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center bg-black/85 p-6"
        >
          <img
            src={images[open].url}
            alt={images[open].caption || "Dashboard screenshot"}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-full cursor-default rounded-md"
          />
          {images[open].caption && (
            <p className="mt-4 text-center text-sm text-white/85">{images[open].caption}</p>
          )}
        </div>
      )}
    </>
  );
}