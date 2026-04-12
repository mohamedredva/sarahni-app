import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req) {
  try {
    const { bio, avatarUrl, telegramChatId } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || "supersecretkeywow1234")
    );
    const userId = verified.payload.id;

    await prisma.user.update({
      where: { id: userId },
      data: { bio, avatarUrl, telegramChatId }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error updating settings" }, { status: 500 });
  }
}
