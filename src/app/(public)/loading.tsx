export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-48 animate-shimmer rounded-lg" />
        <div className="h-12 w-full animate-shimmer rounded-lg" />
        <div className="h-4 w-3/4 animate-shimmer rounded-lg" />
        <div className="h-64 w-full animate-shimmer rounded-xl" />
      </div>
    </div>
  );
}
