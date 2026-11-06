import { NextRequest, NextResponse } from "next/server";
import { runStreakWarnings, runAbandonedOnboarding } from "@/lib/cron/tasks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleDailyCron(req);
}

export async function POST(req: NextRequest) {
  return handleDailyCron(req);
}

async function handleDailyCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

    const [streakResult, onboardingResult] = await Promise.allSettled([
      runStreakWarnings(appUrl),
      runAbandonedOnboarding(appUrl),
    ]);

    return NextResponse.json({
      success: true,
      streakWarnings:
        streakResult.status === "fulfilled"
          ? streakResult.value
          : { error: streakResult.reason?.message },
      abandonedOnboarding:
        onboardingResult.status === "fulfilled"
          ? onboardingResult.value
          : { error: onboardingResult.reason?.message },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Daily consolidated cron error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
