import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Car, Shield, X, MapPin, Phone, CheckCircle2, History, Settings, ExternalLink, Plus } from 'lucide-react';
import { UserProfile, Order, Product } from '../types';
import { fetchOrders, saveUserProfile } from '../lib/dbService';

interface CustomerDashboardProps {
  onClose: () => void;
  user: UserProfile;
  onAddToCart?: (product: Product) => void;
  products?: Product[];
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onClose,
  user,
  onAddToCart,
  products = []
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'garage' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  // Profile state
  const [phone, setPhone] = useState(user.phone || '');
  const [street, setStreet] = useState(user.shippingAddress?.street || '');
  const [city, setCity] = useState(user.shippingAddress?.city || '');
  const [state, setState] = useState(user.shippingAddress?.state || '');
  const [zipCode, setZipCode] = useState(user.shippingAddress?.zipCode || '');
  const [displayName, setDisplayName] = useState(user.displayName || '');

  // Garage Profile state
  const [make, setMake] = useState(user.vehicleInfo?.make || '');
  const [model, setModel] = useState(user.vehicleInfo?.model || '');
  const [year, setYear] = useState(user.vehicleInfo?.year || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user.uid]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const oData = await fetchOrders(user.uid);
      setOrders(oData);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAgain = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && onAddToCart) {
      onAddToCart(product);
      setReorderSuccess(productId);
      setTimeout(() => setReorderSuccess(null), 2000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      displayName,
      phone,
      shippingAddress: { street, city, state, zipCode }
    };
    await saveUserProfile(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveVehicleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      vehicleInfo: { make, model, year }
    };
    await saveUserProfile(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/95 backdrop-blur-xl p-4 sm:p-6 flex items-center justify-center">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-[24px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden my-8 text-zinc-100 flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar / Driver Card Section */}
        <div className="w-full md:w-80 bg-zinc-950 border-r border-zinc-800 p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] rotate-3">
                <User className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black font-mono uppercase italic leading-none tracking-tighter">
                  {user.displayName || 'Unnamed Driver'}
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Verified Driver
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-3 text-zinc-400">
                <History className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Order Count</span>
                  <span className="text-sm font-bold text-zinc-200">{orders.length} Completed Builds</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <Car className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Active Vehicle</span>
                  <span className="text-sm font-bold text-zinc-200">
                    {user.vehicleInfo?.make ? `${user.vehicleInfo.year} ${user.vehicleInfo.make}` : 'No Vehicle Assigned'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-zinc-400">
                <MapPin className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Home Port</span>
                  <span className="text-sm font-bold text-zinc-200 truncate max-w-[180px]">
                    {user.shippingAddress?.city || 'Location Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8">
            <button onClick={onClose} className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-mono text-xs uppercase tracking-widest transition-all hover:bg-zinc-800 flex items-center justify-center gap-2">
              <X className="w-4 h-4" /> Exit Portal
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 md:p-10 bg-zinc-900 relative">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 font-mono text-sm font-bold border-b border-zinc-800 pb-4 mb-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 transition-all relative py-2 ${
                activeTab === 'orders' ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>LOGBOOK</span>
              {activeTab === 'orders' && <div className="absolute bottom-[-17px] left-0 right-0 h-1 bg-amber-500 rounded-t-full shadow-[0_-4px_10px_rgba(245,158,11,0.5)]" />}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 transition-all relative py-2 ${
                activeTab === 'profile' ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>DRIVER CONFIG</span>
              {activeTab === 'profile' && <div className="absolute bottom-[-17px] left-0 right-0 h-1 bg-amber-500 rounded-t-full shadow-[0_-4px_10px_rgba(245,158,11,0.5)]" />}
            </button>

            <button
              onClick={() => setActiveTab('garage')}
              className={`flex items-center gap-2 transition-all relative py-2 ${
                activeTab === 'garage' ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>GARAGE SPEC</span>
              {activeTab === 'garage' && <div className="absolute bottom-[-17px] left-0 right-0 h-1 bg-amber-500 rounded-t-full shadow-[0_-4px_10px_rgba(245,158,11,0.5)]" />}
            </button>
          </div>

          <div className="max-h-[calc(100vh-350px)] overflow-y-auto no-scrollbar pr-2">
            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-700">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-zinc-300 font-bold uppercase font-mono">No Orders Logged</h4>
                      <p className="text-zinc-500 text-sm max-w-xs">Your purchase history will appear here once you acquire some performance parts.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {orders.map((o) => (
                      <div key={o.id} className="bg-zinc-950/50 border border-zinc-800 rounded-[20px] overflow-hidden">
                        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-amber-500">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-white text-sm">ORDER #{o.id.slice(-6).toUpperCase()}</span>
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                  {o.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">{o.createdAt ? new Date(o.createdAt).toDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Value</span>
                            <span className="text-lg font-black text-white font-mono tracking-tighter">₱{o.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Order Items & Status Bar */}
                        <div className="p-5 space-y-6">
                          <div className="space-y-2">
                            {o.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/30">
                                <span className="text-zinc-200">
                                  <span className="text-amber-500 mr-2">[{item.quantity}x]</span> {item.productName}
                                </span>
                                <div className="flex items-center gap-4">
                                  <span>₱{(item.price * item.quantity).toLocaleString()}</span>
                                  <button 
                                    onClick={() => handleOrderAgain(item.productId)}
                                    className={`p-1.5 rounded-md border transition-all ${
                                      reorderSuccess === item.productId 
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-amber-500 hover:border-amber-500'
                                    }`}
                                    title="Add to cart again"
                                  >
                                    {reorderSuccess === item.productId ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-mono uppercase text-zinc-500 tracking-widest">
                              <span>Order Processed</span>
                              <span>Ready</span>
                              <span>Shipped</span>
                              <span>Delivered</span>
                            </div>
                            <div className="relative h-1 bg-zinc-800 rounded-full">
                              <div 
                                className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                style={{ 
                                  width: o.status === 'pending' ? '10%' :
                                         o.status === 'accepted' ? '25%' :
                                         o.status === 'preparing' ? '45%' :
                                         o.status === 'ready_to_ship' ? '65%' :
                                         o.status === 'shipped' ? '85%' :
                                         o.status === 'delivered' ? '100%' : '0%'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SHIPPING & PROFILE */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1">
                  <h3 className="font-mono font-bold text-amber-500 uppercase text-lg tracking-tighter">Identity & Logistics</h3>
                  <p className="text-zinc-500 text-xs">Update your global driver profile and primary shipping coordinates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Phone Contact</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="+63 9xx xxxx xxx"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="123 Racing Lane"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Speed City"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Province</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="Metro Manila"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Zip Code</label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-xl uppercase font-mono tracking-widest transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
                >
                  {savedSuccess ? 'CONFIG UPDATED' : 'SAVE DRIVER DATA'}
                </button>
              </form>
            )}

            {/* TAB 3: GARAGE PROFILE */}
            {activeTab === 'garage' && (
              <form onSubmit={handleSaveVehicleProfile} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-xl">
                <div className="space-y-1">
                  <h3 className="font-mono font-bold text-amber-500 uppercase text-lg tracking-tighter">Vehicle Spec Sheet</h3>
                  <p className="text-zinc-500 text-xs">Configure your primary vehicle to enable faster part fitment verification.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Model Year</label>
                    <input
                      type="text"
                      value={year || ''}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="e.g. 2022"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Make / Brand</label>
                    <input
                      type="text"
                      value={make || ''}
                      onChange={(e) => setMake(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="Nissan / Toyota / Honda"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Vehicle Model</label>
                    <input
                      type="text"
                      value={model || ''}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                      placeholder="GT-R R35 / Supra A90 / Civic Type R"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-xl uppercase font-mono tracking-widest transition-all"
                >
                  {savedSuccess ? 'SPEC SHEET SAVED' : 'UPDATE GARAGE DATA'}
                </button>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase">Fitment Note</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Your saved vehicle specs are automatically used by the NorthBros fitment engine to verify compatibility when browsing the catalog.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

