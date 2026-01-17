
"use client";

import { useState, useEffect, useCallback } from "react";
import { getSalesReport } from "@/actions/analytics";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Download,
  FileText
} from "lucide-react";
import { toast } from "sonner";

const formatDate = (date: Date, pattern: string) => {
    if (pattern === "yyyy-MM-dd") {
        return date.toISOString().split('T')[0];
    }
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

export default function ReportsPage() {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState(new Date());
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        const result = await getSalesReport(startDate, endDate);
        if (result.success) {
            setOrders(result.data || []);
        } else {
            toast.error(result.error as string);
        }
        setIsLoading(false);
    }, [startDate, endDate]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
                    <p className="text-gray-500 text-sm">Analyze your restaurant performance</p>
                </div>
                <button 
                  onClick={() => toast.info("Export feature coming soon!")}
                  className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</label>
                            <input 
                                type="date" 
                                value={formatDate(startDate, "yyyy-MM-dd")}
                                onChange={(e) => setStartDate(new Date(e.target.value))}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</label>
                            <input 
                                type="date" 
                                value={formatDate(endDate, "yyyy-MM-dd")}
                                onChange={(e) => setEndDate(new Date(e.target.value))}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-3">
                        <span className="text-sm font-medium opacity-80">Total Revenue:</span>
                        <span className="text-xl font-bold">${totalRevenue.toFixed(2)}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">Loading records...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 italic">No sales found for this period.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cashier</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(new Date(order.updatedAt), "")}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex flex-wrap gap-1">
                                                {order.items.map((item: any, idx: number) => (
                                                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                        {item.quantity}x {item.menuItem.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {order.user?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                            ${order.totalAmount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
