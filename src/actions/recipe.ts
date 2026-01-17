
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        menuItem: true,
        ingredients: {
          include: {
            inventoryItem: true
          }
        }
      }
    });
    return { success: true, data: recipes };
  } catch (error) {
    return { success: false, error: "Failed to fetch recipes" };
  }
}

export async function upsertRecipe(menuItemId: string, ingredients: { inventoryItemId: string, quantity: number }[]) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Delete existing recipe if it exists to replace it entirely
    // This is simpler for a basic implementation than syncing ingredients
    const existing = await prisma.recipe.findUnique({
      where: { menuItemId }
    });

    if (existing) {
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: existing.id }
      });
      await prisma.recipe.delete({
          where: { id: existing.id }
      });
    }

    await prisma.recipe.create({
      data: {
        menuItemId,
        ingredients: {
          create: ingredients.map(ing => ({
            inventoryItemId: ing.inventoryItemId,
            quantity: ing.quantity
          }))
        }
      }
    });

    revalidatePath("/dashboard/menu");
    return { success: true, message: "Recipe saved successfully" };
  } catch (error) {
    console.error("Upsert Recipe Error:", error);
    return { success: false, error: "Failed to save recipe" };
  }
}

export async function deleteRecipe(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.recipeIngredient.deleteMany({
            where: { recipeId: id }
        });
        await prisma.recipe.delete({
            where: { id }
        });
        revalidatePath("/dashboard/menu");
        return { success: true, message: "Recipe deleted" };
    } catch (error) {
        return { success: false, error: "Failed to delete recipe" };
    }
}
