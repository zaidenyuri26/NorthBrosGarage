import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Car, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  ChevronRight, 
  RefreshCw, 
  Radio, 
  AlertCircle, 
  Package, 
  Wrench, 
  Calendar, 
  Phone, 
  Copy, 
  ExternalLink,
  Zap,
  Navigation,
  Sparkles,
  Search
} from 'lucide-react';
import { Order, ServiceBooking, UserProfile, OrderStatus, BookingStatus } from '../types';
import { subscribeCustomerOrders, fetchCustomerOrders, subscribeUserBookings } from '../lib/dbService';
import { useToast } from '../context/ToastContext';

interface OrderTrackerProps {
  user: UserProfile;
  initialOrderId?: string | null;
  onSelectOrderAgain?: (productId: string) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  user,
  initialOrderId,
  onSelectOrderAgain
}) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<'parts' | 'services'>('parts');
  const [activeItemId, setActiveItemId] = useState<string | null>(initialOrderId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set up real-time Firestore listeners for customer orders & bookings
  useEffect(() => {
    setLoading(true);

    // 1. Initial load & Real-time Orders Listener (merges user UID, email, and local device orders)
    fetchCustomerOrders(user).then((initOrders) => {
      if (initOrders && initOrders.length > 0) {
        setOrders(initOrders);
      }
      setLoading(false);
    });

    const unsubOrders = subscribeCustomerOrders(
      user,
      (liveOrders) => {
        setOrders(liveOrders);
        setLastUpdated(new Date());
        setLoading(false);
      },
      (err) => {
        console.error('Orders tracking stream error:', err);
        setLoading(false);
      }
    );

    // 2. Real-time Service Bookings Listener
    let unsubBookings = () => {};
    if (user?.uid) {
      unsubBookings = subscribeUserBookings(
        user.uid,
        (liveBookings) => {
          setBookings(liveBookings);
          setLastUpdated(new Date());
        },
        (err) => {
          console.error('Bookings tracking stream error:', err);
        }
      );
    }

    return () => {
      unsubOrders();
      unsubBookings();
    };
  }, [user?.uid, user?.email]);

  // Set initial selected item if orders populate
  useEffect(() => {
    if (!activeItemId) {
      if (selectedType === 'parts' && orders.length > 0) {
        setActiveItemId(orders[0].id);
      } else if (selectedType === 'services' && bookings.length > 0) {
        setActiveItemId(bookings[0].id);
      }
    }
  }, [orders, bookings, selectedType, activeItemId]);

  const activeOrder = orders.find(o => o.id === activeItemId);
  const activeBooking = bookings.find(b => b.id === activeItemId);

  // Manual refresh pulse
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Live Sync', 'Order stream refreshed from Firestore.');
    }, 600);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied', `${label} copied to clipboard.`);
  };

  // Filter lists based on search
  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      (o.paymentReference && o.paymentReference.toLowerCase().includes(q)) ||
      o.items?.some(i => i.productName.toLowerCase().includes(q)) ||
      o.status.toLowerCase().includes(q)
    );
  });

  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.id.toLowerCase().includes(q) ||
      b.serviceName?.toLowerCase().includes(q) ||
      b.vehicleModel?.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q)
    );
  });

  // Calculate Order progress step (0 to 4)
  const getOrderStep = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'preparing': return 2;
      case 'ready_to_ship': return 3;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  // Calculate Service progress step (0 to 4)
  const getBookingStep = (status: BookingStatus): number => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'in_progress': return 2;
      case 'completed': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const orderStages = [
    { title: 'Order Placed', desc: 'Received & Queued' },
    { title: 'Payment Verified', desc: 'Finance Cleared' },
    { title: 'Parts Packaging', desc: 'Picked & Boxed' },
    { title: 'Dispatched / Transit', desc: 'On The Road' },
    { title: 'Delivered', desc: 'Arrived at Destination' },
  ];

  const serviceStages = [
    { title: 'Booking Queued', desc: 'Slot Request Logged' },
    { title: 'Bay Reserved', desc: 'Mechanic Assigned' },
    { title: 'Vehicle Ingested', desc: 'Diagnostic & Intake' },
    { title: 'Build In Progress', desc: 'Tuning / Installation' },
    { title: 'Work Completed', desc: 'Ready for Pickup' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Live Stream Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute opacity-75" />
            <span className="w-3 h-3 bg-emerald-500 rounded-full relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black font-mono uppercase text-white tracking-wide">
                Real-Time Telemetry & Tracking
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE FIRESTORE
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-500">
              Synced with user UID: <code className="text-zinc-400">{user.uid.slice(0, 10)}...</code> • Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-amber-400 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 px-3 py-1.5 rounded-xl transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Ping Stream'}</span>
        </button>
      </div>

      {/* Segment Switcher & Quick Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              setSelectedType('parts');
              if (orders.length > 0) setActiveItemId(orders[0].id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
              selectedType === 'parts'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Part Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('services');
              if (bookings.length > 0) setActiveItemId(bookings[0].id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all ${
              selectedType === 'services'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service Bays ({bookings.length})</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={selectedType === 'parts' ? 'Filter by order ID, ref, or part...' : 'Filter by service or car...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 font-mono focus:border-amber-500 focus:outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Main Dual-Column Tracking Grid */}
      {selectedType === 'parts' ? (
        orders.length === 0 ? (
          <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-zinc-700 mx-auto" />
            <h4 className="font-mono font-bold text-zinc-300 uppercase text-sm">No Active Orders Found</h4>
            <p className="font-mono text-xs text-zinc-500 max-w-md mx-auto">
              Any performance parts purchased with your registered account will automatically stream here with live GPS & packing updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Order Selector List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-zinc-400 flex justify-between items-center px-1">
                <span>Select Order to Track</span>
                <span className="text-[10px] text-zinc-500">{filteredOrders.length} records</span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredOrders.map((o) => {
                  const isSelected = activeItemId === o.id;
                  const step = getOrderStep(o.status);

                  return (
                    <div
                      key={o.id}
                      onClick={() => setActiveItemId(o.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 relative overflow-hidden ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-500/80 shadow-lg shadow-amber-500/5'
                          : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-white">
                            #{o.id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            o.status === 'shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            ['accepted', 'preparing', 'ready_to_ship'].includes(o.status) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {o.status === 'pending' ? 'Pending Review' :
                             o.status === 'accepted' ? 'Accepted' :
                             o.status === 'preparing' ? 'Packaging' :
                             o.status === 'ready_to_ship' ? 'Ready for Dispatch' :
                             o.status === 'shipped' ? 'In Transit' :
                             o.status === 'delivered' ? 'Delivered' : o.status}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          ₱{o.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-zinc-400 truncate">
                        {o.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                        <span>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Recent'}</span>
                        <span className="text-zinc-400 uppercase">
                          {o.paymentMethod === 'gcash' ? 'GCash' :
                           o.paymentMethod === 'paymaya' ? 'Maya' :
                           o.paymentMethod === 'bank_transfer' ? 'Bank' : 'COD'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Real-Time Tracking Telemetry Card */}
            <div className="lg:col-span-7">
              {activeOrder ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6">
                  {/* Active Order Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 uppercase">ORDER ID:</span>
                        <span className="text-base font-black font-mono text-white">
                          #{activeOrder.id.toUpperCase()}
                        </span>
                        <button
                          onClick={() => copyToClipboard(activeOrder.id, 'Order ID')}
                          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition"
                          title="Copy Order ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-mono text-zinc-400 mt-1">
                        Placed on {activeOrder.createdAt ? new Date(activeOrder.createdAt).toLocaleString() : 'Recent'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Amount</span>
                      <span className="text-xl font-black font-mono text-amber-400">
                        ₱{activeOrder.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Stage Progress Visualizer */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-amber-400" /> Live Delivery Milestones
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {activeOrder.status === 'delivered' ? '✓ Complete' : '⚡ Live Updates Active'}
                      </span>
                    </div>

                    {/* Stepper Dots & Line */}
                    <div className="relative pt-2 pb-1">
                      {/* Background Bar */}
                      <div className="absolute top-6 left-6 right-6 h-1 bg-zinc-800 -translate-y-1/2 z-0" />
                      {/* Active Progress Bar */}
                      <div
                        className="absolute top-6 left-6 h-1 bg-gradient-to-r from-amber-500 to-emerald-400 -translate-y-1/2 z-0 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(0, (getOrderStep(activeOrder.status) / (orderStages.length - 1)) * 100))}%`
                        }}
                      />

                      <div className="relative z-10 flex justify-between">
                        {orderStages.map((stage, idx) => {
                          const currentStep = getOrderStep(activeOrder.status);
                          const isDone = currentStep > idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={idx} className="flex flex-col items-center text-center max-w-[70px]">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                  : isCurrent
                                  ? 'bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20 scale-110'
                                  : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
                              }`}>
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span className={`text-[10px] font-mono font-bold mt-2 leading-tight ${
                                isCurrent ? 'text-amber-400' : isDone ? 'text-zinc-200' : 'text-zinc-600'
                              }`}>
                                {stage.title}
                              </span>
                              <span className="text-[8px] font-mono text-zinc-500 hidden sm:block">
                                {stage.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dispatch & Telemetry Status Card */}
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Truck className="w-4 h-4 text-amber-400" />
                        <span className="font-bold uppercase">Logistics Status:</span>
                      </div>
                      <span className="text-zinc-400">
                        {activeOrder.status === 'delivered' ? 'Delivered to Garage' :
                         activeOrder.status === 'shipped' ? 'Dispatch Courier En Route' :
                         activeOrder.status === 'preparing' ? 'Packing JDM Parts' :
                         'Awaiting Dispatch Schedule'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Origin Hub</span>
                        <span className="text-zinc-200 font-bold">NorthBros Speed Workshop, Pasig</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Destination Address</span>
                        <span className="text-zinc-200 truncate block">
                          {activeOrder.shippingAddress?.street ? 
                            `${activeOrder.shippingAddress.street}, ${activeOrder.shippingAddress.city || ''}` : 
                            'Customer Shipping Coordinates'}
                        </span>
                      </div>
                    </div>

                    {/* Payment Verification Status */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-zinc-400">Payment Channel:</span>
                        <span className="text-white font-bold uppercase">
                          {activeOrder.paymentMethod === 'gcash' ? 'GCash' :
                           activeOrder.paymentMethod === 'paymaya' ? 'Maya' :
                           activeOrder.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash On Delivery'}
                        </span>
                      </div>

                      {activeOrder.paymentReference && (
                        <div className="text-[11px] text-zinc-400">
                          Ref: <code className="text-amber-400 font-bold">{activeOrder.paymentReference}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Included in this Shipment */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold uppercase text-zinc-400">
                      Package Contents ({activeOrder.items?.length || 0} items)
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activeOrder.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs font-mono"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-10 h-10 object-cover rounded-lg border border-zinc-800 shrink-0"
                              />
                            )}
                            <div>
                              <div className="font-bold text-zinc-200">{item.productName}</div>
                              <div className="text-[10px] text-zinc-500">
                                {item.brand} • Qty: <span className="text-amber-400 font-bold">{item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-zinc-200">
                              ₱{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 font-mono text-xs">
                  Select an order from the list on the left to inspect real-time delivery telemetry.
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* SERVICE BOOKING TRACKER TAB */
        bookings.length === 0 ? (
          <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
            <Wrench className="w-12 h-12 text-zinc-700 mx-auto" />
            <h4 className="font-mono font-bold text-zinc-300 uppercase text-sm">No Active Workshop Bookings</h4>
            <p className="font-mono text-xs text-zinc-500 max-w-md mx-auto">
              When you reserve an ECU Tuning slot, Turbo install, or Dyno run, your service bay progress will stream here live.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Bookings list */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-zinc-400 flex justify-between items-center px-1">
                <span>Select Workshop Bay</span>
                <span className="text-[10px] text-zinc-500">{filteredBookings.length} records</span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredBookings.map((b) => {
                  const isSelected = activeItemId === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => setActiveItemId(b.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 relative overflow-hidden ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-500/80 shadow-lg shadow-amber-500/5'
                          : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                      )}

                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-white">
                          {b.serviceName || 'Garage Workshop Service'}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          b.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          b.status === 'confirmed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {b.status === 'pending' ? 'Pending Bay' :
                           b.status === 'confirmed' ? 'Bay Reserved' :
                           b.status === 'in_progress' ? 'On Dyno / Bay' :
                           b.status === 'completed' ? 'Completed' : b.status}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-amber-500" />
                        <span>{b.vehicleYear} {b.vehicleMake} {b.vehicleModel}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                        <span>Scheduled: {b.preferredDate} ({b.preferredTime})</span>
                        <span className="text-zinc-400">Bay #2 (Speed Lab)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Service Tracker Card */}
            <div className="lg:col-span-7">
              {activeBooking ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6">
                  {/* Service Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 uppercase">SERVICE BAY ID:</span>
                        <span className="text-base font-black font-mono text-white">
                          #{activeBooking.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-black font-mono text-amber-400 uppercase mt-1">
                        {activeBooking.serviceName}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Preferred Slot</span>
                      <span className="text-xs font-bold font-mono text-zinc-200">
                        {activeBooking.preferredDate} • {activeBooking.preferredTime}
                      </span>
                    </div>
                  </div>

                  {/* Service Milestones Stepper */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-amber-400" /> Garage Bay Milestones
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        {activeBooking.status === 'completed' ? '✓ Ready for Pickup' : '⚡ Dyno Bay Monitoring'}
                      </span>
                    </div>

                    <div className="relative pt-2 pb-1">
                      <div className="absolute top-6 left-6 right-6 h-1 bg-zinc-800 -translate-y-1/2 z-0" />
                      <div
                        className="absolute top-6 left-6 h-1 bg-gradient-to-r from-amber-500 to-emerald-400 -translate-y-1/2 z-0 transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(0, (getBookingStep(activeBooking.status) / (serviceStages.length - 1)) * 100))}%`
                        }}
                      />

                      <div className="relative z-10 flex justify-between">
                        {serviceStages.map((stage, idx) => {
                          const currentStep = getBookingStep(activeBooking.status);
                          const isDone = currentStep > idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={idx} className="flex flex-col items-center text-center max-w-[70px]">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                  : isCurrent
                                  ? 'bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20 scale-110'
                                  : 'bg-zinc-900 border border-zinc-700 text-zinc-500'
                              }`}>
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span className={`text-[10px] font-mono font-bold mt-2 leading-tight ${
                                isCurrent ? 'text-amber-400' : isDone ? 'text-zinc-200' : 'text-zinc-600'
                              }`}>
                                {stage.title}
                              </span>
                              <span className="text-[8px] font-mono text-zinc-500 hidden sm:block">
                                {stage.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Spec & Work Notes */}
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Vehicle Build</span>
                        <span className="text-zinc-200 font-bold flex items-center gap-1.5 mt-0.5">
                          <Car className="w-3.5 h-3.5 text-amber-500" />
                          {activeBooking.vehicleYear} {activeBooking.vehicleMake} {activeBooking.vehicleModel}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Assigned Workshop Bay</span>
                        <span className="text-emerald-400 font-bold mt-0.5 block">
                          Main Dyno Hub & Calibration Bay 1
                        </span>
                      </div>
                    </div>

                    {activeBooking.notes && (
                      <div className="pt-2 border-t border-zinc-800 text-xs font-mono">
                        <span className="text-zinc-500 text-[10px] uppercase block">Customer Build Notes:</span>
                        <p className="text-zinc-300 italic mt-0.5 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                          "{activeBooking.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 font-mono text-xs">
                  Select a workshop service booking from the left to view bay telemetry.
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
