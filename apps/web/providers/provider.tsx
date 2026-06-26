"use client";

import { RecoilRoot } from "recoil";
import { QueryProvider } from "@repo/query/providers/query-provider";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RecoilRoot>
      <QueryProvider>{children}</QueryProvider>
    </RecoilRoot>
  );
}