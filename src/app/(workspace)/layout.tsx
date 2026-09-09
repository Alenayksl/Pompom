import { Sidebar } from "@/components/Sidebar";
import { TasksProvider } from "@/context/TasksContext";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TasksProvider>
      <div className="flex h-dvh w-full">
        <Sidebar />
        {children}
      </div>
    </TasksProvider>
  );
}
