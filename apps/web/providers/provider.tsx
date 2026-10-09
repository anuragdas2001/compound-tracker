"use client";

import { RecoilRoot } from "recoil";
import { GamificationProvider } from "../store/gamification";
import { QueryProvider } from "@repo/query/providers/query-provider";
import { useEffect, useState } from "react";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <QueryProvider>{children}</QueryProvider>;
  }

  return (
    <RecoilRoot>
      <QueryProvider>
        <GamificationProvider>{children}</GamificationProvider>
      </QueryProvider>
    </RecoilRoot>
  );
}