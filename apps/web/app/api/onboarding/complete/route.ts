import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db";
import { sendOnboardingCompleteEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { identityGoal, habits = [], dayCutoffHour = 0 } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
      include: { habits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user day cutoff preference and mark onboarding as completed
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dayCutoffHour: Number(dayCutoffHour) || 0,
        hasCompletedOnboarding: true,
      },
    });

    // Save chosen starter habits into the database (up to 3 for starter plan)
    const habitsToCreate = habits.slice(0, 3);
    const createdHabits = [];

    for (const h of habitsToCreate) {
      const habit = await prisma.habit.create({
        data: {
          userId: user.id,
          title: h.title.trim(),
          description: h.category
            ? `${h.category} • ${h.description || identityGoal || "Daily Routine"}`
            : (h.description || identityGoal || "Daily Micro-Habit"),
          color: h.color || "#a8fe43",
          mode: "daily",
          days: [0, 1, 2, 3, 4, 5, 6], // daily
        },
      });
      createdHabits.push(habit);
    }

    // Ensure gamification record has starter sparks
    await prisma.userGamification.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalXp: 50, // Starter kickoff XP
        level: 1,
        sparksBalance: 150,
      },
      update: {
        totalXp: { increment: 50 },
      },
    });

    // Create an in-app welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "ONBOARDING_COMPLETED",
        title: "Welcome to Day 1! 🚀",
        body: `Your ${createdHabits.length} starting habits have been loaded into your dashboard. +50 Kickoff XP earned!`,
      },
    });

    // Send Onboarding Complete Email via Resend
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    try {
      await sendOnboardingCompleteEmail({
        email: user.email!,
        name: user.name,
        identityTitle: identityGoal,
        dayCutoffHour: Number(dayCutoffHour) || 0,
        habits: habitsToCreate.map((h: any) => ({
          title: h.title,
          category: h.category,
        })),
        sparksEarned: 150,
        xpEarned: 50,
        dashboardUrl: `${baseUrl}/dashboard`,
      });
    } catch (emailErr) {
      console.error("[Onboarding Email Error]:", emailErr);
    }

    return NextResponse.json({
      success: true,
      habitsCreated: createdHabits.length,
      message: "Onboarding complete! Your habits are ready.",
    });
  } catch (error: unknown) {
    console.error("[Onboarding Complete Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to finish onboarding";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
