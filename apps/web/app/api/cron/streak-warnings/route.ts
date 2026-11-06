import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { sendStreakWarningEmail } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export async function runStreakWarnings(appUrl: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find users with habits and settings allowing streak reminders
  const users = await prisma.user.findMany({
    where: {
      email: { not: null },
      settings: {
        is: { emailStreakReminder: true },
      },
    },
    include: {
      habits: {
        where: { archived: false },
        include: {
          logs: {
            orderBy: { completedAt: "desc" },
            take: 30,
          },
        },
      },
    },
  });

  let warningsSent = 0;

  for (const user of users) {
    if (!user.email) continue;

    for (const habit of user.habits) {
      // Check if habit was completed today
      const completedToday = habit.logs.some((l) => {
        const logDate = new Date(l.completedAt);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });

      if (!completedToday && habit.logs.length > 0) {
        // Calculate consecutive streak up to yesterday
        let streak = 0;
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1);

        for (let d = 0; d < 30; d++) {
          const hasLog = habit.logs.some((l) => {
            const ld = new Date(l.completedAt);
            ld.setHours(0, 0, 0, 0);
            return ld.getTime() === checkDate.getTime();
          });
          if (hasLog) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        if (streak >= 2) {
          await sendStreakWarningEmail({
            email: user.email,
            name: user.name || "Habit Explorer",
            habitTitle: habit.title,
            currentStreak: streak,
            appUrl: `${appUrl}/dashboard`,
          });
          warningsSent++;
          break; // Send at most one warning email per user per day
        }
      }
    }
  }

  return {
    processedUsers: users.length,
    warningsSent,
  };
}

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
