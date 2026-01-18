import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const password = await bcrypt.hash("admin123", 10);

    const users = [
      {
        email: "admin@rms.com",
        username: "admin",
        name: "Admin User",
        password,
        role: "ADMIN",
      },
      {
        email: "manager@rms.com",
        username: "manager",
        name: "Manager User",
        password,
        role: "MANAGER",
      },
      {
        email: "cashier@rms.com",
        username: "cashier",
        name: "Cashier User",
        password,
        role: "CASHIER",
      },
      {
        email: "kitchen@rms.com",
        username: "kitchen",
        name: "Kitchen Staff",
        password,
        role: "KITCHEN_STAFF",
      },
    ];

    const results = await Promise.all(
      users.map((user) =>
        prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: user,
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length, users: results.map(u => ({ username: u.username, role: u.role })) });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
