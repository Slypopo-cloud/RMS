
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

// --- Schemas ---

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
});

const MenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  image: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  available: z.boolean().default(true),
});

// --- Categories ---

export async function getCategories() {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: categories };
  } catch {
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function createCategory(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return { success: false, error: "Unauthorized" };
  }

  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.menuCategory.create({
      data: validatedFields.data,
    });
    revalidatePath("/dashboard/menu");
    return { success: true, message: "Category created" };
  } catch {
    return { success: false, error: "Failed to create category (Slug might be taken)" };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.menuCategory.delete({ where: { id } });
    revalidatePath("/dashboard/menu");
    return { success: true, message: "Category deleted" };
  } catch {
    return { success: false, error: "Failed to delete category" };
  }
}

// --- Menu Items ---

export async function getMenuItems() {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: items };
  } catch {
    return { success: false, error: "Failed to fetch menu items" };
  }
}

export async function createMenuItem(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
     return { success: false, error: "Unauthorized" };
  }

  const validatedFields = MenuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    image: formData.get("image") || undefined, // Optional
    available: formData.get("available") === "on",
  });

  if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.menuItem.create({
      data: validatedFields.data,
    });
    revalidatePath("/dashboard/menu");
    return { success: true, message: "Item created" };

  } catch {
      return { success: false, error: "Failed to create item" };
  }
}

export async function deleteMenuItem(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
        return { success: false, error: "Unauthorized" };
    }
  
    try {
      await prisma.menuItem.delete({ where: { id } });
      revalidatePath("/dashboard/menu");
      return { success: true, message: "Item deleted" };
    } catch {
      return { success: false, error: "Failed to delete item" };
    }
}

export async function toggleItemAvailability(id: string, currentStatus: boolean) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.menuItem.update({
            where: { id },
            data: { available: !currentStatus }
        });
        revalidatePath("/dashboard/menu");
        return { success: true, message: "Status updated" }
    } catch {
        return { success: false, error: "Failed to update status" }
    }
}
