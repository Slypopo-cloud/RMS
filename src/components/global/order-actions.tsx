"use client";

import { useState } from "react";
import { CreditCard, Banknote, Printer, X, Loader2, Receipt } from "lucide-react";
import { processPayment } from "@/actions/order";
import { toast } from "sonner";

interface OrderActionsProps {
  order: {
    id: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    items: {
      quantity: number;
      menuItem: { name: string; price: number };
    }[];
    createdAt: Date;
    restaurantTable?: { number: string } | null;
  };
}

export function OrderActions({ order }: OrderActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayment = async (method: "CASH" | "CARD") => {
    setIsProcessing(true);
    try {
      const result = await processPayment(order.id, order.totalAmount, method);
      if (result.success) {
        toast.success(result.message);
        setShowPaymentModal(false);
        // Refresh page to show updated status
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.id.slice(-6).toUpperCase()}</title>
          <style>
            @page { margin: 0; }
            body { 
                font-family: 'Courier New', Courier, monospace; 
                padding: 10px; 
                width: 58mm; 
                margin: 0 auto; 
                color: #000;
                line-height: 1.1;
                font-size: 10px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .black { font-weight: 900; }
            .header { margin-bottom: 12px; text-transform: uppercase; }
            .brand { font-size: 14px; letter-spacing: -1px; margin-bottom: 2px; }
            .subtitle { font-size: 7px; color: #666; letter-spacing: 0.5px; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .meta { font-size: 9px; margin-bottom: 8px; }
            .meta-row { display: flex; justify-content: space-between; }
            .item-list { margin-bottom: 20px; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .totals { margin-top: 15px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .grand-total { font-size: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #000; }
            .footer { margin-top: 30px; font-size: 9px; font-style: italic; }
            .status-badge { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 9px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header center">
            <div class="brand black">Olu's Kitchen</div>
            <div class="subtitle bold">Exceptional Dining Orchestrated</div>
            <div class="divider"></div>
          </div>

          <div class="meta">
            <div class="meta-row"><span>Order Ref:</span> <span class="bold">#${order.id.slice(-8).toUpperCase()}</span></div>
            <div class="meta-row"><span>Timestamp:</span> <span>${new Date(order.createdAt).toLocaleString()}</span></div>
            ${order.restaurantTable ? `<div class="meta-row"><span>Table:</span> <span class="bold">No. ${order.restaurantTable.number}</span></div>` : ''}
          </div>

          <div class="divider"></div>

          <div class="item-list">
            ${order.items.map(i => `
              <div class="item-row">
                <span style="flex: 1;">${i.menuItem.name} <span style="font-size: 10px; color: #666;">(x${i.quantity})</span></span>
                <span class="bold">GH₵${(i.quantity * i.menuItem.price).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="divider"></div>

          <div class="totals">
            <div class="total-row grand-total bold">
              <span>NET TOTAL</span>
              <span>GH₵${order.totalAmount.toFixed(2)}</span>
            </div>
            <div class="total-row" style="margin-top: 10px;">
              <span>Payment Status</span>
              <span class="status-badge bold">${order.paymentStatus}</span>
            </div>
          </div>

          <div class="footer center">
            <p>Thank you for choosing Olu's Kitchen!</p>
            <div style="opacity: 0.1; margin-top: 10px;">
                -----------------------------------
            </div>
            <p style="color: #999; margin-top: 10px;">PROCESSED BY VANTAGE RMS</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && (
        <button
          onClick={() => setShowPaymentModal(true)}
          className="bg-primary text-black px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_5px_15px_rgba(245,158,11,0.2)]"
        >
          <CreditCard className="w-3 h-3" />
          SETTLE
        </button>
      )}

      <button
        onClick={handlePrint}
        className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-slate-500 transition-all flex items-center gap-1.5"
      >
        <Printer className="w-3 h-3" />
        RECEIPT
      </button>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-primary" />
                </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">Order Settlement</h3>
              <p className="text-slate-400 text-sm font-medium">Select payment method for total <span className="text-white font-bold">GH₵{order.totalAmount.toFixed(2)}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={isProcessing}
                onClick={() => handlePayment("CASH")}
                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all group"
              >
                <Banknote className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">CASH</span>
              </button>
              
              <button
                disabled={isProcessing}
                onClick={() => handlePayment("CARD")}
                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all group"
              >
                <CreditCard className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">CARD</span>
              </button>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
