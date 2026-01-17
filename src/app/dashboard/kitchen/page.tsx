
import { getOrders } from "@/actions/order";
import KitchenDisplay from "@/components/kitchen/kitchen-display";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
    // Fetch orders that are active (Pending, Preparing, Ready)
    const orders = await prisma.order.findMany({
        where: {
            status: { in: ["PENDING", "PREPARING", "READY"] }
        },
        include: {
            items: { include: { menuItem: true } },
            user: true
        },
        orderBy: { createdAt: "asc" } // Oldest first for kitchen
    });

    return (
        <div className="h-full p-6">
            <h1 className="text-2xl font-bold mb-6">Kitchen Display System (KDS)</h1>
            <KitchenDisplay initialOrders={orders} />
        </div>
    );
}
