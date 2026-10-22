import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_EMAIL = "aleynayuksel.04@gmail.com";
const LAST_UPDATED = "October 22, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy | pomPom",
  description:
    "How pomPom collects, uses, and protects your data, including Google Calendar data.",
  alternates: { canonical: "/privacy" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-moss-deep">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="h-dvh overflow-y-auto bg-cream px-4 py-10">
      <article className="mx-auto flex max-w-2xl flex-col gap-8 rounded-3xl border border-border-soft bg-panel/90 p-8 text-sm leading-relaxed text-soil">
        <header>
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted hover:text-moss-deep"
          >
            Pompom
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Privacy Policy</h1>
          <p className="mt-1 text-xs text-soil-muted">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-4">
            pomPom (&quot;Pompom&quot;, &quot;we&quot;) is a Pomodoro focus
            timer available at{" "}
            <a
              href="https://pompom.software"
              className="text-moss-deep underline underline-offset-2"
            >
              pompom.software
            </a>
            . This policy explains what data Pompom collects, how it is used,
            and the choices you have.
          </p>
        </header>

        <Section title="Data we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account data:</strong> your email address and a securely
              hashed password, used to sign you in.
            </li>
            <li>
              <strong>Content you create:</strong> the notes, tasks, and plant
              progress you save in Pompom.
            </li>
            <li>
              <strong>Local preferences:</strong> timer presets and panel
              layout, stored only in your browser&apos;s local storage.
            </li>
          </ul>
          <p>
            Account data and content are stored with our database provider,
            Supabase, and protected so that only your account can access them.
            We do not use advertising or analytics trackers.
          </p>
        </Section>

        <Section title="Google Calendar data">
          <p>
            Connecting Google Calendar is optional. If you connect it, Pompom
            asks Google for read-only access to your calendar (
            <code className="rounded bg-mist px-1 py-0.5 text-xs">
              calendar.readonly
            </code>
            ) and uses it only to show your events for the next 7 days next to
            your focus timer.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Your events are requested directly from Google by your browser
              and are shown only to you.
            </li>
            <li>
              Pompom does not store your calendar events on its servers or in
              its database.
            </li>
            <li>
              The access token Google issues is kept only in your browser for
              the current session and expires within one hour. It is removed
              when you disconnect or sign out.
            </li>
            <li>
              Pompom never creates, edits, or deletes calendar events.
            </li>
            <li>
              Google user data is not sold, shared with third parties, used for
              advertising, or used to train AI or machine learning models.
            </li>
          </ul>
          <p>
            Pompom&apos;s use and transfer of information received from Google
            APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-moss-deep underline underline-offset-2"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </Section>

        <Section title="How we use your data">
          <p>
            We use your data only to provide Pompom&apos;s features: signing
            you in, saving your notes, tasks, and plants, and showing your
            calendar. We do not sell your data or share it with anyone, except
            the service providers needed to run Pompom (Supabase for the
            database and authentication, Vercel for hosting).
          </p>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Disconnect Google Calendar</strong> at any time from the
              Calendar panel in Pompom. You can also remove Pompom&apos;s access
              from your{" "}
              <a
                href="https://myaccount.google.com/connections"
                target="_blank"
                rel="noopener noreferrer"
                className="text-moss-deep underline underline-offset-2"
              >
                Google Account settings
              </a>
              .
            </li>
            <li>
              <strong>Delete your account</strong> from the account menu in
              Pompom. This permanently deletes your account and all notes,
              tasks, and plants associated with it.
            </li>
          </ul>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change this policy, we will update the date at the top of
            this page.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-moss-deep underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </article>
    </main>
  );
}
