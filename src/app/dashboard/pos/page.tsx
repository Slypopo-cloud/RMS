import { getMenuItems } from "@/actions/menu";
import POSInterface from "@/components/pos/pos-interface";
import { DashboardHeader } from "@/components/global/dashboard-header";

export default async function POSPage() {
    const itemsResult = await getMenuItems();
    
    const items = (itemsResult.success && itemsResult.data) ? itemsResult.data : [];

    return (
        <div className="h-full p-4 md:p-8">
            <DashboardHeader 
                title="Point of Sale" 
                subtitle="Efficient order management for walk-in customers" 
            />
            <POSInterface items={items} />
        </div>
    );
}
