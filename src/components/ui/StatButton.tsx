import { ReactNode, forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGlobalAnimations } from "@/hooks/useGlobalAnimations";

interface StatButtonProps extends Omit<ButtonProps, "children"> {
  icon: ReactNode;
  label: string;
  statValue?: string | number;
  statLabel?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  showStat?: boolean;
  children?: ReactNode;
  animation?: "none" | "fadeIn" | "scaleIn" | "slideInUp";
}

export const StatButton = forwardRef<HTMLButtonElement, StatButtonProps>(
  (
    {
      icon,
      label,
      statValue,
      statLabel,
      badge,
      badgeVariant = "default",
      showStat = true,
      className,
      animation = "none",
      children,
      ...props
    },
    ref
  ) => {
    const { getAnimationClasses, getHoverAnimation } = useGlobalAnimations();

    const animationClasses = getAnimationClasses({
      type: animation === "none" ? "none" : animation || "none",
      duration: "normal",
      delay: "none",
    });

    const hoverClasses = getHoverAnimation("lift");

    return (
      <Button
        ref={ref}
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "glass-button text-white hover:bg-white/30",
          "shadow-lg hover:shadow-xl hover:shadow-primary/20",
          "border border-white/20 hover:border-white/40",
          animationClasses,
          hoverClasses,
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="p-1 rounded-md bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
              {icon}
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{label}</span>
              {showStat && statValue !== undefined && (
                <span className="text-xs opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                  {statValue} {statLabel}
                </span>
              )}
            </div>
          </div>

          {badge && (
            <Badge
              variant={badgeVariant}
              className="animate-in fade-in-0 slide-in-from-right-2"
            >
              {badge}
            </Badge>
          )}

          {children}
        </div>

        {/* Hover effect - apenas no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out pointer-events-none" />
      </Button>
    );
  }
);

StatButton.displayName = "StatButton";
