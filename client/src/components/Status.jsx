export default function Status({ loading, error }) {
  if (loading) return <p className="py-16 text-muted">Loading…</p>;
  if (error) {
    return (
      <p className="py-16 text-red-700 dark:text-red-400">
        This page didn't load. Refresh to try again.
      </p>
    );
  }
  return null;
}