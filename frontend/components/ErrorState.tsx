export default function ErrorState({ title = 'Something went wrong', onRetry }: { title?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-medium">{title}</p>
      {onRetry ? <button onClick={onRetry} className="mt-3 rounded-xl bg-red-900 px-3 py-2 text-white">Retry</button> : null}
    </div>
  );
}
