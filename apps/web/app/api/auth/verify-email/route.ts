import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@repo/db';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email/resend';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email.toLowerCase().trim();

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine
  }

  // If instant verification is requested (e.g., dev bypass)
  if (body.instant === true) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    return NextResponse.json({ success: true, verified: true });
  }

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Remove any previous token for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  // Dispatch email
  await sendVerificationEmail({
    email,
    name: session.user.name,
    verificationUrl,
  });

  return NextResponse.json({
    success: true,
    message: 'Verification email sent successfully',
    verificationUrl: process.env.NODE_ENV === 'development' ? verificationUrl : undefined,
  });
}
