"use client";

import { useActionState, useState } from "react";
import { createMenuItem, deleteMenuItem, toggleItemAvailability } from "@/actions/menu";
import { 
    UtensilsCrossed, 
    Plus, 
    Trash2, 
    DollarSign, 
    Power,
    Settings,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

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
    if (!confirm("Are you sure? This item will be permanently erased.")) return;
    setIsDeleting(id);
    const result = await deleteMenuItem(id);
    setIsDeleting(null);
    if (result.success) {
        toast.success("Item erased from menu");
    } else {
        toast.error("Deletion protocol failed");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
      const result = await toggleItemAvailability(id, currentStatus);
      if (result.success) {
          toast.info(`Item status toggled to ${!currentStatus ? 'Online' : 'Offline'}`);
      }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Add New Item Form */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-primary/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Engineer Menu Item</h3>
        </div>

        <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity</label>
            <input 
                name="name" 
                type="text" 
                required 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-medium" 
                placeholder="Item Designation" 
            />
          </div>
          
           <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
            <select 
                name="categoryId" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-medium appearance-none cursor-pointer"
            >
                {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Value (USD)</label>
            <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    required 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-black text-lg" 
                    placeholder="0.00" 
                />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Culinary Description</label>
            <textarea 
                name="description" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-medium" 
                rows={3} 
                placeholder="Optional taste profile and notes..."
            ></textarea>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                <input 
                    type="checkbox" 
                    name="available" 
                    id="available" 
                    defaultChecked 
                    className="w-5 h-5 rounded-lg accent-primary cursor-pointer"
                />
                <label htmlFor="available" className="text-sm font-black text-white uppercase tracking-widest cursor-pointer">Live in Catalog</label>
          </div>

          <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-800">
             <button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-amber-400 text-black px-12 py-3.5 rounded-2xl disabled:opacity-50 text-sm font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(245,158,11,0.1)] active:scale-95 flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                {isPending ? "ARCHITECTING..." : "COMMIT TO MENU"}
            </button>
          </div>
           {state?.error && (
            <div className="md:col-span-2 mt-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" />
                Error: {typeof state.error === 'string' ? state.error : "Deployment Error"}
            </div>
        )}
        </form>
      </div>

      {/* Items List */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-slate-800">
        <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
             <Settings className="w-6 h-6 text-primary" />
             <h3 className="text-xl font-black text-white tracking-tight">Menu Catalog</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/60 uppercase tracking-widest text-[10px] font-black text-slate-500">
              <tr>
                <th className="px-8 py-5 text-left">Plate</th>
                <th className="px-8 py-5 text-left">Tag</th>
                <th className="px-8 py-5 text-left">Price Point</th>
                <th className="px-8 py-5 text-left">Availability</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/10">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">{item.name}</span>
                        {item.description && <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px]">{item.description}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        {item.category.name}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-xl font-black text-white">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <button 
                        onClick={() => handleToggle(item.id, item.available)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            item.available 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}
                    >
                        <Power className="w-3 h-3" />
                        {item.available ? "ONLINE" : "OFFLINE"}
                    </button>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                      className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-20"
                      title="Erase Item"
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
                            <UtensilsCrossed className="w-12 h-12 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-xs">Menu catalog is empty.</p>
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

