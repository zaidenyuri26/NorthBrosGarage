import React from 'react';
import { MapPin, Phone, Mail, Clock, Shield, Instagram, Youtube, Facebook, Twitter } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { SiteSettings } from '../types';

interface FooterProps {
  onOpenAuth: () => void;
  onSelectCategory: (cat: string) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth, onSelectCategory, siteSettings }) => {
  const brandName = siteSettings?.brandName || 'NORTHBROS GARAGE';
  const brandSubtitle = siteSettings?.brandSubtitle || 'PERFORMANCE & TUNING';
  const about = siteSettings?.footerAbout || 'NorthBros Garage is your trusted JDM performance & tuning specialist, providing high-performance parts, custom engine builds, and chassis tuning.';
  const phone = siteSettings?.contactPhone || '(555) 019-2834';
  const email = siteSettings?.contactEmail || 'contact@northbrosgarage.com';
  const address = siteSettings?.contactAddress || '742 Race Track Way, Speed City, CA 90210';
  const hours = siteSettings?.operatingHours || 'Mon - Fri: 8:00 AM - 7:00 PM | Sat: 9:00 AM - 5:00 PM';
  const copyright = siteSettings?.copyrightText || `© ${new Date().getFullYear()} NorthBros Garage. All rights reserved.`;

  return (
    <footer className="bg-transparent border-t border-zinc-900 text-zinc-300 text-sm text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <BrandHeader size="sm" brandName={brandName} brandSubtitle={brandSubtitle} />
            <p className="text-zinc-300 leading-relaxed mt-2 text-left font-normal">
              {about}
            </p>
            <div className="flex items-center gap-2 text-[#e5a823] font-mono font-bold pt-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-zinc-200">{hours}</span>
            </div>
            
            {/* Dynamic Social Links */}
            <div className="flex items-center gap-4 pt-2">
              {siteSettings?.socialInstagram && (
                <a href={siteSettings.socialInstagram} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-amber-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {siteSettings?.socialYoutube && (
                <a href={siteSettings.socialYoutube} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-amber-500 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {siteSettings?.socialFacebook && (
                <a href={siteSettings.socialFacebook} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-amber-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {siteSettings?.socialTwitter && (
                <a href={siteSettings.socialTwitter} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-amber-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-mono font-bold uppercase text-white tracking-widest text-base">Performance Categories</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectCategory('Exhaust & Turbo')} className="text-zinc-300 hover:text-amber-400 transition-colors text-left font-medium">
                  Exhaust Systems & Turbochargers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Suspension & Brakes')} className="text-zinc-300 hover:text-amber-400 transition-colors text-left font-medium">
                  Coilovers & Monoblock Caliper Brakes
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Interior & Seats')} className="text-zinc-300 hover:text-amber-400 transition-colors text-left font-medium">
                  BRIDE Seats & TAKATA Harnesses
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Wheels & Tires')} className="text-zinc-300 hover:text-amber-400 transition-colors text-left font-medium">
                  RAYS Volk Racing TE37 Forged Wheels
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-3 text-left">
            <h4 className="font-mono font-bold uppercase text-white tracking-widest text-base">Garage Services</h4>
            <ul className="space-y-2 text-left text-zinc-300 font-medium">
              <li>AWD / RWD Chassis Dyno Tuning</li>
              <li>Forged Race Engine Blueprint Assembly</li>
              <li>Track Day Corner Balance & Laser Alignment</li>
              <li>Hand TIG Titanium Exhaust Fabrication</li>
            </ul>
          </div>

          {/* Col 4: Location & Portal */}
          <div className="space-y-3 text-left">
            <h4 className="font-mono font-bold uppercase text-white tracking-widest text-base">Garage Workshop HQ</h4>
            <div className="space-y-2 text-zinc-300 text-left font-medium">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-zinc-200">{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-zinc-200">{phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-zinc-200">{email}</span>
              </p>
            </div>

            <div className="pt-2 text-left">
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 font-mono text-[12px] border-b border-zinc-700 pb-0.5 font-bold"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Account & Portal Sign In</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Firestore notice */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[12px] text-zinc-400 gap-4">
          <p className="text-zinc-300 font-medium">{copyright}</p>
          <p className="font-mono text-zinc-400 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Backend: Firebase Firestore Database</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
