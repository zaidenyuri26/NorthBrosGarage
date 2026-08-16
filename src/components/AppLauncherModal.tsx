import React, { useState } from 'react';
import { Smartphone, ExternalLink, QrCode, CheckCircle2, X, AlertCircle, Copy, Check, ArrowUpRight, Download, Sparkles } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState<'all' | 'number' | 'amount' | null>(null);
  const [launchNotice, setLaunchNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isGcash = appType === 'gcash';
  const appName = isGcash ? 'GCash' : 'Maya';
  const themeBorder = isGcash ? 'border-blue-500/50' : 'border-emerald-500/50';

  // Deep links, Intent URIs & Store Fallbacks
  const customScheme = isGcash ? 'gcash://' : 'paymaya://';
  const playStoreUrl = isGcash
    ? 'https://play.google.com/store/apps/details?id=com.globe.gcash.android'
    : 'https://play.google.com/store/apps/details?id=com.paymaya';
  const appStoreUrl = isGcash
    ? 'https://apps.apple.com/ph/app/gcash/id520358122'
    : 'https://apps.apple.com/ph/app/maya-credit-wallet-bank/id991705982';

  const androidIntent = isGcash
    ? `intent://#Intent;package=com.globe.gcash.android;scheme=gcash;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`
    : `intent://#Intent;package=com.paymaya;scheme=paymaya;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`;

  const handleCopy = (text: string, type: 'all' | 'number' | 'amount') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedType(type);
    setTimeout(() => {
      setCopied(false);
      setCopiedType(null);
    }, 2500);
  };

  // Launch scheme directly on current window without window.open(_blank)
  // to avoid opening an empty white tab
  const handleDirectLaunch = (e: React.MouseEvent, url: string, label: string) => {
    e.preventDefault();
    // Copy account number automatically so user can paste in app
    handleCopy(accountNumber, 'number');
    setLaunchNotice(`Opening ${appName}... Number copied to clipboard!`);

    try {
      window.location.href = url;
    } catch (err) {
      console.warn('Direct launch failed:', err);
    }

    setTimeout(() => {
      setLaunchNotice(`If ${appName} didn't launch automatically, use the Play Store / App Store options or scan the QR code below.`);
    }, 3000);
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
              <p className="text-[10px] text-white/80 font-mono">Direct Mobile App & QR Ph Payment</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status Alert */}
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isGcash ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono space-y-1">
              <p className="font-bold text-white">Send payment via {appName}</p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Send exactly <strong className="text-emerald-400">₱{amount.toLocaleString()}</strong> to the verified merchant below, then copy your receipt's Reference No.
              </p>
            </div>
          </div>

          {/* Account Details Box with 1-Click Copy */}
          <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 uppercase">Verified Merchant Account</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>

            <div className="flex items-center justify-between font-bold bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 text-[10px] block">RECIPIENT {appName.toUpperCase()} NO.</span>
                <span className="text-amber-400 text-sm font-mono tracking-wider">{accountNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(accountNumber, 'number')}
                className="flex items-center gap-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                {copied && copiedType === 'number' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy No.</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[11px]">
              <div>
                <span className="text-zinc-500 text-[10px] block">PAYABLE EXACT AMOUNT</span>
                <span className="text-emerald-400 text-sm font-mono font-bold">₱{amount.toLocaleString()}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(amount.toString(), 'amount')}
                className="flex items-center gap-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                {copied && copiedType === 'amount' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Amount</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-zinc-400">
                Account Name: <strong className="text-white">{accountName}</strong>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(`Recipient: ${accountNumber} | Amount: ₱${amount.toLocaleString()} | Name: ${accountName}`, 'all')}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied && copiedType === 'all' ? 'Copied All!' : 'Copy All Details'}</span>
              </button>
            </div>
          </div>

          {/* Dynamic Launch Feedback Notice */}
          {launchNotice && (
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-[11px] font-mono text-blue-200 animate-in fade-in duration-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{launchNotice}</span>
            </div>
          )}

          {/* Action Launcher Buttons */}
          <div className="space-y-2 pt-1">
            {/* Optional Official Online Payment Portal if configured */}
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={`w-full py-3 px-4 rounded-xl font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all ${
                  isGcash
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 ring-2 ring-blue-400'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400'
                }`}
              >
                <ExternalLink className="w-4 h-4 text-white" />
                <span>Open Official Online Checkout Portal</span>
              </a>
            )}

            {/* Primary Direct Mobile App Launch Button */}
            <button
              type="button"
              onClick={(e) => handleDirectLaunch(e, customScheme, 'App')}
              className={`w-full py-3.5 px-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isGcash
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 active:scale-98'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-98'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch {appName} App directly</span>
              <ArrowUpRight className="w-4 h-4 text-amber-300" />
            </button>

            {/* App Store / Android Intent Options Grid */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={(e) => handleDirectLaunch(e, androidIntent, 'Android Intent')}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 py-2.5 px-2 rounded-xl text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
                title="Launch via Android Intent Protocol"
              >
                <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                <span>Android App</span>
              </button>

              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 py-2.5 px-2 rounded-xl text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
                title="Open Google Play Store"
              >
                <Download className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Play Store</span>
              </a>

              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 py-2.5 px-2 rounded-xl text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all text-center cursor-pointer"
                title="Open Apple App Store"
              >
                <Download className="w-3 h-3 text-sky-400 shrink-0" />
                <span>App Store</span>
              </a>
            </div>
          </div>

          {/* QR Code Display section if available */}
          {qrUrl && (
            <div className="pt-3 border-t border-zinc-800 text-center space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-amber-400" /> Scan QR Ph Code with {appName} Scanner
              </span>
              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg max-w-[180px] mx-auto border-2 border-amber-400/50">
                <img src={qrUrl} alt={`${appName} QR Code`} className="w-36 h-36 object-contain" />
              </div>
            </div>
          )}

          {/* Return Guidance Notice */}
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center space-y-1">
            <p className="text-[11px] font-mono text-amber-300 font-bold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Step 2: Enter Transaction Reference No.</span>
            </p>
            <p className="text-[10px] font-mono text-zinc-400 leading-normal">
              After sending the payment in your {appName} app, copy the 10-13 digit Reference Number from your receipt/SMS and paste it into checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


