export interface PaymentReceiptEmailProps {
  name?: string | null;
  plan: string;
  amount: number; // in Rupees, e.g. 599, 4999, 14999
  orderId: string;
  paymentId?: string;
  bonusSparks?: number;
  dashboardUrl?: string;
}

export function getPaymentReceiptEmailHtml({
  name,
  plan,
  amount,
  orderId,
  paymentId,
  bonusSparks = 500,
  dashboardUrl = "http://localhost:3001/dashboard",
}: PaymentReceiptEmailProps): string {
  const displayName = name ? name : "Habit Architect";
  const formattedAmount = `₹${amount.toLocaleString("en-IN")}`;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed — Welcome to Habitly ${plan}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d11; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #14171f; border-radius: 16px; border: 1px solid #232734; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Gold/Lime Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #a8fe43 0%, #f59e0b 100%);"></td>
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
                    <span style="background-color: rgba(168, 254, 67, 0.15); color: #a8fe43; border: 1px solid rgba(168, 254, 67, 0.3); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                      PAYMENT CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 12px 0 12px 0;">
                Welcome to ${plan}, ${displayName}! 💎
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                Thank you for investing in your personal compounding. Your Razorpay payment of <strong style="color: #ffffff;">${formattedAmount}</strong> has been successfully processed and your membership is active immediately.
              </p>

              <!-- Receipt Details Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1a1e29; border-radius: 12px; border: 1px solid #232734; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Plan</td>
                        <td align="right" style="font-size: 13px; font-weight: 700; color: #a8fe43; padding-bottom: 8px;">${plan} Membership</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Amount Paid</td>
                        <td align="right" style="font-size: 13px; font-weight: 700; color: #ffffff; padding-bottom: 8px;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Date</td>
                        <td align="right" style="font-size: 13px; color: #94a3b8; padding-bottom: 8px;">${currentDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748b; padding-bottom: 8px;">Order Reference</td>
                        <td align="right" style="font-size: 11px; font-family: monospace; color: #94a3b8; padding-bottom: 8px;">${orderId}</td>
                      </tr>
                      ${
                        paymentId
                          ? `<tr>
                        <td style="font-size: 12px; color: #64748b;">Payment ID</td>
                        <td align="right" style="font-size: 11px; font-family: monospace; color: #94a3b8;">${paymentId}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Perks Unlocked Notice -->
              <div style="background-color: rgba(168, 254, 67, 0.05); border: 1px solid rgba(168, 254, 67, 0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                  ⚡ Perks Unlocked Instantly:
                </div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                  • Unlimited Daily Habits tracking<br>
                  • Custom weekly schedules (Mon/Wed/Fri, etc.)<br>
                  • Advanced 140-day compounding heatmaps<br>
                  • <strong style="color: #a8fe43;">+${bonusSparks} Sparks Bonus</strong> deposited into your vault
                </div>
              </div>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 20px 0;">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background-color: #a8fe43; color: #0c0d11; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; letter-spacing: -0.2px; text-align: center; box-shadow: 0 4px 14px rgba(168, 254, 67, 0.35);">
                      Open Pro Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 12px 0 0 0; text-align: center;">
                Need an invoice or have a billing question? Simply reply directly to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e1017; padding: 20px 36px; border-top: 1px solid #232734; font-size: 12px; color: #64748b; text-align: center;">
              Habitly • Powered by Razorpay Secure Payments
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

