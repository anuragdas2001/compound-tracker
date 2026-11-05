export interface OnboardingAbandonedEmailProps {
  name?: string | null;
  resumeUrl?: string;
}

export function getOnboardingAbandonedEmailHtml({
  name,
  resumeUrl = "http://localhost:3001/onboarding",
}: OnboardingAbandonedEmailProps): string {
  const displayName = name ? name : "Habit Architect";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Don't leave your new streak behind!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #14171f; border-radius: 16px; border: 1px solid #232734; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Amber Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f59e0b 0%, #a8fe43 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 16px 36px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">HABITLY</span>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                      UNFINISHED SETUP
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 12px 0 12px 0;">
                Don't leave your new streak behind, ${displayName}! 🔥
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0;">
                You started setting up your personal compounding routine on Habitly, but didn't finish locking it in.
              </p>

              <!-- Sparks Vault Notice -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1a1e29; border-radius: 12px; border: 1px solid #232734; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                      🎁 +150 Sparks Reserved For You
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                      Finish your 60-second setup to claim your welcome sparks and generate your 2026 habit tracker.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 20px 0;">
                    <a href="${resumeUrl}" target="_blank" style="display: inline-block; background-color: #a8fe43; color: #0c0d11; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 14px rgba(168, 254, 67, 0.35);">
                      Resume Onboarding (Takes 60s) &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 12px 0 0 0; text-align: center;">
                "The secret of getting ahead is getting started."
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e1017; padding: 20px 36px; border-top: 1px solid #232734; font-size: 12px; color: #64748b; text-align: center;">
              You received this because an onboarding session was started with this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

