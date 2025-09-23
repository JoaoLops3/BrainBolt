import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
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
          className
        )}
      >
        {title && (
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};
