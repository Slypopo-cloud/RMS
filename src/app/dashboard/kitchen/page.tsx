
import KitchenDisplay, { KitchenOrder } from "@/components/kitchen/kitchen-display";
import prisma from "@/lib/prisma";

import { DashboardHeader } from "@/components/global/dashboard-header";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
    // Fetch orders that are active (Pending, Preparing, Ready)
    const orders = await prisma.order.findMany({
        where: {
            status: { in: ["PENDING", "PREPARING", "READY"] }
        },
        include: {
            items: { include: { menuItem: true } },
            table: true,
            user: {
                select: { name: true, username: true }
            }
        },
        orderBy: { createdAt: "asc" }
    });

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <DashboardHeader 
                    title="Culinary Hub" 
                    subtitle="Real-time fulfillment orchestration (KDS)" 
                />
                <div className="bg-slate-800/80 px-6 py-3 rounded-2xl border border-slate-700 flex flex-col items-center md:mt-[-32px]">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Queue</span>
                    <span className="text-2xl font-black text-primary leading-none mt-1">{orders.length}</span>
                </div>
            </div>

            <div className="relative">
                <KitchenDisplay initialOrders={orders as KitchenOrder[]} />
            </div>
        </div>
    );
}
