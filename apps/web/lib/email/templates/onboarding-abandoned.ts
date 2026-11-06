export interface OnboardingAbandonedEmailProps {
  name?: string | null;
  resumeUrl?: string;
}

export function getOnboardingAbandonedEmailHtml({
  name,
  resumeUrl = "http://localhost:3001/onboarding",
}: OnboardingAbandonedEmailProps): string {
  const displayName = name ? name.trim().split(" ")[0] : "Architect";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Don't leave your new streak behind!</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .outer-canvas { background-color: #08090d !important; }
      .main-card { background-color: #0f121a !important; border-color: #1f2533 !important; }
      .headline-dark { color: #f8fafc !important; }
      .subtext-dark { color: #94a3b8 !important; }
      .card-footer { background-color: #0c0e14 !important; border-top-color: #1a1e29 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="outer-canvas" style="background-color: #f6f8fa; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="main-card" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          
          <!-- Amber Accent Bar -->
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #f59e0b 0%, #a8fe43 100%);"></td>
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
                    <span style="display: inline-block; background-color: #fefce8; color: #b45309; border: 1px solid #fde68a; font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 9999px; letter-spacing: 0.3px; text-transform: uppercase;">
                      &#9679; UNFINISHED SETUP
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
                Don&rsquo;t leave your new streak behind, ${displayName}! 🔥
              </h1>
              <p class="subtext-dark" style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 22px 0;">
                You started calibrating your personal compounding routine on Habitly, but paused before locking in Day 1. Your customized habits are saved and waiting.
              </p>

              <!-- Sparks Vault Notice: Obsidian Gamification Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; border-radius: 14px; border: 1px solid #232734; margin-bottom: 26px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;">
                      🎁 Reserved in your vault
                    </div>
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                      +150 Sparks &bull; Free Starter Kit
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                      Finish your 45-second setup to claim your welcome sparks and initialize your Day 1 streak tracker.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 4px 0 16px 0;">
                    <a href="${resumeUrl}" target="_blank" style="display: inline-block; background: linear-gradient(180deg, #bbf85c 0%, #a8fe43 100%); color: #0c0d11; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 38px; border-radius: 9999px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 18px rgba(168, 254, 67, 0.4); border: 1px solid #8be828;">
                      Resume Setup (Takes 45s) &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 14px 0 0 0; text-align: center; font-style: italic;">
                &ldquo;The secret of getting ahead is getting started.&rdquo; &mdash; Mark Twain
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="card-footer" style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
              <span style="font-weight: 600; color: #334155;">Habitly</span> &bull; Daily Micro-Habit Compounding System<br>
              <span style="font-size: 11px; color: #94a3b8;">You received this because an onboarding setup was initiated with this email.</span>
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
