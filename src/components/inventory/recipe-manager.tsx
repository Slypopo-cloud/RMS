"use client";

import { useState } from "react";
import { upsertRecipe } from "@/actions/recipe";
import { toast } from "sonner";
import { 
    Plus, 
    Save, 
    BookOpen, 
    Scale, 
    Database, 
    Layers,
    X,
    ClipboardList,
    AlertCircle
} from "lucide-react";

interface MenuItem {
    id: string;
    name: string;
}

interface InventoryItem {
    id: string;
    name: string;
    unit: string;
}

interface RecipeIngredient {
    inventoryItemId: string;
    quantity: number;
}

interface Recipe {
    id: string;
    menuItemId: string;
    menuItem: MenuItem;
    ingredients: {
        id: string;
        inventoryItemId: string;
        quantity: number;
        inventoryItem: InventoryItem;
    }[];
}

export default function RecipeManager({ 
    menuItems, 
    inventoryItems, 
    existingRecipes 
}: { 
    menuItems: MenuItem[], 
    inventoryItems: InventoryItem[], 
    existingRecipes: Recipe[] 
}) {
    const [selectedMenuItem, setSelectedMenuItem] = useState("");
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleMenuChange = (id: string) => {
        setSelectedMenuItem(id);
        const recipe = existingRecipes.find(r => r.menuItemId === id);
        if (recipe) {
            setIngredients(recipe.ingredients.map(i => ({
                inventoryItemId: i.inventoryItemId,
                quantity: i.quantity
            })));
        } else {
            setIngredients([]);
        }
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { inventoryItemId: "", quantity: 0 }]);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    const handleSave = async () => {
        if (!selectedMenuItem) {
            toast.error("Protocol error: No target item selected");
            return;
        }
        if (ingredients.some(i => !i.inventoryItemId || i.quantity <= 0)) {
            toast.error("Integrity error: All ingredients must have quantity > 0");
            return;
        }

        setIsSaving(true);
        const result = await upsertRecipe(selectedMenuItem, ingredients);
        setIsSaving(false);

        if (result.success) {
            toast.success("Composition logic updated");
        } else {
            toast.error(result.error as string);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden border-primary/10">
                <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-primary/5 blur-[100px] rounded-full"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight">Recipe Blueprint</h3>
                        </div>
                        <p className="text-slate-400 font-medium ml-1">Establish inventory deduction logic for menu items</p>
                    </div>

                    <div className="min-w-[300px] space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Layers className="w-3 h-3" /> Target Item
                        </label>
                        <select 
                            value={selectedMenuItem}
                            onChange={(e) => handleMenuChange(e.target.value)}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-slate-900">-- Choose Item Designation --</option>
                            {menuItems.map(item => (
                                <option key={item.id} value={item.id} className="bg-slate-900">{item.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedMenuItem ? (
                    <div className="space-y-10 relative z-10">
                        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <ClipboardList className="w-3.5 h-3.5" /> Component Logic
                            </h4>
                            <button 
                                onClick={addIngredient}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-slate-700/50"
                            >
                                <Plus className="w-3.5 h-3.5 text-primary" /> Add Component
                            </button>
                        </div>

                        {ingredients.length === 0 ? (
                            <div className="py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                                <AlertCircle className="w-12 h-12 opacity-10 mb-4" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">No components registered for thisblueprint.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {ingredients.map((ing, index) => (
                                    <div key={index} className="group bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-end transition-all">
                                        <div className="flex-1 w-full space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Database className="w-3 h-3" /> Raw Material
                                            </label>
                                            <select 
                                                value={ing.inventoryItemId}
                                                onChange={(e) => updateIngredient(index, 'inventoryItemId', e.target.value)}
                                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-primary/50 outline-none appearance-none"
                                            >
                                                <option value="" className="bg-slate-900">-- Material Selection --</option>
                                                {inventoryItems.map(inv => (
                                                    <option key={inv.id} value={inv.id} className="bg-slate-900">
                                                        {inv.name} (per {inv.unit})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-full md:w-48 space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Scale className="w-3 h-3" /> Deduction Qty
                                            </label>
                                            <input 
                                                type="number"
                                                step="0.1"
                                                value={ing.quantity}
                                                onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-black focus:border-primary/50 outline-none"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => removeIngredient(index)}
                                            className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-10 flex justify-end">
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-3 bg-primary hover:bg-amber-400 text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(245,158,11,0.2)] active:scale-95 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {isSaving ? "SYNCHRONIZING..." : "COMMIT BLUEPRINT"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center animate-pulse">
                            <BookOpen className="w-10 h-10 text-slate-700" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-slate-700 uppercase tracking-widest">Awaiting Material Assignment</p>
                            <p className="text-slate-500 text-sm">Select a menu item from the nexusthreshold above to begin configuration.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

