import { NextRequest, NextResponse } from "next/server";
import { runAbandonedOnboarding } from "@/lib/cron/tasks";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleAbandonedOnboarding(req);
}

export async function POST(req: NextRequest) {
  return handleAbandonedOnboarding(req);
}

async function handleAbandonedOnboarding(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const result = await runAbandonedOnboarding(appUrl);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Abandoned onboarding cron error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
