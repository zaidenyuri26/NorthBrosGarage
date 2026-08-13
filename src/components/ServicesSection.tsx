import React, { useState, useMemo } from 'react';
import { Activity, Wrench, Sliders, Flame, ShieldAlert, CheckCircle2, Clock, Check, ArrowRight, Tag, Sparkles, PhoneCall } from 'lucide-react';
import { ServiceCategory, SiteSettings } from '../types';
import { ServiceDetailModal } from './ServiceDetailModal';

interface ServicesSectionProps {
  services: ServiceCategory[];
  siteSettings?: SiteSettings;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, siteSettings }) => {
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const badge = siteSettings?.servicesBadge || 'OFFICIAL WORKSHOP & PERFORMANCE BAY';
  const title = siteSettings?.servicesTitle || 'GARAGE & PERFORMANCE SERVICES';
  const subtitle = siteSettings?.servicesSubtitle || 'Equipped with 2000HP AWD Chassis Dyno, precision TIG welding stations, engine blueprinting cleanroom, and master JDM technicians.';

  const renderSplitTitle = (text: string) => {
    const words = text.trim().split(' ');
    if (words.length <= 1) {
      return <span className="brand-line1-text">{text}</span>;
    }
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    return (
      <>
        <span className="brand-line1-text">{line1}</span>{' '}
        <span className="brand-line2-text">{line2}</span>
      </>
    );
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Activity': return <Activity className="w-6 h-6 text-[#e5a823]" />;
      case 'Wrench': return <Wrench className="w-6 h-6 text-[#e5a823]" />;
      case 'Sliders': return <Sliders className="w-6 h-6 text-[#e5a823]" />;
      case 'Flame': return <Flame className="w-6 h-6 text-[#e5a823]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-[#e5a823]" />;
      default: return <CheckCircle2 className="w-6 h-6 text-[#e5a823]" />;
    }
  };

  const formatPrice = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val;
    if (isNaN(num)) return val;
    return num.toLocaleString();
  };

  const filteredServices = useMemo(() => {
    if (activeFilter === 'all') return services;
    return services.filter(s => 
      s.title.toLowerCase().includes(activeFilter.toLowerCase()) || 
      s.description.toLowerCase().includes(activeFilter.toLowerCase())
    );
  }, [services, activeFilter]);

  return (
    <section id="services-section" className="py-20 bg-zinc-950/80 border-t border-zinc-900 text-left relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Highlights */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#e5a823] font-mono text-xs uppercase tracking-widest mb-3 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#e5a823] animate-ping" />
              <span>{badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black italic font-sans uppercase tracking-tight">
              {renderSplitTitle(title)}
            </h2>
            <p className="text-zinc-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {/* Pricing Guarantee Callout */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-lg shadow-amber-500/5">
            <div className="p-3 bg-[#e5a823]/15 text-[#e5a823] rounded-xl">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-zinc-400 font-bold tracking-wider">Transparent Rates</div>
              <div className="text-lg sm:text-xl font-mono font-black text-white">All Prices in ₱ PHP</div>
              <div className="text-xs text-zinc-400">Guaranteed fixed labor packages</div>
            </div>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {[
            { id: 'all', label: 'All Garage Services' },
            { id: 'dyno', label: 'Dyno Tuning & Remap' },
            { id: 'engine', label: 'Engine & Turbo Builds' },
            { id: 'maintenance', label: 'Periodic Maintenance (PMS)' },
            { id: 'suspension', label: 'Chassis, Brakes & Track' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-[#e5a823] text-zinc-950 shadow-md shadow-[#e5a823]/20'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center my-4 font-mono text-sm">
            <Wrench className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold text-white uppercase">No Services Found</h3>
            <p className="text-zinc-400 mt-1 max-w-md mx-auto">
              No services match the selected category filter. Try viewing All Garage Services or configure in Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="bg-zinc-900/90 border-2 border-zinc-800 hover:border-[#e5a823] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer active:scale-[0.99] relative"
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative h-44 sm:h-52 overflow-hidden bg-zinc-950">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800'}
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-zinc-950/40" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-3 left-3 p-2.5 bg-zinc-950/90 border border-[#e5a823]/40 rounded-xl backdrop-blur-md shadow-lg">
                      {getIcon(service.iconName)}
                    </div>

                    {/* SUPER VISIBLE PRICE BADGE (Top Right Banner) */}
                    <div className="absolute top-3 right-3 flex flex-col items-end">
                      <div className="bg-gradient-to-r from-amber-500 to-[#e5a823] text-zinc-950 font-mono font-black text-sm sm:text-base px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1 border border-amber-300">
                        <span className="text-[10px] uppercase font-sans font-extrabold tracking-tight opacity-90">STARTS</span>
                        <span className="text-base sm:text-lg font-mono font-black">₱{formatPrice(service.priceStartingFrom)}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-zinc-950/90 px-2 py-0.5 rounded-md mt-1 backdrop-blur-sm border border-zinc-800">
                        BASE RATE
                      </span>
                    </div>

                    {/* Estimated Time Overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-zinc-800 backdrop-blur-md">
                      <Clock className="w-3.5 h-3.5 text-[#e5a823]" />
                      <span>{service.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 sm:p-6 space-y-4 text-left">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#e5a823] transition-colors line-clamp-1 font-sans">
                        {service.title}
                      </h3>
                      <p className="text-sm text-zinc-200 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {service.description}
                      </p>
                    </div>

                    {/* Included Key Deliverables */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                      <div className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider">Service Inclusions:</div>
                      {service.features?.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                          <Check className="w-3.5 h-3.5 text-[#e5a823] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Large Pricing Banner & Action CTA */}
                <div className="p-5 pt-0">
                  <div className="w-full bg-zinc-950 border border-zinc-800 group-hover:border-[#e5a823]/50 p-3 rounded-xl flex items-center justify-between transition-colors">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Estimated Cost</span>
                      <span className="text-lg font-mono font-black text-[#e5a823]">
                        ₱{formatPrice(service.priceStartingFrom)} <span className="text-xs text-zinc-400 font-normal">PHP</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-[#e5a823] text-zinc-950 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold group-hover:bg-amber-400 transition-colors">
                      <span>View Service</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </section>
  );
};
