export interface StreakWarningEmailProps {
  name?: string | null;
  habitTitle: string;
  currentStreak: number;
  appUrl?: string;
}

export function getStreakWarningEmailHtml({
  name,
  habitTitle,
  currentStreak,
  appUrl = "http://localhost:3001/dashboard",
}: StreakWarningEmailProps): string {
  const displayName = name ? name : "Habit Architect";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Streak at Risk: Don't lose your ${currentStreak}-day momentum!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #14171f; border-radius: 16px; border: 1px solid #232734; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Warning Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);"></td>
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
                    <span style="background-color: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                      STREAK AT RISK
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
                Don't lose your ${currentStreak}-day momentum, ${displayName}! 🔥
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0;">
                You haven't logged your habit <strong style="color: #ffffff;">"${habitTitle}"</strong> today. You're just a few hours away from midnight reset!
              </p>

              <!-- Streak Stat Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1a1e29; border-radius: 12px; border: 1px solid #232734; margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding: 20px;">
                    <div style="font-size: 38px; font-weight: 800; color: #f59e0b; line-height: 1;">
                      ${currentStreak} <span style="font-size: 20px;">DAYS</span>
                    </div>
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;">
                      Current Streak On "${habitTitle}"
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 20px 0;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #a8fe43; color: #0c0d11; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 14px rgba(168, 254, 67, 0.35);">
                      Check In Now (Takes 10s) &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: rgba(168, 254, 67, 0.05); border-left: 3px solid #a8fe43; padding: 12px 14px; border-radius: 4px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <strong style="color: #a8fe43;">Pro Tip:</strong> Can't complete it today? Open the Shop in Habitly and equip a <strong style="color: #ffffff;">Streak Freeze Shield</strong> to protect your streak automatically!
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e1017; padding: 20px 36px; border-top: 1px solid #232734; font-size: 12px; color: #64748b; text-align: center;">
              You received this because streak notifications are enabled on your Habitly account.
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

