
import { getInventory } from "@/actions/inventory";
import InventoryManager from "@/components/inventory/inventory-manager";
import { DashboardHeader } from "@/components/global/dashboard-header";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const result = await getInventory();
    const items = (result.success && result.data) ? result.data : [];

    return (
        <div className="p-4 md:p-8">
            <DashboardHeader 
              title="Inventory Management" 
              subtitle="Track and manage your restaurant's stock levels" 
            />
            <InventoryManager items={items} />
        </div>
    );
}
