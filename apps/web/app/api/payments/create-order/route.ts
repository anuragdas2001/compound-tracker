import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, Plan } from "@repo/db";
import { createOrder, PRICING_CONFIG, RAZORPAY_KEY_ID } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required to initiate checkout" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan, interval = "monthly" } = body as {
      plan: "PRO" | "ELITE";
      interval?: "monthly" | "yearly" | "lifetime";
    };

    if (plan !== "PRO" && plan !== "ELITE") {
      return NextResponse.json(
        { error: "Invalid plan. Choose either 'PRO' or 'ELITE'." },
        { status: 400 }
      );
    }

    // Determine pricing configuration
    let selectedTier;
    if (plan === "PRO") {
      selectedTier =
        interval === "yearly"
          ? PRICING_CONFIG.PRO.yearly
          : PRICING_CONFIG.PRO.monthly;
    } else {
      selectedTier = PRICING_CONFIG.ELITE.lifetime;
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, plan: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.plan === "ELITE") {
      return NextResponse.json(
        { error: "You already hold an Elite Lifetime membership." },
        { status: 400 }
      );
    }

    if (dbUser.plan === "PRO" && plan === "PRO") {
      return NextResponse.json(
        { error: "You already have an active Pro subscription." },
        { status: 400 }
      );
    }

    const receipt = `rcpt_${dbUser.id.slice(-6)}_${Date.now().toString().slice(-6)}`;

    const order = await createOrder({
      amount: selectedTier.amount,
      currency: selectedTier.currency,
      receipt,
      notes: {
        userId: dbUser.id,
        plan,
        interval,
        userEmail: dbUser.email || "",
      },
    });

    // Store pending payment in database
    await prisma.payment.create({
      data: {
        userId: dbUser.id,
        razorpayOrderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        plan: plan as Plan,
        interval,
        status: "created",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: selectedTier.planName,
      keyId: RAZORPAY_KEY_ID || "rzp_test_mock_key",
      simulated: (order as any).simulated || false,
      user: {
        name: dbUser.name || session.user.name || "Explorer",
        email: dbUser.email,
      },
    });
  } catch (error: unknown) {
    console.error("[Create Order Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

