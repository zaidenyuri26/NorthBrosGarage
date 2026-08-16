import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle, Sparkles, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    if (isRunningStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // Check if user dismissed banner recently
    const dismissed = sessionStorage.getItem('northbros_pwa_dismissed');
    if (dismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show discrete banner after 3 seconds
    if (isAppleMobile && !isRunningStandalone && !dismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    const handleAppInstalled = () => {
      setShowBanner(false);
      setInstalledSuccessfully(true);
      setTimeout(() => setInstalledSuccessfully(false), 4000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
        setInstalledSuccessfully(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('northbros_pwa_dismissed', 'true');
  };

  if (isStandalone) return null;

  if (installedSuccessfully) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-full font-mono text-xs font-bold flex items-center gap-2 shadow-2xl shadow-emerald-500/40 animate-toast-in">
        <CheckCircle className="w-4 h-4" />
        <span>NorthBros Garage App Installed Successfully!</span>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-zinc-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl shadow-black/80 animate-toast-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              NorthBros Mobile App
            </span>
            <span className="text-[9px] bg-amber-500 text-zinc-950 font-black px-1 rounded uppercase font-mono">
              PWA
            </span>
          </div>

          <p className="text-xs text-zinc-300 mt-0.5 leading-snug">
            {isIOS
              ? 'Install for fullscreen JDM garage browsing and fast order tracking.'
              : 'Add to your Android home screen for 1-tap launch and instant order alerts.'}
          </p>

          {isIOS ? (
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
              <span>Tap</span> <Share2 className="w-3 h-3 text-amber-400" /> <span>then</span>
              <strong className="text-zinc-200 font-bold">"Add to Home Screen"</strong>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-black text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-amber-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
              <button
                onClick={handleDismiss}
                className="text-zinc-400 hover:text-zinc-200 text-xs font-mono px-2 py-1.5"
              >
                Maybe Later
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-300 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
