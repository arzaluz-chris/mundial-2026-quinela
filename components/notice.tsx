export function Notice({
  message,
  error
}: {
  message?: string | null;
  error?: string | null;
}) {
  if (!message && !error) return null;

  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        error
          ? "border-coral/40 bg-coral/10 text-red-900"
          : "border-pitch/30 bg-pitch/10 text-emerald-950"
      }`}
    >
      {error || message}
    </div>
  );
}
