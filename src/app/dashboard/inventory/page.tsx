
import { getInventory } from "@/actions/inventory";
import InventoryManager from "@/components/inventory/inventory-manager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const result = await getInventory();
    const items = result.success ? result.data : [];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
            <InventoryManager items={items} />
        </div>
    );
}
