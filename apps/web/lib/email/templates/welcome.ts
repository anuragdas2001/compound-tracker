export interface WelcomeEmailProps {
  name?: string | null;
  verificationUrl?: string;
}

export function getWelcomeEmailHtml({ name, verificationUrl }: WelcomeEmailProps): string {
  const displayName = name ? name : "Habit Architect";
  const ctaUrl = verificationUrl || "http://localhost:3001/dashboard";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Habitly</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #14171f; border-radius: 16px; border: 1px solid #232734; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #a8fe43 0%, #22c55e 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-flex; align-items: center; gap: 8px;">
                      <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">HABITLY</span>
                      <span style="background-color: #a8fe43; color: #0c0d11; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">PRO</span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="color: #64748b; font-size: 12px; font-family: monospace;">COMPOUND v2.0</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Content -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <h1 style="font-size: 26px; font-weight: 700; line-height: 1.3; color: #ffffff; margin: 16px 0 12px 0;">
                Welcome aboard, <span style="color: #a8fe43;">${displayName}</span>! 👋
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                You just took the first step toward continuous daily compounding. Big achievements aren’t made in a day—they are compounded 1% every day.
              </p>

              <!-- Sparks Welcome Reward Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1a1e29; border-radius: 12px; border: 1px solid rgba(168, 254, 67, 0.2); margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="42" valign="middle">
                          <div style="width: 36px; height: 36px; border-radius: 8px; background-color: rgba(168, 254, 67, 0.15); display: flex; align-items: center; justify-content: center; font-size: 18px; text-align: center; line-height: 36px;">
                            ⚡
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <div style="font-size: 14px; font-weight: 700; color: #ffffff;">+150 Sparks Bonus Credited</div>
                          <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Your starter kit is ready in your vault for Streak Freezes and XP Boosts.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #a8fe43; color: #0c0d11; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 14px rgba(168, 254, 67, 0.35);">
                      Verify Email & Launch Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 3 Core Principles -->
              <div style="border-top: 1px solid #232734; padding-top: 24px; margin-top: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px;">
                  3 Rules of Compounding
                </div>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #a8fe43; font-weight: bold; margin-right: 8px;">01.</span>
                      <strong style="color: #ffffff;">Start Tiny:</strong>
                      <span style="color: #94a3b8; font-size: 13px;"> Keep habits small enough that you can’t say no (the 2-minute rule).</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <span style="color: #a8fe43; font-weight: bold; margin-right: 8px;">02.</span>
                      <strong style="color: #ffffff;">Never Miss Twice:</strong>
                      <span style="color: #94a3b8; font-size: 13px;"> Bad days happen. Missing once is an accident; missing twice is a new habit.</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px;">
                      <span style="color: #a8fe43; font-weight: bold; margin-right: 8px;">03.</span>
                      <strong style="color: #ffffff;">Lock the Streak:</strong>
                      <span style="color: #94a3b8; font-size: 13px;"> Every consecutive check-in multiplies your momentum and gamified XP.</span>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e1017; padding: 24px 36px; border-top: 1px solid #232734; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">Habitly — Daily Micro-Habit Compounding System</p>
              <p style="margin: 0;">
                If you didn't create this account, you can safely ignore this email.
              </p>
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

