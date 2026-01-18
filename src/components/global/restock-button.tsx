"use client";

import { useState } from "react";
import { restockItem } from "@/actions/inventory";
import { toast } from "sonner";
import { PackagePlus, Loader2 } from "lucide-react";

interface RestockButtonProps {
    itemId: string;
    itemName: string;
    threshold: number;
}

export function RestockButton({ itemId, itemName, threshold }: RestockButtonProps) {
    const [isRestocking, setIsRestocking] = useState(false);

    const handleRestock = async () => {
        setIsRestocking(true);
        // Default restock amount is 2x the threshold or a fixed amount
        const amount = threshold * 2;
        const result = await restockItem(itemId, amount);
        
        if (result.success) {
            toast.success(`${itemName} restocked by ${amount}`);
        } else {
            toast.error(result.error || "Failed to restock");
        }
        setIsRestocking(false);
    };

    return (
        <button 
            onClick={handleRestock}
            disabled={isRestocking}
            className="w-full text-center text-sm font-black text-white bg-red-600 hover:bg-red-500 py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {isRestocking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <PackagePlus className="w-4 h-4" />
            )}
            RESTOCK {threshold * 2} UNITS
        </button>
    );
}
