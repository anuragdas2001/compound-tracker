import Razorpay from "razorpay";
import crypto from "crypto";

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Pricing catalog in INR Paise (1 INR = 100 Paise)
export const PRICING_CONFIG = {
  PRO: {
    monthly: {
      amount: 59900, // ₹599/month
      displayPrice: 599,
      currency: "INR",
      planName: "Pro (Monthly)",
    },
    yearly: {
      amount: 499900, // ₹4,999/year (Save ~30%)
      displayPrice: 4999,
      currency: "INR",
      planName: "Pro (Annual)",
    },
  },
  ELITE: {
    lifetime: {
      amount: 1499900, // ₹14,999 One-time
      displayPrice: 14999,
      currency: "INR",
      planName: "Elite (Lifetime)",
    },
  },
} as const;

export function getRazorpayClient(): Razorpay | null {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

export interface CreateOrderParams {
  amount: number; // in paise
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}: CreateOrderParams) {
  const client = getRazorpayClient();

  if (!client) {
    // Development / Fallback Mock Mode
    console.log("\n=======================================================");
    console.log("💳 [RAZORPAY DEV MOCK] (RAZORPAY_KEY_ID / SECRET not set)");
    console.log(`Receipt: ${receipt}`);
    console.log(`Amount:  ₹${amount / 100} (${amount} paise)`);
    console.log(`Currency: ${currency}`);
    console.log(`Notes:   `, notes);
    console.log("=======================================================\n");

    return {
      id: `order_mock_${Date.now()}`,
      amount,
      currency,
      receipt,
      status: "created",
      simulated: true,
    };
  }

  const order = await client.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });

  return {
    ...order,
    simulated: false,
  };
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (orderId.startsWith("order_mock_")) {
    return true; // Auto-verify simulated dev orders
  }

  if (!RAZORPAY_KEY_SECRET) {
    console.warn("[Razorpay] Missing RAZORPAY_KEY_SECRET for signature verification.");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

