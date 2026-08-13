import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CartItem, UserProfile } from '../types';
import { createOrder, saveUserProfile } from '../lib/dbService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  user: UserProfile | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.shippingAddress?.street || '');
  const [city, setCity] = useState(user?.shippingAddress?.city || '');
  const [state, setState] = useState(user?.shippingAddress?.state || '');
  const [zipCode, setZipCode] = useState(user?.shippingAddress?.zipCode || '');
  const [loading, setLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [saveProfile, setSaveProfile] = useState(true);

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

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !street || !city || !state || !zipCode) {
      alert('Please complete all required address fields.');
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
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Credit Card / Express Checkout'
      });

      setCreatedOrderId(newOrder.id);
      onClearCart();
      setStep('success');
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'Order creation failed. Please check stock availability and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-zinc-100 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black text-white italic font-mono uppercase">
                {step === 'cart' ? 'SHOPPING CART' : step === 'checkout' ? 'SHIPPING & CHECKOUT' : 'ORDER CONFIRMED'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
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
                            <p className="text-sm font-mono font-bold text-zinc-300 mt-0.5">${product.price.toLocaleString()}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800">
                              <button
                                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                                className="p-1 text-zinc-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-sm font-mono font-bold text-zinc-100">{quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                className="p-1 text-zinc-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => onRemoveItem(product.id)}
                              className="text-zinc-500 hover:text-red-400 p-1"
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
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 text-sm">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Secure 256-Bit Encrypted Order Dispatch</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-mono font-bold text-zinc-300 uppercase">Contact Information</h4>
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={customerName || ''}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={customerEmail || ''}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number *"
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-mono font-bold text-zinc-300 uppercase">Delivery Address</h4>
                  <input
                    type="text"
                    required
                    placeholder="Street Address *"
                    value={street || ''}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City *"
                      value={city || ''}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State / Prov *"
                      value={state || ''}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ZIP / Postal Code *"
                    value={zipCode || ''}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-mono font-bold text-zinc-300 uppercase">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border font-mono text-[12px] font-bold transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === 'cod' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>CASH ON DELIVERY</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border font-mono text-[12px] font-bold transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === 'card' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>CARD PAYMENT</span>
                    </button>
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="text-[11px] text-zinc-500 italic px-1">
                      * Please prepare exact amount upon delivery. Orders will be verified by our team.
                    </p>
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
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white uppercase font-mono">ORDER RECEIVED!</h3>
                <p className="text-sm text-zinc-400">
                  {paymentMethod === 'cod' 
                    ? 'Your Cash on Delivery order is recorded. Our team will verify it shortly and begin preparation.'
                    : 'Your payment has been processed and your order is recorded for immediate dispatch.'}
                </p>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-sm text-zinc-300">
                  Order ID: <span className="text-amber-400 font-bold">{createdOrderId}</span>
                </div>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-left space-y-2">
                  <h4 className="text-[11px] font-bold text-amber-500 uppercase font-mono">Next Steps:</h4>
                  <ul className="text-[11px] text-zinc-400 space-y-1 list-disc pl-4">
                    <li>Track your order in your Driver Portal profile</li>
                    <li>Look out for a verification call/SMS for COD</li>
                    <li>Wait for "Ready for Shipment" status update</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-zinc-800 bg-zinc-950 space-y-3">
            {step === 'cart' && (
              <>
                <div className="flex items-center justify-between text-base font-mono font-bold">
                  <span className="text-zinc-400 uppercase">Subtotal</span>
                  <span className="text-amber-400 text-xl">₱{totalAmount.toLocaleString()} PHP</span>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  disabled={cart.length === 0}
                  id="cart-proceed-checkout-btn"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
                  className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-3 rounded-xl text-sm uppercase"
                >
                  Back
                </button>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  id="confirm-place-order-btn"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-3 px-4 rounded-xl text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing Order...' : `Place Order ($${totalAmount.toLocaleString()})`}
                </button>
              </div>
            )}

            {step === 'success' && (
              <button
                onClick={() => { setStep('cart'); onClose(); }}
                className="w-full bg-amber-500 text-zinc-950 font-bold py-3 px-4 rounded-xl text-sm uppercase"
              >
                Back to Garage Store
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
