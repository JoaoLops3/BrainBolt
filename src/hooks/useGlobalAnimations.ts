import { useState, useEffect } from "react";

export type AnimationType =
  | "fadeIn"
  | "fadeOut"
  | "slideInLeft"
  | "slideInRight"
  | "slideInUp"
  | "slideInDown"
  | "scaleIn"
  | "scaleOut"
  | "bounceIn"
  | "bounceOut"
  | "rotateIn"
  | "rotateOut"
  | "flipInX"
  | "flipInY"
  | "zoomIn"
  | "zoomOut"
  | "none";

export type AnimationDuration = "fast" | "normal" | "slow";
export type AnimationDelay = "none" | "short" | "medium" | "long";

export interface AnimationConfig {
  type: AnimationType;
  duration?: AnimationDuration;
  delay?: AnimationDelay;
  repeat?: boolean;
  infinite?: boolean;
}

interface GlobalAnimationsHook {
  getAnimationClasses: (config: AnimationConfig) => string;
  getHoverAnimation: (type: "lift" | "scale" | "glow" | "none") => string;
  getTransitionClasses: (properties: string[]) => string;
  isReducedMotion: boolean;
}

const durationMap: Record<AnimationDuration, string> = {
  fast: "duration-200",
  normal: "duration-300",
  slow: "duration-500",
};

const delayMap: Record<AnimationDelay, string> = {
  none: "delay-0",
  short: "delay-100",
  medium: "delay-200",
  long: "delay-300",
};

const animationMap: Record<AnimationType, string> = {
  fadeIn: "animate-global-fade-in",
  fadeOut: "animate-global-fade-out",
  slideInLeft: "animate-global-slide-in-left",
  slideInRight: "animate-global-slide-in-right",
  slideInUp: "animate-global-slide-in-up",
  slideInDown: "animate-global-slide-in-down",
  scaleIn: "animate-global-scale-in",
  scaleOut: "animate-global-scale-out",
  bounceIn: "animate-global-bounce-in",
  bounceOut: "animate-global-fade-out", // Fallback para bounceOut
  rotateIn: "animate-global-fade-in", // Fallback para rotateIn
  rotateOut: "animate-global-fade-out", // Fallback para rotateOut
  flipInX: "animate-global-fade-in", // Fallback para flipInX
  flipInY: "animate-global-fade-in", // Fallback para flipInY
  zoomIn: "animate-global-scale-in",
  zoomOut: "animate-global-scale-out",
  none: "",
};

const hoverAnimationMap = {
  lift: "hover-global-lift",
  scale: "hover-global-scale",
  glow: "hover-global-glow",
  none: "",
};

export const useGlobalAnimations = (): GlobalAnimationsHook => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const getAnimationClasses = (config: AnimationConfig): string => {
    if (isReducedMotion || config.type === "none") {
      return "";
    }

    const baseAnimation = animationMap[config.type];
    const duration = durationMap[config.duration || "normal"];
    const delay = delayMap[config.delay || "none"];

    let classes = `${baseAnimation} ${duration} ${delay}`;

    if (config.infinite) {
      classes += " animate-infinite";
    }

    return classes.trim();
  };

  const getHoverAnimation = (
    type: "lift" | "scale" | "glow" | "none"
  ): string => {
    if (isReducedMotion) {
      return "";
    }
    return hoverAnimationMap[type];
  };

  const getTransitionClasses = (properties: string[]): string => {
    if (isReducedMotion) {
      return "transition-none";
    }

    const transitionProperties = properties.join(", ");
    return `transition-${transitionProperties}`;
  };

  return {
    getAnimationClasses,
    getHoverAnimation,
    getTransitionClasses,
    isReducedMotion,
  };
};
