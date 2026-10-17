"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Account() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const menuRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
    });

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleSignOut() {
    setLoading(true);
    setError(null);
    setMenuOpen(false);

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      setLoading(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  async function handleDeleteAccount() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Could not delete account.");
      }

      await supabase.auth.signOut().catch(() => undefined);
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete account.");
      setLoading(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div ref={menuRef} className="relative z-30">
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border-soft bg-panel px-3 py-2.5 text-left shadow-[0_1px_0_rgba(92,107,82,0.04)] transition-all duration-200 hover:border-moss hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sm font-semibold text-moss-deep">
          {(email?.[0] ?? "P").toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-moss-deep">Profile</span>
          <span className="block truncate text-xs text-soil-muted">{email ?? "Signed in"}</span>
        </span>
        <span className={`text-soil-muted transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      <div
        role="menu"
        aria-hidden={!menuOpen}
        className={`absolute left-0 top-[calc(100%+0.5rem)] w-full origin-top rounded-2xl border border-border-soft bg-panel p-1.5 shadow-[0_12px_30px_rgba(92,107,82,0.14)] transition-all duration-200 ease-out ${menuOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}
      >
        {error ? (
          <p className="m-1 rounded-xl bg-red-50 px-2.5 py-2 text-xs text-red-700">{error}</p>
        ) : null}
        <button
          type="button"
          role="menuitem"
          onClick={handleSignOut}
          disabled={loading}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-soil transition-colors hover:bg-mist disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Sign Out"}
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setMenuOpen(false);
            setError(null);
            setConfirmDelete(true);
          }}
          disabled={loading}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-soil-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
        >
          Delete Account
        </button>
      </div>

      <div
        aria-hidden={!confirmDelete}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-soil/20 p-5 transition-opacity duration-200 ${confirmDelete ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className={`w-full max-w-sm rounded-3xl border border-border-soft bg-panel p-6 shadow-[0_18px_50px_rgba(92,107,82,0.2)] transition-all duration-200 ${confirmDelete ? "translate-y-0 scale-100" : "translate-y-3 scale-95"}`}
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-moss-deep">Account</p>
          <h2 id="delete-account-title" className="text-xl font-semibold text-soil">Are you sure?</h2>
          <p className="mt-2 text-sm leading-relaxed text-soil-muted">This permanently deletes your account. This cannot be undone.</p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                setError(null);
              }}
              disabled={loading}
              className="flex-1 rounded-xl border border-border-soft bg-cream px-3 py-2.5 text-sm font-semibold text-soil-muted transition-colors hover:bg-mist disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
