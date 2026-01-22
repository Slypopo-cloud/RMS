import { PublicMenu } from "@/components/public/public-menu";
import { MenuSkeleton } from "@/components/public/menu-skeleton";
import { getCategories } from "@/actions/menu";
import Link from 'next/link';
import { ChefHat, Star } from 'lucide-react';
import { Suspense } from "react";
import { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Signature Menu | Olu's Kitchen",
        description: "Explore our curated collection of culinary masterpieces. From artisanal starters to signature mains, experience digital gastronomy at its finest.",
        openGraph: {
            title: "Olu's Kitchen - Signature Menu",
            description: "Exceptional dining, digitally orchestrated.",
            images: ["/og-menu.jpg"], // Placeholder for actual OG image
        },
    };
};

async function MenuList() {
    const categoriesResult = await getCategories();
    const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <PublicMenu categories={categories as any} />;
}

export default async function PublicMenuPage() {

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-20">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
      
      {/* Public Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 backdrop-blur-xl border-b border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/menu" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform rotate-3">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">OLU&apos;S <span className="text-primary">KITCHEN</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Digital Gastronomy</p>
            </div>
          </Link>
          
          <Link 
            href="/login" 
            className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors px-4 py-2 border border-white/5 rounded-xl hover:bg-white/5"
          >
            Staff Portal
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20">
        <div className="relative mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Kitchen Operative • Live
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 animate-in fade-in slide-in-from-left-8 duration-700 leading-[0.9]">
                Behold the <br />
                <span className="text-primary italic">Signature</span> Selection
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-8 animate-in fade-in slide-in-from-left-12 duration-1000">
                <p className="text-slate-400 max-w-xl text-xl font-medium leading-relaxed">
                    Crafting extraordinary culinary narratives through seasonal ingredients and avant-garde techniques.
                </p>
                <div className="flex items-center gap-4 p-4 rounded-[2rem] bg-slate-900/50 border border-white/5 backdrop-blur-md">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest">Chef&apos;s Recommendation</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Refined Daily</p>
                    </div>
                </div>
            </div>
        </div>

        <Suspense fallback={<MenuSkeleton />}>
            <MenuList />
        </Suspense>
      </div>

      {/* Floating Cart Placeholder - Will be part of PublicMenu probably */}
    </main>
  );
}
