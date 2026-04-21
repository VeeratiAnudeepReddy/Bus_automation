export default function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-200/70 ${className}`} />;
}

