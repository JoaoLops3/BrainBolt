import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMultiplayerConnection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Test Supabase connection
  const testConnection = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      setIsSupabaseConnected(!error);
      if (!error) {
        setReconnectAttempts(0);
      }
    } catch (error) {
      setIsSupabaseConnected(false);
    }
  }, []);

  // Auto-reconnect when back online
  useEffect(() => {
    if (isOnline && !isSupabaseConnected && reconnectAttempts < maxReconnectAttempts) {
      const timeout = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        testConnection();
      }, Math.pow(2, reconnectAttempts) * 1000); // Exponential backoff

      return () => clearTimeout(timeout);
    }
  }, [isOnline, isSupabaseConnected, reconnectAttempts, testConnection]);

  // Test connection initially
  useEffect(() => {
    testConnection();
  }, [testConnection]);

  const isConnected = isOnline && isSupabaseConnected;

  return {
    isOnline,
    isSupabaseConnected,
    isConnected,
    reconnectAttempts,
    testConnection,
    maxReconnectAttempts
  };
};