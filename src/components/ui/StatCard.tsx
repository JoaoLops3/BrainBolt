import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  animation?: "fadeIn" | "slideUp" | "scale" | "none";
  delay?: number;
}

export const StatCard = ({
  icon,
  label,
  value,
  subtitle,
  badge,
  badgeVariant = "default",
  className,
  animation = "fadeIn",
  delay = 0,
}: StatCardProps) => {
  const animationClasses = {
    fadeIn: "animate-in fade-in-0",
    slideUp: "animate-in slide-in-from-bottom-4 fade-in-0",
    scale: "animate-in zoom-in-95 fade-in-0",
    none: "",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
        "bg-white/5 backdrop-blur-sm border-white/20",
        "hover:bg-white/20 hover:border-white/30",
        animationClasses[animation],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/20 transition-colors duration-200">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                {label}
              </p>
              <p className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors duration-200">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-white/60 group-hover:text-white/70 transition-colors duration-200">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {badge && (
            <Badge
              variant={badgeVariant}
              className="animate-in fade-in-0 slide-in-from-right-2"
              style={{ animationDelay: `${delay + 100}ms` }}
            >
              {badge}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
};
