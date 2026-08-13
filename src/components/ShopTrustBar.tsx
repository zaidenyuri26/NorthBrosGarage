import React from 'react';
import { Plane, ShieldCheck, Activity, Truck } from 'lucide-react';

export const ShopTrustBar: React.FC = () => {
  const highlights = [
    {
      icon: <Plane className="w-6 h-6 text-amber-500" />,
      title: 'OSAKA & TOKYO AIR FREIGHT',
      subtitle: 'Direct daily air shipments from Japanese manufacturer headquarters',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      title: '100% GENUINE HOLOGRAM',
      subtitle: 'Guaranteed 100% authentic JDM parts with verified serial seals',
    },
    {
      icon: <Activity className="w-6 h-6 text-amber-500" />,
      title: '2000 HP CHASSIS DYNO',
      subtitle: 'In-house AWD Dynojet calibration by certified master mechanics',
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-500" />,
      title: 'INSURED GLOBAL EXPRESS',
      subtitle: 'Fast worldwide door-to-door insured shipping with real-time tracking',
    },
  ];

  return (
    <div className="bg-transparent border-y border-zinc-800/80 py-6 sm:py-8 px-4 relative z-20 text-left">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {highlights.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 group text-left"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:scale-110 transition-transform shrink-0">
              {item.icon}
            </div>
            <div className="text-left">
              <h4 className="font-mono font-bold text-[12px] sm:text-sm uppercase text-white tracking-wider group-hover:text-amber-500 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] sm:text-[12px] text-zinc-400 mt-0.5 sm:mt-1 leading-snug">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
