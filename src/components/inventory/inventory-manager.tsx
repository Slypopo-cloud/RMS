
"use client";

import { useActionState, useState } from "react";
import { createInventoryItem, deleteInventoryItem, updateInventoryItem } from "@/actions/inventory";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
}

export default function InventoryManager({ items }: { items: InventoryItem[] }) {
  const [state, action, isPending] = useActionState(createInventoryItem, null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setIsDeleting(id);
    await deleteInventoryItem(id);
    setIsDeleting(null);
  };

  const handleUpdate = async (id: string, newQuantity: number) => {
      setUpdatingId(id);
      await updateInventoryItem(id, { quantity: newQuantity });
      setUpdatingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Add New Item Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Add New Inventory Item</h3>
        <form action={action} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" type="text" required className="w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="Item Name" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input name="quantity" type="number" required className="w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="0" />
          </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input name="unit" type="text" required className="w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="e.g. kg, pcs" />
          </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <input name="threshold" type="number" required className="w-full rounded-md border border-gray-300 p-2 text-sm" placeholder="e.g. 5" />
          </div>
          
          <div className="md:col-span-4">
             <button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
                {isPending ? "Adding..." : "Add to Inventory"}
            </button>
          </div>
           {state?.error && (
            <div className="md:col-span-4 text-red-500 text-sm">
                Error: {typeof state.error === 'string' ? state.error : "Validation Failed"}
            </div>
        )}
        </form>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className={item.quantity <= item.threshold ? "bg-red-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={updatingId === item.id || item.quantity <= 0}
                            onClick={() => handleUpdate(item.id, item.quantity - 1)}
                            className="px-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                             disabled={updatingId === item.id}
                             onClick={() => handleUpdate(item.id, item.quantity + 1)}
                             className="px-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >+</button>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {item.quantity <= item.threshold ? (
                       <span className="px-2 py-1 text-xs font-bold text-red-800 bg-red-200 rounded-full">Low Stock</span>
                   ) : (
                       <span className="px-2 py-1 text-xs font-bold text-green-800 bg-green-200 rounded-full">In Stock</span>
                   )}
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
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Inventory is empty.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
