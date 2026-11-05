import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

  if (!token || !email) {
    return NextResponse.redirect(
      new URL("/login?error=InvalidVerificationLink", baseUrl)
    );
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Look for matching token
    const record = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: normalizedEmail,
      },
    });

    if (!record) {
      return NextResponse.redirect(
        new URL("/login?error=VerificationTokenNotFound", baseUrl)
      );
    }

    // Check expiry
    if (new Date() > record.expires) {
      // Clean up expired token
      await prisma.verificationToken.deleteMany({
        where: { token },
      });
      return NextResponse.redirect(
        new URL("/login?error=VerificationTokenExpired", baseUrl)
      );
    }

    // Mark user email as verified
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    });

    // Delete token once used
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    // Redirect to dashboard with verified flag
    return NextResponse.redirect(
      new URL("/dashboard?verified=true", baseUrl)
    );
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.redirect(
      new URL("/login?error=VerificationFailed", baseUrl)
    );
  }
}

