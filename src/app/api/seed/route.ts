import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "admin@rms.com";
    const password = await bcrypt.hash("admin123", 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username: "admin",
        name: "Admin User",
        password,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
