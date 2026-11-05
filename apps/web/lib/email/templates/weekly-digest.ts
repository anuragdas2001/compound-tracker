export interface WeeklyDigestStats {
  completedCount: number;
  completionRate: number;
  totalXp: number;
  currentLevel: number;
  longestStreak: number;
}

export interface WeeklyDigestEmailProps {
  name?: string | null;
  stats: WeeklyDigestStats;
  appUrl?: string;
}

export function getWeeklyDigestEmailHtml({
  name,
  stats,
  appUrl = "http://localhost:3001/analytics",
}: WeeklyDigestEmailProps): string {
  const displayName = name ? name : "Habit Architect";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Compounding Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #14171f; border-radius: 16px; border: 1px solid #232734; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #a8fe43 0%, #38bdf8 100%);"></td>
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
                    <span style="color: #a8fe43; font-size: 12px; font-weight: 700; font-family: monospace;">
                      WEEKLY REPORT
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 12px 0 8px 0;">
                Your Week in Review, ${displayName} 📈
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                Here is your 7-day habit breakdown. Consistency is compounding into exponential progress.
              </p>

              <!-- 4-Stat Grid -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="48%" style="background-color: #1a1e29; border: 1px solid #232734; border-radius: 10px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Check-ins</div>
                    <div style="font-size: 26px; font-weight: 800; color: #ffffff; margin-top: 4px;">${stats.completedCount}</div>
                    <div style="font-size: 11px; color: #a8fe43; margin-top: 2px;">Completed this week</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #1a1e29; border: 1px solid #232734; border-radius: 10px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Consistency</div>
                    <div style="font-size: 26px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${stats.completionRate}%</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">7-day success rate</div>
                  </td>
                </tr>
                <tr><td height="12" colspan="3"></td></tr>
                <tr>
                  <td width="48%" style="background-color: #1a1e29; border: 1px solid #232734; border-radius: 10px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Player Level</div>
                    <div style="font-size: 26px; font-weight: 800; color: #eab308; margin-top: 4px;">Lv. ${stats.currentLevel}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${stats.totalXp} Total XP</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #1a1e29; border: 1px solid #232734; border-radius: 10px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Best Active Streak</div>
                    <div style="font-size: 26px; font-weight: 800; color: #f97316; margin-top: 4px;">${stats.longestStreak} 🔥</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Days in a row</div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 16px 0;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #a8fe43; color: #0c0d11; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 14px rgba(168, 254, 67, 0.35);">
                      View Full Analytics & Heatmap &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e1017; padding: 20px 36px; border-top: 1px solid #232734; font-size: 12px; color: #64748b; text-align: center;">
              You received this weekly report from Habitly. You can update your email preferences in settings anytime.
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

