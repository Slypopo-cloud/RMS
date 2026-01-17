"use client";

import { useActionState, useState } from "react";
import { createCategory, deleteCategory } from "@/actions/menu";
import { 
    Tag, 
    Link as LinkIcon, 
    Plus, 
    Trash2, 
    LayoutGrid, 
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

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
    if (!confirm("Are you sure? All items in this category will be orphaned. This action is permanent.")) return;
    setIsDeleting(id);
    const result = await deleteCategory(id);
    setIsDeleting(null);
    if (result.success) {
        toast.success("Category dissolved successfully");
    } else {
        toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Add New Category Form */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-primary/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Define New Category</h3>
        </div>

        <form action={action} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Tag className="w-3 h-3" /> Display Name
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-medium"
              placeholder="e.g. Masterwork Entrees"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <LinkIcon className="w-3 h-3" /> Technical ID (Slug)
            </label>
            <input
              name="slug"
              type="text"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-xs"
              placeholder="e.g. entrees-premium"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-amber-400 text-black px-8 py-3.5 rounded-2xl disabled:opacity-50 text-sm font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(245,158,11,0.1)] active:scale-95"
          >
            {isPending ? "DEFINING..." : "CREATE CATEGORY"}
          </button>
        </form>
        {state?.error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error: {typeof state.error === 'string' ? state.error : "Verification Failed"}
            </div>
        )}
      </div>

      {/* Categories List */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-slate-800">
        <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
             <LayoutGrid className="w-6 h-6 text-primary" />
             <h3 className="text-xl font-black text-white tracking-tight">Active Classifications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/60 uppercase tracking-widest text-[10px] font-black text-slate-500">
              <tr>
                <th className="px-8 py-5 text-left">Classification</th>
                <th className="px-8 py-5 text-left">Digital Slug</th>
                <th className="px-8 py-5 text-left">Population</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/10">
              {categories.map((category) => (
                <tr key={category.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
                        <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-500 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">
                        {category.slug}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{category._count?.items || 0}</span>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Items linked</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={isDeleting === category.id}
                      className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-20"
                      title="Dissolve Category"
                    >
                      {isDeleting === category.id ? (
                           <div className="w-5 h-5 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
                      ) : (
                          <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                  <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-600 gap-4">
                            <LayoutGrid className="w-12 h-12 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-xs">No classifications discovered.</p>
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

