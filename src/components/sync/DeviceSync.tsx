import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOffline } from "@/hooks/useOffline";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Cloud,
  CloudOff,
} from "lucide-react";

interface DeviceInfo {
  id: string;
  name: string;
  type: "mobile" | "desktop" | "tablet";
  lastSeen: string;
  isOnline: boolean;
  syncStatus: "synced" | "pending" | "error";
}

export const DeviceSync = () => {
  const { user } = useAuth();
  const { isOnline, syncOfflineData, getOfflineStats } = useOffline();
  const { showNotification } = useNotifications();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (user) {
      loadDevices();
      startSyncMonitoring();
    }
  }, [user]);

  const loadDevices = async () => {
    // Simulate loading devices from API
    const mockDevices: DeviceInfo[] = [
      {
        id: "current-device",
        name: getCurrentDeviceName(),
        type: getCurrentDeviceType(),
        lastSeen: new Date().toISOString(),
        isOnline: isOnline,
        syncStatus: "synced",
      },
      {
        id: "mobile-device",
        name: "iPhone 15 Pro",
        type: "mobile",
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isOnline: false,
        syncStatus: "pending",
      },
      {
        id: "desktop-device",
        name: "MacBook Pro",
        type: "desktop",
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isOnline: true,
        syncStatus: "synced",
      },
    ];

    setDevices(mockDevices);
  };

  const getCurrentDeviceName = () => {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return "iPhone/iPad";
    } else if (/Android/.test(userAgent)) {
      return "Android Device";
    } else if (/Windows/.test(userAgent)) {
      return "Windows PC";
    } else if (/Mac/.test(userAgent)) {
      return "Mac";
    } else if (/Linux/.test(userAgent)) {
      return "Linux PC";
    }
    return "Unknown Device";
  };

  const getCurrentDeviceType = (): "mobile" | "desktop" | "tablet" => {
    const userAgent = navigator.userAgent;
    if (/iPhone|Android/.test(userAgent)) {
      return "mobile";
    } else if (/iPad/.test(userAgent)) {
      return "tablet";
    }
    return "desktop";
  };

  const startSyncMonitoring = () => {
    // Monitor for sync events
    const interval = setInterval(() => {
      if (isOnline) {
        checkForUpdates();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  };

  const checkForUpdates = async () => {
    try {
      // Simulate checking for updates from other devices
      const hasUpdates = Math.random() > 0.7; // 30% chance of updates

      if (hasUpdates) {
        showNotification("Sincronização Disponível", {
          body: "Novos dados foram sincronizados de outros dispositivos.",
          tag: "device-sync",
        });
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      showNotification("Sincronização Offline", {
        body: "Você está offline. A sincronização será feita quando voltar online.",
        tag: "sync-offline",
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus("syncing");

    try {
      // Simulate sync process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sync offline data
      await syncOfflineData();

      setSyncStatus("success");
      showNotification("Sincronização Concluída", {
        body: "Todos os dados foram sincronizados com sucesso.",
        tag: "sync-success",
      });

      // Update devices
      await loadDevices();
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus("error");
      showNotification("Erro na Sincronização", {
        body: "Ocorreu um erro durante a sincronização. Tente novamente.",
        tag: "sync-error",
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      case "desktop":
        return <Monitor className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSyncStatusText = (status: string) => {
    switch (status) {
      case "synced":
        return "Sincronizado";
      case "pending":
        return "Pendente";
      case "error":
        return "Erro";
      default:
        return "Desconhecido";
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "Agora";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const offlineStats = getOfflineStats();

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Sincronização de Dispositivos
          </CardTitle>
          <CardDescription>
            Gerencie a sincronização entre seus dispositivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
            </div>

            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="glass-button"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Agora
                </>
              )}
            </Button>
          </div>

          {/* Sync Status Indicator */}
          {syncStatus !== "idle" && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10">
              {syncStatus === "syncing" && (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {syncStatus === "success" && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {syncStatus === "error" && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {syncStatus === "syncing" && "Sincronizando dados..."}
                {syncStatus === "success" && "Sincronização concluída!"}
                {syncStatus === "error" && "Erro na sincronização"}
              </span>
            </div>
          )}

          {/* Offline Stats */}
          {offlineStats.totalOfflineSessions > 0 && (
            <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CloudOff className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-200">
                  Dados Offline
                </span>
              </div>
              <div className="text-xs text-yellow-100">
                {offlineStats.totalOfflineSessions} sessões offline aguardando
                sincronização
              </div>
            </div>
          )}

          {/* Devices List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80">
              Dispositivos Conectados
            </h4>
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(device.type)}
                  <div>
                    <div className="text-sm font-medium text-white">
                      {device.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {formatLastSeen(device.lastSeen)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {device.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-gray-500" />
                  )}

                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      device.syncStatus === "synced"
                        ? "bg-green-500/20 text-green-300 border-green-400/30"
                        : device.syncStatus === "pending"
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                        : "bg-red-500/20 text-red-300 border-red-400/30"
                    }`}
                  >
                    {getSyncStatusText(device.syncStatus)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
