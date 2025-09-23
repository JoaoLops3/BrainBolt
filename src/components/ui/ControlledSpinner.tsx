import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ControlledSpinnerProps {
  isLoading: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const ControlledSpinner = ({
  isLoading,
  className,
  size = "md",
  label = "Carregando...",
}: ControlledSpinnerProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Pequeno delay para evitar animações desnecessárias
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldAnimate(false);
    }
  }, [isLoading]);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={cn(
          "rounded-full border-b-2 border-primary transition-opacity duration-300",
          sizeClasses[size],
          shouldAnimate ? "animate-spin opacity-100" : "opacity-0"
        )}
      />
      {label && (
        <span className="ml-2 text-muted-foreground text-sm">{label}</span>
      )}
    </div>
  );
};
