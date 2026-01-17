
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createOrder(items: { menuItemId: string; quantity: number; price: number }[]) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (items.length === 0) {
    return { success: false, error: "Order must have at least one item" };
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    // Fetch recipes for the items in the order
    const menuItemIds = items.map(i => i.menuItemId);
    const recipes = await prisma.recipe.findMany({
      where: { menuItemId: { in: menuItemIds } },
      include: { ingredients: true }
    });

    // Calculate total inventory deductions
    const inventoryUpdates: Record<string, number> = {};
    items.forEach(orderItem => {
      const recipe = recipes.find((r: any) => r.menuItemId === orderItem.menuItemId);
      if (recipe) {
        recipe.ingredients.forEach((ingredient: any) => {
          const totalDeduction = ingredient.quantity * orderItem.quantity;
          inventoryUpdates[ingredient.inventoryItemId] = (inventoryUpdates[ingredient.inventoryItemId] || 0) + totalDeduction;
        });
      }
    });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.order.create({
        data: {
          totalAmount,
          userId: session.user.id,
          items: {
            create: items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // 2. Update inventory for each required ingredient
      for (const [inventoryItemId, deduction] of Object.entries(inventoryUpdates)) {
        await tx.inventoryItem.update({
          where: { id: inventoryItemId },
          data: {
            quantity: {
              decrement: Math.round(deduction) // Quantity is Int in schema
            }
          }
        });
      }

      return order;
    });

    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/kitchen");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");

    return { success: true, message: "Order placed successfully", orderId: result.id };
  } catch (error) {
    console.error("Create Order Error:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function getOrders(status?: string) {
  try {
    const where = status ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
            select: { name: true, username: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: "Failed to fetch orders" };
  }
}


export async function updateOrderStatus(orderId: string, newStatus: string) {
    const session = await auth();
    // Allow Kitchen, Manager, Admin to update status
    const allowedRoles = ["ADMIN", "MANAGER", "KITCHEN_STAFF"];
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
       return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        revalidatePath("/dashboard/pos");
        revalidatePath("/dashboard/kitchen");
        revalidatePath("/dashboard/orders");
        return { success: true, message: "Order status updated" };
    } catch (error) {
         return { success: false, error: "Failed to update order status" };
    }
}
