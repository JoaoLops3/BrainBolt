import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface NotificationStatusProps {
  onOpenSettings: () => void;
}

export const NotificationStatus = ({
  onOpenSettings,
}: NotificationStatusProps) => {
  const { permission, settings, requestPermission, isLoading } =
    usePushNotifications();

  // Se já tem permissão e notificações estão ativas, não mostrar
  if (
    permission === "granted" &&
    (settings.dailyReminders || settings.achievements)
  ) {
    return null;
  }

  // Se foi negado ou nunca pediu, mostrar prompt discreto
  if (permission === "denied" || permission === "default") {
    return (
      <div className="fixed left-4 z-50 safe-top-fixed">
        <Button
          variant="ghost"
          size="sm"
          onClick={
            permission === "default" ? requestPermission : onOpenSettings
          }
          disabled={isLoading}
          className="glass-button bg-white/80 hover:bg-white/90 border border-white/30 shadow-lg text-gray-800 gap-2"
        >
          {permission === "denied" ? (
            <>
              <BellOff className="h-4 w-4" />
              <span className="hidden sm:inline">Reativar</span>
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isLoading ? "Ativando..." : "Ativar alertas"}
              </span>
            </>
          )}
          <Badge
            variant="secondary"
            className="ml-1 bg-purple-100 text-purple-700"
          >
            Novo
          </Badge>
        </Button>
      </div>
    );
  }

  return null;
};
