import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, Clock, Car, Copy, Check } from 'lucide-react';
import { Order, SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../lib/dbService';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  siteSettings?: SiteSettings;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  siteSettings = DEFAULT_SITE_SETTINGS,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discountAmount || 0;
  const shippingFee = Math.max(0, order.totalAmount - (subtotal - discount));

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:inset-auto print:static">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl text-zinc-100 overflow-hidden relative print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono font-bold text-white text-sm uppercase tracking-wider">
              OFFICIAL GARAGE INVOICE & RECEIPT
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-invoice-btn"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-3.5 py-1.5 rounded-xl text-xs uppercase font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6 print:text-black font-sans">
          
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 print:border-black pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-sm italic print:border print:border-black">
                  NB
                </div>
                <h1 className="text-xl font-black italic uppercase font-mono tracking-tight text-white print:text-black">
                  {siteSettings.brandName || 'NORTHBROS GARAGE'}
                </h1>
              </div>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-mono">
                {siteSettings.brandSubtitle || 'Performance JDM Parts & Tuning Workshop'}
              </p>
              <p className="text-[11px] text-zinc-500 print:text-gray-500 font-mono">
                Quezon City / Metro Manila, Philippines | Support: support@northbrosgarage.ph
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 font-mono">
              <div className="inline-flex items-center gap-1.5 bg-zinc-950 print:bg-gray-100 px-3 py-1 rounded-lg border border-zinc-800 print:border-gray-300">
                <span className="text-xs font-bold text-amber-400 print:text-black">{invoiceNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyInvoice}
                  className="text-zinc-500 hover:text-white print:hidden ml-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 print:text-gray-600">Date: {formattedDate}</p>
              <p className="text-[11px] text-zinc-400 print:text-gray-600">Order Ref ID: #{order.id}</p>
            </div>
          </div>

          {/* Customer & Payment Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Customer Shipping Address */}
            <div className="bg-zinc-950/60 print:bg-gray-50 p-4 rounded-2xl border border-zinc-800 print:border-gray-300 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 print:text-gray-500 block">Billed & Shipped To</span>
              <p className="font-bold text-white print:text-black text-sm">{order.customerName}</p>
              <p className="text-zinc-300 print:text-gray-700">{order.customerEmail}</p>
              <p className="text-zinc-300 print:text-gray-700">{order.phone}</p>
              <p className="text-zinc-400 print:text-gray-600 pt-1 leading-relaxed">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
            </div>

            {/* Payment & Audit Info */}
            <div className="bg-zinc-950/60 print:bg-gray-50 p-4 rounded-2xl border border-zinc-800 print:border-gray-300 space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-500 print:text-gray-500 block">Payment Audit Details</span>
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 print:text-gray-600">Method:</span>
                <span className="font-bold uppercase text-amber-400 print:text-black">
                  {order.paymentMethod === 'gcash' ? 'GCash QR Ph Transfer' :
                   order.paymentMethod === 'paymaya' ? 'Maya (PayMaya)' :
                   order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                </span>
              </div>

              {order.paymentReference && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 print:text-gray-600">Reference No:</span>
                  <span className="font-bold text-white print:text-black bg-zinc-900 print:bg-gray-200 px-2 py-0.5 rounded border border-zinc-800 print:border-gray-400">
                    {order.paymentReference}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-zinc-800/80 print:border-gray-300">
                <span className="text-zinc-400 print:text-gray-600">Verification Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  order.paymentStatus === 'verified' || order.paymentStatus === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400 print:text-green-700'
                    : 'bg-amber-500/20 text-amber-400 print:text-amber-800'
                }`}>
                  {order.paymentStatus === 'verified' || order.paymentStatus === 'paid'
                    ? '✓ Verified & Confirmed'
                    : 'Pending Ledger Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 print:border-gray-300">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 print:bg-gray-100 text-zinc-400 print:text-gray-700 uppercase border-b border-zinc-800 print:border-gray-300">
                <tr>
                  <th className="p-3">Part Description</th>
                  <th className="p-3 text-center">Brand</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 print:divide-gray-300 text-zinc-200 print:text-black">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-950/40 print:hover:bg-transparent">
                    <td className="p-3">
                      <span className="font-bold block text-white print:text-black">{item.productName}</span>
                      <span className="text-[10px] text-zinc-500 print:text-gray-500">ID: {item.productId}</span>
                    </td>
                    <td className="p-3 text-center font-bold text-amber-400 print:text-black uppercase">
                      {item.brand}
                    </td>
                    <td className="p-3 text-right">₱{item.price.toLocaleString()}</td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-bold">₱{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 font-mono text-xs bg-zinc-950/80 print:bg-gray-50 p-4 rounded-2xl border border-zinc-800 print:border-gray-300">
              <div className="flex justify-between text-zinc-400 print:text-gray-600">
                <span>Subtotal Items:</span>
                <span className="text-zinc-200 print:text-black">₱{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 print:text-green-700 font-bold">
                  <span>Promo Discount ({order.discountCode || 'COUPON'}):</span>
                  <span>- ₱{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400 print:text-gray-600">
                <span>Shipping Fee:</span>
                <span className="text-zinc-200 print:text-black">+ ₱{shippingFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-amber-400 print:text-black border-t border-zinc-800 print:border-gray-400 pt-2 mt-1">
                <span>Grand Total:</span>
                <span>₱{order.totalAmount.toLocaleString()} PHP</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Authenticity Seal */}
          <div className="border-t border-zinc-800/80 print:border-gray-300 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500 print:text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-green-700 shrink-0" />
              <span>Official Electronic Receipt generated by NorthBros Garage Store. All items covered by 30-day manufacturer warranty.</span>
            </div>
            <span className="shrink-0 text-[10px]">Page 1 of 1</span>
          </div>

        </div>
      </div>
    </div>
  );
};
