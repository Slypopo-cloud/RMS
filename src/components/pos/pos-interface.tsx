
"use client";

import { useActionState, useState } from "react";
import { createOrder } from "@/actions/order";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  category: { name: string };
}

interface CartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
}

export default function POSInterface({ items }: { items: MenuItem[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.menuItemId === item.id);
            if (existing) {
                return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.menuItemId !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.menuItemId === itemId) {
                    const newQty = Math.max(1, i.quantity + delta);
                    return { ...i, quantity: newQty };
                }
                return i;
            });
        });
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        const result = await createOrder(cart);
        setIsCheckingOut(false);
        if (result.success) {
            setLastOrderId(result.orderId || null);
            setCart([]);
            toast.success("Order placed successfully!");
        } else {
            toast.error("Failed to place order: " + result.error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto bg-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-bold mb-4">Menu</h2>
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.filter(i => i.available).map(item => (
                        <div key={item.id} 
                             onClick={() => addToCart(item)}
                             className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col justify-between h-32"
                        >
                            <h3 className="font-semibold">{item.name}</h3>
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-gray-500">{item.category.name}</span>
                                <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 bg-white p-6 rounded-lg shadow flex flex-col">
                <h2 className="text-xl font-bold mb-4">Current Order</h2>
                
                {lastOrderId && cart.length === 0 && (
                     <div className="mb-4 p-3 bg-green-100 text-green-800 rounded text-sm">
                        Order Placed! ID: #{lastOrderId.slice(-4)}
                     </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-center mt-10">Cart is empty</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.menuItemId} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border rounded">
                                        <button onClick={() => updateQuantity(item.menuItemId, -1)} className="px-2 hover:bg-gray-100">-</button>
                                        <span className="px-2">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.menuItemId, 1)} className="px-2 hover:bg-gray-100">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-500 hover:text-red-700">×</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isCheckingOut}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCheckingOut ? "Processing..." : "Place Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
