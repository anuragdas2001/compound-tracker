export interface WelcomeEmailProps {
  name?: string | null;
  verificationUrl?: string;
}

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);

function safeUrl(value?: string, fallback = "https://compoundio.vercel.app/dashboard"): string {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? escapeHtml(url.toString()) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Generates the full-width Welcome email for Habitly.
 * Designed to match the dark aesthetic (#151c17), full-width responsive layout,
 * and typography of the onboarding complete founder welcome email.
 */
export function getWelcomeEmailHtml({ name, verificationUrl }: WelcomeEmailProps): string {
  const rawFirstName = name?.trim().split(/\s+/)[0] || "Friend";
  const safeFirstName = escapeHtml(rawFirstName);
  const ctaHref = safeUrl(verificationUrl);

  const publicAssetBase =
    process.env.APP_PUBLIC_URL ||
    (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
      ? process.env.NEXTAUTH_URL
      : "https://compoundio.vercel.app");

  const logoMarkUrl = `${publicAssetBase}/habitly-mark.png`;
  const logoWordmarkUrl = `${publicAssetBase}/habitly-wordmark.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Welcome to Habitly, ${safeFirstName}</title>
  <style>
    body, html { width:100% !important; min-width:100% !important; margin:0 !important; padding:0 !important; }
    table { border-collapse:collapse; }
    img { border:0; outline:none; text-decoration:none; }
    a { text-decoration:none; }
    .w-full { width:100% !important; min-width:100% !important; }
    @media only screen and (max-width:640px) {
      .email-pad { padding-left:20px !important; padding-right:20px !important; }
      .hero-heading { font-size:28px !important; line-height:36px !important; }
      .letter-copy { font-size:14px !important; line-height:25px !important; }
      .cta-button { display:block !important; width:100% !important; text-align:center !important; }
      .brand-wordmark { max-width:100px !important; }
    }
    @media (prefers-color-scheme:dark) {
      .dark-text { color:#eff7ef !important; }
      .body-copy { color:#c1cec3 !important; }
      .subtle-copy { color:#9eada1 !important; }
      .soft-rule { border-color:#2b392e !important; }
      .email-footer { background-color:#111813 !important; border-color:#29352c !important; }
    }
  </style>
</head>
<body bgcolor="#151c17" class="w-full" style="margin:0;padding:0;width:100% !important;min-width:100%;background-color:#151c17;font-family:Arial,Helvetica,sans-serif;color:#eff7ef;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Welcome to Habitly. Your compounding journey starts today.
  </div>

  <!-- Full-Width Container (Occupies the Whole Space) -->
  <table role="presentation" width="100%" class="w-full" cellpadding="0" cellspacing="0" border="0" bgcolor="#151c17" style="width:100% !important;min-width:100%;margin:0;padding:0;background-color:#151c17;">
    
    <!-- Header Row (Spans Full Width) -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:28px 48px 20px 48px;border-bottom:1px solid #29352c;background-color:#151c17;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr>
            <td valign="middle" align="left">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" align="center" style="line-height:0;">
                    <img src="${logoMarkUrl}" alt="Habitly" width="22" height="22" style="display:block;width:22px;height:22px;border:0;outline:none;" />
                  </td>
                  <td valign="middle" style="padding-left:9px;line-height:0;">
                    <img class="brand-wordmark" src="${logoWordmarkUrl}" alt="Habitly" height="17" style="display:block;width:auto;max-width:112px;height:17px;border:0;outline:none;" />
                  </td>
                </tr>
              </table>
            </td>
            <td valign="middle" align="right" class="subtle-copy" style="color:#9eada1;font-size:10px;letter-spacing:.7px;text-transform:uppercase;">
              Welcome &middot; Day One
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Hero & Welcome Content (Spans Full Width) -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:32px 48px 8px 48px;background-color:#151c17;">
        <div style="margin:0 0 13px;color:#659b3e;font-size:10px;line-height:15px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
          A fresh start begins here
        </div>
        <h1 class="hero-heading dark-text" style="margin:0 0 19px;color:#eff7ef;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:44px;font-weight:700;letter-spacing:-.8px;">
          Welcome aboard, ${safeFirstName}.
        </h1>

        <div class="letter-copy body-copy" style="color:#c1cec3;font-size:15px;line-height:27px;">
          <p style="margin:0 0 17px;">You just took the first step toward continuous daily compounding. Big achievements aren&rsquo;t made in a day &mdash; they are compounded 1% every single day.</p>
          <p style="margin:0 0 17px;">Whether you&rsquo;re building deep focus, building an unstoppable fitness routine, or breaking patterns that quietly hold you back, Habitly is built to support your daily consistency without guilt or complexity.</p>
        </div>
      </td>
    </tr>

    <!-- The 3 Rules of Compounding -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:14px 48px 4px 48px;background-color:#151c17;">
        <div class="soft-rule" style="padding-top:18px;border-top:1px solid #2b392e;">
          <div class="subtle-copy" style="margin:0 0 10px;color:#9eada1;font-size:10px;line-height:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
            The 3 Rules of Daily Compounding
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 0;">
            <tr>
              <td valign="top" width="18" style="width:18px;padding:7px 0 0 0;">
                <span style="display:block;width:6px;height:6px;border-radius:50%;background:#79bd45;font-size:0;line-height:0;">&nbsp;</span>
              </td>
              <td valign="top" style="padding:3px 0 10px;color:#e5eee6;font-size:13px;line-height:21px;">
                <strong style="color:#eff7ef;">Never break the chain twice:</strong> Miss a day? Life happens. Just never miss two in a row.
              </td>
            </tr>
            <tr>
              <td valign="top" width="18" style="width:18px;padding:7px 0 0 0;">
                <span style="display:block;width:6px;height:6px;border-radius:50%;background:#79bd45;font-size:0;line-height:0;">&nbsp;</span>
              </td>
              <td valign="top" style="padding:3px 0 10px;color:#e5eee6;font-size:13px;line-height:21px;">
                <strong style="color:#eff7ef;">Make it too small to fail:</strong> Start with micro-habits and let consistency do the heavy lifting.
              </td>
            </tr>
            <tr>
              <td valign="top" width="18" style="width:18px;padding:7px 0 0 0;">
                <span style="display:block;width:6px;height:6px;border-radius:50%;background:#79bd45;font-size:0;line-height:0;">&nbsp;</span>
              </td>
              <td valign="top" style="padding:3px 0 0;color:#e5eee6;font-size:13px;line-height:21px;">
                <strong style="color:#eff7ef;">Protect your momentum:</strong> Use Streak Freezes and flexible cutoff times when life gets unpredictable.
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <!-- Closing & Founder Signature -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:22px 48px 0 48px;background-color:#151c17;">
        <p class="letter-copy body-copy" style="margin:0 0 17px;color:#c1cec3;font-size:15px;line-height:27px;">
          Don&rsquo;t worry about being perfect. Just begin, and take it one day at a time. I&rsquo;m rooting for you.
        </p>
        <p class="letter-copy body-copy" style="margin:0 0 3px;color:#c1cec3;font-size:14px;line-height:24px;">Warmly,</p>
        <p class="dark-text" style="margin:0;color:#eff7ef;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:29px;font-weight:700;">Anurag Das</p>
        <p class="subtle-copy" style="margin:1px 0 0;color:#829086;font-size:12px;line-height:18px;">Founder, Habitly</p>
      </td>
    </tr>

    <!-- CTA Button & P.S. -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:24px 48px 28px 48px;background-color:#151c17;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" style="padding:0;">
              <a href="${ctaHref}" target="_blank" rel="noopener noreferrer" class="cta-button" style="display:inline-block;padding:13px 23px;border-radius:7px;background:#a8fe43;color:#14200e;font-size:13px;line-height:18px;font-weight:700;text-decoration:none;text-align:center;">
                Verify Email &amp; Launch Dashboard&nbsp; &rarr;
              </a>
            </td>
          </tr>
        </table>
        <p class="subtle-copy" style="margin:18px 0 0;color:#829086;font-size:12px;line-height:20px;">
          P.S. Have a question, some feedback, or an idea that could make Habitly better? Just reply to this email. I read every message.
        </p>
      </td>
    </tr>

    <!-- Full-Width Footer -->
    <tr>
      <td class="email-footer" align="center" bgcolor="#111813" style="width:100%;padding:24px;background-color:#111813;border-top:1px solid #29352c;">
        <p style="margin:0 0 5px;color:#8b978d;font-size:10px;line-height:15px;font-weight:700;letter-spacing:.6px;">HABITLY &middot; BUILD WHAT MOVES YOU FORWARD</p>
        <p class="subtle-copy" style="margin:0 0 8px;color:#6d7a6e;font-size:10px;line-height:16px;">You&rsquo;re receiving this because you created an account on Habitly.<br>Manage your email preferences in Account Settings.</p>
        <p class="subtle-copy" style="margin:0;color:#6d7a6e;font-size:10px;line-height:16px;">Small actions, repeated with intention, can change a lot.</p>
      </td>
    </tr>

  </table>

</body>
</html>
  `.trim();
}
