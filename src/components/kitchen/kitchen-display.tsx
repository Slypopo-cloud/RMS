
"use client";

import { useActionState } from "react";
import { updateOrderStatus } from "@/actions/order";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
    id: string;
    quantity: number;
    menuItem: { name: string };
}

interface Order {
    id: string;
    status: string;
    createdAt: Date;
    items: OrderItem[];
    user?: { name: string; username: string };
}

export default function KitchenDisplay({ initialOrders }: { initialOrders: Order[] }) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Naive polling for now (every 10s) to refresh orders
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 10000);
        return () => clearInterval(interval);
    }, [router]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        await updateOrderStatus(orderId, newStatus);
        setUpdatingId(null);
        router.refresh(); 
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case "PENDING": return "bg-yellow-100 border-yellow-300";
            case "PREPARING": return "bg-blue-100 border-blue-300";
            case "READY": return "bg-green-100 border-green-300";
            default: return "bg-gray-100";
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialOrders.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">No active orders</div>
            )}
            
            {initialOrders.map(order => (
                <div key={order.id} className={`border-l-4 rounded-lg shadow bg-white p-4 ${getStatusColor(order.status)}`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className="font-bold text-lg">#{order.id.slice(-4)}</span>
                            <div className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                                Server: {order.user?.username || "Unknown"}
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-white rounded text-xs font-bold border">
                            {order.status}
                        </span>
                    </div>

                    <div className="space-y-2 mb-4">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.menuItem.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {order.status === "PENDING" && (
                            <button 
                                onClick={() => handleStatusUpdate(order.id, "PREPARING")}
                                disabled={updatingId === order.id}
                                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                Start Preparing
                            </button>
                        )}
                        {order.status === "PREPARING" && (
                            <button 
                                onClick={() => handleStatusUpdate(order.id, "READY")}
                                disabled={updatingId === order.id}
                                className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                            >
                                Mark Ready
                            </button>
                        )}
                        {order.status === "READY" && (
                            <button 
                                onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                                disabled={updatingId === order.id}
                                className="flex-1 bg-gray-800 text-white py-2 rounded text-sm font-semibold hover:bg-gray-900 disabled:opacity-50"
                            >
                                Complete
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
