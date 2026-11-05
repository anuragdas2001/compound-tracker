import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '@repo/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        dayCutoffHour: true,
        plan: true,
        hasCompletedOnboarding: true,
        habits: { select: { id: true }, take: 1 },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      dayCutoffHour: user.dayCutoffHour ?? 0,
      plan: user.plan,
      hasCompletedOnboarding: Boolean(
        user.hasCompletedOnboarding || (user.habits && user.habits.length > 0)
      ),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dayCutoffHour } = body;

    if (typeof dayCutoffHour !== 'number' || dayCutoffHour < 0 || dayCutoffHour > 23) {
      return NextResponse.json(
        { error: 'Invalid dayCutoffHour. Must be an integer between 0 and 23.' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: { dayCutoffHour: Math.floor(dayCutoffHour) },
      select: { dayCutoffHour: true },
    });

    return NextResponse.json({
      success: true,
      dayCutoffHour: updated.dayCutoffHour,
      message: 'Day reset window updated successfully',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

