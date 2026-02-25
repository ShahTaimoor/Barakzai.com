import { useState, useEffect, useCallback } from 'react';

/** Detect if app is currently running as installed PWA (standalone), not in browser tab. */
const getIsStandalone = () => {
  if (typeof window === 'undefined') return false;
  const m = window.matchMedia;
  if (m('(display-mode: standalone)').matches) return true;
  if (m('(display-mode: fullscreen)').matches) return true;
  if (m('(display-mode: minimal-ui)').matches) return true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && ('standalone' in window.navigator) && window.navigator.standalone) return true;
  return false;
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getIsStandalone);

  useEffect(() => {
    const updateInstalled = () => {
      const standalone = getIsStandalone();
      setIsInstalled(standalone);
      if (standalone) {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    };

    updateInstalled();

    const mql = window.matchMedia('(display-mode: standalone)');
    const onDisplayChange = () => {
      updateInstalled();
    };
    mql.addEventListener('change', onDisplayChange);

    const handleBeforeInstallPrompt = (e) => {
      if (getIsStandalone()) return;
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      updateInstalled();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mql.removeEventListener('change', onDisplayChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    setIsInstalled(getIsStandalone());
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    handleInstallClick,
    deferredPrompt
  };
};

