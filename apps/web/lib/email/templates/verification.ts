export interface VerificationEmailProps {
  name?: string | null;
  verificationUrl: string;
}

export function getVerificationEmailHtml({ name, verificationUrl }: VerificationEmailProps): string {
  const displayName = name ? name : "Habit Architect";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Habitly Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #14171f; border-radius: 16px; border: 1px solid #232734; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #a8fe43 0%, #22c55e 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 16px 36px;">
              <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">HABITLY</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 12px 0 12px 0;">
                Verify your email address
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                Hi ${displayName}, please confirm your email address by clicking the button below to secure your account and enable cloud sync.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 12px 0 24px 0;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #a8fe43; color: #0c0d11; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 14px rgba(168, 254, 67, 0.35);">
                      Verify My Email &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 16px 0 0 0; word-break: break-all;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #a8fe43; text-decoration: underline;">${verificationUrl}</a>
              </p>

              <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
                This link will expire in 24 hours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e1017; padding: 20px 36px; border-top: 1px solid #232734; font-size: 12px; color: #64748b; text-align: center;">
              If you didn't create a Habitly account, no action is required.
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

