import { prisma } from "@repo/db";
import { sendOnboardingAbandonedEmail, sendStreakWarningEmail } from "@/lib/email/resend";

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

