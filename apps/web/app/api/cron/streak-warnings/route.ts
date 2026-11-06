import { NextRequest, NextResponse } from "next/server";
import { runStreakWarnings } from "@/lib/cron/tasks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleStreakWarnings(req);
}

export async function POST(req: NextRequest) {
  return handleStreakWarnings(req);
}

async function handleStreakWarnings(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In production with CRON_SECRET configured, enforce token
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const result = await runStreakWarnings(appUrl);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Streak warning cron error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
