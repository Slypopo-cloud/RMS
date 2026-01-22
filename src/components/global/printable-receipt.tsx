"use client";



interface ReceiptProps {
  order: {
    id: string;
    createdAt: Date;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod?: string;
    user?: { name: string | null };
    items: {
      quantity: number;
      price: number;
      menuItem: { name: string };
    }[];
  };
}

export function PrintableReceipt({ order }: ReceiptProps) {
  return (
    <div id="receipt-print-area" className="w-[80mm] p-6 bg-white text-black font-mono text-[11px] leading-tight border border-slate-200 mx-auto hidden print:block">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-lg font-black uppercase tracking-tighter">Olu&apos;s Kitchen</h1>
        <p className="text-[9px] uppercase font-bold text-slate-500">Exceptional Dining Orchestrated</p>
        <div className="w-full border-t border-dashed border-slate-300 mt-2"></div>
      </div>

      {/* Meta Specs */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-500">
           <span>Order ID</span>
           <span className="text-black">#{order.id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Date</span>
            <span className="font-bold">{new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Server</span>
            <span className="font-bold">{order.user?.name || "Counter"}</span>
        </div>
      </div>

      <div className="w-full border-t border-dashed border-slate-300 my-4"></div>

      {/* Items Grid */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-[1fr,40px,60px] gap-2 font-black uppercase text-[9px] text-slate-500">
          <span>Item</span>
          <span className="text-center">QTY</span>
          <span className="text-right">Price</span>
        </div>
        {order.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-[1fr,20px,60px] gap-2 items-start">
            <span className="font-bold">{item.menuItem.name}</span>
            <span className="text-center font-bold">×{item.quantity}</span>
            <span className="text-right font-black">GH₵{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="w-full border-t border-dashed border-slate-300 my-4"></div>

      {/* Totals Section */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-sm font-black">
          <span className="uppercase tracking-tighter">Grand Total</span>
          <span>GH₵{order.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Payment Status</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${order.paymentStatus === 'PAID' ? 'bg-slate-100 text-black' : 'bg-red-50 text-red-600'}`}>
                {order.paymentStatus}
            </span>
        </div>
        {order.paymentMethod && (
            <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold uppercase text-[9px]">Method</span>
                <span className="font-bold uppercase">{order.paymentMethod}</span>
            </div>
        )}
      </div>

      <div className="w-full border-t border-dashed border-slate-300 my-4"></div>

      {/* Footer Acknowledgement */}
      <div className="text-center space-y-2 mt-8">
        <p className="font-bold italic uppercase text-[9px]">Thank you for dining with us!</p>
        <div className="flex justify-center flex-col items-center gap-1 opacity-20">
             <div className="w-full h-px bg-black"></div>
             <div className="w-2/3 h-px bg-black"></div>
             <div className="w-1/2 h-px bg-black"></div>
        </div>
        <p className="text-[7px] font-bold text-slate-400 mt-2">v.1.0-AUTH-ORCHESTRATED</p>
      </div>
    </div>
  );
}
