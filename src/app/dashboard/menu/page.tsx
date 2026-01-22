import { getCategories, getMenuItems } from "@/actions/menu";
import { getInventory } from "@/actions/inventory";
import { getRecipes } from "@/actions/recipe";
import CategoryManager from "@/components/menu/category-manager";
import ItemManager from "@/components/menu/item-manager";
import RecipeManager from "@/components/inventory/recipe-manager";
import Link from "next/link";
import { UtensilsCrossed, LayoutGrid, BookOpen } from "lucide-react";

import { DashboardHeader } from "@/components/global/dashboard-header";

interface UIMenuCategory {
    id: string;
    name: string;
    slug: string;
    _count?: { items: number };
}

interface UIMenuItemSimple {
    id: string;
    name: string;
    description: string | null;
    price: number;
    available: boolean;
}

interface UIMenuItemWithCategory extends UIMenuItemSimple {
    image: string | null;
    category: UIMenuCategory;
}

interface UIInventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

interface UIRecipe {
    id: string;
    menuItemId: string;
    menuItem: UIMenuItemSimple;
    ingredients: { 
        id: string;
        inventoryItemId: string;
        quantity: number;
        inventoryItem: UIInventoryItem;
    }[];
}

export default async function MenuPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const { tab } = searchParams;
  const activeTab = tab || "categories";

  const categoriesResult = await getCategories();
  const itemsResult = await getMenuItems();
  const inventoryResult = await getInventory();
  const recipesResult = await getRecipes();

  const categories = (categoriesResult.success ? categoriesResult.data : []) as UIMenuCategory[];
  const items = (itemsResult.success ? itemsResult.data : []) as UIMenuItemWithCategory[];
  const inventoryItems = (inventoryResult.success ? inventoryResult.data : []) as UIInventoryItem[];
  const existingRecipes = (recipesResult.success ? recipesResult.data : []) as UIRecipe[];

  const tabs = [
    { id: "categories", label: "Categories", icon: LayoutGrid },
    { id: "items", label: "Menu Items", icon: UtensilsCrossed },
    { id: "recipes", label: "Recipes", icon: BookOpen },
  ];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
      <DashboardHeader 
        title="Menu Architect" 
        subtitle="Design your culinary offerings and logic" 
      />

      <div className="flex flex-wrap gap-2 p-1 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <Link
              key={t.id}
              href={`/dashboard/menu?tab=${t.id}`}
              className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-widest ${
                isActive
                  ? "bg-primary text-black shadow-[0_5px_15px_rgba(245,158,11,0.2)]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="relative">
        {activeTab === "categories" && <CategoryManager categories={categories} />}
        {activeTab === "items" && <ItemManager items={items} categories={categories} />}
        {activeTab === "recipes" && (
            <RecipeManager 
                menuItems={items} 
                inventoryItems={inventoryItems} 
                existingRecipes={existingRecipes} 
            />
        )}
      </div>
    </div>
  );
}

