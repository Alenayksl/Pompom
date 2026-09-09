import { Canvas } from "@/components/Canvas";
import { TodoPanel } from "@/components/TodoPanel";

export default function TodoPage() {
  return (
    <div className="flex min-w-0 flex-1">
      <TodoPanel />
      <Canvas />
    </div>
  );
}
