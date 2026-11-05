import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@repo/db";
import { sendPaymentReceiptEmail } from "@/lib/email/resend";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[Razorpay Webhook Received]: ${eventType}`);

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
          include: { user: true },
        });

        if (paymentRecord && paymentRecord.status !== "captured") {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: "captured",
                razorpayPaymentId: paymentId || paymentRecord.razorpayPaymentId,
              },
            }),
            prisma.user.update({
              where: { id: paymentRecord.userId },
              data: { plan: paymentRecord.plan },
            }),
          ]);

          if (paymentRecord.user?.email) {
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
            try {
              await sendPaymentReceiptEmail({
                email: paymentRecord.user.email,
                name: paymentRecord.user.name,
                plan: paymentRecord.plan,
                amount: Math.round(paymentRecord.amount / 100),
                orderId: paymentRecord.razorpayOrderId,
                paymentId: paymentId || paymentRecord.razorpayPaymentId || undefined,
                dashboardUrl: `${baseUrl}/dashboard`,
              });
            } catch (emailErr) {
              console.error("[Webhook Email Error]:", emailErr);
            }
          }
        }
      }
    } else if (eventType === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        await prisma.payment.updateMany({
          where: { razorpayOrderId: orderId },
          data: { status: "failed" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook handler failed";
    console.error("[Razorpay Webhook Error]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

