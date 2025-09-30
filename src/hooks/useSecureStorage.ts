import { useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

interface SecureStorageHook {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  isSupported: boolean;
}

export const useSecureStorage = (): SecureStorageHook => {
  const [isSupported] = useState(true); // Sempre suportado

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Para mobile, usar Capacitor Preferences se disponível
        try {
          const { Preferences } = await import("@capacitor/preferences");
          const result = await Preferences.get({ key });
          return result.value;
        } catch (error) {
          console.warn(
            "Capacitor Preferences not available, falling back to localStorage"
          );
          return localStorage.getItem(key);
        }
      } else {
        // Para web, usar localStorage
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error("Error getting item from storage:", error);
      return null;
    }
  }, []);

  const setItem = useCallback(
    async (key: string, value: string): Promise<void> => {
      try {
        if (Capacitor.isNativePlatform()) {
          // Para mobile, usar Capacitor Preferences se disponível
          try {
            const { Preferences } = await import("@capacitor/preferences");
            await Preferences.set({ key, value });
            return;
          } catch (error) {
            console.warn(
              "Capacitor Preferences not available, falling back to localStorage"
            );
            localStorage.setItem(key, value);
          }
        } else {
          // Para web, usar localStorage
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.error("Error setting item in storage:", error);
      }
    },
    []
  );

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Para mobile, usar Capacitor Preferences se disponível
        try {
          const { Preferences } = await import("@capacitor/preferences");
          await Preferences.remove({ key });
          return;
        } catch (error) {
          console.warn(
            "Capacitor Preferences not available, falling back to localStorage"
          );
          localStorage.removeItem(key);
        }
      } else {
        // Para web, usar localStorage
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error removing item from storage:", error);
    }
  }, []);

  return {
    getItem,
    setItem,
    removeItem,
    isSupported,
  };
};

export const useLoginStorage = () => {
  const storage = useSecureStorage();
  const REMEMBER_EMAIL_KEY = "brainbolt-remember-email";

  const saveRememberedEmail = useCallback(
    async (email: string) => {
      await storage.setItem(REMEMBER_EMAIL_KEY, email);
    },
    [storage]
  );

  const getRememberedEmail = useCallback(async (): Promise<string> => {
    const email = await storage.getItem(REMEMBER_EMAIL_KEY);
    return email || "";
  }, [storage]);

  const clearRememberedEmail = useCallback(async () => {
    await storage.removeItem(REMEMBER_EMAIL_KEY);
  }, [storage]);

  return {
    saveRememberedEmail,
    getRememberedEmail,
    clearRememberedEmail,
  };
};
