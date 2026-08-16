import React from 'react';
import { Smartphone, ExternalLink, QrCode, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  appType: 'gcash' | 'paymaya';
  accountNumber: string;
  accountName: string;
  amount: number;
  qrUrl?: string;
  portalUrl?: string;
  onCopied?: () => void;
}

export const AppLauncherModal: React.FC<AppLauncherModalProps> = ({
  isOpen,
  onClose,
  appType,
  accountNumber,
  accountName,
  amount,
  qrUrl,
  portalUrl,
}) => {
  if (!isOpen) return null;

  const isGcash = appType === 'gcash';
  const appName = isGcash ? 'GCash' : 'Maya';
  const themeBorder = isGcash ? 'border-blue-500/40' : 'border-emerald-500/40';

  // Check if likely desktop browser
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Deep links & Intent URIs
  const iosScheme = isGcash ? 'gcash://' : 'paymaya://';
  const androidIntent = isGcash
    ? 'intent://#Intent;package=com.globe.gcash.android;scheme=gcash;end'
    : 'intent://#Intent;package=com.paymaya;scheme=paymaya;end';

  const handleCopyDetails = () => {
    navigator.clipboard.writeText(`${accountNumber}`);
  };

  const handleTriggerDeepLink = (scheme: string) => {
    handleCopyDetails();
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = scheme;
      } else {
        window.location.href = scheme;
      }
    } catch {
      window.location.href = scheme;
    }
  };

  return (
    <div className="fixed inset-0 z-[160] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border bg-zinc-950 ${themeBorder} text-white animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${isGcash ? 'bg-blue-600 border-blue-500' : 'bg-emerald-600 border-emerald-500'} text-white`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-xs italic shadow">
              {isGcash ? 'G' : 'M'}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none font-mono uppercase tracking-wider">
                Official {appName} Transfer
              </h3>
              <p className="text-[10px] text-white/80 font-mono">Direct Real-Time Transfer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status Alert */}
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-start gap-3">
            <div className={`p-2 rounded-xl ${isGcash ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono space-y-1">
              <p className="font-bold text-white">Send payment via {appName}</p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Send the exact payment of ₱{amount.toLocaleString()} to the merchant account details below.
              </p>
            </div>
          </div>

          {/* Copied Details Box */}
          <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 uppercase">Verified Merchant Account</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <div className="flex items-center justify-between font-bold bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 text-[10px] block">RECIPIENT {appName.toUpperCase()} NO.</span>
                <span className="text-amber-400 text-sm font-mono">{accountNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 text-[10px] block">PAYABLE AMOUNT</span>
                <span className="text-emerald-400 text-sm font-mono">₱{amount.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 text-center">Account Name: <strong className="text-white">{accountName}</strong></p>
          </div>

          {/* Action Launcher Buttons */}
          <div className="space-y-2 pt-1">
            {/* Optional Official Online Payment Link if set */}
            {portalUrl && (
              <button
                type="button"
                onClick={() => {
                  window.open(portalUrl, '_blank');
                  onClose();
                }}
                className={`w-full py-3.5 px-4 rounded-xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all ${
                  isGcash
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 ring-2 ring-blue-400'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400'
                }`}
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Open Official Online Payment Link</span>
              </button>
            )}

            {/* Mobile App Deep Link Button */}
            <button
              type="button"
              onClick={() => handleTriggerDeepLink(iosScheme)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 py-3 px-3 rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Launch {appName} App ({iosScheme})</span>
            </button>

            {/* Android Intent Link */}
            <button
              type="button"
              onClick={() => handleTriggerDeepLink(androidIntent)}
              className="w-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 py-2.5 px-3 rounded-xl text-[11px] font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Android Intent Deep Link</span>
            </button>
          </div>

          {!isMobileDevice && (
            <div className="p-3 bg-zinc-900/90 border border-amber-500/30 rounded-xl text-left space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-mono font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Desktop / Web Browser Notice</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                App deep links (<code className="text-amber-300">gcash://</code>) open the app directly on mobile smartphones. If you are on desktop, open the GCash app on your mobile phone and scan the QR code below.
              </p>
            </div>
          )}

          {/* QR Code Display section if available */}
          {qrUrl && (
            <div className="pt-2 border-t border-zinc-800 text-center space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-amber-400" /> Or Scan QR Code with {appName} Scanner
              </span>
              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg max-w-[180px] mx-auto border-2 border-amber-400/50">
                <img src={qrUrl} alt={`${appName} QR Code`} className="w-36 h-36 object-contain" />
              </div>
            </div>
          )}

          {/* Return Guidance Notice */}
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center space-y-1">
            <p className="text-[11px] font-mono text-amber-300 font-bold">
              ⚠️ Return here after sending payment
            </p>
            <p className="text-[10px] font-mono text-zinc-400">
              Copy the real 10-13 digit Transaction Reference Number from your {appName} receipt and paste it in the checkout drawer to complete your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
