
"use client";

import { useActionState, useState } from "react";
import { createCategory, deleteCategory } from "@/actions/menu";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { items: number };
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, action, isPending] = useActionState(createCategory, null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    setIsDeleting(id);
    await deleteCategory(id);
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Add New Category</h3>
        <form action={action} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Starters"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              name="slug"
              type="text"
              required
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. starters"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {isPending ? "Adding..." : "Add Category"}
          </button>
        </form>
        {state?.error && (
            <div className="text-red-500 text-sm mt-2">
                {typeof state.error === 'string' ? state.error : "Validation Error"}
            </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category._count?.items || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting === category.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {isDeleting === category.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
             {categories.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No categories found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
