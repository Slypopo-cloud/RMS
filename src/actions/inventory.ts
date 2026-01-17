
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

const InventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().int().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  threshold: z.coerce.number().int().min(0, "Threshold must be positive"),
});

export async function getInventory() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Failed to fetch inventory" };
  }
}

export async function createInventoryItem(prevState: any, formData: FormData) {
  const session = await auth();
    // Allow Admin, Manager, Kitchen Staff to manage inventory? Maybe just Admin/Manager/Kitchen.
  const allowedRoles = ["ADMIN", "MANAGER", "KITCHEN_STAFF"];
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const validatedFields = InventoryItemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    threshold: formData.get("threshold"),
  });

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.inventoryItem.create({
      data: validatedFields.data,
    });
    revalidatePath("/dashboard/inventory");
    return { success: true, message: "Item created" };
  } catch (error) {
    return { success: false, error: "Failed to create item" };
  }
}

export async function updateInventoryItem(id: string, data: { quantity: number }) {
    const session = await auth();
    const allowedRoles = ["ADMIN", "MANAGER", "KITCHEN_STAFF"];
    if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
      return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.inventoryItem.update({
            where: { id },
            data: { quantity: data.quantity }
        });
        revalidatePath("/dashboard/inventory");
        return { success: true, message: "Updated" };
    } catch (error) {
        return { success: false, error: "Failed to update" };
    }
}

export async function deleteInventoryItem(id: string) {
  const session = await auth();
  const allowedRoles = ["ADMIN", "MANAGER"]; // Only Admin/Manager can delete
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.inventoryItem.delete({ where: { id } });
    revalidatePath("/dashboard/inventory");
    return { success: true, message: "Item deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete item" };
  }
}
