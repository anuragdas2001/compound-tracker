"use client";

import type { ComponentType, ReactNode } from "react";
import { Button } from "@repo/ui/button";

import { C, fontMono, navItems } from "./constants";
import type { HabitTabId } from "./constants";

type HabitTabsShellProps = {
  activeTab: HabitTabId;
  onTabChange: (tab: HabitTabId) => void;
  children: ReactNode;
};

type WithHabitTabsProps = {
  activeTab: HabitTabId;
  onTabChange: (tab: HabitTabId) => void;
};

type HabitTabOutletProps = {
  activeTab: HabitTabId;
  views: Record<HabitTabId, ReactNode>;
};

type HabitTabsProps = Omit<HabitTabOutletProps, "activeTab"> & WithHabitTabsProps;

function HabitTabsShell({ activeTab, onTabChange, children }: HabitTabsShellProps) {
  return (
    <section aria-label="Habit workspace">
      <div
        className="flex flex-col gap-3 rounded-2xl border p-2 sm:flex-row sm:items-center sm:justify-between bg-[var(--c-surface)]/80 backdrop-blur-md"
        style={{
          borderColor: C.border,
        }}
      >
        <div
          className="no-scrollbar flex items-center gap-1 overflow-x-auto"
          role="tablist"
          aria-label="Habit sections"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                role="tab"
                aria-selected={isActive}
                aria-controls={`habit-tabpanel-${item.id}`}
                id={`habit-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`relative h-11 rounded-xl px-4 text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--c-primary)] font-semibold text-white dark:text-[#06120B] hover:bg-[var(--c-light)] hover:text-white dark:hover:text-[#06120B]"
                    : "text-[var(--c-muted)] hover:bg-black/5 dark:hover:bg-white/[0.04] hover:text-[var(--c-text)]"
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        <div
          className="hidden shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--c-muted)] sm:flex"
          style={{ borderColor: C.border, backgroundColor: C.surfaceSoft, ...fontMono }}
        >
          <span className="h-2 w-2 rounded-full bg-[var(--c-primary)]" />
          {activeTab}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`habit-tabpanel-${activeTab}`}
        aria-labelledby={`habit-tab-${activeTab}`}
        className="pt-8"
      >
        {children}
      </div>
    </section>
  );
}

function HabitTabOutlet({ activeTab, views }: HabitTabOutletProps) {
  return <>{views[activeTab]}</>;
}

export function withHabitTabs(WrappedComponent: ComponentType<HabitTabOutletProps>) {
  function HabitTabsController({ activeTab, onTabChange, views }: HabitTabsProps) {
    return (
      <HabitTabsShell activeTab={activeTab} onTabChange={onTabChange}>
        <WrappedComponent activeTab={activeTab} views={views} />
      </HabitTabsShell>
    );
  }

  HabitTabsController.displayName = `withHabitTabs(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return HabitTabsController;
}

export const HabitTabs = withHabitTabs(HabitTabOutlet);
