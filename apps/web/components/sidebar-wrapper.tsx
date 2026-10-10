"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./sidebar";
import dynamic from "next/dynamic";

const PlayerStatusBar = dynamic(
  () => import("./player-status-bar"),
  { ssr: false }
);


export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("compound_sidebar_collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const handleSetCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    if (mounted) {
      localStorage.setItem("compound_sidebar_collapsed", String(val));
    }
  };

  // Do not show sidebar on landing page or auth routes
  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/(auth)");

  if (isPublicRoute) {
    return <>{children}</>;
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
