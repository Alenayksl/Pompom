import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const GROWTH_STAGES = [0, 1, 2, 3, 4, 5, 6];

const FEATURES = [
  {
    title: "Pomodoro timer",
    body: "Focus in calm, timed sessions with short and long breaks. Pick the Classic 25/5 rhythm, Quick focus, or build your own preset, with a gentle sound when each session ends.",
  },
  {
    title: "A flower that grows with you",
    body: "Every completed focus session helps your hand-drawn flower grow. Finish a full cycle of 8 pomodoros to see it in full bloom.",
  },
  {
    title: "Notes and tasks",
    body: "Keep a to-do list and quick notes right next to your timer. Everything is saved to your account so it is there when you come back.",
  },
  {
    title: "Google Calendar",
    body: "Optionally connect Google Calendar to see this week's events beside your timer and plan focus time around them. Access is read-only, and your events are never stored.",
  },
];

const linkButton =
  "rounded-xl px-5 py-2.5 text-sm font-medium transition-colors";

export default function WelcomePage() {
  return (
    <main className="relative h-dvh overflow-y-auto bg-cream text-soil">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(ellipse_at_20%_10%,var(--sage-soft)_0%,transparent_55%),radial-gradient(ellipse_at_85%_30%,var(--mist)_0%,transparent_50%)]"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-20 px-4 pb-10 pt-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-deep">
            pomPom
          </p>
          <Link
            href="/login"
            className={`${linkButton} border border-border-soft bg-panel text-soil hover:bg-mist`}
          >
            Sign in
          </Link>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
              The plant-based Pomodoro timer
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Grow a flower while you focus.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-soil-muted">
              pomPom is a calm, garden-inspired workspace. Work in focused
              Pomodoro sessions, keep your tasks and notes close, and watch a
              little flower grow with every session you complete.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login?mode=register"
                className={`${linkButton} bg-moss text-cream hover:bg-moss-deep`}
              >
                Start growing — it&apos;s free
              </Link>
              <Link
                href="/login"
                className={`${linkButton} border border-border-soft bg-panel text-soil hover:bg-mist`}
              >
                I have an account
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex aspect-square w-full max-w-xs items-center justify-center rounded-3xl border border-dashed border-sage bg-panel/70">
              <Image
                src="/flowers/Pomodoro6.png"
                alt="A fully bloomed pixel-art flower in a pot"
                width={256}
                height={256}
                priority
                className="h-56 w-56 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
        </section>

        {/* Growth stages */}
        <section className="flex flex-col items-center gap-6 text-center">
          <div>
            <h2 className="text-2xl font-semibold">
              Every session counts
            </h2>
            <p className="mt-2 text-sm text-soil-muted">
              Your flower grows one stage at a time as you finish focus
              sessions.
            </p>
          </div>
          <ol className="grid w-full grid-cols-4 gap-3 sm:grid-cols-7">
            {GROWTH_STAGES.map((stage) => (
              <li
                key={stage}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border-soft bg-panel/80 p-3"
              >
                <Image
                  src={`/flowers/Pomodoro${stage}.png`}
                  alt={`Flower growth stage ${stage + 1}`}
                  width={96}
                  height={96}
                  className="h-16 w-16 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="text-[11px] font-medium text-soil-muted">
                  Stage {stage + 1}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-6">
          <h2 className="text-center text-2xl font-semibold">
            Everything for a focused day
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="rounded-2xl border border-border-soft bg-panel p-5"
              >
                <h3 className="text-base font-semibold text-moss-deep">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-soil-muted">
                  {feature.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Screenshot */}
        <section className="flex flex-col items-center gap-6">
          <h2 className="text-center text-2xl font-semibold">
            Your workspace
          </h2>
          <Image
            src="/screenshots/pompom-workspace.png"
            alt="The pomPom workspace with the timer, to-do list, notes, and a growing flower"
            width={1917}
            height={907}
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="w-full rounded-2xl border border-border-soft shadow-[0_12px_40px_rgba(92,107,82,0.08)]"
          />
          <Link
            href="/login?mode=register"
            className={`${linkButton} bg-moss text-cream hover:bg-moss-deep`}
          >
            Create your free account
          </Link>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-border-soft pt-6 text-xs text-soil-muted sm:flex-row">
          <p>© 2026 pomPom</p>
          <nav className="flex gap-4">
            <Link
              href="/privacy"
              className="underline-offset-2 hover:text-moss-deep hover:underline"
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:aleynayuksel.04@gmail.com"
              className="underline-offset-2 hover:text-moss-deep hover:underline"
            >
              Contact
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
