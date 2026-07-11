export default function AdminLoading() {
  return (
    <div className="p-6">
      <div className="mb-8 h-8 w-48 animate-shimmer rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-shimmer rounded-xl" />
        ))}
      </div>
    </div>
  );
}
