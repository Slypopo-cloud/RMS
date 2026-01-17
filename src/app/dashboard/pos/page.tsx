import { getMenuItems } from "@/actions/menu";
import { getTables } from "@/actions/table";
import POSInterface from "@/components/pos/pos-interface";
import { DashboardHeader } from "@/components/global/dashboard-header";

export default async function POSPage() {
    const itemsResult = await getMenuItems();
    const tablesResult = await getTables();
    
    const items = (itemsResult.success && itemsResult.data) ? itemsResult.data : [];
    const tables = (tablesResult.success && tablesResult.data) ? tablesResult.data : [];

    return (
        <div className="h-full p-4 md:p-8">
            <DashboardHeader 
                title="Point of Sale" 
                subtitle="Efficient order management for walk-in customers" 
            />
            <POSInterface items={items} tables={tables} />
        </div>
    );
}
