import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">This page doesn't exist or has moved.</p>
      <Link to="/" className="cta mt-8">Go to the home page</Link>
    </section>
  );
}