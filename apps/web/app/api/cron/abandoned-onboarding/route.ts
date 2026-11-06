import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { sendOnboardingAbandonedEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export async function runAbandonedOnboarding(appUrl: string) {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  // Find users who signed up over 24 hours ago, have not completed onboarding and have no habits
  const abandonedUsers = await prisma.user.findMany({
    where: {
      email: { not: null },
      hasCompletedOnboarding: false,
      createdAt: { lte: oneDayAgo },
      habits: { none: {} },
    },
    take: 50,
  });

  let emailsSent = 0;

  for (const user of abandonedUsers) {
    if (!user.email) continue;

    await sendOnboardingAbandonedEmail({
      email: user.email,
      name: user.name || "Habit Explorer",
      resumeUrl: `${appUrl}/onboarding`,
    });

    emailsSent++;
  }

  return {
    foundAbandonedUsers: abandonedUsers.length,
    emailsSent,
  };
}

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
