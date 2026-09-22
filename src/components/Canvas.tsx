"use client";

import Image from "next/image";
import { useFlowerIndex } from "@/context/FlowerContext";

export function Canvas() {
  const flowerIndex = useFlowerIndex();
  const flowerProgress = (flowerIndex / 6) * 100;
  return (
    <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-cream">
      {/* Soft lo-fi atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,var(--sage-soft)_0%,transparent_55%),radial-gradient(ellipse_at_80%_70%,var(--mist)_0%,transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-soil-muted">
            Garden
          </p>
          <h2 className="text-lg font-semibold text-soil">Plant area</h2>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-8 pb-8">
        <div className="flex h-full w-full max-w-5xl items-center justify-center rounded-3xl border border-dashed border-sage bg-panel/60 backdrop-blur-[2px]">
          <div className="text-center">
            <Image
              key={flowerIndex}
              src={`/flowers/Pomodoro${flowerIndex}.png`}
              alt={`Pomodoro flower ${flowerIndex}`}
              width={256}
              height={256}
              className="mx-auto mb-4 h-64 w-64 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <div
              className="mx-auto h-2 w-40 overflow-hidden rounded-full bg-sage-soft"
              role="progressbar"
              aria-label="Flower growth progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={flowerProgress}
            >
              <div
                className="h-full rounded-full bg-moss transition-[width] duration-500"
                style={{ width: `${flowerProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
