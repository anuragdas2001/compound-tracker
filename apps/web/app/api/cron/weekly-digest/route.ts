import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { sendWeeklyDigestEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleWeeklyDigest(req);
}

export async function POST(req: NextRequest) {
  return handleWeeklyDigest(req);
}

async function handleWeeklyDigest(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const users = await prisma.user.findMany({
      where: {
        email: { not: null },
        settings: {
          is: { emailWeeklyDigest: true },
        },
      },
      include: {
        gamification: true,
        habits: {
          where: { archived: false },
          include: {
            logs: {
              where: { completedAt: { gte: sevenDaysAgo } },
            },
          },
        },
      },
    });

    let digestsSent = 0;

    for (const user of users) {
      if (!user.email) continue;
      if (user.habits.length === 0) continue;

      let completedCount = 0;
      for (const h of user.habits) {
        completedCount += h.logs.length;
      }

      const totalExpected = user.habits.length * 7;
      const completionRate = Math.min(100, Math.round((completedCount / Math.max(1, totalExpected)) * 100));

      const stats = {
        completedCount,
        completionRate,
        totalXp: user.gamification?.totalXp || 0,
        currentLevel: user.gamification?.level || 1,
        longestStreak: Math.max(1, completedCount),
      };

      await sendWeeklyDigestEmail({
        email: user.email,
        name: user.name || "Habit Builder",
        stats,
        appUrl: `${appUrl}/analytics`,
      });

      digestsSent++;
    }

    return NextResponse.json({
      success: true,
      processedUsers: users.length,
      digestsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Weekly digest cron error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

