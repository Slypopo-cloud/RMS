
import { getMenuItems } from "@/actions/menu";
import POSInterface from "@/components/pos/pos-interface";

export default async function POSPage() {
    const result = await getMenuItems();
    const items = result.success ? result.data : [];

    return (
        <div className="h-full p-6">
            <h1 className="text-2xl font-bold mb-6">Point of Sale (POS)</h1>
            <POSInterface items={items} />
        </div>
    );
}
