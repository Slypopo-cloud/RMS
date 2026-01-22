"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function clockIn(userId: string) {
  try {
    // Check if user already has an active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId,
        status: "ACTIVE"
      }
    });

    if (activeShift) {
      return { success: false, error: "Already clocked in." };
    }

    await prisma.shift.create({
      data: {
        userId,
        status: "ACTIVE",
        startTime: new Date()
      }
    });

    revalidatePath("/dashboard/shifts");
    return { success: true };
  } catch (error) {
    console.error("Clock In Error:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function clockOut(shiftId: string, notes?: string) {
  try {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId }
    });

    if (!shift || shift.status === "COMPLETED") {
      return { success: false, error: "Invalid shift." };
    }

    await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
        notes
      }
    });

    revalidatePath("/dashboard/shifts");
    return { success: true };
  } catch (error) {
    console.error("Clock Out Error:", error);
    return { success: false, error: "Internal server error." };
  }
}

export async function getActiveShift(userId: string) {
  try {
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId,
        status: "ACTIVE"
      }
    });
    return { success: true, data: activeShift };
  } catch (error) {
    console.error("Get Active Shift Error:", error);
    return { success: false, error: "Failed to fetch shift." };
  }
}

export async function getRecentShifts(limit = 10) {
  try {
    const shifts = await prisma.shift.findMany({
      include: {
        user: { select: { name: true, role: true } }
      },
      orderBy: { startTime: "desc" },
      take: limit
    });
    return { success: true, data: shifts };
  } catch (error) {
    console.error("Get Recent Shifts Error:", error);
    return { success: false, error: "Failed to fetch shifts." };
  }
}
