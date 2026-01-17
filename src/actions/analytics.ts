
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [revenueResult, orderCount, lowStockCount] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          updatedAt: { gte: today },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.inventoryItem.count({
        where: {
          quantity: { lte: prisma.inventoryItem.fields.threshold },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        todayRevenue: revenueResult._sum.totalAmount || 0,
        todayOrders: orderCount,
        lowStockAlerts: lowStockCount,
      },
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}

export async function getSalesReport(startDate: Date, endDate: Date) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                status: "COMPLETED",
                updatedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                items: {
                    include: { menuItem: true }
                },
                user: {
                    select: { name: true }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        return { success: true, data: orders };
    } catch (error) {
        return { success: false, error: "Failed to fetch sales report" };
    }
}
