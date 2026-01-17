
"use client";

import { useActionState, useState } from "react";
import { createMenuItem, deleteMenuItem, toggleItemAvailability } from "@/actions/menu";

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  category: Category;
}

export default function ItemManager({ items, categories }: { items: MenuItem[]; categories: Category[] }) {
  const [state, action, isPending] = useActionState(createMenuItem, null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setIsDeleting(id);
    await deleteMenuItem(id);
    setIsDeleting(null);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
      await toggleItemAvailability(id, currentStatus);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Add New Item</h3>
        <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" type="text" required className="w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="Item Name" />
          </div>
          
           <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="categoryId" className="w-full rounded-md border border-gray-300 p-2 text-sm">
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input name="price" type="number" step="0.01" required className="w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="0.00" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" className="w-full rounded-md border border-gray-300 p-2 text-sm" rows={2} placeholder="Optional description"></textarea>
          </div>
          
            <div className="flex items-center gap-2">
                <input type="checkbox" name="available" id="available" defaultChecked />
                <label htmlFor="available" className="text-sm text-gray-700">Available</label>
            </div>

          <div className="md:col-span-2">
             <button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
                {isPending ? "Adding..." : "Add Item"}
            </button>
          </div>
           {state?.error && (
            <div className="md:col-span-2 text-red-500 text-sm">
                Error: {typeof state.error === 'string' ? state.error : "Validation Failed"}
            </div>
        )}
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                        onClick={() => handleToggle(item.id, item.available)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {item.available ? "Available" : "Unavailable"}
                    </button>
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                   {isDeleting === item.id ? "..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No items found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
