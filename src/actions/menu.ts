
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

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

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const categoryId = formData.get("categoryId") as string;
  const available = formData.get("available") === "on";
  const imageFile = formData.get("image") as File | null;

  let imagePath = undefined;

  if (imageFile && imageFile.size > 0) {
    // Validate image
    if (!imageFile.type.startsWith("image/")) {
        return { success: false, error: "Invalid file type. Please upload an image." };
    }
    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
        return { success: false, error: "Image too large. Max size is 5MB." };
    }

    try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public/uploads/menu");
        await mkdir(uploadDir, { recursive: true });

        const filename = `${crypto.randomUUID()}-${imageFile.name.replace(/\s+/g, "-")}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);
        imagePath = `/uploads/menu/${filename}`;
    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Failed to save image" };
    }
  }

  const validatedFields = MenuItemSchema.safeParse({
    name,
    description,
    price,
    categoryId,
    image: imagePath,
    available,
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

  } catch (error) {
      console.error("Database error:", error);
      return { success: false, error: "Failed to create item" };
  }
}

export async function deleteMenuItem(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
        return { success: false, error: "Unauthorized" };
    }
  
    try {
      // Find item first to get image path
      const item = await prisma.menuItem.findUnique({
        where: { id },
        select: { image: true }
      });

      await prisma.menuItem.delete({ where: { id } });

      // If item had an image, delete it from storage
      if (item?.image && item.image.startsWith("/uploads/")) {
        const filepath = path.join(process.cwd(), "public", item.image);
        try {
            await unlink(filepath);
        } catch (err) {
            console.error("Failed to delete image file:", err);
            // Non-blocking error
        }
      }

      revalidatePath("/dashboard/menu");
      return { success: true, message: "Item deleted" };
    } catch (error) {
      console.error("Delete error:", error);
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
