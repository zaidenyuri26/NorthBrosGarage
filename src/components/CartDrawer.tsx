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
  ZoomIn,
  Tag,
  FileText,
  User,
  MapPin,
  Edit3,
  ArrowLeft
} from 'lucide-react';
import { CartItem, UserProfile, SiteSettings, PaymentMethodType, Order } from '../types';
import { createOrder, saveUserProfile, checkPaymentReferenceUnique, DEFAULT_SITE_SETTINGS } from '../lib/dbService';
import { getStoredCustomerDetails, saveStoredCustomerDetails } from '../lib/cartStorage';
import { useToast } from '../context/ToastContext';
import { InvoiceModal } from './InvoiceModal';
import { AppLauncherModal } from './AppLauncherModal';

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
  const [step, setStep] = useState<'cart' | 'customer_info' | 'payment' | 'success'>('cart');
  
  // Customer Info State - Initialized from persistent localStorage draft & user profile
  const savedCustomerDraft = getStoredCustomerDetails();

  const [customerName, setCustomerName] = useState(() => savedCustomerDraft.customerName || user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(() => savedCustomerDraft.customerEmail || user?.email || '');
  const [phone, setPhone] = useState(() => savedCustomerDraft.phone || user?.phone || '');
  const [street, setStreet] = useState(() => savedCustomerDraft.street || user?.shippingAddress?.street || '');
  const [city, setCity] = useState(() => savedCustomerDraft.city || user?.shippingAddress?.city || '');
  const [state, setState] = useState(() => savedCustomerDraft.state || user?.shippingAddress?.state || '');
  const [zipCode, setZipCode] = useState(() => savedCustomerDraft.zipCode || user?.shippingAddress?.zipCode || '');
  const [touchedCustomerInfo, setTouchedCustomerInfo] = useState(false);
  
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
  const [codAcknowledged, setCodAcknowledged] = useState(false);

  // Promo Code & Invoice State
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; description: string } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // External App Return Indicator & Mobile Launcher State
  const [externalAppOpened, setExternalAppOpened] = useState(false);
  const [userReturnedFromApp, setUserReturnedFromApp] = useState(false);
  const [appLauncherType, setAppLauncherType] = useState<'gcash' | 'paymaya' | null>(null);

  const [qrMode, setQrMode] = useState<'dynamic' | 'static'>('dynamic');
  const [zoomedQr, setZoomedQr] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Monitor window focus to detect when user returns to site after switching to banking app
  useEffect(() => {
    const handleFocus = () => {
      if (externalAppOpened) {
        setUserReturnedFromApp(true);
        if (!paymentReference.trim()) {
          toast.info(
            'Returned to Checkout',
            'Please paste or enter your GCash / Maya Transaction Reference Code below to complete your order.'
          );
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [externalAppOpened, paymentReference]);

  /**
   * Real Payment Reference Validator
   * Strictly prevents customers from passing dummy/fake/spam numbers without completing real transfer.
   */
  const validateReference = (method: PaymentMethodType, refStr: string): { isValid: boolean; message: string; severity?: 'error' | 'success' | 'warn' } => {
    if (method === 'cod') {
      return { isValid: true, message: 'Cash on delivery selected.', severity: 'success' };
    }

    const clean = refStr.trim().replace(/[\s-]/g, '').toUpperCase();

    if (!clean) {
      return { 
        isValid: false, 
        message: `Transaction Reference Number is required for ${method === 'gcash' ? 'GCash' : method === 'paymaya' ? 'Maya' : 'Bank Transfer'}.`,
        severity: 'error'
      };
    }

    // Ban known spam, dummy, and test strings or common placeholder words
    const bannedDummyPatterns = [
      'TEST', 'DEMO', 'DUMMY', 'FAKE', 'NONE', 'NOTHING', 'NULL', 'NA', 'N/A', 'ASDF', 'QWERTY', 'SAMPLE',
      '12345678', '123456789', '1234567890', '0123456789', '987654321', '9876543210', '123412341234',
      'GCASH123', 'MAYA123', 'REF123', 'PROOFOFPAYMENT', 'RECEIPT123', 'TRANSACTION123'
    ];
    if (bannedDummyPatterns.some(p => clean.includes(p))) {
      return { 
        isValid: false, 
        message: 'Invalid or test reference number detected. Please enter your genuine transaction reference number.',
        severity: 'error'
      };
    }

    // Ban repeated single digits/chars (e.g. 00000000, 11111111) or simple sequential patterns
    if (/^(.)\1+$/.test(clean) || /^(01234|12345|23456|34567|45678|56789|67890)+$/.test(clean)) {
      return { 
        isValid: false, 
        message: 'Repeated or sequential test patterns are prohibited. Enter the actual reference number.',
        severity: 'error'
      };
    }

    if (method === 'gcash') {
      if (clean.length < 8 || clean.length > 24) {
        return { 
          isValid: false, 
          message: `GCash Reference must be 8–24 characters (Entered: ${clean.length}). Check the top of your GCash receipt.`,
          severity: 'error'
        };
      }
      return { isValid: true, message: '✓ Valid GCash transaction reference format.', severity: 'success' };
    }

    if (method === 'paymaya') {
      if (clean.length < 8 || clean.length > 28) {
        return { 
          isValid: false, 
          message: `Maya Reference must be 8–28 characters (Entered: ${clean.length}). Check your Maya confirmation screen.`,
          severity: 'error'
        };
      }
      return { isValid: true, message: '✓ Valid Maya transaction reference format.', severity: 'success' };
    }

    if (method === 'bank_transfer') {
      if (clean.length < 6 || clean.length > 32) {
        return { 
          isValid: false, 
          message: `Bank trace / confirmation number must be 6–32 characters (Entered: ${clean.length}).`,
          severity: 'error'
        };
      }
      return { isValid: true, message: '✓ Valid bank trace confirmation format.', severity: 'success' };
    }

    return { isValid: clean.length >= 6, message: '✓ Reference format accepted.', severity: 'success' };
  };

  const currentPaymentValidation = validateReference(paymentMethod, paymentReference);
  const isPaymentReady = paymentMethod === 'cod' ? codAcknowledged : currentPaymentValidation.isValid;

  /**
   * Pastes reference from device clipboard
   */
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPaymentReference(text.trim());
        toast.success('Pasted Reference', `Pasted: ${text.trim()}`);
      }
    } catch {
      toast.warning('Clipboard Access', 'Please paste your reference number into the field.');
    }
  };

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

  // Auto-save customer checkout details to localStorage on every input change so refresh never clears form fields
  useEffect(() => {
    saveStoredCustomerDetails({
      customerName,
      customerEmail,
      phone,
      street,
      city,
      state,
      zipCode
    });
  }, [customerName, customerEmail, phone, street, city, state, zipCode]);

  useEffect(() => {
    if (user) {
      const draft = getStoredCustomerDetails();
      setCustomerName(prev => (prev.trim() ? prev : (draft.customerName || user.displayName || '')));
      setCustomerEmail(prev => (prev.trim() ? prev : (draft.customerEmail || user.email || '')));
      setPhone(prev => (prev.trim() ? prev : (draft.phone || user.phone || '')));
      if (user.shippingAddress || draft.street) {
        setStreet(prev => (prev.trim() ? prev : (draft.street || user.shippingAddress?.street || '')));
        setCity(prev => (prev.trim() ? prev : (draft.city || user.shippingAddress?.city || '')));
        setState(prev => (prev.trim() ? prev : (draft.state || user.shippingAddress?.state || '')));
        setZipCode(prev => (prev.trim() ? prev : (draft.zipCode || user.shippingAddress?.zipCode || '')));
      }
    }
  }, [user]);

  // Customer Info Validation
  const isNameValid = customerName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;
  const isStreetValid = street.trim().length >= 3;
  const isCityValid = city.trim().length >= 2;
  const isStateValid = state.trim().length >= 2;
  const isZipValid = zipCode.trim().length >= 3;
  const isCustomerInfoValid = isNameValid && isEmailValid && isPhoneValid && isStreetValid && isCityValid && isStateValid && isZipValid;

  const handleProceedToPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTouchedCustomerInfo(true);
    if (!isNameValid) {
      toast.warning('Full Name Required', 'Please enter your full name for delivery.');
      return;
    }
    if (!isEmailValid) {
      toast.warning('Valid Email Required', 'Please enter a valid email address for order notifications.');
      return;
    }
    if (!isPhoneValid) {
      toast.warning('Mobile Number Required', 'Please enter a valid 10-11 digit Philippine mobile number (e.g. 0917 123 4567).');
      return;
    }
    if (!isStreetValid || !isCityValid || !isStateValid || !isZipValid) {
      toast.warning('Incomplete Address', 'Please complete your street, city, province, and ZIP code before proceeding.');
      return;
    }

    // Persist details locally and to Firestore profile
    saveStoredCustomerDetails({
      customerName,
      customerEmail,
      phone,
      street,
      city,
      state,
      zipCode
    });

    if (user) {
      try {
        await saveUserProfile({
          ...user,
          displayName: customerName,
          phone,
          shippingAddress: { street, city, state, zipCode }
        });
      } catch (err) {
        console.error('Failed to sync profile on proceed to payment:', err);
      }
    }

    setStep('payment');
    toast.success('Customer Details Saved', 'Please select your preferred payment method below.');
  };

  // Active payment gateway details based directly on admin siteSettings
  const gcashEnabled = siteSettings?.paymentGcashEnabled ?? true;
  const paymayaEnabled = siteSettings?.paymentPaymayaEnabled ?? true;
  const codEnabled = siteSettings?.paymentCodEnabled ?? true;
  const bankEnabled = siteSettings?.paymentBankEnabled ?? true;

  const gcashName = siteSettings?.paymentGcashName || '';
  const gcashNumber = siteSettings?.paymentGcashNumber || '';
  const gcashQr = siteSettings?.paymentGcashQr || '';
  const gcashPortalUrl = siteSettings?.paymentGcashPortalUrl || '';
  const gcashInstructions = siteSettings?.paymentGcashInstructions || 'Open GCash, scan QR code or send to the account number above, then enter the Reference Number.';

  const paymayaName = siteSettings?.paymentPaymayaName || '';
  const paymayaNumber = siteSettings?.paymentPaymayaNumber || '';
  const paymayaQr = siteSettings?.paymentPaymayaQr || '';
  const paymayaPortalUrl = siteSettings?.paymentPaymayaPortalUrl || '';
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
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const totalAmount = Math.max(0, subtotal + totalShipping - discountAmount);

  const handleApplyPromoCode = () => {
    setPromoError('');
    const clean = promoCode.trim().toUpperCase();
    if (!clean) {
      setPromoError('Please enter a coupon or promo code.');
      return;
    }

    if (clean === 'JDM10') {
      const disc = Math.round(subtotal * 0.10);
      setAppliedDiscount({ code: 'JDM10', amount: disc, description: '10% JDM Tuner Discount' });
      toast.success('Promo Code Applied!', '10% off entire order applied.');
    } else if (clean === 'WELCOME500') {
      if (subtotal < 2000) {
        setPromoError('WELCOME500 requires a minimum cart subtotal of ₱2,000.');
        return;
      }
      setAppliedDiscount({ code: 'WELCOME500', amount: 500, description: '₱500 New Tuner Discount' });
      toast.success('Promo Code Applied!', '₱500 welcome credit applied.');
    } else if (clean === 'NORTHBROS15') {
      const disc = Math.round(subtotal * 0.15);
      setAppliedDiscount({ code: 'NORTHBROS15', amount: disc, description: '15% Garage Club Discount' });
      toast.success('Promo Code Applied!', '15% NorthBros Club discount applied.');
    } else {
      setPromoError('Invalid coupon code. Try JDM10 or WELCOME500.');
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success('Copied to Clipboard', `${fieldName} copied: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenGcashApp = () => {
    setExternalAppOpened(true);
    setUserReturnedFromApp(false);
    const numberToCopy = gcashNumber || '09171234567';
    navigator.clipboard.writeText(`${numberToCopy}`);
    toast.success(
      'GCash Details Copied!',
      `Copied GCash No. (${numberToCopy}) & Amount ₱${totalAmount.toLocaleString()} to clipboard.`
    );

    setAppLauncherType('gcash');
  };

  const handleOpenMayaApp = () => {
    setExternalAppOpened(true);
    setUserReturnedFromApp(false);
    const numberToCopy = paymayaNumber || '09171234567';
    navigator.clipboard.writeText(`${numberToCopy}`);
    toast.success(
      'Maya Details Copied!',
      `Copied Maya No. (${numberToCopy}) & Amount ₱${totalAmount.toLocaleString()} to clipboard.`
    );

    setAppLauncherType('paymaya');
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

    // Require strict valid real payment verification for electronic methods
    if (paymentMethod === 'gcash' || paymentMethod === 'paymaya' || paymentMethod === 'bank_transfer') {
      const validation = validateReference(paymentMethod, paymentReference);
      if (!validation.isValid) {
        toast.error('Payment Verification Required', validation.message);
        return;
      }

      // Check if this reference number has already been submitted for another order
      const cleanRef = paymentReference.trim().replace(/[\s-]/g, '').toUpperCase();
      const refCheck = await checkPaymentReferenceUnique(cleanRef);
      if (!refCheck.isUnique) {
        toast.error(
          'Duplicate Reference Number',
          `Reference #${cleanRef} was already used for order #${refCheck.existingOrder?.id.slice(0, 8).toUpperCase()}. Reusing payment receipts is prohibited.`
        );
        return;
      }
    }

    // Require COD confirmation checkbox if cash on delivery is chosen
    if (paymentMethod === 'cod' && !codAcknowledged) {
      toast.warning('Confirmation Required', 'Please check the box confirming you will pay the rider upon delivery.');
      return;
    }

    setLoading(true);
    try {
      // Always save customer details locally for future checkout speed
      saveStoredCustomerDetails({
        customerName,
        customerEmail,
        phone,
        street,
        city,
        state,
        zipCode
      });

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
        discountAmount,
        discountCode: appliedDiscount?.code,
        shippingAddress: { street, city, state, zipCode },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'pending_verification',
        paymentReference: paymentReference.trim() || undefined,
        paymentReceiptUrl: paymentReceiptUrl || undefined,
      });

      setCompletedOrder(newOrder);
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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full max-w-lg bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-zinc-100 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white italic font-mono uppercase tracking-wide">
                {step === 'cart' 
                  ? 'SHOPPING CART' 
                  : step === 'customer_info' 
                  ? '1. CUSTOMER & DELIVERY INFO' 
                  : step === 'payment' 
                  ? '2. SELECT & COMPLETE PAYMENT' 
                  : 'ORDER CONFIRMED'}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Progress Tracker */}
          {step !== 'success' && (
            <div className="px-5 sm:px-6 pt-4 pb-1">
              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    step === 'cart' ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === 'cart' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-300'
                  }`}>1</span>
                  <span>Cart</span>
                </button>
                <div className="w-5 sm:w-8 h-px bg-zinc-800" />
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'payment') setStep('customer_info');
                  }}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    step === 'customer_info'
                      ? 'text-amber-400'
                      : step === 'payment'
                      ? 'text-emerald-400 hover:text-emerald-300 cursor-pointer'
                      : 'text-zinc-600'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === 'customer_info'
                      ? 'bg-amber-500 text-zinc-950 font-black'
                      : isCustomerInfoValid
                      ? 'bg-emerald-500 text-zinc-950 font-black'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    {isCustomerInfoValid && step === 'payment' ? '✓' : '2'}
                  </span>
                  <span>Customer Details</span>
                </button>
                <div className="w-5 sm:w-8 h-px bg-zinc-800" />
                <div className={`flex items-center gap-1.5 font-bold ${
                  step === 'payment' ? 'text-amber-400' : 'text-zinc-600'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === 'payment' ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-600'
                  }`}>3</span>
                  <span>Payment</span>
                </div>
              </div>
            </div>
          )}

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

            {/* Step 2: Customer Details & Delivery Address */}
            {step === 'customer_info' && (
              <form id="customer-info-form" onSubmit={handleProceedToPayment} className="space-y-5 text-sm">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 flex items-start gap-2.5 text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold font-mono uppercase">Step 1: Fill Customer Details</p>
                    <p className="text-zinc-300 text-[11px]">
                      Please complete all contact and shipping address fields below. Payment (GCash, Maya, COD, etc.) is unlocked right after this step.
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono font-bold text-zinc-300 uppercase text-xs tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. Contact Information</span>
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500">* All fields required</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juan Dela Cruz"
                      value={customerName || ''}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full bg-zinc-950 border rounded-xl p-2.5 text-zinc-100 focus:outline-none ${
                        touchedCustomerInfo && !isNameValid
                          ? 'border-red-500 bg-red-950/10 focus:border-red-400'
                          : isNameValid
                          ? 'border-zinc-800 focus:border-amber-500'
                          : 'border-zinc-800 focus:border-amber-500'
                      }`}
                    />
                    {touchedCustomerInfo && !isNameValid && (
                      <p className="text-[11px] font-mono text-red-400 mt-1">Full name must be at least 2 characters.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Email Address * (For order receipts & tracking)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. juandelacruz@gmail.com"
                      value={customerEmail || ''}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={`w-full bg-zinc-950 border rounded-xl p-2.5 text-zinc-100 focus:outline-none ${
                        touchedCustomerInfo && !isEmailValid
                          ? 'border-red-500 bg-red-950/10 focus:border-red-400'
                          : isEmailValid
                          ? 'border-zinc-800 focus:border-amber-500'
                          : 'border-zinc-800 focus:border-amber-500'
                      }`}
                    />
                    {touchedCustomerInfo && !isEmailValid && (
                      <p className="text-[11px] font-mono text-red-400 mt-1">Please enter a valid email address.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Philippine Mobile Number * (Rider delivery dispatch)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0917 123 4567 or 0998 765 4321"
                      value={phone || ''}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-zinc-950 border rounded-xl p-2.5 text-zinc-100 font-mono focus:outline-none ${
                        touchedCustomerInfo && !isPhoneValid
                          ? 'border-red-500 bg-red-950/10 focus:border-red-400'
                          : isPhoneValid
                          ? 'border-zinc-800 focus:border-amber-500'
                          : 'border-zinc-800 focus:border-amber-500'
                      }`}
                    />
                    {touchedCustomerInfo && !isPhoneValid && (
                      <p className="text-[11px] font-mono text-red-400 mt-1">Please enter a valid 10-11 digit Philippine mobile number.</p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono font-bold text-zinc-300 uppercase text-xs tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>2. Delivery Address</span>
                    </h4>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      House / Unit / Building / Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unit 4B, 123 Katipunan Ave, Brgy. Loyola"
                      value={street || ''}
                      onChange={(e) => setStreet(e.target.value)}
                      className={`w-full bg-zinc-950 border rounded-xl p-2.5 text-zinc-100 focus:outline-none ${
                        touchedCustomerInfo && !isStreetValid
                          ? 'border-red-500 bg-red-950/10 focus:border-red-400'
                          : 'border-zinc-800 focus:border-amber-500'
                      }`}
                    />
                    {touchedCustomerInfo && !isStreetValid && (
                      <p className="text-[11px] font-mono text-red-400 mt-1">Street address is required.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        City / Municipality *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Quezon City"
                        value={city || ''}
                        onChange={(e) => setCity(e.target.value)}
                        className={`w-full bg-zinc-950 border rounded-xl p-2.5 text-zinc-100 focus:outline-none ${
                          touchedCustomerInfo && !isCityValid
                            ? 'border-red-500 bg-red-950/10 focus:border-red-400'
                            : 'border-zinc-800 focus:border-amber-500'
                        }`}
                      />
                      {touchedCustomerInfo && !isCityValid && (
                        <p className="text-[10px] font-mono text-red-400 mt-1">City required.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        Province / State *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Metro Manila / Cavite"
                        value={state || ''}
                        onChange={(e) => setState(e.target.value)}
                        className={`w-full bg-zinc-950 border rounded-xl p-2.5 text-zinc-100 focus:outline-none ${
                          touchedCustomerInfo && !isStateValid
                            ? 'border-red-500 bg-red-950/10 focus:border-red-400'
                            : 'border-zinc-800 focus:border-amber-500'
                        }`}
                      />
                      {touchedCustomerInfo && !isStateValid && (
                        <p className="text-[10px] font-mono text-red-400 mt-1">Province required.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1108"
                      value={zipCode || ''}
                      onChange={(e) => setZipCode(e.target.value)}
                      className={`w-full bg-zinc-950 border rounded-xl p-2.5 text-zinc-100 font-mono focus:outline-none ${
                        touchedCustomerInfo && !isZipValid
                          ? 'border-red-500 bg-red-950/10 focus:border-red-400'
                          : 'border-zinc-800 focus:border-amber-500'
                      }`}
                    />
                    {touchedCustomerInfo && !isZipValid && (
                      <p className="text-[11px] font-mono text-red-400 mt-1">ZIP / Postal code is required.</p>
                    )}
                  </div>
                </div>

                {user && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="save-profile-info"
                      checked={saveProfile}
                      onChange={(e) => setSaveProfile(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded bg-zinc-900 border-zinc-800"
                    />
                    <label htmlFor="save-profile-info" className="text-[12px] font-mono text-zinc-400 cursor-pointer">
                      Save shipping details to my Driver Profile
                    </label>
                  </div>
                )}
              </form>
            )}

            {/* Step 3: Payment & Order Finalization */}
            {step === 'payment' && (
              <form id="payment-form" onSubmit={handleCheckoutSubmit} className="space-y-5 text-sm">
                
                {/* Delivering To Customer Summary Card with Edit Button */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Delivering To:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('customer_info')}
                      className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Details</span>
                    </button>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-white text-sm">{customerName}</span>
                      <span className="font-mono text-zinc-400 text-[11px]">{phone}</span>
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {street}, {city}, {state} {zipCode}
                    </p>
                    <p className="text-zinc-500 text-[11px] font-mono">{customerEmail}</p>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono font-bold text-zinc-300 uppercase text-xs tracking-wider">
                      Select Payment Method
                    </h4>
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
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative overflow-hidden cursor-pointer ${
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
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative overflow-hidden cursor-pointer ${
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
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
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
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
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
                      
                      {/* Official GCash Portal Button (if configured) */}
                      {gcashPortalUrl ? (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => window.open(gcashPortalUrl, '_blank')}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase font-mono flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer ring-2 ring-blue-400"
                          >
                            <ExternalLink className="w-4 h-4 text-white" />
                            <span>Pay via Official GCash Online Checkout (₱{totalAmount.toLocaleString()})</span>
                          </button>
                          <p className="text-[10px] font-mono text-zinc-400 text-center">
                            Opens the official merchant checkout portal in a secure window.
                          </p>
                          <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-zinc-800"></div>
                            <span className="flex-shrink mx-3 text-[10px] font-mono text-zinc-500 uppercase">Or Direct Mobile / QR Transfer</span>
                            <div className="flex-grow border-t border-zinc-800"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-blue-950/40 border border-blue-800/40 p-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-mono font-bold text-blue-300">Direct GCash Transfer / QR Ph</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenGcashApp}
                            className="text-[11px] font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Smartphone className="w-3 h-3" /> Launch App
                          </button>
                        </div>
                      )}

                      {/* QR Code & Account Info */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                        {(() => {
                          const dynamicQr = gcashNumber ? createDynamicQrPhUrl('gcash', gcashNumber, gcashName, totalAmount) : '';
                          const activeQr = dynamicQr || gcashQr;

                          return activeQr ? (
                            <div className="bg-white p-2 rounded-xl shrink-0 shadow relative group">
                              <img src={activeQr} alt="GCash QR Code" className="w-36 h-36 object-contain" />
                              <button
                                type="button"
                                onClick={() => setZoomedQr({ url: activeQr, title: 'GCash / QR Ph Payment', subtitle: `Merchant: ${gcashName || 'NorthBros Garage'}` })}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-xl transition-opacity cursor-pointer"
                              >
                                <ZoomIn className="w-6 h-6" />
                              </button>
                            </div>
                          ) : null;
                        })()}

                        <div className="flex-1 min-w-0 space-y-2 text-xs w-full">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Recipient GCash Number</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-blue-400 text-sm">{gcashNumber || '09171234567'}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(gcashNumber || '09171234567', 'GCash Number')}
                                className="text-zinc-400 hover:text-white p-1"
                                title="Copy Number"
                              >
                                {copiedField === 'GCash Number' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Name</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                              <span className="font-bold text-zinc-200 text-xs truncate">{gcashName || 'NorthBros Garage'}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(gcashName || 'NorthBros Garage', 'Account Name')}
                                className="text-zinc-400 hover:text-white p-1"
                                title="Copy Name"
                              >
                                {copiedField === 'Account Name' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Payable Amount</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-emerald-400 text-sm">₱{totalAmount.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(totalAmount.toString(), 'Payable Amount')}
                                className="text-zinc-400 hover:text-white p-1"
                                title="Copy Amount"
                              >
                                {copiedField === 'Payable Amount' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reference Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-mono font-bold text-zinc-300 uppercase">
                            Transaction Reference No. *
                          </label>
                          <button
                            type="button"
                            onClick={handlePasteClipboard}
                            className="text-[10px] font-mono text-blue-400 hover:text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Paste
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Enter 8-24 digit GCash Reference Number"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className={`w-full bg-zinc-900 border rounded-xl p-2.5 text-white font-mono text-sm tracking-wider focus:outline-none ${
                              !paymentReference.trim()
                                ? 'border-zinc-700 focus:border-blue-400'
                                : currentPaymentValidation.isValid
                                ? 'border-emerald-500 bg-emerald-950/10'
                                : 'border-red-500 bg-red-950/10'
                            }`}
                          />
                          {paymentReference.trim() && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {currentPaymentValidation.isValid ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          )}
                        </div>

                        {paymentReference.trim() && !currentPaymentValidation.isValid && (
                          <p className="text-[11px] font-mono text-red-400">{currentPaymentValidation.message}</p>
                        )}
                      </div>

                      {/* Proof of Payment Screenshot Upload */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase">
                          Payment Screenshot / Receipt (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-dashed border-zinc-700 hover:border-blue-500 rounded-xl cursor-pointer text-xs font-mono text-zinc-300 transition-colors">
                            <ImageIcon className="w-4 h-4 text-blue-400" />
                            <span className="truncate">{receiptFileName || 'Attach Screenshot / Receipt Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                          </label>
                          {paymentReceiptUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentReceiptUrl('');
                                setReceiptFileName('');
                              }}
                              className="p-2 bg-red-950/40 text-red-400 border border-red-800/60 rounded-xl hover:bg-red-900/60 transition-colors"
                              title="Remove Attachment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Maya Payment Box */}
                  {paymentMethod === 'paymaya' && (
                    <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
                      
                      {/* Official Maya Portal Button (if configured) */}
                      {paymayaPortalUrl ? (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => window.open(paymayaPortalUrl, '_blank')}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer ring-2 ring-emerald-400"
                          >
                            <ExternalLink className="w-4 h-4 text-white" />
                            <span>Pay via Official Maya Online Checkout (₱{totalAmount.toLocaleString()})</span>
                          </button>
                          <p className="text-[10px] font-mono text-zinc-400 text-center">
                            Opens the official merchant checkout portal in a secure window.
                          </p>
                          <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-zinc-800"></div>
                            <span className="flex-shrink mx-3 text-[10px] font-mono text-zinc-500 uppercase">Or Direct Mobile / QR Transfer</span>
                            <div className="flex-grow border-t border-zinc-800"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono font-bold text-emerald-300">Direct Maya Transfer / QR Ph</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenMayaApp}
                            className="text-[11px] font-mono font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Smartphone className="w-3 h-3" /> Launch App
                          </button>
                        </div>
                      )}

                      {/* QR Code & Account Info */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                        {(() => {
                          const dynamicQr = paymayaNumber ? createDynamicQrPhUrl('paymaya', paymayaNumber, paymayaName, totalAmount) : '';
                          const activeQr = dynamicQr || paymayaQr;

                          return activeQr ? (
                            <div className="bg-white p-2 rounded-xl shrink-0 shadow relative group">
                              <img src={activeQr} alt="Maya QR Code" className="w-36 h-36 object-contain" />
                              <button
                                type="button"
                                onClick={() => setZoomedQr({ url: activeQr, title: 'Maya / QR Ph Payment', subtitle: `Merchant: ${paymayaName || 'NorthBros Garage'}` })}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-xl transition-opacity cursor-pointer"
                              >
                                <ZoomIn className="w-6 h-6" />
                              </button>
                            </div>
                          ) : null;
                        })()}

                        <div className="flex-1 min-w-0 space-y-2 text-xs w-full">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Recipient Maya Mobile Number</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-emerald-400 text-sm">{paymayaNumber || '09171234567'}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(paymayaNumber || '09171234567', 'Maya Number')}
                                className="text-zinc-400 hover:text-white p-1"
                                title="Copy Number"
                              >
                                {copiedField === 'Maya Number' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Name</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                              <span className="font-bold text-zinc-200 text-xs truncate">{paymayaName || 'NorthBros Garage'}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(paymayaName || 'NorthBros Garage', 'Maya Account Name')}
                                className="text-zinc-400 hover:text-white p-1"
                                title="Copy Name"
                              >
                                {copiedField === 'Maya Account Name' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Payable Amount</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                              <span className="font-mono font-bold text-emerald-400 text-sm">₱{totalAmount.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(totalAmount.toString(), 'Payable Amount')}
                                className="text-zinc-400 hover:text-white p-1"
                                title="Copy Amount"
                              >
                                {copiedField === 'Payable Amount' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reference Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-mono font-bold text-zinc-300 uppercase">
                            Transaction Reference No. *
                          </label>
                          <button
                            type="button"
                            onClick={handlePasteClipboard}
                            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Paste
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Enter Maya Reference Number"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className={`w-full bg-zinc-900 border rounded-xl p-2.5 text-white font-mono text-sm tracking-wider focus:outline-none ${
                              !paymentReference.trim()
                                ? 'border-zinc-700 focus:border-emerald-400'
                                : currentPaymentValidation.isValid
                                ? 'border-emerald-500 bg-emerald-950/10'
                                : 'border-red-500 bg-red-950/10'
                            }`}
                          />
                          {paymentReference.trim() && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {currentPaymentValidation.isValid ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          )}
                        </div>

                        {paymentReference.trim() && !currentPaymentValidation.isValid && (
                          <p className="text-[11px] font-mono text-red-400">{currentPaymentValidation.message}</p>
                        )}
                      </div>

                      {/* Proof of Payment Screenshot Upload */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase">
                          Payment Screenshot / Receipt (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl cursor-pointer text-xs font-mono text-zinc-300 transition-colors">
                            <ImageIcon className="w-4 h-4 text-emerald-400" />
                            <span className="truncate">{receiptFileName || 'Attach Screenshot / Receipt Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                          </label>
                          {paymentReceiptUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentReceiptUrl('');
                                setReceiptFileName('');
                              }}
                              className="p-2 bg-red-950/40 text-red-400 border border-red-800/60 rounded-xl hover:bg-red-900/60 transition-colors"
                              title="Remove Attachment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Box */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-zinc-950 border border-purple-500/40 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-2 text-xs bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Bank Name</span>
                          <span className="font-bold text-white text-sm">{bankName || 'BDO / BPI / UnionBank'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Name</span>
                          <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 mt-0.5">
                            <span className="font-bold text-zinc-200">{bankAccountName || 'NorthBros Garage Inc.'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankAccountName || 'NorthBros Garage Inc.', 'Bank Account Name')}
                              className="text-zinc-400 hover:text-white p-1"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Number</span>
                          <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 mt-0.5">
                            <span className="font-mono font-bold text-purple-300 text-sm">{bankAccountNumber || '0012-3456-7890'}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankAccountNumber || '0012-3456-7890', 'Bank Account Number')}
                              className="text-zinc-400 hover:text-white p-1"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-mono font-bold text-zinc-300 uppercase">
                            Bank Trace / Reference Number *
                          </label>
                          <button
                            type="button"
                            onClick={handlePasteClipboard}
                            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Paste
                          </button>
                        </div>

                        <input
                          type="text"
                          required
                          placeholder="Enter Bank Deposit / InstaPay Reference No."
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          className={`w-full bg-zinc-900 border rounded-xl p-2.5 text-white font-mono text-sm tracking-wider focus:outline-none ${
                            !paymentReference.trim()
                              ? 'border-zinc-700 focus:border-purple-400'
                              : currentPaymentValidation.isValid
                              ? 'border-emerald-500 bg-emerald-950/10'
                              : 'border-red-500 bg-red-950/10'
                          }`}
                        />
                      </div>

                      {/* Proof of Payment Screenshot Upload */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-mono font-bold text-zinc-400 uppercase">
                          Bank Transfer Slip / Receipt (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-dashed border-zinc-700 hover:border-purple-500 rounded-xl cursor-pointer text-xs font-mono text-zinc-300 transition-colors">
                            <ImageIcon className="w-4 h-4 text-purple-400" />
                            <span className="truncate">{receiptFileName || 'Attach Deposit Slip / Transfer Proof'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                          </label>
                          {paymentReceiptUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentReceiptUrl('');
                                setReceiptFileName('');
                              }}
                              className="p-2 bg-red-950/40 text-red-400 border border-red-800/60 rounded-xl hover:bg-red-900/60 transition-colors"
                              title="Remove Attachment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash On Delivery Box with Mandatory Buyer Commitment */}
                  {paymentMethod === 'cod' && (
                    <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-xs">
                        <ShoppingBag className="w-4 h-4" />
                        <span>CASH ON DELIVERY (COD)</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Pay upon delivery directly to our courier rider. Please ensure exact payment of <strong className="text-amber-400 font-mono">₱{totalAmount.toLocaleString()} PHP</strong> is ready when the parcel arrives.
                      </p>

                      <label className="flex items-start gap-2.5 p-2.5 bg-zinc-900/90 border border-amber-500/40 rounded-xl cursor-pointer hover:bg-zinc-900 transition-colors">
                        <input
                          type="checkbox"
                          required
                          checked={codAcknowledged}
                          onChange={(e) => setCodAcknowledged(e.target.checked)}
                          className="w-4 h-4 accent-amber-500 rounded bg-zinc-950 border-zinc-700 mt-0.5 shrink-0"
                        />
                        <span className="text-xs text-zinc-200 font-mono leading-tight select-none">
                          I acknowledge and guarantee that I will pay <strong className="text-amber-400">₱{totalAmount.toLocaleString()} PHP</strong> in cash directly upon courier arrival.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Anti-Fraud Security Notice */}
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All payment reference numbers are automatically matched with merchant banking records prior to dispatch.</span>
                  </div>
                </div>
              </form>
            )}

            {/* Step 4: Success Screen */}
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
              <div className="space-y-2 pb-2 border-b border-zinc-900 mb-2">
                {/* Promo Code Input Box */}
                <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1 text-amber-400 font-bold uppercase">
                      <Tag className="w-3.5 h-3.5" /> Promo / Discount Code
                    </span>
                    <span className="text-[10px] text-zinc-500">Try: JDM10 or WELCOME500</span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. JDM10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-3 py-1 rounded-lg text-xs uppercase font-mono transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-400 font-mono">{promoError}</p>}
                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      <span>✓ {appliedDiscount.description}</span>
                      <button
                        type="button"
                        onClick={() => { setAppliedDiscount(null); setPromoCode(''); }}
                        className="text-zinc-500 hover:text-red-400 underline ml-2 text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 uppercase">Items Subtotal</span>
                  <span className="text-zinc-300">₱{subtotal.toLocaleString()}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                    <span className="uppercase">Coupon ({appliedDiscount.code})</span>
                    <span>- ₱{discountAmount.toLocaleString()}</span>
                  </div>
                )}

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
                  onClick={() => setStep('customer_info')}
                  disabled={cart.length === 0}
                  id="cart-proceed-checkout-btn"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black py-3.5 px-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <span>Proceed to Customer Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 'customer_info' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-base font-mono font-bold pb-1">
                  <span className="text-zinc-400 uppercase text-xs">Total to Pay</span>
                  <span className="text-amber-400 text-lg">₱{totalAmount.toLocaleString()} PHP</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-3 rounded-xl text-xs uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cart</span>
                  </button>

                  <button
                    type="submit"
                    form="customer-info-form"
                    id="proceed-to-payment-btn"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-2">
                {!isPaymentReady && (
                  <div className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {paymentMethod === 'cod'
                        ? 'Please check the Cash on Delivery payment agreement above.'
                        : `Please enter your valid ${paymentMethod === 'gcash' ? 'GCash' : paymentMethod === 'paymaya' ? 'Maya' : 'Bank'} Reference Number.`}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('customer_info')}
                    className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-3 rounded-xl text-xs uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <button
                    type="submit"
                    form="payment-form"
                    disabled={loading || !isPaymentReady}
                    id="confirm-place-order-btn"
                    className={`flex-1 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      !isPaymentReady || loading
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                        : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 cursor-pointer'
                    }`}
                  >
                    {loading ? (
                      <span>Verifying & Placing...</span>
                    ) : !isPaymentReady ? (
                      <span>Complete Payment Info</span>
                    ) : (
                      <span>Place Order (₱{totalAmount.toLocaleString()})</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="space-y-2">
                {completedOrder && (
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/40 font-bold py-3 px-4 rounded-xl text-xs uppercase font-mono tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View / Print Official Receipt</span>
                  </button>
                )}
                <button
                  onClick={() => { setStep('cart'); onClose(); }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Back to Garage Store
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Invoice / Receipt Printable Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        order={completedOrder}
        siteSettings={siteSettings}
      />

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

      {/* Mobile App Launcher Guidance Modal */}
      {appLauncherType && (
        <AppLauncherModal
          isOpen={!!appLauncherType}
          onClose={() => setAppLauncherType(null)}
          appType={appLauncherType}
          accountNumber={appLauncherType === 'gcash' ? (gcashNumber || '09171234567') : (paymayaNumber || '09171234567')}
          accountName={appLauncherType === 'gcash' ? (gcashName || 'NorthBros Garage') : (paymayaName || 'NorthBros Garage')}
          amount={totalAmount}
          portalUrl={appLauncherType === 'gcash' ? gcashPortalUrl : paymayaPortalUrl}
          qrUrl={appLauncherType === 'gcash'
            ? (createDynamicQrPhUrl('gcash', gcashNumber || '09171234567', gcashName, totalAmount) || gcashQr)
            : (createDynamicQrPhUrl('paymaya', paymayaNumber || '09171234567', paymayaName, totalAmount) || paymayaQr)
          }
        />
      )}
    </div>
  );
};
