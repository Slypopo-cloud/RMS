"use client";

import { useState } from "react";
import { 
    ShoppingBag, 
    X, 
    ChevronRight, 
    Plus, 
    Minus,
    ArrowRight,
    ShieldCheck,
    CreditCard
} from "lucide-react";
import Image from "next/image";
import { createPublicOrder } from "@/actions/public-order";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export function DigitalCart({ 
    cart, 
    removeFromCart, 
    addToCart,
    clearCart
}: { 
    cart: CartItem[]; 
    removeFromCart: (id: string) => void;
    addToCart: (item: MenuItem) => void;
    clearCart: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [orderDetails, setOrderDetails] = useState<{ id: string } | null>(null);

  const total = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const orderData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        items: cart.map(i => ({
            menuItemId: i.item.id,
            quantity: i.quantity,
            price: i.item.price
        }))
    };

    const result = await createPublicOrder(orderData);

    if (result.success && result.orderId) {
        setOrderDetails({ id: result.orderId });
        clearCart();
    } else {
        toast.error(result.error || "Failed to place order");
    }
    setIsPending(false);
  };

  const closeCart = () => {
    setIsOpen(false);
    setIsCheckingOut(false);
    setOrderDetails(null);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-[100] bg-primary text-black px-6 py-4 rounded-[1.5rem] shadow-[0_20px_40px_rgba(245,158,11,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center gap-3 animate-bounce-subtle"
        >
            <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center rounded-full font-black">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
            </div>
            <span className="font-black text-sm uppercase tracking-widest hidden sm:inline">Review Selection</span>
            <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Cart/Checkout Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={closeCart}
            ></div>
            
            <div className="relative w-full max-w-lg bg-slate-900 border-l border-white/5 h-screen flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                {orderDetails ? "Order Finalized" : "Selection Hub"}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Digital Gastronomy</p>
                        </div>
                    </div>
                    <button 
                        onClick={closeCart}
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {orderDetails ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 animate-in zoom-in-95 duration-700">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-8 animate-bounce-subtle">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">You&apos;re All Set!</h3>
                            <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">
                                Your culinary request has been transmitted to our kitchen. We are preparing your selection with precision.
                            </p>
                            
                            <div className="w-full bg-slate-800/50 rounded-3xl p-6 border border-white/5 mb-10 text-left">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol ID</span>
                                    <span className="text-primary font-black uppercase tracking-widest">#{orderDetails.id.slice(-8)}</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-400">Please provide this ID upon arrival for pickup.</p>
                                    <p className="text-xs font-medium text-slate-400">Estimated preparation time: <span className="text-white">15-20 minutes</span>.</p>
                                </div>
                            </div>

                            <button 
                                onClick={closeCart}
                                className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!isCheckingOut ? (
                                cart.map((cartItem) => (
                                    <div key={cartItem.item.id} className="group relative flex gap-6 p-4 bg-slate-800/30 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/5 shrink-0">
                                            {cartItem.item.image ? (
                                                <Image 
                                                    src={cartItem.item.image} 
                                                    alt={cartItem.item.name} 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                    <ShoppingBag className="w-8 h-8 text-slate-700" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-black text-white text-lg tracking-tight mb-1">{cartItem.item.name}</h4>
                                                <p className="text-primary font-black">GH₵{(cartItem.item.price * cartItem.quantity).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center bg-slate-950/50 rounded-lg p-1 border border-white/5">
                                                    <button 
                                                        onClick={() => removeFromCart(cartItem.item.id)}
                                                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-black">{cartItem.quantity}</span>
                                                    <button 
                                                        onClick={() => addToCart(cartItem.item)}
                                                        className="w-6 h-6 rounded flex items-center justify-center text-primary hover:text-primary/70"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <form onSubmit={handleCheckout} id="checkout-form" className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Authorization</label>
                                            <div className="relative group">
                                                <input 
                                                    name="name" 
                                                    type="text" 
                                                    required 
                                                    placeholder="Full Operator Name" 
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Communication Protocol</label>
                                            <div className="relative group">
                                                <input 
                                                    name="email" 
                                                    type="email" 
                                                    required 
                                                    placeholder="Digital Contact (Email)" 
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="w-5 h-5 text-primary mt-1 shrink-0" />
                                            <div>
                                                <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Payment Method</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Pay on arrival (Cash or Card supported). A digital receipt will be transmitted to your email.</p>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {!orderDetails && (
                    <div className="p-8 bg-slate-900/80 border-t border-white/5 backdrop-blur-xl">
                        {!isCheckingOut ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Value</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">GH₵{total.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={() => setIsCheckingOut(true)}
                                    className="w-full bg-primary hover:bg-amber-400 text-black font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                                >
                                    Proceed to Protocol
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsCheckingOut(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Back
                                </button>
                                <button 
                                    form="checkout-form"
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-[2] bg-primary hover:bg-amber-400 text-black font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-50"
                                >
                                    {isPending ? "Transmitting..." : "Authorize Selection"}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}
    </>
  );
}
