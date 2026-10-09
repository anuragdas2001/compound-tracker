"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const GamificationContext = createContext<{
  sparks: number;
  setSparks: React.Dispatch<React.SetStateAction<number>>;
} | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [sparks, setSparks] = useState(150);
  
  return (
    <GamificationContext.Provider value={{ sparks, setSparks }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useSparksState() {
  const context = useContext(GamificationContext);
  if (!context) throw new Error("useSparksState must be used within GamificationProvider");
  return [context.sparks, context.setSparks] as const;
}
