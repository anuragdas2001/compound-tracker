import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required to verify payment" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, paymentId, signature } = body as {
      orderId: string;
      paymentId: string;
      signature: string;
    };

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: "Missing required payment details (orderId, paymentId)" },
        { status: 400 }
      );
    }

    // Verify signature (auto-passes for simulated mock orders)
    const isValid = verifyPaymentSignature({ orderId, paymentId, signature });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature. Payment could not be verified." },
        { status: 400 }
      );
    }

    // Fetch the payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Order record not found" },
        { status: 404 }
      );
    }

    // Upgrade the user plan and mark payment as captured
    const upgradedPlan = payment.plan;
    const bonusSparks = upgradedPlan === "ELITE" ? 2000 : 500;

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "captured",
          razorpayPaymentId: paymentId,
          razorpaySignature: signature || "simulated_signature",
        },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: upgradedPlan,
        },
      }),
      // Bonus sparks for upgrading
      prisma.userGamification.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          totalXp: 100,
          level: 1,
          sparksBalance: 150 + bonusSparks,
        },
        update: {
          sparksBalance: {
            increment: bonusSparks,
          },
        },
      }),
      // Add in-app notification
      prisma.notification.create({
        data: {
          userId: payment.userId,
          type: "PLAN_UPGRADE",
          title: `Welcome to ${upgradedPlan}! ⚡`,
          body: `Your account is now upgraded to ${upgradedPlan}. +${bonusSparks} bonus Sparks have been deposited into your vault!`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      plan: upgradedPlan,
      message: `Successfully upgraded to ${upgradedPlan}!`,
      bonusSparks,
    });
  } catch (error: unknown) {
    console.error("[Verify Payment Error]:", error);
    const msg = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

