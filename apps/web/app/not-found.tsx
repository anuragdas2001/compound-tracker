import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-full bg-[var(--c-primary)]/10 px-4 py-1 text-sm font-semibold text-[var(--c-primary)]">
        404 Not Found
      </div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base text-[var(--c-muted)]">
        The page you are looking for does not exist or has been moved. Keep your streak going on your dashboard.
      </p>
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="rounded-full bg-[var(--c-primary)] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

