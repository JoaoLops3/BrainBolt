import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useOffline } from "@/hooks/useOffline";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const ConnectivityStatus = () => {
  const { isOnline, getOfflineStats } = useOffline();
  const { showOfflineNotification, showOnlineNotification } =
    useNotifications();
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline) {
        setIsReconnecting(true);
        showOnlineNotification();

        setTimeout(() => {
          setIsReconnecting(false);
          setWasOffline(false);
        }, 2000);
      }
    };

    const handleOffline = () => {
      setWasOffline(true);
      showOfflineNotification();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline, showOfflineNotification, showOnlineNotification]);

  const offlineStats = getOfflineStats();

  if (isOnline && !isReconnecting) {
    return (
      <Badge
        variant="secondary"
        className="bg-green-500/20 text-green-300 border-green-400/30 animate-fade-in"
      >
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }

  if (isReconnecting) {
    return (
      <Badge
        variant="secondary"
        className="bg-blue-500/20 text-blue-300 border-blue-400/30 animate-pulse"
      >
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Reconectando...
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className="bg-red-500/20 text-red-300 border-red-400/30 animate-pulse"
      >
        <WifiOff className="h-3 w-3 mr-1" />
        Offline
      </Badge>

      {offlineStats.totalOfflineSessions > 0 && (
        <Badge
          variant="secondary"
          className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
        >
          <CloudOff className="h-3 w-3 mr-1" />
          {offlineStats.totalOfflineSessions}
        </Badge>
      )}
    </div>
  );
};
