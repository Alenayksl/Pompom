"use client";

import Link from "next/link";
import { Account } from "@/components/Account";
import { Notes } from "@/components/Notes";
import { Pomodoro } from "@/components/Pomodoro";
import { Todo } from "@/components/Todo";

type SidebarProps = {
  onFocusComplete: () => void;
  onLongBreakComplete: () => void;
  onReset: () => void;
};

export function Sidebar({
  onFocusComplete,
  onLongBreakComplete,
  onReset,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 border-r border-border-soft bg-sidebar p-5">
      <header className="pb-1">
        <Link href="/" className="block">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
            Pompom
          </p>
          <h1 className="mt-1 text-xl font-semibold text-soil">Workspace</h1>
        </Link>
      </header>

      <Account />
      <Pomodoro
        onFocusComplete={onFocusComplete}
        onLongBreakComplete={onLongBreakComplete}
        onReset={onReset}
      />
      <Todo />
      <Notes />
    </aside>
  );
}
