"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "Authentication failed. Please try again."
      : null,
  );

  const supabase = useMemo(() => createClient(), []);

  async function handleEmailAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setMessage("Check your email to confirm your account, then sign in.");
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-border-soft bg-panel/90 p-8 shadow-[0_12px_40px_rgba(92,107,82,0.08)] backdrop-blur-sm">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-soil-muted">
          Pompom
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-soil">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-soil-muted">
          {mode === "login"
            ? "Sign in to tend your garden and tasks."
            : "Start growing your productivity garden."}
        </p>
      </div>

      <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-soil-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-border-soft bg-cream px-3 py-2.5 text-sm text-soil outline-none placeholder:text-soil-muted/70 focus:border-sage"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-soil-muted">Password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-border-soft bg-cream px-3 py-2.5 text-sm text-soil outline-none placeholder:text-soil-muted/70 focus:border-sage"
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl bg-mist px-3 py-2 text-sm text-moss-deep">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-xl bg-moss px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-moss-deep disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-soil-muted">
        {mode === "login" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
            setMessage(null);
          }}
          className="font-medium text-moss-deep underline-offset-2 hover:underline"
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
