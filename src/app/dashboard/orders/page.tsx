import prisma from "@/lib/prisma";
import { 
    History, 
    User as UserIcon, 
    Package, 
    CheckCircle2, 
    XCircle, 
    Clock,
    Hash
} from "lucide-react";

import { DashboardHeader } from "@/components/global/dashboard-header";
import { OrderActions } from "@/components/global/order-actions";

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

  const getPaymentStyles = (status: string) => {
    switch(status) {
        case "PAID": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "REFUNDED": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        default: return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  const getStatusStyles = (status: string) => {
    switch(status) {
        case "COMPLETED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
        default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
        case "COMPLETED": return CheckCircle2;
        case "CANCELLED": return XCircle;
        default: return Clock;
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
      <DashboardHeader 
        title="Order Archive" 
        subtitle="Historical record of all culinary transactions" 
      />

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-slate-800">
        <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <Package className="w-6 h-6 text-primary" />
                 <h3 className="text-xl font-black text-white tracking-tight">Full Registry</h3>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {orders.length} TOTAL ENTRIES
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/60 uppercase tracking-widest text-[10px] font-black text-slate-500">
              <tr>
                <th className="px-8 py-5 text-left">Reference</th>
                <th className="px-8 py-5 text-left">Timestamp</th>
                <th className="px-8 py-5 text-left">Operator</th>
                <th className="px-8 py-5 text-left">Composition</th>
                <th className="px-8 py-5 text-left">Net Value</th>
                <th className="px-8 py-5 text-center">Payment</th>
                <th className="px-8 py-5 text-center">Fulfillment</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/10">
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm font-mono text-slate-500 group-hover:text-primary transition-colors">
                                <Hash className="w-3 h-3" />
                                <span>{order.id.slice(-6).toUpperCase()}</span>
                            </div>
                            {order.type === "DINE_IN" && order.restaurantTable && (
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                                    Table {order.restaurantTable.number}
                                </span>
                            )}
                        </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                <UserIcon className="w-3 h-3 text-slate-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-400">{order.user?.name || "Counter"}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {order.items.map((i, idx) => (
                                <span key={idx} className="bg-slate-800/80 text-white border border-slate-700/50 px-2 py-0.5 rounded-lg text-[9px] font-black whitespace-nowrap uppercase">
                                    {i.quantity}× {i.menuItem.name}
                                </span>
                            ))}
                        </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-black text-white">${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getPaymentStyles(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(order.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                        <OrderActions order={order} />
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                  <tr>
                      <td colSpan={8} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-600 gap-4">
                            <History className="w-12 h-12 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-xs italic">Historical database is currently empty.</p>
                        </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

