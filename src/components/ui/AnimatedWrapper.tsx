import React, { ReactNode } from "react";
import {
  useGlobalAnimations,
  AnimationConfig,
} from "@/hooks/useGlobalAnimations";
import { cn } from "@/lib/utils";

interface AnimatedWrapperProps {
  children: ReactNode;
  animation?: AnimationConfig;
  hoverAnimation?: "lift" | "scale" | "glow" | "none";
  transitionProperties?: string[];
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const AnimatedWrapper = ({
  children,
  animation,
  hoverAnimation = "none",
  transitionProperties = ["all"],
  className,
  as: Component = "div",
}: AnimatedWrapperProps) => {
  const { getAnimationClasses, getHoverAnimation, getTransitionClasses } =
    useGlobalAnimations();

  const animationClasses = animation ? getAnimationClasses(animation) : "";
  const hoverClasses = getHoverAnimation(hoverAnimation);
  const transitionClasses = getTransitionClasses(transitionProperties);

  return (
    <Component
      className={cn(
        animationClasses,
        hoverClasses,
        transitionClasses,
        className
      )}
    >
      {children}
    </Component>
  );
};
