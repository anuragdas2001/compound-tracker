import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendWelcomeEmail } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        password: hashedPassword,
        gamification: {
          create: {
            totalXp: 0,
            level: 1,
            sparksBalance: 150,
          },
        },
      },
    });

    // Generate email verification token (valid for 24 hours)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send Welcome Email with verification link via Resend (or dev console fallback)
    try {
      await sendWelcomeEmail({
        email: normalizedEmail,
        name: user.name,
        verificationUrl,
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
      // Non-blocking: registration still succeeds even if email dispatch fails
    }

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
