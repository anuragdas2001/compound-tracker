export interface OnboardingCompleteEmailProps {
  name?: string | null;
  habits: Array<{ title: string; category?: string }>;
  dashboardUrl?: string;
}

export function getOnboardingCompleteEmailHtml({
  name,
  habits,
  dashboardUrl = "http://localhost:3001/dashboard",
}: OnboardingCompleteEmailProps): string {
  const displayName = name ? name : "Habit Architect";

  const habitsListHtml = habits
    .map(
      (h, idx) => `
    <tr>
      <td style="padding: 10px 14px; background-color: #1a1e29; border: 1px solid #232734; border-radius: 8px; margin-bottom: 8px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="28" style="color: #a8fe43; font-weight: 800; font-size: 13px;">0${idx + 1}.</td>
            <td style="color: #ffffff; font-size: 14px; font-weight: 600;">${h.title}</td>
            ${
              h.category
                ? `<td align="right" style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">${h.category}</td>`
                : ""
            }
          </tr>
        </table>
      </td>
    </tr>
    <tr><td height="6"></td></tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Habit Blueprint is Locked!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #14171f; border-radius: 16px; border: 1px solid #232734; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #a8fe43 0%, #22c55e 100%);"></td>
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
                    <span style="background-color: rgba(168, 254, 67, 0.15); color: #a8fe43; border: 1px solid rgba(168, 254, 67, 0.3); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                      ONBOARDING COMPLETE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 12px 0 12px 0;">
                Your Compounding Blueprint is Live, ${displayName}! ⚡
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                You've successfully customized your personal routine. Your micro-habits have been added to your live dashboard and your Day 1 streak counter is active.
              </p>

              <!-- Habits Summary Box -->
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">
                Your Starting Habits
              </div>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                ${habitsListHtml}
              </table>

              <!-- Vault Status Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1a1e29; border-radius: 12px; border: 1px solid rgba(168, 254, 67, 0.25); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="36" valign="middle">
                          <span style="font-size: 22px;">🛡️</span>
                        </td>
                        <td style="padding-left: 10px;">
                          <div style="font-size: 13px; font-weight: 700; color: #ffffff;">+150 Sparks Ready in Vault</div>
                          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                            Equip Streak Freezes or Double XP potions in the Shop whenever you need them.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 20px 0;">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background-color: #a8fe43; color: #0c0d11; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 14px rgba(168, 254, 67, 0.35);">
                      Launch Day 1 in Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 16px 0 0 0; text-align: center;">
                Remember: Consistency beats intensity. Check in for just 10 seconds every day.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e1017; padding: 20px 36px; border-top: 1px solid #232734; font-size: 12px; color: #64748b; text-align: center;">
              Habitly • Built for continuous personal compounding
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

