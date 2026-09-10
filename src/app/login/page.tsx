import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-cream px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,var(--sage-soft)_0%,transparent_50%),radial-gradient(ellipse_at_80%_90%,var(--mist)_0%,transparent_45%)]"
      />
      <div className="relative z-10 w-full">
        <Suspense
          fallback={
            <div className="mx-auto h-96 w-full max-w-md animate-pulse rounded-3xl bg-panel/60" />
          }
        >
          <div className="mx-auto flex justify-center">
            <AuthForm />
          </div>
        </Suspense>
      </div>
    </main>
  );
}
