
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// --- Table Actions ---

export async function getTables() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      include: {
        orders: {
          where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }
        }
      },
      orderBy: { number: "asc" },
    });
    return { success: true, data: tables };
  } catch {
    return { success: false, error: "Failed to fetch tables" };
  }
}

export async function createTable(number: string, capacity: number) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.restaurantTable.create({
      data: { number, capacity: Number(capacity) },
    });
    revalidatePath("/dashboard/tables");
    return { success: true, message: "Table created" };
  } catch {
    return { success: false, error: "Failed to create table" };
  }
}

export async function updateTableStatus(id: string, status: string) {
  const session = await auth();
  const allowedRoles = ["ADMIN", "MANAGER", "CASHIER"];
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.restaurantTable.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/tables");
    return { success: true, message: "Table status updated" };
  } catch {
    return { success: false, error: "Failed to update table status" };
  }
}

export async function deleteTable(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
      return { success: false, error: "Unauthorized" };
    }
  
    try {
      await prisma.restaurantTable.delete({ where: { id } });
      revalidatePath("/dashboard/tables");
      return { success: true, message: "Table deleted" };
    } catch {
      return { success: false, error: "Failed to delete table" };
    }
}

// --- Reservation Actions ---

export async function getReservations() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { restaurantTable: true },
      orderBy: { startTime: "asc" },
    });
    return { success: true, data: reservations };
  } catch {
    return { success: false, error: "Failed to fetch reservations" };
  }
}

export async function getReservationsByDate(date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await prisma.reservation.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { restaurantTable: true },
      orderBy: { startTime: "asc" },
    });
    return { success: true, data: reservations };
  } catch {
    return { success: false, error: "Failed to fetch reservations" };
  }
}

export async function createReservation(data: {
  customerName: string;
  customerPhone?: string;
  guestCount: number;
  startTime: Date;
  durationMinutes?: number;
  tableId: string;
}) {
  const session = await auth();
  const allowedRoles = ["ADMIN", "MANAGER", "CASHIER"];
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + (data.durationMinutes || 120) * 60000);

    // Conflict Check: Any reservation for the same table that overlaps
    const conflict = await prisma.reservation.findFirst({
      where: {
        tableId: data.tableId,
        status: "CONFIRMED",
        AND: [
          { startTime: { lt: endTime } },
          { 
            OR: [
              { endTime: { gt: startTime } },
              // If endTime is null, assume it lasts 2 hours for conflict check
              { 
                AND: [
                  { endTime: null },
                  { startTime: { gt: new Date(startTime.getTime() - 120 * 60000) } }
                ] 
              }
            ]
          }
        ]
      }
    });

    if (conflict) {
      return { success: false, error: "Table is already reserved for this time slot" };
    }

    await prisma.reservation.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guestCount: Number(data.guestCount),
        startTime,
        endTime,
        tableId: data.tableId,
      },
    });
    
    revalidatePath("/dashboard/tables");
    return { success: true, message: "Reservation confirmed" };
  } catch (error) {
    console.error("Create Reservation Error:", error);
    return { success: false, error: "Failed to create reservation" };
  }
}

export async function completeReservation(id: string) {
    const session = await auth();
    const allowedRoles = ["ADMIN", "MANAGER", "CASHIER"];
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: "Unauthorized" };
    }
  
    try {
      await prisma.reservation.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      revalidatePath("/dashboard/tables");
      return { success: true, message: "Reservation marked as completed" };
    } catch {
      return { success: false, error: "Failed to complete reservation" };
    }
}

export async function cancelReservation(id: string) {
    const session = await auth();
    const allowedRoles = ["ADMIN", "MANAGER", "CASHIER"];
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: "Unauthorized" };
    }
  
    try {
      await prisma.reservation.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      revalidatePath("/dashboard/tables");
      return { success: true, message: "Reservation cancelled" };
    } catch {
      return { success: false, error: "Failed to cancel reservation" };
    }
}
