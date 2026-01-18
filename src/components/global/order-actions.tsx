"use client";

import { useState } from "react";
import { CreditCard, Banknote, Printer, CheckCircle2, X, Loader2, Receipt } from "lucide-react";
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
  const [showReceipt, setShowReceipt] = useState(false);

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
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById(`receipt-${order.id}`);
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 300px; margin: auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
            .total { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            .b { font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h2 style="margin: 0;">VANTAGE RMS</h2>
            <div style="font-size: 12px;">Professional Hospitality</div>
            <div style="font-size: 10px; margin-top: 5px;">${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div class="item b">
              <span>Item</span>
              <span>Total</span>
            </div>
            ${order.items.map(i => `
              <div class="item">
                <span>${i.quantity}x ${i.menuItem.name}</span>
                <span>$${(i.quantity * (i.menuItem.price || 0)).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="total">
            <div class="item">
              <span>NET TOTAL</span>
              <span>$${order.totalAmount.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>STATUS</span>
              <span>${order.paymentStatus}</span>
            </div>
          </div>
          <div class="footer">
            <div>Order ID: ${order.id.slice(-6).toUpperCase()}</div>
            ${order.restaurantTable ? `<div>Table: ${order.restaurantTable.number}</div>` : ''}
            <div style="margin-top: 10px;">Thank you for your visit!</div>
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
              <p className="text-slate-400 text-sm font-medium">Select payment method for total <span className="text-white font-bold">${order.totalAmount.toFixed(2)}</span></p>
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
