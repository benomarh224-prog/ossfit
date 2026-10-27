export default function Loading() {
  return <main role="status" aria-label="Loading your coaching space" className="mx-auto max-w-7xl animate-pulse px-6 py-28">
    <div className="h-4 w-40 rounded bg-primary/20" /><div className="mt-7 h-14 max-w-xl rounded bg-muted" /><div className="mt-3 h-14 max-w-md rounded bg-muted" />
    <div className="mt-7 h-5 max-w-lg rounded bg-muted" /><div className="mt-3 h-5 max-w-sm rounded bg-muted" /><div className="mt-10 h-11 w-48 rounded bg-primary/20" />
    <span className="sr-only">Loading…</span>
  </main>;
}
