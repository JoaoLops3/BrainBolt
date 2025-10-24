import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
  maxHeight?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "4xl"
    | "6xl"
    | "full"
    | "screen";
}

export const ResponsiveDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = "4xl",
  maxHeight = "screen",
}: ResponsiveDialogProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "max-w-full",
  };

  const maxHeightClasses = {
    sm: "max-h-sm",
    md: "max-h-md",
    lg: "max-h-lg",
    xl: "max-h-xl",
    "2xl": "max-h-2xl",
    "4xl": "max-h-4xl",
    "6xl": "max-h-6xl",
    full: "max-h-full",
    screen: "max-h-[95vh] sm:max-h-[85vh]",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[95vw] sm:w-full mx-2 sm:mx-auto",
          maxWidthClasses[maxWidth],
          maxHeightClasses[maxHeight],
          "overflow-y-auto",
          // Glass effect
          "backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className={title ? "text-lg sm:text-xl" : "sr-only"}>
            {title || "Janela"}
          </DialogTitle>
          <DialogDescription className={description ? undefined : "sr-only"}>
            {description || "Conteúdo da janela"}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
