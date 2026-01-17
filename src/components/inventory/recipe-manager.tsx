
"use client";

import { useState } from "react";
import { upsertRecipe, deleteRecipe } from "@/actions/recipe";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";

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

    // Initialize form when a recipe is found for selected menu item
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

    const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    const handleSave = async () => {
        if (!selectedMenuItem) {
            toast.error("Please select a menu item");
            return;
        }
        if (ingredients.some(i => !i.inventoryItemId || i.quantity <= 0)) {
            toast.error("Please fill all ingredient details correctly");
            return;
        }

        setIsSaving(true);
        const result = await upsertRecipe(selectedMenuItem, ingredients);
        setIsSaving(false);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.error as string);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Configure Recipe</h3>
                
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Menu Item</label>
                        <select 
                            value={selectedMenuItem}
                            onChange={(e) => handleMenuChange(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="">-- Select an Item --</option>
                            {menuItems.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedMenuItem && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium text-gray-600">Ingredients</h4>
                                <button 
                                    onClick={addIngredient}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Add Ingredient
                                </button>
                            </div>

                            {ingredients.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded">No ingredients defined</p>
                            ) : (
                                <div className="space-y-3">
                                    {ingredients.map((ing, index) => (
                                        <div key={index} className="flex gap-3 items-end">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Ingredient</label>
                                                <select 
                                                    value={ing.inventoryItemId}
                                                    onChange={(e) => updateIngredient(index, 'inventoryItemId', e.target.value)}
                                                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                                >
                                                    <option value="">-- Choose --</option>
                                                    {inventoryItems.map(inv => (
                                                        <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                                                <input 
                                                    type="number"
                                                    step="0.1"
                                                    value={ing.quantity}
                                                    onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                                                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => removeIngredient(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-md mb-0.5"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t flex justify-end">
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? "Saving..." : "Save Recipe"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* List of active recipes could go here for overview */}
        </div>
    );
}
