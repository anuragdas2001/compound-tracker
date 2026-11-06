export interface VerificationEmailProps {
  name?: string | null;
  verificationUrl: string;
}

export function getVerificationEmailHtml({ name, verificationUrl }: VerificationEmailProps): string {
  const displayName = name ? name.trim().split(" ")[0] : "Architect";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Habitly Email</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .outer-canvas { background-color: #08090d !important; }
      .main-card { background-color: #0f121a !important; border-color: #1f2533 !important; }
      .headline-dark { color: #f8fafc !important; }
      .subtext-dark { color: #94a3b8 !important; }
      .link-box { background-color: #141824 !important; border-color: #232a3b !important; }
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
                      &#9679; VERIFICATION
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
                Verify your email address
              </h1>
              <p class="subtext-dark" style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Hi ${displayName}, please confirm your email address by tapping below to secure your account and activate cloud synchronization.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 4px 0 22px 0;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(180deg, #bbf85c 0%, #a8fe43 100%); color: #0c0d11; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 38px; border-radius: 9999px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 18px rgba(168, 254, 67, 0.4); border: 1px solid #8be828;">
                      Verify My Email &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link Fallback Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="link-box" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;">
                      Alternative link
                    </div>
                    <div style="font-size: 12px; line-height: 1.5; color: #334155; word-break: break-all;">
                      <a href="${verificationUrl}" style="color: #16a34a; text-decoration: underline;">${verificationUrl}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0 0; text-align: center;">
                This link expires in 24 hours for security.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="card-footer" style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
              <span style="font-weight: 600; color: #334155;">Habitly</span> &bull; Daily Micro-Habit Compounding System<br>
              <span style="font-size: 11px; color: #94a3b8;">If you didn&rsquo;t create a Habitly account, you can safely ignore this email.</span>
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
