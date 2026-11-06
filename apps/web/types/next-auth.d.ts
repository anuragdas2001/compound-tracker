import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      emailVerified?: Date | string | null;
      plan?: string;
      dayCutoffHour?: number;
      hasCompletedOnboarding?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    emailVerified?: Date | string | null;
    plan?: string;
    dayCutoffHour?: number;
    hasCompletedOnboarding?: boolean;
  }
}

