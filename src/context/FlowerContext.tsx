"use client";

import { createContext, useContext } from "react";

const FlowerContext = createContext(0);

export function FlowerProvider({
  flowerIndex,
  children,
}: {
  flowerIndex: number;
  children: React.ReactNode;
}) {
  return (
    <FlowerContext.Provider value={flowerIndex}>
      {children}
    </FlowerContext.Provider>
  );
}

export function useFlowerIndex() {
  return useContext(FlowerContext);
}