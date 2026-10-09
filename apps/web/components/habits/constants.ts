import { Award, BarChart3, Settings, Zap } from "lucide-react";

export const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
export const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export const C = {
  bg: "var(--c-bg)",
  surface: "var(--c-surface)",
  surfaceSoft: "var(--c-surface-soft)",
  border: "var(--c-border)",
  borderHover: "var(--c-border-hover)",
  primary: "var(--c-primary)",
  light: "var(--c-light)",
  pale: "var(--c-pale)",
  deep: "var(--c-deep)",
  deeper: "var(--c-deeper)",
  text: "var(--c-text)",
  muted: "var(--c-muted)",
};

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const navItems = [
  { label: "Today", icon: Zap, id: "Today" },
  { label: "Insights", icon: BarChart3, id: "Insights" },
  { label: "Store", icon: Award, id: "Store" },
  { label: "Settings", icon: Settings, id: "Settings" },
] as const;

export type HabitTabId = (typeof navItems)[number]["id"];

export const dailyTips = [
  "Never miss twice. One slip is an accident; two is the start of a new habit.",
  "Make it small. A two-minute version of a habit still keeps the chain alive.",
  "Stack it. Attach a new habit to something you already do every day.",
  "Show up first, perfect later. Consistency beats intensity.",
  "Make it obvious. Put the cue where you'll see it, like your water bottle on your desk.",
  "Track it today. The check-in itself is a tiny reward.",
  "Your streak is a promise to your future self. Keep it light, keep it going.",
];
