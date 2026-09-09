import { Canvas } from "@/components/Canvas";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <main className="flex h-dvh w-full">
      <Sidebar />
      <Canvas />
    </main>
  );
}
