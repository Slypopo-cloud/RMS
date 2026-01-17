
import { getCategories, getMenuItems } from "@/actions/menu";
import CategoryManager from "@/components/menu/category-manager";
import ItemManager from "@/components/menu/item-manager";
import Link from "next/link";


export default async function MenuPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const { tab } = searchParams;
  const activeTab = tab || "categories";

  const categoriesResult = await getCategories();
  const itemsResult = await getMenuItems();

  const categories = categoriesResult.success ? categoriesResult.data : [];
  const items = itemsResult.success ? itemsResult.data : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Menu Management</h1>
      
      <div className="flex border-b border-gray-200 mb-6">
        <Link
          href="/dashboard/menu?tab=categories"
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Categories
        </Link>
        <Link
          href="/dashboard/menu?tab=items"
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "items"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Menu Items
        </Link>
      </div>

      <div>
        {activeTab === "categories" ? (
          <CategoryManager categories={categories} />
        ) : (
          <ItemManager items={items} categories={categories} />
        )}
      </div>
    </div>
  );
}
