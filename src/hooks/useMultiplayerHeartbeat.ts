import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeartbeatOptions {
  interval?: number;
  timeout?: number;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

export const useMultiplayerHeartbeat = (
  roomId: string,
  options: HeartbeatOptions = {}
) => {
  const {
    interval = 10000, // 10 seconds
    timeout = 30000, // 30 seconds
    onDisconnect,
    onReconnect,
  } = options;

  const [isConnected, setIsConnected] = useState(true);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;

  // Update last activity timestamp
  const updateActivity = useCallback(async () => {
    if (!roomId) return;

    try {
      const { error } = await supabase
        .from("multiplayer_rooms")
        .update({ last_activity: new Date().toISOString() })
        .eq("id", roomId);

      if (error) {
        console.error("Heartbeat update failed:", error);
        throw error;
      }

      setLastActivity(new Date());
      
      if (!isConnected && reconnectAttempts > 0) {
        setIsConnected(true);
        setReconnectAttempts(0);
        onReconnect?.();
      }
    } catch (error) {
      console.error("Heartbeat failed:", error);
      
      if (isConnected) {
        setIsConnected(false);
        setReconnectAttempts(prev => prev + 1);
        onDisconnect?.();
      }
    }
  }, [roomId, isConnected, reconnectAttempts, onDisconnect, onReconnect]);

  // Listen for disconnection based on inactivity
  useEffect(() => {
    if (!lastActivity) return;

    const checkConnection = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity.getTime();

      if (timeSinceLastActivity > timeout && isConnected) {
        setIsConnected(false);
        setReconnectAttempts(prev => prev + 1);
        onDisconnect?.();
      }
    };

    const checkInterval = setInterval(checkConnection, 5000); // Check every 5s
    return () => clearInterval(checkInterval);
  }, [lastActivity, timeout, isConnected, onDisconnect]);

  // Heartbeat interval
  useEffect(() => {
    if (!roomId) return;

    // Initial heartbeat
    updateActivity();

    const heartbeatInterval = setInterval(updateActivity, interval);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [roomId, interval, updateActivity]);

  // Auto-reconnect with exponential backoff
  useEffect(() => {
    if (isConnected || reconnectAttempts >= maxReconnectAttempts) return;

    const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
    
    const reconnectTimeout = setTimeout(() => {
      updateActivity();
    }, reconnectDelay);

    return () => clearTimeout(reconnectTimeout);
  }, [isConnected, reconnectAttempts, maxReconnectAttempts, updateActivity]);

  return {
    isConnected,
    lastActivity,
    reconnectAttempts,
    maxReconnectAttempts,
    forceUpdate: updateActivity,
  };
};
