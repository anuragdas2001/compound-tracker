import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || (session?.user as any)?.id;
    const dateKey = searchParams.get("dateKey");

    if (!userId || !dateKey) {
      return NextResponse.json({ error: "userId and dateKey are required" }, { status: 400 });
    }

    const note = await prisma.dailyNote.findUnique({
      where: { userId_dateKey: { userId, dateKey } },
    });

    return NextResponse.json(note || { userId, dateKey, content: "" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch note";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const userId = body.userId || (session?.user as any)?.id;
    const { dateKey, content = "" } = body;

    if (!userId || !dateKey) {
      return NextResponse.json({ error: "userId and dateKey are required" }, { status: 400 });
    }

    const note = await prisma.dailyNote.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      create: { userId, dateKey, content },
      update: { content },
    });

    return NextResponse.json(note);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to save note";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

