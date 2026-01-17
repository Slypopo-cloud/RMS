"use client";

import { useActionState, useState } from "react";
import { createInventoryItem, deleteInventoryItem, updateInventoryItem } from "@/actions/inventory";
import { 
    Plus, 
    Minus, 
    Trash2, 
    AlertTriangle, 
    CheckCircle2, 
    Layers,
    Warehouse
} from "lucide-react";
import { toast } from "sonner";

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
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    setIsDeleting(id);
    const result = await deleteInventoryItem(id);
    setIsDeleting(null);
    if (result.success) {
        toast.success("Item removed from inventory");
    } else {
        toast.error("Failed to delete item");
    }
  };

  const handleUpdate = async (id: string, newQuantity: number) => {
      setUpdatingId(id);
      const result = await updateInventoryItem(id, { quantity: newQuantity });
      setUpdatingId(null);
      if (!result.success) {
          toast.error("Failed to update quantity");
      }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Add New Item Form */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-primary/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Warehouse className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Register New Stock</h3>
        </div>

        <form action={action} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Item Name</label>
            <input 
                name="name" 
                type="text" 
                required 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" 
                placeholder="e.g. Fresh Tomatoes" 
            />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Initial Quantity</label>
            <input 
                name="quantity" 
                type="number" 
                required 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" 
                placeholder="0" 
            />
          </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unit</label>
            <input 
                name="unit" 
                type="text" 
                required 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" 
                placeholder="kg, liters, pcs" 
            />
          </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Min. Threshold</label>
            <input 
                name="threshold" 
                type="number" 
                required 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all" 
                placeholder="Low stock alert" 
            />
          </div>
          
          <div className="md:col-span-4 mt-2">
             <button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-amber-400 text-black px-8 py-3.5 rounded-2xl disabled:opacity-50 text-sm font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(245,158,11,0.1)] active:scale-95"
            >
                {isPending ? "REGISTERING..." : "ADD TO WAREHOUSE"}
            </button>
          </div>
           {state?.error && (
            <div className="md:col-span-4 mt-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Error: {typeof state.error === 'string' ? state.error : "Verification Failed"}
            </div>
        )}
        </form>
      </div>

      {/* Inventory List */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-slate-800">
        <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
             <Layers className="w-6 h-6 text-primary" />
             <h3 className="text-xl font-black text-white tracking-tight">Stock Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/60 uppercase tracking-widest text-[10px] font-black text-slate-500">
              <tr>
                <th className="px-8 py-5 text-left">Internal Item</th>
                <th className="px-8 py-5 text-left">Level</th>
                <th className="px-8 py-5 text-left">Unit</th>
                <th className="px-8 py-5 text-left">Condition</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/20">
              {items.map((item) => (
                <tr key={item.id} className={`group hover:bg-white/5 transition-colors ${item.quantity <= item.threshold ? "bg-red-500/5" : ""}`}>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${item.quantity <= item.threshold ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-slate-700'}`}></div>
                        <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                          <button
                              disabled={updatingId === item.id || item.quantity <= 0}
                              onClick={() => handleUpdate(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-20 shadow-lg"
                          ><Minus className="w-4 h-4" /></button>
                          
                          <div className="flex flex-col items-center min-w-[50px]">
                            <span className="text-2xl font-black text-white leading-none">{item.quantity}</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase mt-1 tracking-tighter">Current</span>
                          </div>

                          <button
                               disabled={updatingId === item.id}
                               onClick={() => handleUpdate(item.id, item.quantity + 1)}
                               className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-20 shadow-lg"
                          ><Plus className="w-4 h-4" /></button>
                      </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-slate-400 uppercase tracking-widest">{item.unit}</td>
                  <td className="px-8 py-6 whitespace-nowrap">
                     {item.quantity <= item.threshold ? (
                         <div className="flex items-center gap-2 bg-red-500/10 text-red-500 py-2 px-4 rounded-xl border border-red-500/20 w-fit">
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">Low Stock</span>
                         </div>
                     ) : (
                         <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 py-2 px-4 rounded-xl border border-emerald-500/20 w-fit">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Adequate</span>
                         </div>
                     )}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                      className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-20"
                      title="Delete Item"
                    >
                      {isDeleting === item.id ? (
                           <div className="w-5 h-5 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
                      ) : (
                          <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-600 gap-4">
                            <Warehouse className="w-12 h-12 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-xs">Inventory control is currently empty.</p>
                        </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

