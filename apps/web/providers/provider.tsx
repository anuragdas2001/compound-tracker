"use client";

import { RecoilRoot } from "recoil";
import { GamificationProvider } from "../store/gamification";
import { QueryProvider } from "@repo/query/providers/query-provider";
import { SessionProvider } from "next-auth/react";
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
    return (
      <SessionProvider>
        <QueryProvider>{children}</QueryProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <RecoilRoot>
        <QueryProvider>
          <GamificationProvider>{children}</GamificationProvider>
        </QueryProvider>
      </RecoilRoot>
    </SessionProvider>
  );
}