import React from 'react';
import { X, Wrench, Clock, Check, Activity, Sliders, Flame, ShieldAlert, CheckCircle2, MessageSquare, Tag, PhoneCall } from 'lucide-react';
import { ServiceCategory } from '../types';

interface ServiceDetailModalProps {
  service: ServiceCategory | null;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
}) => {
  if (!service) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Activity': return <Activity className="w-8 h-8 text-[#e5a823]" />;
      case 'Wrench': return <Wrench className="w-8 h-8 text-[#e5a823]" />;
      case 'Sliders': return <Sliders className="w-8 h-8 text-[#e5a823]" />;
      case 'Flame': return <Flame className="w-8 h-8 text-[#e5a823]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-8 h-8 text-[#e5a823]" />;
      default: return <CheckCircle2 className="w-8 h-8 text-[#e5a823]" />;
    }
  };

  const formatPrice = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val;
    if (isNaN(num)) return val;
    return num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border-2 border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 bg-zinc-950/90 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-800"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          
          {/* Left: Image & Identity */}
          <div className="relative w-full md:w-[42%] h-64 md:h-auto min-h-[380px] bg-zinc-950">
            <img
              src={service.image || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800'}
              alt={service.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
            
            {/* Identity Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-5 bg-zinc-950/95 border border-zinc-800 rounded-2xl backdrop-blur-xl space-y-2.5">
              <div className="inline-flex p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                {getIcon(service.iconName)}
              </div>
              <div>
                <h3 className="text-[10px] font-mono font-bold text-[#e5a823] uppercase tracking-[0.2em] mb-0.5">Workshop Division</h3>
                <h2 className="text-2xl font-black text-white italic font-sans uppercase tracking-tight leading-tight">
                  {service.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Right: Detailed Content & High-Visibility Pricing */}
          <div className="flex-1 p-6 md:p-10 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar text-left">
            
            {/* PROMINENT PRICING HERO BANNER */}
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-5 rounded-2xl border-2 border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#e5a823] uppercase tracking-wider">
                  <Tag className="w-4 h-4" />
                  <span>Workshop Service Pricing</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-mono font-black text-white">
                    ₱{formatPrice(service.priceStartingFrom)}
                  </span>
                  <span className="text-sm font-mono text-zinc-400 font-bold">PHP (Base Rate)</span>
                </div>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-xl text-left shrink-0">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#e5a823]" /> Turnaround Time
                </span>
                <span className="text-sm font-mono font-bold text-zinc-200">{service.estimatedTime}</span>
              </div>
            </div>

            {/* Service Briefing */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Service Overview</span>
              <p className="text-base text-zinc-300 leading-relaxed font-normal">
                {service.description}
              </p>
            </div>

            {/* Detailed Features List */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                Technical Features & Deliverables Included
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {service.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60 group hover:border-amber-500/30 transition-all">
                    <div className="w-6 h-6 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Check className="w-3.5 h-3.5 text-[#e5a823]" />
                    </div>
                    <span className="text-zinc-200 text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Disclaimer */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-amber-500/20 flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-[#e5a823] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider">Dyno & Fitment Guarantee</h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  All tuning and mechanical builds include diagnostic data logs, dyno power graphs, and expert inspection before track release.
                </p>
              </div>
            </div>

            {/* Final CTA Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-[#e5a823] hover:bg-amber-400 text-zinc-950 font-black py-3.5 px-6 rounded-xl text-xs font-mono uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
              >
                <Wrench className="w-4 h-4" /> Book This Service Now
              </button>
              <button
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-800 font-bold py-3.5 px-6 rounded-xl text-xs font-mono uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all"
                onClick={() => {
                   window.location.href = `mailto:northbros.garage@example.com?subject=Inquiry about ${service.title}`;
                }}
              >
                <MessageSquare className="w-4 h-4 text-[#e5a823]" /> Inquire Custom Scope
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
