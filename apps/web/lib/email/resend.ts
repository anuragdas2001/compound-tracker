import { Resend } from "resend";
import { getWelcomeEmailHtml } from "./templates/welcome";
import { getVerificationEmailHtml } from "./templates/verification";
import { getStreakWarningEmailHtml, StreakWarningEmailProps } from "./templates/streak-warning";
import { getWeeklyDigestEmailHtml, WeeklyDigestEmailProps } from "./templates/weekly-digest";

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

// Default sender for Resend (can use onboarding@resend.dev during testing or custom domain)
export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Habitly <onboarding@resend.dev>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Universal email dispatcher:
 * - If RESEND_API_KEY is configured, sends via Resend API
 * - If RESEND_API_KEY is missing, gracefully logs the email to console and succeeds (safe dev fallback)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_FROM_EMAIL,
}: SendEmailOptions): Promise<SendEmailResult> {
  const recipients = Array.isArray(to) ? to.join(", ") : to;

  if (!resend) {
    console.log("\n=======================================================");
    console.log("📨 [RESEND DEV MOCK] (RESEND_API_KEY not configured)");
    console.log(`To:      ${recipients}`);
    console.log(`From:    ${from}`);
    console.log(`Subject: ${subject}`);
    console.log("-------------------------------------------------------");
    console.log("To send real emails, set RESEND_API_KEY in .env");
    console.log("=======================================================\n");

    return {
      success: true,
      id: `mock-${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || subject,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Resend Exception]:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Sends a stylized Welcome Email to a newly registered user
 */
export async function sendWelcomeEmail({
  email,
  name,
  verificationUrl,
}: {
  email: string;
  name?: string | null;
  verificationUrl?: string;
}): Promise<SendEmailResult> {
  const html = getWelcomeEmailHtml({ name, verificationUrl });
  return sendEmail({
    to: email,
    subject: "Welcome to Habitly — Your compounding journey starts here 🚀",
    html,
  });
}

/**
 * Sends a stylized Email Verification link
 */
export async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
}: {
  email: string;
  name?: string | null;
  verificationUrl: string;
}): Promise<SendEmailResult> {
  const html = getVerificationEmailHtml({ name, verificationUrl });
  return sendEmail({
    to: email,
    subject: "Verify your Habitly email address",
    html,
  });
}

/**
 * Sends a Streak-at-Risk Warning Email
 */
export async function sendStreakWarningEmail({
  email,
  name,
  habitTitle,
  currentStreak,
  appUrl,
}: StreakWarningEmailProps & { email: string }): Promise<SendEmailResult> {
  const html = getStreakWarningEmailHtml({
    name,
    habitTitle,
    currentStreak,
    appUrl,
  });
  return sendEmail({
    to: email,
    subject: `🔥 Streak at Risk: Don't break your ${habitTitle} streak!`,
    html,
  });
}

/**
 * Sends a Weekly Compounding Digest Email
 */
export async function sendWeeklyDigestEmail({
  email,
  name,
  stats,
  appUrl,
}: WeeklyDigestEmailProps & { email: string }): Promise<SendEmailResult> {
  const html = getWeeklyDigestEmailHtml({ name, stats, appUrl });
  return sendEmail({
    to: email,
    subject: "📊 Your Habitly Weekly Compounding Digest",
    html,
  });
}
