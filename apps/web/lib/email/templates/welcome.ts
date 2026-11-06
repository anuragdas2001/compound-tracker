export interface WelcomeEmailProps {
  name?: string | null;
  verificationUrl?: string;
}

export function getWelcomeEmailHtml({ name, verificationUrl }: WelcomeEmailProps): string {
  const displayName = name ? name.trim().split(" ")[0] : "Architect";
  const ctaUrl = verificationUrl || "http://localhost:3001/dashboard";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Habitly</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .outer-canvas { background-color: #08090d !important; }
      .main-card { background-color: #0f121a !important; border-color: #1f2533 !important; }
      .headline-dark { color: #f8fafc !important; }
      .subtext-dark { color: #94a3b8 !important; }
      .rules-divider { border-top-color: #1f2533 !important; }
      .rule-title { color: #f1f5f9 !important; }
      .card-footer { background-color: #0c0e14 !important; border-top-color: #1a1e29 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="outer-canvas" style="background-color: #f6f8fa; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="main-card" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #a8fe43 0%, #22c55e 50%, #10b981 100%);"></td>
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
                      &#9679; WELCOME
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Content -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <h1 class="headline-dark" style="font-size: 25px; font-weight: 700; color: #0c0d11; margin: 8px 0 10px 0; letter-spacing: -0.6px; line-height: 1.25; font-family: Georgia, 'Times New Roman', serif;">
                Welcome aboard, ${displayName}! 👋
              </h1>
              <p class="subtext-dark" style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 22px 0;">
                You just took the first step toward continuous daily compounding. Big achievements aren&rsquo;t made in a day &mdash; they are compounded 1% every day.
              </p>

              <!-- Sparks Welcome Reward Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; border-radius: 14px; border: 1px solid #232734; margin-bottom: 26px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 700; color: #a8fe43; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;">
                            &#9889; Starter Kit Unlocked
                          </div>
                          <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                            +150 Sparks Bonus Credited
                          </div>
                          <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                            Your starter kit is ready in your vault for Streak Freezes and XP Boosts.
                          </div>
                        </td>
                        <td align="right" valign="middle" style="padding-left: 16px;">
                          <div style="display: inline-block; background-color: rgba(168, 254, 67, 0.15); border: 1px solid rgba(168, 254, 67, 0.35); color: #a8fe43; font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: 8px; white-space: nowrap;">
                            +150 ⚡
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 4px 0 16px 0;">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(180deg, #bbf85c 0%, #a8fe43 100%); color: #0c0d11; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 9999px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 18px rgba(168, 254, 67, 0.4); border: 1px solid #8be828;">
                      Verify Email &amp; Launch Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 3 Core Principles -->
              <div class="rules-divider" style="border-top: 1px solid #e2e8f0; padding-top: 22px; margin-top: 12px;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px;">
                  3 Rules of Compounding
                </div>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: #ecfccb; color: #3f6212; font-weight: 800; font-size: 11px; text-align: center; line-height: 22px; margin-right: 8px; vertical-align: middle;">1</span>
                      <strong class="rule-title" style="color: #0f172a; font-size: 13px;">Start Tiny:</strong>
                      <span style="color: #64748b; font-size: 13px;"> Keep habits small enough that you can&rsquo;t say no (the 2-minute rule).</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: #ecfccb; color: #3f6212; font-weight: 800; font-size: 11px; text-align: center; line-height: 22px; margin-right: 8px; vertical-align: middle;">2</span>
                      <strong class="rule-title" style="color: #0f172a; font-size: 13px;">Never Miss Twice:</strong>
                      <span style="color: #64748b; font-size: 13px;"> Bad days happen. Missing once is an accident; missing twice is a new habit.</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 6px;">
                      <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: #ecfccb; color: #3f6212; font-weight: 800; font-size: 11px; text-align: center; line-height: 22px; margin-right: 8px; vertical-align: middle;">3</span>
                      <strong class="rule-title" style="color: #0f172a; font-size: 13px;">Lock the Streak:</strong>
                      <span style="color: #64748b; font-size: 13px;"> Every consecutive check-in multiplies your momentum and gamified XP.</span>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="card-footer" style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
              <span style="font-weight: 600; color: #334155;">Habitly</span> &bull; Daily Micro-Habit Compounding System<br>
              <span style="font-size: 11px; color: #94a3b8;">If you didn&rsquo;t create this account, you can safely ignore this email.</span>
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
