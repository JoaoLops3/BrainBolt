import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  isSyncing?: boolean;
  lastActivity?: Date | null;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
  showDetails?: boolean;
}

export const ConnectionStatus = ({
  isConnected,
  isSyncing = false,
  lastActivity,
  reconnectAttempts = 0,
  maxReconnectAttempts = 3,
  showDetails = false,
}: ConnectionStatusProps) => {
  const getStatusText = () => {
    if (isSyncing) return "Sincronizando...";
    if (isConnected) return "Conectado";
    
    if (reconnectAttempts >= maxReconnectAttempts) {
      return "Desconectado";
    }
    
    return `Reconectando (${reconnectAttempts}/${maxReconnectAttempts})`;
  };

  const getStatusIcon = () => {
    if (isSyncing) return "🔄";
    if (isConnected) return "🟢";
    return "🔴";
  };

  const getTimeAgo = () => {
    if (!lastActivity) return "";
    
    const now = Date.now();
    const diff = Math.floor((now - lastActivity.getTime()) / 1000);
    
    if (diff < 60) return `há ${diff}s`;
    if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
    return `há ${Math.floor(diff / 3600)}h`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all",
      isConnected 
        ? "bg-green-500/10 text-green-400 border border-green-500/20"
        : isSyncing
        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
        : "bg-red-500/10 text-red-400 border border-red-500/20"
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full transition-all",
        isConnected 
          ? "bg-green-400"
          : isSyncing 
          ? "bg-blue-400 animate-ping"
          : "bg-red-400"
      )} />
      
      <span>{getStatusIcon()} {getStatusText()}</span>
      
      {showDetails && lastActivity && (
        <span className="opacity-60">
          • {getTimeAgo()}
        </span>
      )}
    </div>
  );
};
