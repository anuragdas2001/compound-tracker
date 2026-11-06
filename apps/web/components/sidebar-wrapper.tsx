"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppSidebar } from "./sidebar";
import dynamic from "next/dynamic";

const PlayerStatusBar = dynamic(
  () => import("./player-status-bar"),
  { ssr: false }
);


export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("compound_sidebar_collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Do not show sidebar or require auth on landing page or auth routes
  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/(auth)");

  useEffect(() => {
    if (isPublicRoute) return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const isJustOnboarded = typeof window !== 'undefined' && window.location.search.includes('onboarded=true');
      const hasCompletedOnboarding = Boolean(session.user.hasCompletedOnboarding) || isJustOnboarded;
      if (!hasCompletedOnboarding) {
        router.replace("/onboarding");
      }
    }
  }, [isPublicRoute, status, session, router]);

  const handleSetCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    if (mounted) {
      localStorage.setItem("compound_sidebar_collapsed", String(val));
    }
  };

  if (isPublicRoute) {
    return <>{children}</>;
  }

  const isJustOnboarded = typeof window !== 'undefined' && window.location.search.includes('onboarded=true');
  const isPendingOnboarding = status === "authenticated" && session?.user && !session.user.hasCompletedOnboarding && !isJustOnboarded;

  if (status === "loading" || status === "unauthenticated" || isPendingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--c-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AppSidebar isCollapsed={isCollapsed} setIsCollapsed={handleSetCollapsed} />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <PlayerStatusBar />
        {children}
      </div>
    </div>
  );
}
