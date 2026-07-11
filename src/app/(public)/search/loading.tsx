export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <div className="h-10 w-32 animate-shimmer rounded-lg" />
        <div className="h-4 w-64 animate-shimmer rounded-lg" />
      </div>
      <div className="h-32 animate-shimmer rounded-xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-shimmer rounded-xl" />
        ))}
      </div>
    </div>
  );
}
