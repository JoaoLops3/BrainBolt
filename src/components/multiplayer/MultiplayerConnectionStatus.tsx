import { useState, useEffect } from "react";
import { Wifi, WifiOff, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MultiplayerConnectionStatusProps {
  isConnected: boolean;
  roomCode?: string;
  playersCount: number;
  ping?: number;
}

export const MultiplayerConnectionStatus = ({
  isConnected,
  roomCode,
  playersCount,
  ping
}: MultiplayerConnectionStatusProps) => {
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'medium' | 'poor'>('good');

  useEffect(() => {
    if (ping !== undefined) {
      if (ping < 100) setConnectionQuality('good');
      else if (ping < 300) setConnectionQuality('medium');
      else setConnectionQuality('poor');
    }
  }, [ping]);

  const getConnectionColor = () => {
    if (!isConnected) return 'text-red-500';
    switch (connectionQuality) {
      case 'good': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  return (
    <Card className="fixed top-4 right-4 z-50 px-3 py-2 bg-white/90 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className={`h-4 w-4 ${getConnectionColor()}`} />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className={getConnectionColor()}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {roomCode && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-mono font-bold">{roomCode}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{playersCount}/2</span>
        </div>

        {ping !== undefined && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{ping}ms</span>
          </div>
        )}
      </div>
    </Card>
  );
};