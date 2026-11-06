export interface HabitItem {
  title?: string;
  name?: string;
  category?: string | null;
}

export interface OnboardingCompleteEmailProps {
  name?: string | null;
  habits?: Array<HabitItem | string>;
  dashboardUrl?: string;
  identityTitle?: string | null;
  identityQuote?: string | null;
  dayCutoffHour?: number | null;
  sparksEarned?: number | null;
  xpEarned?: number | null;
}

const IDENTITY_QUOTES: Record<string, string> = {
  "High Performer & Builder":
    "Execute with relentless focus, eliminate distractions, and ship meaningful work.",
  "high performer & builder":
    "Execute with relentless focus, eliminate distractions, and ship meaningful work.",
  "Iron Discipline & Fitness":
    "Build unstoppable daily physical vitality, energy, endurance, and strength.",
  "Lifelong Learner & Thinker":
    "Compound knowledge daily through deliberate reading, reflection, and curiosity.",
  "Mindful & Balanced":
    "I guard my calm, my sleep and my attention.",
};

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);

function safeUrl(value?: string): string {
  const fallback = "https://compoundio.vercel.app/dashboard";
  if (!value) return fallback;

  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? escapeHtml(url.toString()) : fallback;
  } catch {
    return fallback;
  }
}

function formatCutoff(cutoffHour?: number | null): { title: string; desc: string } {
  switch (cutoffHour) {
    case 3:
      return {
        title: "3:00 AM · Night Owl",
        desc: "Your daily progress rolls over at 3:00 AM, not midnight.",
      };
    case 4:
      return {
        title: "4:00 AM · Late Shift",
        desc: "Your daily progress rolls over at 4:00 AM, not midnight.",
      };
    case 5:
      return {
        title: "5:00 AM · Dawn Patrol",
        desc: "Your day rolls over at dawn, so early-morning check-ins count.",
      };
    case 0:
    default:
      return {
        title: "12:00 AM · Standard Midnight",
        desc: "Your daily progress rolls over at midnight each calendar day.",
      };
  }
}

/**
 * Generates the full-width founder welcome email for Habitly.
 * Occupies the whole space (100% width) with the exact content and styling of habitly-founder-welcome-preview.html.
 */
export function getOnboardingCompleteEmailHtml({
  name,
  habits = [],
  dashboardUrl,
  identityTitle,
  identityQuote,
  dayCutoffHour,
  sparksEarned = 150,
  xpEarned = 50,
}: OnboardingCompleteEmailProps): string {
  const rawFirstName = name?.trim().split(/\s+/)[0] || "Friend";
  const safeFirstName = escapeHtml(rawFirstName);
  const dashboardHref = safeUrl(dashboardUrl);
  const cutoffInfo = formatCutoff(dayCutoffHour);

  const safeIdentityTitle = identityTitle ? escapeHtml(identityTitle.trim()) : "";
  const resolvedQuote =
    identityQuote ||
    (identityTitle && IDENTITY_QUOTES[identityTitle]) ||
    (identityTitle && IDENTITY_QUOTES[identityTitle.toLowerCase()]) ||
    "Execute with relentless focus, eliminate distractions, and ship meaningful work.";

  const publicAssetBase =
    process.env.APP_PUBLIC_URL ||
    (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")
      ? process.env.NEXTAUTH_URL
      : "https://compoundio.vercel.app");

  const logoMarkUrl = `${publicAssetBase}/habitly-mark.png`;
  const logoWordmarkUrl = `${publicAssetBase}/habitly-wordmark.png`;

  // Parse habits
  const parsedHabits = Array.isArray(habits)
    ? habits
        .map((h) => {
          if (typeof h === "string") return { title: h, category: "" };
          const title = h?.title || h?.name || "";
          return { title, category: h?.category || "" };
        })
        .filter((h) => h.title.trim().length > 0)
    : [];

  const habitsListRowsHtml = parsedHabits
    .map(
      (h) => `
        <tr>
          <td valign="top" width="18" style="width:18px;padding:7px 0 0 0;">
            <span style="display:block;width:6px;height:6px;border-radius:50%;background:#79bd45;font-size:0;line-height:0;">&nbsp;</span>
          </td>
          <td valign="top" class="habit-text" style="padding:3px 0 0;color:#e5eee6;font-size:13px;line-height:20px;">
            <span style="font-weight:600;">${escapeHtml(h.title)}</span>${
              h.category
                ? `<span class="subtle-copy" style="color:#89958b;font-size:11px;"> &nbsp;&middot;&nbsp; ${escapeHtml(h.category)}</span>`
                : ""
            }
          </td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>A personal welcome to Habitly, ${safeFirstName}</title>
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
      .habit-text { color:#e5eee6 !important; }
      .email-footer { background-color:#111813 !important; border-color:#29352c !important; }
    }
  </style>
</head>
<body bgcolor="#151c17" class="w-full" style="margin:0;padding:0;width:100% !important;min-width:100%;background-color:#151c17;font-family:Arial,Helvetica,sans-serif;color:#eff7ef;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    A personal note from Anurag, founder of Habitly. Your next chapter starts here.
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
              A note from the founder
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Hero & Letter Body (Spans Full Width) -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:32px 48px 8px 48px;background-color:#151c17;">
        <div style="margin:0 0 13px;color:#659b3e;font-size:10px;line-height:15px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
          A fresh start begins here
        </div>
        <h1 class="hero-heading dark-text" style="margin:0 0 19px;color:#eff7ef;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:44px;font-weight:700;letter-spacing:-.8px;">
          Welcome to Habitly, ${safeFirstName}.
        </h1>

        <div class="letter-copy body-copy" style="color:#c1cec3;font-size:15px;line-height:27px;">
          <p style="margin:0 0 17px;">I&rsquo;m Anurag, the founder, and I wanted to take a moment to welcome you personally. I&rsquo;m genuinely glad you&rsquo;re here.</p>
          <p style="margin:0 0 17px;">I started building Habitly around a simple belief: the direction of our lives is shaped by the little things we do every day. We all have habits we want to build &mdash; to become healthier, more focused, more disciplined, or more intentional with our time. And we all have patterns we&rsquo;d like to leave behind: the distractions, procrastination, and routines that quietly hold us back.</p>
          <p style="margin:0 0 17px;">Knowing what you want to change is one thing. Making that change stick is another.</p>
          <p style="margin:0 0 17px;">When you join Habitly, you&rsquo;re trusting us with something personal: your routines, your goals, your struggles, and the person you&rsquo;re working towards becoming. I don&rsquo;t take that lightly.</p>
          <p style="margin:0 0 17px;">I don&rsquo;t want Habitly to make you feel guilty when you miss a day or overwhelmed by expectations you can&rsquo;t sustain. I want it to help you understand your patterns, keep showing up, and make progress at a pace that works for your life. Whether you&rsquo;re building a good habit or working to break an old one, you deserve a tool that supports you without judging you.</p>
          <p style="margin:0 0 17px;">I can&rsquo;t promise that change will always be easy. What I can promise is that we&rsquo;ll keep listening, improving, and building Habitly with your journey in mind. My hope is that it becomes a genuinely useful part of your everyday life.</p>
        </div>
      </td>
    </tr>

    ${
      parsedHabits.length > 0
        ? `
    <!-- Starting Habits Section (Spans Full Width) -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:5px 48px 6px 48px;background-color:#151c17;">
        <div class="soft-rule" style="padding-top:17px;border-top:1px solid #2b392e;">
          <div class="subtle-copy" style="margin:0 0 5px;color:#9eada1;font-size:10px;line-height:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">A few things you&rsquo;re starting with</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:5px 0 0;">
            ${habitsListRowsHtml}
          </table>
        </div>
      </td>
    </tr>
    `
        : ""
    }

    ${
      safeIdentityTitle
        ? `
    <!-- Guiding Identity Section (Spans Full Width) -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:16px 48px 3px 48px;background-color:#151c17;">
        <p class="subtle-copy" style="margin:0;color:#9eada1;font-size:12px;line-height:20px;">
          The identity you&rsquo;re working towards: <strong class="dark-text" style="color:#eff7ef;font-weight:700;">${safeIdentityTitle}</strong><br><span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;">&ldquo;${escapeHtml(resolvedQuote)}&rdquo;</span>
        </p>
      </td>
    </tr>
    `
        : ""
    }

    <!-- Momentum & Reset Cutoff Notice (Spans Full Width) -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:17px 48px 0 48px;background-color:#151c17;">
        <div class="soft-rule" style="padding-top:16px;border-top:1px solid #2b392e;">
          <p class="letter-copy body-copy" style="margin:0;color:#c1cec3;font-size:14px;line-height:24px;">
            Your personal system is ready, ${safeFirstName}. I&rsquo;ve added <strong class="dark-text" style="color:#eff7ef;">${Number(sparksEarned) || 150} Sparks</strong> and <strong class="dark-text" style="color:#eff7ef;">${Number(xpEarned) || 50} XP</strong> to give you a little starting momentum. Your daily reset is set to <strong class="dark-text" style="color:#eff7ef;">${escapeHtml(cutoffInfo.title)}</strong>.
            <span class="subtle-copy" style="display:block;margin-top:4px;color:#879389;font-size:11px;line-height:17px;">${escapeHtml(cutoffInfo.desc)}</span>
          </p>
        </div>
      </td>
    </tr>

    <!-- Closing & Founder Signature (Spans Full Width) -->
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

    <!-- CTA Button & P.S. (Spans Full Width) -->
    <tr>
      <td class="email-pad" bgcolor="#151c17" style="width:100%;padding:24px 48px 28px 48px;background-color:#151c17;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" style="padding:0;">
              <a href="${dashboardHref}" target="_blank" rel="noopener noreferrer" class="cta-button" style="display:inline-block;padding:13px 23px;border-radius:7px;background:#a8fe43;color:#14200e;font-size:13px;line-height:18px;font-weight:700;text-decoration:none;text-align:center;">
                Start your Habitly journey&nbsp; &rarr;
              </a>
            </td>
          </tr>
        </table>
        <p class="subtle-copy" style="margin:18px 0 0;color:#829086;font-size:12px;line-height:20px;">
          P.S. Have a question, some feedback, or an idea that could make Habitly better? Just reply to this email. I value hearing from the people building their journey with us.
        </p>
      </td>
    </tr>

    <!-- Full-Width Footer -->
    <tr>
      <td class="email-footer" align="center" bgcolor="#111813" style="width:100%;padding:24px;background-color:#111813;border-top:1px solid #29352c;">
        <p style="margin:0 0 5px;color:#8b978d;font-size:10px;line-height:15px;font-weight:700;letter-spacing:.6px;">HABITLY &middot; BUILD WHAT MOVES YOU FORWARD</p>
        <p class="subtle-copy" style="margin:0 0 8px;color:#6d7a6e;font-size:10px;line-height:16px;">You&rsquo;re receiving this because you completed onboarding on Habitly.<br>Manage your email preferences in Account Settings.</p>
        <p class="subtle-copy" style="margin:0;color:#6d7a6e;font-size:10px;line-height:16px;">Small actions, repeated with intention, can change a lot.</p>
      </td>
    </tr>

  </table>

</body>
</html>
  `.trim();
}
