import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db";
import { sendOnboardingAbandonedEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let targetEmail = session?.user?.email;
    let targetName = session?.user?.name;

    // Optional override if called by scheduled cron with specific user email
    try {
      const body = await req.json();
      if (body.email) targetEmail = body.email;
      if (body.name) targetName = body.name;
    } catch {
      // Empty body is fine, falls back to session
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Target email required" },
        { status: 400 }
      );
    }

    const normalizedEmail = targetEmail.toLowerCase().trim();

    // Check if user already completed onboarding (already has habits)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { habits: true },
    });

    if (user && (user.hasCompletedOnboarding || user.habits.length > 0)) {
      return NextResponse.json({
        skipped: true,
        message: "User has already completed onboarding.",
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const result = await sendOnboardingAbandonedEmail({
      email: normalizedEmail,
      name: targetName || user?.name || "Habit Explorer",
      resumeUrl: `${baseUrl}/onboarding`,
    });

    return NextResponse.json({
      success: result.success,
      id: result.id,
      simulated: result.simulated ?? false,
      message: "Abandoned onboarding email dispatched successfully",
    });
  } catch (error: unknown) {
    console.error("[Abandoned Onboarding Email Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

