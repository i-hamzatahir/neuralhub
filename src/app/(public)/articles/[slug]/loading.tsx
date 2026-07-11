export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-4 w-24 animate-shimmer rounded" />
        <div className="mx-auto h-12 w-full max-w-2xl animate-shimmer rounded-lg" />
        <div className="mx-auto h-4 w-64 animate-shimmer rounded" />
      </div>
      <div className="mt-10 h-64 animate-shimmer rounded-xl" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 animate-shimmer rounded" />
        ))}
      </div>
    </div>
  );
}
