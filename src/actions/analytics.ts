
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [revenueResult, orderCount, lowStockCount, lowStockItems] = await Promise.all([
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
      prisma.inventoryItem.findMany({
        where: {
          quantity: { lte: prisma.inventoryItem.fields.threshold },
        },
        take: 6,
      }),
    ]);

    return {
      success: true,
      data: {
        todayRevenue: revenueResult._sum.totalAmount || 0,
        todayOrders: orderCount,
        lowStockAlerts: lowStockCount,
        lowStockItems: lowStockCount > 0 ? lowStockItems : [],
      },
    };
  } catch {
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
    } catch {
    return { success: false, error: "Failed to fetch sales report" };
  }
}

export async function exportSalesReportCSV(startDate: Date, endDate: Date) {
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

        // Generate CSV Header
        let csvContent = "Date,Order ID,Items,Operator,Total Amount\n";

        // Generate CSV Rows
        orders.forEach(order => {
            const date = new Date(order.updatedAt).toLocaleString();
            const orderId = order.id.slice(-6).toUpperCase();
            const items = order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(" | ");
            const operator = order.user?.name || "Counter";
            const amount = order.totalAmount.toFixed(2);
            
            // Basic CSV escaping for items just in case
            csvContent += `"${date}","${orderId}","${items}","${operator}",${amount}\n`;
        });

        return { success: true, data: csvContent };
    } catch (error) {
        console.error("Export CSV Error:", error);
        return { success: false, error: "Failed to generate export" };
    }
}

export async function getTopSellingItems(startDate: Date, endDate: Date, limit: number = 5) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const result = await prisma.orderItem.groupBy({
            by: ['menuItemId'],
            where: {
                order: {
                    status: "COMPLETED",
                    updatedAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                }
            },
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: limit
        });

        // Fetch menu item names for the result
        const itemsWithDetails = await Promise.all(result.map(async (row) => {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: row.menuItemId },
                select: { name: true, price: true }
            });
            return {
                name: menuItem?.name || "Unknown",
                quantity: row._sum.quantity || 0,
                revenue: (menuItem?.price || 0) * (row._sum.quantity || 0)
            };
        }));

        return { success: true, data: itemsWithDetails };
    } catch (error) {
        console.error("Top Selling Items Error:", error);
        return { success: false, error: "Failed to fetch top selling items" };
    }
}

export async function getHourlySales(startDate: Date, endDate: Date) {
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
                }
            },
            select: {
                updatedAt: true,
                totalAmount: true
            }
        });

        // Initialize 24 hours
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            count: 0,
            revenue: 0
        }));

        orders.forEach(order => {
            const hour = new Date(order.updatedAt).getHours();
            hourlyData[hour].count += 1;
            hourlyData[hour].revenue += order.totalAmount;
        });

        return { success: true, data: hourlyData };
    } catch (error) {
        console.error("Hourly Sales Error:", error);
        return { success: false, error: "Failed to fetch hourly analytics" };
    }
}

export async function getCategoryRevenue(startDate: Date, endDate: Date) {
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
                }
            },
            include: {
                items: {
                    include: {
                        menuItem: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });

        // Aggregate by category
        const categoryMap = new Map<string, { revenue: number; count: number }>();
        
        orders.forEach(order => {
            order.items.forEach(item => {
                const categoryName = item.menuItem.category.name;
                const itemRevenue = item.quantity * item.menuItem.price;
                
                const existing = categoryMap.get(categoryName) || { revenue: 0, count: 0 };
                categoryMap.set(categoryName, {
                    revenue: existing.revenue + itemRevenue,
                    count: existing.count + item.quantity
                });
            });
        });

        const categoryData = Array.from(categoryMap.entries()).map(([name, data]) => ({
            category: name,
            revenue: data.revenue,
            itemsSold: data.count
        })).sort((a, b) => b.revenue - a.revenue);

        return { success: true, data: categoryData };
    } catch (error) {
        console.error("Category Revenue Error:", error);
        return { success: false, error: "Failed to fetch category revenue" };
    }
}

export async function getStaffPerformance(startDate: Date, endDate: Date) {
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
                }
            },
            include: {
                user: {
                    select: { name: true, username: true }
                }
            }
        });

        // Aggregate by user
        const userMap = new Map<string, { name: string; orderCount: number; revenue: number }>();
        
        orders.forEach(order => {
            const userName = order.user?.name || "Counter";
            const existing = userMap.get(userName) || { name: userName, orderCount: 0, revenue: 0 };
            userMap.set(userName, {
                name: userName,
                orderCount: existing.orderCount + 1,
                revenue: existing.revenue + order.totalAmount
            });
        });

        const staffData = Array.from(userMap.values())
            .sort((a, b) => b.revenue - a.revenue);

        return { success: true, data: staffData };
    } catch (error) {
        console.error("Staff Performance Error:", error);
        return { success: false, error: "Failed to fetch staff performance" };
    }
}

export async function getLaborAnalytics(startDate: Date, endDate: Date) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const shifts = await prisma.shift.findMany({
            where: {
                startTime: { gte: startDate },
                endTime: { lte: endDate, not: null }
            }
        });

        let totalMinutes = 0;
        shifts.forEach(shift => {
            if (shift.endTime) {
                totalMinutes += (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / 60000;
            }
        });

        const totalHours = totalMinutes / 60;
        const estHourlyRate = 25; // Placeholder GH₵ per hour
        const estLaborCost = totalHours * estHourlyRate;

        return { 
            success: true, 
            data: { 
                totalHours: parseFloat(totalHours.toFixed(1)), 
                estLaborCost: parseFloat(estLaborCost.toFixed(2)),
                shiftCount: shifts.length
            } 
        };
    } catch (error) {
        console.error("Labor Analytics Error:", error);
        return { success: false, error: "Failed to fetch labor data" };
    }
}
