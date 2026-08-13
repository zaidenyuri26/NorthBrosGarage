import React, { useState } from 'react';
import { Activity, Wrench, Sliders, Flame, ShieldAlert, CheckCircle2, Clock, Check } from 'lucide-react';
import { ServiceCategory, SiteSettings } from '../types';
import { ServiceDetailModal } from './ServiceDetailModal';

interface ServicesSectionProps {
  services: ServiceCategory[];
  siteSettings?: SiteSettings;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, siteSettings }) => {
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);

  const badge = siteSettings?.servicesBadge || 'PROFESSIONAL WORKSHOP';
  const title = siteSettings?.servicesTitle || 'GARAGE & PERFORMANCE SERVICES';
  const subtitle = siteSettings?.servicesSubtitle || 'Equipped with 2000HP AWD Chassis Dyno, precision TIG welding stations, and master technicians.';

  const getIcon = (name: string) => {
    switch (name) {
      case 'Activity': return <Activity className="w-6 h-6 text-amber-500" />;
      case 'Wrench': return <Wrench className="w-6 h-6 text-amber-500" />;
      case 'Sliders': return <Sliders className="w-6 h-6 text-amber-500" />;
      case 'Flame': return <Flame className="w-6 h-6 text-amber-500" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-amber-500" />;
      default: return <CheckCircle2 className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <section id="services-section" className="py-16 bg-transparent border-t border-zinc-900 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-500 font-mono text-sm uppercase tracking-widest mb-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>{badge}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white italic font-mono uppercase">
              {title}
            </h2>
            <p className="text-zinc-400 text-base mt-2 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center my-4 font-mono text-sm">
            <Wrench className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold text-white uppercase">No Garage Services Listed Yet</h3>
            <p className="text-zinc-400 mt-1 max-w-md mx-auto">
              Real workshop services are fetched directly from Firestore. Admins can manage services via the Admin Portal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer active:scale-[0.98]"
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative h-32 sm:h-48 overflow-hidden bg-zinc-950">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800'}
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 p-1.5 sm:p-2.5 bg-zinc-950/90 border border-amber-500/40 rounded-xl backdrop-blur-md">
                      {getIcon(service.iconName)}
                    </div>

                    {/* Starting Price Tag */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-amber-500 text-zinc-950 font-mono font-black text-[11px] sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                      From ${service.priceStartingFrom}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-6 space-y-2 sm:space-y-4 text-left">
                    <div>
                      <h3 className="text-sm sm:text-xl font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-[12px] sm:text-sm text-zinc-400 mt-1 line-clamp-2 leading-tight sm:leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Estimated Time */}
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-sm font-mono text-zinc-400 bg-zinc-950/60 p-1.5 sm:p-2 rounded-lg border border-zinc-800/80">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
                      <span className="line-clamp-1">Est: {service.estimatedTime}</span>
                    </div>

                    {/* Included Features */}
                    <div className="space-y-1 pt-1 hidden sm:block">
                      {service.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Badge */}
                <div className="p-3 sm:p-6 pt-0">
                  <div className="w-full bg-zinc-950 border border-zinc-800 py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[10px] sm:text-sm font-mono font-bold text-amber-500 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>WORKSHOP SPEC</span>
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
