import { NextRequest, NextResponse } from "next/server";
import {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendStreakWarningEmail,
  sendWeeklyDigestEmail,
  sendOnboardingCompleteEmail,
  sendOnboardingAbandonedEmail,
  sendPaymentReceiptEmail,
  DEFAULT_FROM_EMAIL,
} from "@/lib/email/resend";

export async function GET() {
  const isKeyConfigured = Boolean(process.env.RESEND_API_KEY);

  return NextResponse.json({
    status: "ok",
    provider: "Resend",
    isConfigured: isKeyConfigured,
    fromEmail: DEFAULT_FROM_EMAIL,
    supportedTypes: [
      "welcome",
      "verification",
      "onboarding-complete",
      "onboarding-abandoned",
      "payment-receipt",
      "streak",
      "weekly",
      "custom",
    ],
    instructions:
      "Send a POST request with { to: 'email@example.com', type: '<type>' } to test any template.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, type = "welcome", data = {} } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Missing 'to' recipient email address" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    let result;

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail({
          email: to,
          name: data.name || "Explorer",
          verificationUrl:
            data.verificationUrl ||
            `${baseUrl}/api/auth/verify?token=sample-test-token&email=${encodeURIComponent(to)}`,
        });
        break;

      case "verification":
        result = await sendVerificationEmail({
          email: to,
          name: data.name || "Explorer",
          verificationUrl:
            data.verificationUrl ||
            `${baseUrl}/api/auth/verify?token=sample-test-token&email=${encodeURIComponent(to)}`,
        });
        break;

      case "onboarding-complete":
        result = await sendOnboardingCompleteEmail({
          email: to,
          name: data.name || "Explorer",
          habits: data.habits || [
            { title: "Morning Deep Work (45m)", category: "Focus" },
            { title: "Hydrate 2L Daily", category: "Health" },
            { title: "Evening Reading (15m)", category: "Mindset" },
          ],
          dashboardUrl: `${baseUrl}/dashboard`,
        });
        break;

      case "onboarding-abandoned":
        result = await sendOnboardingAbandonedEmail({
          email: to,
          name: data.name || "Explorer",
          resumeUrl: `${baseUrl}/onboarding`,
        });
        break;

      case "payment-receipt":
        result = await sendPaymentReceiptEmail({
          email: to,
          name: data.name || "Explorer",
          plan: data.plan || "PRO",
          amount: data.amount ?? 599,
          orderId: data.orderId || `order_${Date.now()}`,
          paymentId: data.paymentId || `pay_${Date.now()}`,
          bonusSparks: data.bonusSparks ?? 500,
          dashboardUrl: `${baseUrl}/dashboard`,
        });
        break;

      case "streak":
        result = await sendStreakWarningEmail({
          email: to,
          name: data.name || "Explorer",
          habitTitle: data.habitTitle || "Morning Deep Work",
          currentStreak: data.currentStreak || 14,
          appUrl: `${baseUrl}/dashboard`,
        });
        break;

      case "weekly":
        result = await sendWeeklyDigestEmail({
          email: to,
          name: data.name || "Explorer",
          stats: {
            completedCount: data.completedCount ?? 28,
            completionRate: data.completionRate ?? 92,
            totalXp: data.totalXp ?? 1450,
            currentLevel: data.currentLevel ?? 4,
            longestStreak: data.longestStreak ?? 21,
          },
          appUrl: `${baseUrl}/analytics`,
        });
        break;

      case "custom":
        result = await sendEmail({
          to,
          subject: data.subject || "Habitly Custom Notification",
          html: data.html || "<p>This is a test notification from Habitly.</p>",
        });
        break;

      default:
        return NextResponse.json(
          {
            error: `Invalid template type: '${type}'. Valid types: welcome, verification, onboarding-complete, onboarding-abandoned, payment-receipt, streak, weekly, custom`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      id: result.id,
      error: result.error,
      simulated: result.simulated ?? false,
      dispatchedTo: to,
      template: type,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
