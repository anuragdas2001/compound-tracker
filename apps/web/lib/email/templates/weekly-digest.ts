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
  const displayName = name ? name.trim().split(" ")[0] : "Architect";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Compounding Digest</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .outer-canvas { background-color: #08090d !important; }
      .main-card { background-color: #0f121a !important; border-color: #1f2533 !important; }
      .headline-dark { color: #f8fafc !important; }
      .subtext-dark { color: #94a3b8 !important; }
      .stat-card { background-color: #141824 !important; border-color: #232a3b !important; }
      .stat-title { color: #f1f5f9 !important; }
      .card-footer { background-color: #0c0e14 !important; border-top-color: #1a1e29 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="outer-canvas" style="background-color: #f6f8fa; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="main-card" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          
          <!-- Top Accent Bar: Sky / Lime -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #a8fe43 0%, #38bdf8 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 36px 18px 36px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="34" height="34" style="background-color: #0c0d11; border-radius: 9px; text-align: center; vertical-align: middle; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                          <div style="font-size: 18px; line-height: 1; color: #a8fe43; font-weight: 900; transform: translateY(-1px);">&#9670;</div>
                        </td>
                        <td style="padding-left: 12px;" valign="middle">
                          <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.4px; color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">HABITLY</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 9999px; letter-spacing: 0.3px; text-transform: uppercase;">
                      &#9679; WEEKLY DIGEST
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <h1 class="headline-dark" style="font-size: 25px; font-weight: 700; color: #0c0d11; margin: 8px 0 10px 0; letter-spacing: -0.6px; line-height: 1.25; font-family: Georgia, 'Times New Roman', serif;">
                Your Week in Review, ${displayName} 📈
              </h1>
              <p class="subtext-dark" style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 22px 0;">
                Here is your 7-day habit breakdown. Daily consistency is compounding into exponential progress.
              </p>

              <!-- 4-Stat Grid -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="48%" class="stat-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.4px;">Check-ins</div>
                    <div class="stat-title" style="font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 4px;">${stats.completedCount}</div>
                    <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 2px;">Completed this week</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" class="stat-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.4px;">Consistency</div>
                    <div style="font-size: 26px; font-weight: 800; color: #0284c7; margin-top: 4px;">${stats.completionRate}%</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">7-day completion rate</div>
                  </td>
                </tr>
                <tr><td height="12" colspan="3"></td></tr>
                <tr>
                  <td width="48%" class="stat-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.4px;">Player Level</div>
                    <div style="font-size: 26px; font-weight: 800; color: #d97706; margin-top: 4px;">Lv. ${stats.currentLevel}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${stats.totalXp} Total XP</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" class="stat-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.4px;">Best Active Streak</div>
                    <div style="font-size: 26px; font-weight: 800; color: #ea580c; margin-top: 4px;">${stats.longestStreak} 🔥</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Consecutive days</div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 4px 0 16px 0;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; background: linear-gradient(180deg, #bbf85c 0%, #a8fe43 100%); color: #0c0d11; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 38px; border-radius: 9999px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 18px rgba(168, 254, 67, 0.4); border: 1px solid #8be828;">
                      View Full Analytics &amp; Heatmap &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="card-footer" style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
              <span style="font-weight: 600; color: #334155;">Habitly</span> &bull; Daily Micro-Habit Compounding System<br>
              <span style="font-size: 11px; color: #94a3b8;">You can manage your weekly email report digest in Account Settings.</span>
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
