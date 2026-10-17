"use client";

import Link from "next/link";
import { Account } from "@/components/Account";
import { Calendar } from "@/components/Calendar";
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
    <aside className="flex h-full w-80 shrink-0 flex-col gap-4 overflow-y-auto [scrollbar-color:var(--sage)_transparent] [scrollbar-width:thin] border-r border-border-soft bg-sidebar p-5">
      <header className="pb-1">
        <Link href="/" className="block">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
            Pompom
          </p>
          <p className="mt-1 text-xl font-semibold text-soil">Workspace</p>
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
      <Calendar />
    </aside>
  );
}
