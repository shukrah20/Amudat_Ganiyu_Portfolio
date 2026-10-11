export default function PowerBIEmbed({ url, title }) {
  if (!url) return null;

  // Only embed links that really come from Power BI
  if (!url.startsWith("https://app.powerbi.com/")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-accent-ink underline">
        Open the report
      </a>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-card">
      <iframe
        src={url}
        title={`${title} (Power BI report)`}
        loading="lazy"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}