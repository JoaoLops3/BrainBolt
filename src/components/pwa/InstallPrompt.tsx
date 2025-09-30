import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Smartphone,
  Monitor,
  X,
  CheckCircle,
  ExternalLink,
  Wifi,
  WifiOff,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installSource, setInstallSource] = useState<"browser" | "store">(
    "browser"
  );

  useEffect(() => {
    // Check if app is already installed
    checkInstallStatus();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const checkInstallStatus = () => {
    // Check if running in standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if app is installed (PWA)
    const isInstalledPWA =
      localStorage.getItem("brainbolt-installed") === "true";
    setIsInstalled(isInstalledPWA || isStandaloneMode);

    // Determine install source based on user agent
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      setInstallSource("store");
    } else if (/Android/.test(userAgent)) {
      setInstallSource("browser");
    } else {
      setInstallSource("browser");
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        localStorage.setItem("brainbolt-installed", "true");
      } else {
        console.log("User dismissed the install prompt");
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (installSource === "store") {
      // Redirect to app store
      const userAgent = navigator.userAgent;
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        window.open("https://apps.apple.com/app/brainbolt", "_blank");
      } else if (/Android/.test(userAgent)) {
        window.open(
          "https://play.google.com/store/apps/details?id=com.joaolops3.brainbolt",
          "_blank"
        );
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem("brainbolt-install-dismissed", "true");
  };

  // Don't show if already installed or dismissed
  if (isInstalled || isStandalone || !showPrompt) {
    return null;
  }

  // Check if user dismissed in this session
  if (sessionStorage.getItem("brainbolt-install-dismissed") === "true") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={handleInstallClick} className="shadow-lg">
        {installSource === "browser" ? (
          <>
            <Download className="h-4 w-4 mr-2" />
            Instalar App
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4 mr-2" />
            Baixar na App Store
          </>
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        className="ml-2"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
