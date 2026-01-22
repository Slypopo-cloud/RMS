"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { 
    Search, 
    Plus, 
    Minus, 
    ShoppingBag, 
    Star,
    Clock,
    Flame,
    X
} from "lucide-react";
import { DigitalCart } from "./digital-cart";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  available: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
}

export function PublicMenu({ categories }: { categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    let items = activeCategory === "all" 
      ? categories.flatMap(c => c.items)
      : categories.find(c => c.id === activeCategory)?.items || [];
    
    if (searchQuery) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return items.filter(i => i.available);
  }, [categories, activeCategory, searchQuery]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.item.id !== itemId);
    });
  };

  const getQuantity = (itemId: string) => {
    return cart.find(i => i.item.id === itemId)?.quantity || 0;
  };

  return (
    <div className="space-y-12">
      {/* Category Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-6 sticky top-20 z-40 py-4 bg-slate-950/80 backdrop-blur-md">
        <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-3 p-1 bg-slate-900/50 rounded-2xl border border-white/5 w-max">
            <button
                onClick={() => setActiveCategory("all")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeCategory === "all" ? "bg-primary text-black shadow-lg" : "text-slate-400 hover:text-white"
                }`}
            >
                Catalog
            </button>
            {categories.map(category => (
                <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeCategory === category.id ? "bg-primary text-black shadow-lg" : "text-slate-400 hover:text-white"
                    }`}
                >
                    {category.name}
                </button>
            ))}
          </div>
        </div>

        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                <Search className="w-5 h-5" />
            </div>
            <input 
                type="text" 
                placeholder="Search the menu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item, index) => (
            <div 
                key={item.id} 
                className="group bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-500 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedItem(item)}
            >
                <div className="relative h-56 w-full overflow-hidden">
                    {item.image ? (
                        <Image 
                            src={item.image} 
                            alt={item.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-slate-700" />
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-primary flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-black text-white leading-tight">{item.name}</h3>
                        <p className="text-primary font-black text-lg">GH₵{item.price.toFixed(2)}</p>
                    </div>
                    
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 min-h-[40px] mb-6">
                        {item.description || "Authentic culinary creation prepared with the finest selected ingredients."}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>15-20 Min</span>
                            </div>
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                            {getQuantity(item.id) > 0 ? (
                                <div className="flex items-center bg-slate-800/80 rounded-xl border border-white/5 p-1">
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-black text-sm">{getQuantity(item.id)}</span>
                                    <button 
                                        onClick={() => addToCart(item)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-primary hover:bg-slate-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => addToCart(item)}
                                    className="bg-primary hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700 mb-6 border border-white/5 ring-8 ring-primary/5">
                <Search className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">No Masterpieces Found</h3>
            <p className="text-slate-500 max-w-sm font-medium">We couldn&apos;t find any items matching your criteria. Try adjusting your search or category filters.</p>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 lg:p-10">
            <div 
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
                onClick={() => setSelectedItem(null)}
            ></div>
            
            <div className="relative w-full max-w-5xl bg-slate-900 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-slate-950/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all border border-white/10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="relative w-full md:w-1/2 h-[40vh] md:h-auto overflow-hidden">
                    {selectedItem.image ? (
                        <Image src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <ShoppingBag className="w-20 h-20 text-slate-700" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                </div>

                <div className="flex-1 p-8 md:p-14 flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                            <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 leading-none">Original Recipe</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Premium</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none">{selectedItem.name}</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed mb-4">
                            {selectedItem.description || "Our signature creation, meticulously crafted using traditional techniques and the freshest seasonal ingredients."}
                        </p>
                        <div className="flex items-center gap-6 text-slate-500 text-sm font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>15-20 Min</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span>Perfectly Spiced</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Pricing</p>
                            <p className="text-4xl font-black text-white">GH₵{selectedItem.price.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {getQuantity(selectedItem.id) > 0 ? (
                                <div className="flex items-center bg-slate-800 rounded-3xl p-2 border border-white/5 shadow-inner">
                                    <button 
                                        onClick={() => removeFromCart(selectedItem.id)}
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
                                    >
                                        <Minus className="w-6 h-6" />
                                    </button>
                                    <span className="w-12 text-center font-black text-2xl">{getQuantity(selectedItem.id)}</span>
                                    <button 
                                        onClick={() => addToCart(selectedItem)}
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary hover:bg-slate-700 transition-colors"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => addToCart(selectedItem)}
                                    className="bg-primary hover:bg-amber-400 text-black px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-primary/20 active:scale-95 flex items-center gap-3"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Initiate Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {cart.length > 0 && (
        <DigitalCart cart={cart} removeFromCart={removeFromCart} addToCart={addToCart} clearCart={() => setCart([])} />
      )}
    </div>
  );
}
