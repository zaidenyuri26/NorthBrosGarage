import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  Upload, 
  Image as ImageIcon,
  Smartphone, 
  Building2, 
  AlertCircle,
  ExternalLink,
  ZoomIn
} from 'lucide-react';
import { CartItem, UserProfile, SiteSettings, PaymentMethodType } from '../types';
import { createOrder, saveUserProfile, DEFAULT_SITE_SETTINGS } from '../lib/dbService';
import { useToast } from '../context/ToastContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  user: UserProfile | null;
  siteSettings?: SiteSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
  siteSettings = DEFAULT_SITE_SETTINGS,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  
  // Customer Info State
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.shippingAddress?.street || '');
  const [city, setCity] = useState(user?.shippingAddress?.city || '');
  const [state, setState] = useState(user?.shippingAddress?.state || '');
  const [zipCode, setZipCode] = useState(user?.shippingAddress?.zipCode || '');
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('gcash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderRef, setCreatedOrderRef] = useState<string | null>(null);
  const [saveProfile, setSaveProfile] = useState(true);

  const [qrMode, setQrMode] = useState<'dynamic' | 'static'>('dynamic');
  const [zoomedQr, setZoomedQr] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  /**
   * Constructs an EMVCo QR Ph compliant payload string and generates a dynamic QR code
   * with Tag 54 (Transaction Amount) set to the exact order totalAmount.
   */
  const createDynamicQrPhUrl = (provider: 'gcash' | 'paymaya', number: string, name: string, amount: number) => {
    const cleanNum = (number || '').replace(/\D/g, '');
    if (!cleanNum) return '';

    const amtStr = amount.toFixed(2);
    const providerTag = provider === 'gcash' ? 'ph.com.gcash' : 'ph.maya';
    const cleanName = (name || 'NorthBros Motorsport').substring(0, 25).replace(/[^a-zA-Z0-9 ]/g, '');

    // EMVCo QR Ph Data Payload
    const merchantTagData = `0010${providerTag}0112${cleanNum}`;
    const merchantTag = `26${merchantTagData.length.toString().padStart(2, '0')}${merchantTagData}`;
    const amountTag = `54${amtStr.length.toString().padStart(2, '0')}${amtStr}`;
    const nameTag = `59${cleanName.length.toString().padStart(2, '0')}${cleanName}`;

    // Raw EMVCo payload format for Philippine QR Ph scanning
    const rawPayload = `000201010212${merchantTag}520460165303608${amountTag}5802PH${nameTag}6006Manila6304`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(rawPayload)}`;
  };

  useEffect(() => {
    if (user) {
      setCustomerName(user.displayName || '');
      setCustomerEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.shippingAddress) {
        setStreet(user.shippingAddress.street || '');
        setCity(user.shippingAddress.city || '');
        setState(user.shippingAddress.state || '');
        setZipCode(user.shippingAddress.zipCode || '');
      }
    }
  }, [user]);

  // Active payment gateway details based directly on admin siteSettings
  const gcashEnabled = siteSettings?.paymentGcashEnabled ?? true;
  const paymayaEnabled = siteSettings?.paymentPaymayaEnabled ?? true;
  const codEnabled = siteSettings?.paymentCodEnabled ?? true;
  const bankEnabled = siteSettings?.paymentBankEnabled ?? true;

  const gcashName = siteSettings?.paymentGcashName || '';
  const gcashNumber = siteSettings?.paymentGcashNumber || '';
  const gcashQr = siteSettings?.paymentGcashQr || '';
  const gcashInstructions = siteSettings?.paymentGcashInstructions || 'Open GCash, scan QR code or send to the account number above, then enter the Reference Number.';

  const paymayaName = siteSettings?.paymentPaymayaName || '';
  const paymayaNumber = siteSettings?.paymentPaymayaNumber || '';
  const paymayaQr = siteSettings?.paymentPaymayaQr || '';
  const paymayaInstructions = siteSettings?.paymentPaymayaInstructions || 'Open Maya, scan QR code or send to the account number above, then enter the Reference Number.';

  const bankName = siteSettings?.paymentBankName || '';
  const bankAccountName = siteSettings?.paymentBankAccountName || '';
  const bankAccountNumber = siteSettings?.paymentBankAccountNumber || '';
  const bankInstructions = siteSettings?.paymentBankInstructions || 'Transfer via InstaPay or PESONet and paste the transaction trace number below.';

  useEffect(() => {
    const activeMethods: PaymentMethodType[] = [];
    if (gcashEnabled) activeMethods.push('gcash');
    if (paymayaEnabled) activeMethods.push('paymaya');
    if (codEnabled) activeMethods.push('cod');
    if (bankEnabled) activeMethods.push('bank_transfer');

    if (activeMethods.length > 0 && !activeMethods.includes(paymentMethod)) {
      setPaymentMethod(activeMethods[0]);
    }
  }, [gcashEnabled, paymayaEnabled, codEnabled, bankEnabled, paymentMethod]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalShipping = cart.reduce((sum, item) => sum + (item.product.shippingFee || 0) * item.quantity, 0);
  const totalAmount = subtotal + totalShipping;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success('Copied to Clipboard', `${fieldName} copied: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File Too Large', 'Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentReceiptUrl(reader.result as string);
      setReceiptFileName(file.name);
      toast.success('Receipt Attached', 'Payment proof screenshot attached to your order.');
    };
    reader.readAsDataURL(file);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !street || !city || !state || !zipCode) {
      toast.warning('Incomplete Address', 'Please complete all required shipping address fields.');
      return;
    }

    // Require reference number for GCash / Maya / Bank Transfer
    if ((paymentMethod === 'gcash' || paymentMethod === 'paymaya' || paymentMethod === 'bank_transfer') && !paymentReference.trim()) {
      toast.warning(
        'Reference Number Required',
        `Please enter the transaction reference number from your ${
          paymentMethod === 'gcash' ? 'GCash' : paymentMethod === 'paymaya' ? 'Maya' : 'Bank'
        } receipt.`
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Save Profile if requested and user is logged in
      if (user && saveProfile) {
        await saveUserProfile({
          ...user,
          displayName: customerName,
          phone,
          shippingAddress: { street, city, state, zipCode }
        });
      }

      const orderItems = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      const newOrder = await createOrder({
        userId: user?.uid || 'guest-user',
        customerName,
        customerEmail,
        phone,
        items: orderItems,
        totalAmount,
        shippingAddress: { street, city, state, zipCode },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'pending_verification',
        paymentReference: paymentReference.trim() || undefined,
        paymentReceiptUrl: paymentReceiptUrl || undefined,
      });

      setCreatedOrderId(newOrder.id);
      setCreatedOrderRef(paymentReference.trim() || null);
      toast.success(
        'Order Placed Successfully!',
        `Order #${newOrder.id.slice(0, 8).toUpperCase()} for ₱${totalAmount.toLocaleString()} has been queued for fulfillment.`
      );
      onClearCart();
      setStep('success');
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Order Submission Failed', err.message || 'Please check stock availability and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-zinc-100 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-white italic font-mono uppercase">
                {step === 'cart' ? 'SHOPPING CART' : step === 'checkout' ? 'CHECKOUT & PAYMENT' : 'ORDER CONFIRMED'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Step 1: Cart Items List */}
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto" />
                    <p className="text-base text-zinc-400 font-medium">Your shopping cart is empty.</p>
                    <p className="text-sm text-zinc-600">Browse NorthBros Garage performance parts catalog to add items.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg bg-zinc-900"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">{product.brand}</span>
                            <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                            <p className="text-sm font-mono font-bold text-zinc-300 mt-0.5">₱{product.price.toLocaleString()}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800">
                              <button
                                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                                className="p-1 text-zinc-400 hover:text-white"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-sm font-mono font-bold text-zinc-100">{quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                className="p-1 text-zinc-400 hover:text-white"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => onRemoveItem(product.id)}
                              className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 2: Checkout Form */}
            {step === 'checkout' && (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-5 text-sm">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Direct QR Ph E-Wallet Payment with Instant Reference Verification</span>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-mono font-bold text-zinc-300 uppercase text-xs tracking-wider">1. Contact Information</h4>
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={customerName || ''}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={customerEmail || ''}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Philippine Mobile Number (e.g. 0917 123 4567) *"
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Delivery Address */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-mono font-bold text-zinc-300 uppercase text-xs tracking-wider">2. Delivery Address</h4>
                  <input
                    type="text"
                    required
                    placeholder="Street Address, Unit / Building *"
                    value={street || ''}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City / Municipality *"
                      value={city || ''}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Province / State *"
                      value={state || ''}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ZIP / Postal Code *"
                    value={zipCode || ''}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono font-bold text-zinc-300 uppercase text-xs tracking-wider">3. Select Payment Method</h4>
                    <span className="text-[11px] font-mono text-amber-400 font-semibold">QR Ph Ready</span>
                  </div>

                  {!gcashEnabled && !paymayaEnabled && !codEnabled && !bankEnabled && (
                    <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 text-center space-y-1 font-mono">
                      <p className="text-red-400 font-bold text-xs uppercase">No Payment Options Enabled</p>
                      <p className="text-zinc-400 text-[11px]">The store administrator has currently paused online payment gateways.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* GCASH Option */}
                    {gcashEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('gcash')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative overflow-hidden ${
                          paymentMethod === 'gcash'
                            ? 'bg-blue-950/40 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-blue-400 font-black">GCASH</span>
                          </div>
                          {paymentMethod === 'gcash' && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {gcashNumber ? `Send to ${gcashNumber}` : 'Scan QR / Direct'}
                        </span>
                      </button>
                    )}

                    {/* MAYA Option */}
                    {paymayaEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paymaya')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative overflow-hidden ${
                          paymentMethod === 'paymaya'
                            ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-emerald-400 font-black">MAYA</span>
                          </div>
                          {paymentMethod === 'paymaya' && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {paymayaNumber ? `Send to ${paymayaNumber}` : 'Scan QR / Wallet'}
                        </span>
                      </button>
                    )}

                    {/* COD Option */}
                    {codEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          paymentMethod === 'cod'
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold font-mono text-xs text-amber-400">COD</span>
                          {paymentMethod === 'cod' && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">Cash on Delivery</span>
                      </button>
                    )}

                    {/* Bank Transfer Option */}
                    {bankEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          paymentMethod === 'bank_transfer'
                            ? 'bg-purple-950/40 border-purple-500 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold font-mono text-xs text-purple-400">BANK TRANSFER</span>
                          {paymentMethod === 'bank_transfer' && <Check className="w-4 h-4 text-purple-400" />}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {bankName ? bankName : 'InstaPay / PESONet'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* GCash Payment Box */}
                  {paymentMethod === 'gcash' && (
                    <div className="bg-zinc-950 border border-blue-500/40 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-black text-[10px] text-white">
                            G
                          </div>
                          <span className="font-mono font-bold text-blue-400 text-xs uppercase">GCash Transfer Details</span>
                        </div>
                        <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">QR Ph Verified</span>
                      </div>

                      {/* QR Code & Transfer Details */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                        {(() => {
                          const dynamicQr = gcashNumber ? createDynamicQrPhUrl('gcash', gcashNumber, gcashName, totalAmount) : '';
                          const activeQr = (qrMode === 'dynamic' && dynamicQr) ? dynamicQr : (gcashQr || dynamicQr);
                          const isDynamicActive = qrMode === 'dynamic' && !!dynamicQr;

                          return (
                            <div className="flex flex-col items-center shrink-0 w-full sm:w-auto">
                              {gcashNumber && gcashQr && (
                                <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[9px] font-mono mb-2 w-full justify-center">
                                  <button
                                    type="button"
                                    onClick={() => setQrMode('dynamic')}
                                    className={`px-2 py-0.5 rounded transition-all ${isDynamicActive ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                                  >
                                    ⚡ Auto-Amount
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQrMode('static')}
                                    className={`px-2 py-0.5 rounded transition-all ${!isDynamicActive ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                                  >
                                    Static QR
                                  </button>
                                </div>
                              )}

                              {activeQr ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomedQr({ url: activeQr, title: 'GCash QR Ph Code', subtitle: isDynamicActive ? `Auto-Fills ₱${totalAmount.toLocaleString()}` : 'Scan via GCash' })}
                                  className="relative group shrink-0 text-center focus:outline-none cursor-pointer block"
                                >
                                  <div className="relative overflow-hidden rounded-2xl bg-white p-2 shadow-xl border-2 border-blue-500/30 group-hover:border-blue-500 transition-all">
                                    <img
                                      src={activeQr}
                                      alt="GCash QR Ph Code"
                                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-mono text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                                      <ZoomIn className="w-5 h-5 text-blue-400" />
                                      <span>Tap to Enlarge</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-center font-mono font-bold text-blue-400 mt-2 flex items-center justify-center gap-1">
                                    <span>{isDynamicActive ? `⚡ Auto-Fills ₱${totalAmount.toLocaleString()}` : 'Scan via GCash'}</span>
                                    <ZoomIn className="w-3 h-3 text-blue-400/70" />
                                  </div>
                                </button>
                              ) : (
                                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-zinc-500 font-mono text-xs shrink-0">
                                  <QrCode className="w-8 h-8 text-zinc-700 mb-2" />
                                  <span className="font-bold text-zinc-400">Direct Transfer</span>
                                  <span className="text-[10px] text-zinc-600 mt-1">No QR Code Uploaded</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="flex-1 min-w-0 space-y-2 text-xs w-full">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Name</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                              <span className="font-bold text-white truncate">{gcashName}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(gcashName, 'Account Name')}
                                className="text-zinc-400 hover:text-blue-400 ml-2"
                                title="Copy Account Name"
                              >
                                {copiedField === 'Account Name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">GCash Number</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-amber-400">{gcashNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(gcashNumber, 'GCash Number')}
                                className="text-zinc-400 hover:text-amber-400 ml-2"
                                title="Copy GCash Number"
                              >
                                {copiedField === 'GCash Number' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Exact Amount to Send</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-emerald-400">₱{totalAmount.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(totalAmount.toString(), 'Total Amount')}
                                className="text-zinc-400 hover:text-emerald-400 ml-2"
                                title="Copy Amount"
                              >
                                {copiedField === 'Total Amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 italic">
                        {gcashInstructions}
                      </p>

                      {/* Required Reference Number Input */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-xs font-mono font-bold text-blue-300 uppercase">
                          GCash Transaction / Reference Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1002 9384 7561"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="w-full bg-zinc-900 border border-blue-500/50 rounded-xl p-2.5 text-white font-mono text-sm tracking-wider focus:border-blue-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          Found at the top of your GCash receipt right after sending.
                        </span>
                      </div>

                      {/* Optional Receipt Screenshot */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                          Optional: Attach Receipt Screenshot
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-mono transition-colors">
                            <Upload className="w-3.5 h-3.5 text-blue-400" />
                            <span>{receiptFileName ? 'Change Screenshot' : 'Upload Receipt Screenshot'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleReceiptUpload}
                            />
                          </label>
                          {receiptFileName && (
                            <button
                              type="button"
                              onClick={() => { setPaymentReceiptUrl(''); setReceiptFileName(''); }}
                              className="text-xs text-red-400 hover:text-red-300 font-mono"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {paymentReceiptUrl && (
                          <div className="mt-2 relative inline-block">
                            <img src={paymentReceiptUrl} alt="Receipt preview" className="w-20 h-20 object-cover rounded-lg border border-zinc-700" />
                            <span className="text-[10px] text-emerald-400 font-mono block mt-1">✓ Receipt Attached</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Maya Payment Box */}
                  {paymentMethod === 'paymaya' && (
                    <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-black text-[10px] text-white">
                            M
                          </div>
                          <span className="font-mono font-bold text-emerald-400 text-xs uppercase">Maya / PayMaya Details</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">QR Ph Verified</span>
                      </div>

                      {/* QR Code & Transfer Details */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                        {(() => {
                          const dynamicQr = paymayaNumber ? createDynamicQrPhUrl('paymaya', paymayaNumber, paymayaName, totalAmount) : '';
                          const activeQr = (qrMode === 'dynamic' && dynamicQr) ? dynamicQr : (paymayaQr || dynamicQr);
                          const isDynamicActive = qrMode === 'dynamic' && !!dynamicQr;

                          return (
                            <div className="flex flex-col items-center shrink-0 w-full sm:w-auto">
                              {paymayaNumber && paymayaQr && (
                                <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[9px] font-mono mb-2 w-full justify-center">
                                  <button
                                    type="button"
                                    onClick={() => setQrMode('dynamic')}
                                    className={`px-2 py-0.5 rounded transition-all ${isDynamicActive ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                                  >
                                    ⚡ Auto-Amount
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQrMode('static')}
                                    className={`px-2 py-0.5 rounded transition-all ${!isDynamicActive ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                                  >
                                    Static QR
                                  </button>
                                </div>
                              )}

                              {activeQr ? (
                                <button
                                  type="button"
                                  onClick={() => setZoomedQr({ url: activeQr, title: 'Maya QR Ph Code', subtitle: isDynamicActive ? `Auto-Fills ₱${totalAmount.toLocaleString()}` : 'Scan via Maya' })}
                                  className="relative group shrink-0 text-center focus:outline-none cursor-pointer block"
                                >
                                  <div className="relative overflow-hidden rounded-2xl bg-white p-2 shadow-xl border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-all">
                                    <img
                                      src={activeQr}
                                      alt="Maya QR Ph Code"
                                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-mono text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                                      <ZoomIn className="w-5 h-5 text-emerald-400" />
                                      <span>Tap to Enlarge</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-center font-mono font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1">
                                    <span>{isDynamicActive ? `⚡ Auto-Fills ₱${totalAmount.toLocaleString()}` : 'Scan via Maya'}</span>
                                    <ZoomIn className="w-3 h-3 text-emerald-400/70" />
                                  </div>
                                </button>
                              ) : (
                                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-zinc-500 font-mono text-xs shrink-0">
                                  <QrCode className="w-8 h-8 text-zinc-700 mb-2" />
                                  <span className="font-bold text-zinc-400">Direct Transfer</span>
                                  <span className="text-[10px] text-zinc-600 mt-1">No QR Code Uploaded</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="flex-1 min-w-0 space-y-2 text-xs w-full">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Name</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                              <span className="font-bold text-white truncate">{paymayaName}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(paymayaName, 'Maya Account Name')}
                                className="text-zinc-400 hover:text-emerald-400 ml-2"
                                title="Copy Account Name"
                              >
                                {copiedField === 'Maya Account Name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Maya Mobile Number</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-emerald-400">{paymayaNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(paymayaNumber, 'Maya Number')}
                                className="text-zinc-400 hover:text-emerald-400 ml-2"
                                title="Copy Maya Number"
                              >
                                {copiedField === 'Maya Number' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Exact Amount to Send</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-emerald-400">₱{totalAmount.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(totalAmount.toString(), 'Total Amount')}
                                className="text-zinc-400 hover:text-emerald-400 ml-2"
                                title="Copy Amount"
                              >
                                {copiedField === 'Total Amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 italic">
                        {paymayaInstructions}
                      </p>

                      {/* Required Reference Number Input */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-xs font-mono font-bold text-emerald-300 uppercase">
                          Maya Reference / Transaction ID *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MP-84729104 or 8392019482"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="w-full bg-zinc-900 border border-emerald-500/50 rounded-xl p-2.5 text-white font-mono text-sm tracking-wider focus:border-emerald-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          Generated right after completing payment on your Maya app.
                        </span>
                      </div>

                      {/* Optional Receipt Screenshot */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                          Optional: Attach Receipt Screenshot
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl border border-zinc-800 text-xs font-mono transition-colors">
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{receiptFileName ? 'Change Screenshot' : 'Upload Receipt Screenshot'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleReceiptUpload}
                            />
                          </label>
                          {receiptFileName && (
                            <button
                              type="button"
                              onClick={() => { setPaymentReceiptUrl(''); setReceiptFileName(''); }}
                              className="text-xs text-red-400 hover:text-red-300 font-mono"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {paymentReceiptUrl && (
                          <div className="mt-2 relative inline-block">
                            <img src={paymentReceiptUrl} alt="Receipt preview" className="w-20 h-20 object-cover rounded-lg border border-zinc-700" />
                            <span className="text-[10px] text-emerald-400 font-mono block mt-1">✓ Receipt Attached</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Box */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-zinc-950 border border-purple-500/40 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-400" />
                          <span className="font-mono font-bold text-purple-400 text-xs uppercase">Bank Transfer / InstaPay</span>
                        </div>
                        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">PESONet / InstaPay</span>
                      </div>

                      <div className="space-y-2 text-xs bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Bank Name</span>
                          <span className="font-bold text-white">{bankName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Name</span>
                          <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                            <span className="font-bold text-white">{bankAccountName}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankAccountName, 'Bank Account Name')}
                              className="text-zinc-400 hover:text-purple-400"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Number</span>
                          <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                            <span className="font-mono font-bold text-purple-300">{bankAccountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankAccountNumber, 'Bank Account Number')}
                              className="text-zinc-400 hover:text-purple-400"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 italic">{bankInstructions}</p>

                      <div className="space-y-1.5 pt-1">
                        <label className="block text-xs font-mono font-bold text-purple-300 uppercase">
                          Bank Trace / Reference Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2024081200192837"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className="w-full bg-zinc-900 border border-purple-500/50 rounded-xl p-2.5 text-white font-mono text-sm tracking-wider focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cash On Delivery Box */}
                  {paymentMethod === 'cod' && (
                    <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-xs">
                        <ShoppingBag className="w-4 h-4" />
                        <span>CASH ON DELIVERY (COD)</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Pay upon delivery directly to our courier rider. Please ensure exact payment of <strong className="text-white font-mono">₱{totalAmount.toLocaleString()}</strong> is ready upon delivery.
                      </p>
                    </div>
                  )}
                </div>

                {user && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="save-profile"
                      checked={saveProfile}
                      onChange={(e) => setSaveProfile(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded bg-zinc-900 border-zinc-800"
                    />
                    <label htmlFor="save-profile" className="text-[12px] font-mono text-zinc-400 cursor-pointer">
                      Save shipping details to my Driver Profile
                    </label>
                  </div>
                )}
              </form>
            )}

            {/* Step 3: Success Screen */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-white uppercase font-mono tracking-tight">ORDER PLACED!</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Thank you for your order. We have recorded your payment reference and dispatch details.
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-left space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">Order ID</span>
                    <span className="text-amber-400 font-bold">#{createdOrderId?.slice(0, 10).toUpperCase()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase">Payment Method</span>
                    <span className={`font-bold uppercase ${
                      paymentMethod === 'gcash' ? 'text-blue-400' :
                      paymentMethod === 'paymaya' ? 'text-emerald-400' :
                      paymentMethod === 'bank_transfer' ? 'text-purple-400' : 'text-amber-400'
                    }`}>
                      {paymentMethod === 'gcash' ? 'GCash Transfer' :
                       paymentMethod === 'paymaya' ? 'Maya (PayMaya)' :
                       paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                    </span>
                  </div>

                  {createdOrderRef && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 uppercase">Reference #</span>
                      <span className="text-white font-bold">{createdOrderRef}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2">
                    <span className="text-zinc-500 uppercase">Payment Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {paymentMethod === 'cod' ? 'Pay upon Delivery' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl text-left space-y-2">
                  <h4 className="text-[11px] font-bold text-amber-400 uppercase font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>How Payment Verification Works:</span>
                  </h4>
                  <ul className="text-[11px] text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Our team checks the submitted Reference Number against our GCash/Maya notifications.</li>
                    <li>Once verified, your order status is updated to <strong className="text-white">Accepted & Preparing</strong>.</li>
                    <li>You can track real-time fulfillment status in your <strong className="text-amber-400">Driver Portal Logbook</strong>.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 border-t border-zinc-800 bg-zinc-950 space-y-3">
            {step !== 'success' && cart.length > 0 && (
              <div className="space-y-1.5 pb-2 border-b border-zinc-900 mb-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 uppercase">Items Subtotal</span>
                  <span className="text-zinc-300">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 uppercase">Shipping Fee</span>
                  <span className="text-emerald-500 font-bold">+ ₱{totalShipping.toLocaleString()}</span>
                </div>
              </div>
            )}

            {step === 'cart' && (
              <>
                <div className="flex items-center justify-between text-base font-mono font-bold pb-1">
                  <span className="text-zinc-400 uppercase text-xs">Total Amount</span>
                  <span className="text-amber-400 text-xl">₱{totalAmount.toLocaleString()} PHP</span>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  disabled={cart.length === 0}
                  id="cart-proceed-checkout-btn"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 'checkout' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-3 rounded-xl text-xs uppercase transition-colors"
                >
                  Back
                </button>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  id="confirm-place-order-btn"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Submitting Order...</span>
                  ) : (
                    <span>Place Order (₱{totalAmount.toLocaleString()})</span>
                  )}
                </button>
              </div>
            )}

            {step === 'success' && (
              <button
                onClick={() => { setStep('cart'); onClose(); }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Back to Garage Store
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Zoomed QR Code Lightbox Modal */}
      {zoomedQr && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomedQr(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-sm w-full flex flex-col items-center text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedQr(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="font-mono font-bold text-white text-base uppercase tracking-wide">{zoomedQr.title}</h3>
              {zoomedQr.subtitle && (
                <p className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
                  {zoomedQr.subtitle}
                </p>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-2xl shadow-2xl border-4 border-zinc-800">
              <img
                src={zoomedQr.url}
                alt="Enlarged QR Code"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
              />
            </div>

            <p className="text-xs font-mono text-zinc-400">
              Scan directly using your GCash, Maya, or QR Ph supported banking app camera.
            </p>

            <button
              type="button"
              onClick={() => setZoomedQr(null)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
