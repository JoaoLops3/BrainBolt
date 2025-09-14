import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Crown,
  Target,
  Zap,
  Award,
  Brain,
  Map,
  Palette,
  Scroll,
  Flame,
  X,
  Users,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
}

interface Character {
  id: string;
  name: string;
  category: string;
  rarity: string;
}

interface NotificationData {
  type: "achievement" | "character";
  achievement?: Achievement;
  character?: Character;
}

interface AchievementNotificationProps {
  notification: NotificationData | null;
  onClose: () => void;
}

const getIconComponent = (iconName: string) => {
  const iconMap = {
    trophy: Trophy,
    zap: Zap,
    target: Target,
    brain: Brain,
    map: Map,
    palette: Palette,
    scroll: Scroll,
    star: Star,
    flame: Flame,
    crown: Crown,
    award: Award,
    users: Users,
  };
  return iconMap[iconName as keyof typeof iconMap] || Trophy;
};

export const AchievementNotification = ({ notification, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const { type, achievement, character } = notification;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card 
        className={`
          w-80 border-l-4 shadow-lg transition-all duration-300 
          ${type === 'achievement' 
            ? 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50' 
            : 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50'
          }
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`
                p-2 rounded-full 
                ${type === 'achievement' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-purple-500 text-white'
                }
              `}>
                {type === 'achievement' && achievement ? (
                  (() => {
                    const IconComponent = getIconComponent(achievement.icon);
                    return <IconComponent className="h-5 w-5" />;
                  })()
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">
                    {type === 'achievement' ? 'Conquista Desbloqueada!' : 'Personagem Coletado!'}
                  </h4>
                  {type === 'achievement' && achievement && (
                    <Badge variant="outline" className="text-xs">
                      {achievement.badge_color}
                    </Badge>
                  )}
                  {type === 'character' && character && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {character.rarity}
                    </Badge>
                  )}
                </div>
                
                <p className="font-medium text-sm mb-1">
                  {type === 'achievement' && achievement 
                    ? achievement.name 
                    : character?.name
                  }
                </p>
                
                <p className="text-xs text-muted-foreground">
                  {type === 'achievement' && achievement 
                    ? achievement.description
                    : `Novo personagem de ${character?.category} adicionado à sua coleção!`
                  }
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-black/10"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};