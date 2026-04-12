import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const username = resolvedParams.username;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        avatarUrl: true,
        bio: true,
        messages: {
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            replyText: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
