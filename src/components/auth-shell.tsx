interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Shared visual shell for every auth page (login, forgot-password,
 * reset-password, verify-otp) — centered card, wordmark, a subtle decorative
 * shape behind it. Purely presentational: no form logic lives here, each
 * page keeps its own state/handlers exactly as before.
 */
export function AuthShell({ title, children }: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 size-[380px] rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative w-full max-w-sm rounded-xl bg-card p-8 shadow-sm ring-1 ring-foreground/5">
        <div className="mb-6 space-y-1 text-center">
          <p className="text-xs font-semibold tracking-wide text-accent-foreground uppercase">Hello Linden</p>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
