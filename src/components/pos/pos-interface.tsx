"use client";

import { useState } from "react";
import { createOrder } from "@/actions/order";
import { toast } from "sonner";
import { 
    Plus, 
    Minus, 
    ShoppingCart, 
    Utensils,
    X,
    CheckCircle2,
    Users,
    ChevronDown,
    Truck,
    Coffee
} from "lucide-react";

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

interface Table {
    id: string;
    number: string;
    status: string;
}

export default function POSInterface({ items, tables }: { items: MenuItem[], tables: Table[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
    const [selectedTableId, setSelectedTableId] = useState<string>("");

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.menuItemId === item.id);
            if (existing) {
                return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
        toast.info(`Added ${item.name} to order`);
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
        if (orderType === "DINE_IN" && !selectedTableId) {
            toast.error("Please select a table for dine-in orders");
            return;
        }

        setIsCheckingOut(true);
        const result = await createOrder(
            cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, price: i.price })), 
            orderType, 
            selectedTableId
        );
        setIsCheckingOut(false);
        if (result.success) {
            setLastOrderId(result.orderId || null);
            setCart([]);
            setSelectedTableId("");
            toast.success("Order dispatched to kitchen!");
        } else {
            toast.error("Failed to place order: " + result.error);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Menu Grid */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                 <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Utensils className="w-8 h-8 text-primary" />
                            Digital Menu
                        </h2>
                        <p className="text-slate-400 font-medium">Select items to build an order</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.filter(i => i.available).map(item => (
                        <button 
                             key={item.id} 
                             onClick={() => addToCart(item)}
                             className="glass-card rounded-2xl p-6 text-left flex flex-col justify-between h-48 group hover:border-primary/50 hover:shadow-primary/5 transition-all active:scale-95"
                        >
                            <div className="flex justify-between items-start">
                                <span className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                    {item.category.name}
                                </span>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-2xl font-black text-white">${item.price.toFixed(2)}</span>
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-black transition-all">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                 </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-full lg:w-[400px] glass-card rounded-3xl p-8 flex flex-col border-primary/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-primary/10 blur-3xl rounded-full"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                        Cart
                    </h2>
                    <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                    </span>
                </div>
                
                {lastOrderId && cart.length === 0 && (
                     <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div className="text-sm font-bold text-green-500">
                            ID: #{lastOrderId.slice(-6).toUpperCase()}
                        </div>
                     </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar relative z-10">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 py-20">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <ShoppingCart className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-bold uppercase tracking-widest text-[10px]">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.menuItemId} className="flex justify-between items-center group animate-in slide-in-from-right-4 duration-300">
                                <div className="flex-1">
                                    <h3 className="font-bold text-white mb-0.5">{item.name}</h3>
                                    <p className="text-xs font-black text-slate-500">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
                                        <button 
                                            onClick={() => updateQuantity(item.menuItemId, -1)} 
                                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.menuItemId, 1)} 
                                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.menuItemId)} 
                                        className="text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 relative z-10 space-y-6 text-slate-500">
                    {/* Order Type & Table Selection */}
                    <div className="space-y-4">
                        <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
                            <button 
                                onClick={() => setOrderType("DINE_IN")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs tracking-widest transition-all ${orderType === "DINE_IN" ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Coffee className="w-4 h-4" /> DINE IN
                            </button>
                            <button 
                                onClick={() => {
                                    setOrderType("TAKEAWAY");
                                    setSelectedTableId("");
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs tracking-widest transition-all ${orderType === "TAKEAWAY" ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                            >
                                <Truck className="w-4 h-4" /> TAKEAWAY
                            </button>
                        </div>

                        {orderType === "DINE_IN" && (
                            <div className="relative group">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <select 
                                    value={selectedTableId}
                                    onChange={(e) => setSelectedTableId(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none appearance-none focus:border-primary/50 transition-all cursor-pointer"
                                >
                                    <option value="" className="bg-slate-900">Select Table</option>
                                    {tables.map(table => (
                                        <option 
                                            key={table.id} 
                                            value={table.id} 
                                            disabled={table.status === "OCCUPIED" || table.status === "OUT_OF_ORDER"}
                                            className="bg-slate-900"
                                        >
                                            Table {table.number} ({table.status})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-focus-within:text-primary transition-colors" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between font-bold text-sm uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white font-black text-3xl">
                            <span>Total</span>
                            <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isCheckingOut}
                        className="w-full relative group overflow-hidden bg-primary disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.2)] transition-all active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {isCheckingOut ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    PROCESSING...
                                </>
                            ) : (
                                <>
                                    PLACE ORDER
                                    <CheckCircle2 className="w-5 h-5" />
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
