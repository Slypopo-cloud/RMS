"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface OrderData {
  name: string;
  email: string;
  items: {
    menuItemId: string;
    quantity: number;
    price: number;
  }[];
}

export async function createPublicOrder(data: OrderData) {
  if (data.items.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    // Note: In a real app, we'd handle payment here.
    // For now, we just create the order as TAKEAWAY from a guest.

    // 1. Fetch recipes for inventory check
    const menuItemIds = data.items.map(i => i.menuItemId);
    const recipes = await prisma.recipe.findMany({
      where: { menuItemId: { in: menuItemIds } },
      include: { ingredients: true }
    });

    const inventoryUpdates: Record<string, number> = {};
    data.items.forEach(orderItem => {
      const recipe = recipes.find(r => r.menuItemId === orderItem.menuItemId);
      if (recipe) {
        recipe.ingredients.forEach(ingredient => {
          const totalDeduction = ingredient.quantity * orderItem.quantity;
          inventoryUpdates[ingredient.inventoryItemId] = (inventoryUpdates[ingredient.inventoryItemId] || 0) + totalDeduction;
        });
      }
    });

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          totalAmount,
          type: "TAKEAWAY",
          status: "PENDING",
          paymentStatus: "UNPAID",
          items: {
            create: data.items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
      });

      // Update inventory
      for (const [inventoryItemId, deduction] of Object.entries(inventoryUpdates)) {
        await tx.inventoryItem.update({
          where: { id: inventoryItemId },
          data: {
            quantity: {
              decrement: Math.round(deduction)
            }
          }
        });
      }

      return newOrder;
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/kitchen");

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Public Order Error:", error);
    return { success: false, error: "Failed to place order. Technical distortion." };
  }
}
