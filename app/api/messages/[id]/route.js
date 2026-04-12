import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function DELETE(req, { params }) {
  try {
    const resolvedParams = await params;
    const messageId = resolvedParams.id;
    
    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || "supersecretkeywow1234")
    );
    const userId = verified.payload.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.receiverId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error deleting message" }, { status: 500 });
  }
}
