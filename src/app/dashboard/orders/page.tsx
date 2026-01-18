import prisma from "@/lib/prisma";
import { DashboardHeader } from "@/components/global/dashboard-header";
import { OrdersClient } from "@/components/global/orders-client";

export const dynamic = "force-dynamic";

interface UIOrder {
    id: string;
    status: string;
    type: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: Date;
    restaurantTable: { number: string } | null;
    items: {
        quantity: number;
        menuItem: { name: string; price: number };
    }[];
    user: { name: string | null } | null;
}

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { menuItem: true } },
      restaurantTable: true,
      user: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
  }) as unknown as UIOrder[];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
      <DashboardHeader 
        title="Order Archive" 
        subtitle="Historical record of all culinary transactions" 
      />

      <OrdersClient orders={orders} />
    </div>
  );
}

