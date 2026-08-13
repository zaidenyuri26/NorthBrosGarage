import React from 'react';
import { X, Wrench, Clock, Check, Activity, Sliders, Flame, ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';
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
      case 'Activity': return <Activity className="w-8 h-8 text-amber-500" />;
      case 'Wrench': return <Wrench className="w-8 h-8 text-amber-500" />;
      case 'Sliders': return <Sliders className="w-8 h-8 text-amber-500" />;
      case 'Flame': return <Flame className="w-8 h-8 text-amber-500" />;
      case 'ShieldAlert': return <ShieldAlert className="w-8 h-8 text-amber-500" />;
      default: return <CheckCircle2 className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-800"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          
          {/* Left: Image & Identity */}
          <div className="relative w-full md:w-[45%] h-64 md:h-auto min-h-[400px] bg-zinc-950">
            <img
              src={service.image || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800'}
              alt={service.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
            
            {/* Identity Badge */}
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-zinc-950/90 border border-zinc-800 rounded-2xl backdrop-blur-xl space-y-3">
              <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                {getIcon(service.iconName)}
              </div>
              <div>
                <h3 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-[0.2em] mb-1">Workshop Division</h3>
                <h2 className="text-2xl font-black text-white italic font-mono uppercase tracking-tighter leading-none">
                  {service.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Right: Detailed Content */}
          <div className="flex-1 p-8 md:p-12 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
            
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Service Briefing</span>
                <p className="text-lg text-zinc-300 leading-relaxed font-medium">
                  {service.description}
                </p>
              </div>

              {/* Specs & Estimates Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Lead Time
                  </span>
                  <p className="text-lg font-mono font-black text-white">{service.estimatedTime}</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5 text-amber-500" /> Start Base
                  </span>
                  <p className="text-lg font-mono font-black text-amber-400">${service.priceStartingFrom}</p>
                </div>
              </div>

              {/* Detailed Features List */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Technical Features & Deliverables</h4>
                <div className="grid grid-cols-1 gap-3">
                  {service.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/50 group hover:border-amber-500/30 transition-all">
                      <div className="w-6 h-6 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <span className="text-zinc-200 text-sm font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Disclaimer */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-amber-500/10 flex items-start gap-4">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider">Expert Compliance</h5>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                    All performance modifications are carried out by master technicians. Final pricing may vary based on vehicle condition and specific fitment requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Final CTA Buttons */}
            <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all shadow-[0_8px_25px_-5px_rgba(245,158,11,0.3)] active:scale-[0.98]"
              >
                <Wrench className="w-4 h-4" /> Schedule Consultation
              </button>
              <button
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-800 font-bold py-4 px-6 rounded-2xl text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all"
                onClick={() => {
                   window.location.href = `mailto:northbros.garage@example.com?subject=Inquiry about ${service.title}`;
                }}
              >
                <MessageSquare className="w-4 h-4 text-amber-500" /> Technical Inquiry
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
