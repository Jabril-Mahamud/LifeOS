"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone, Zap, Wifi, Home } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      
      // Show install prompt after a delay
      setTimeout(() => {
        if (!isInstalled && !isStandalone && !sessionStorage.getItem('pwa-install-dismissed')) {
          setIsVisible(true);
        }
      }, 5000);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
      }
      
      setDeferredPrompt(null);
      handleDismiss();
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, dismissed in this session, or no install prompt available
  if (isInstalled || isStandalone || !isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleDismiss}
      />
      
      {/* Install Prompt */}
      <Card className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 shadow-xl border animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Install LifeOS</CardTitle>
                <p className="text-sm text-muted-foreground">Get the app experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Install LifeOS for quick access to your habits, journal, and insights. 
            Works offline and loads instantly.
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium">Works Offline</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium">Faster Loading</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <Home className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium">Home Screen</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
              <Smartphone className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium">Native Feel</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Not Now
          </Button>
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}