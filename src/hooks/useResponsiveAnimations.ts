import { useEffect, useState } from "react";

interface AnimationConfig {
  mobile: string;
  tablet: string;
  desktop: string;
}

export const useResponsiveAnimations = () => {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "mobile"
  );

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const getResponsiveAnimation = (config: AnimationConfig): string => {
    switch (screenSize) {
      case "mobile":
        return config.mobile;
      case "tablet":
        return config.tablet;
      case "desktop":
        return config.desktop;
      default:
        return config.mobile;
    }
  };

  const getResponsiveSpacing = (
    mobile: string,
    tablet: string,
    desktop: string
  ): string => {
    return getResponsiveAnimation({ mobile, tablet, desktop });
  };

  const getResponsiveSize = (
    mobile: string,
    tablet: string,
    desktop: string
  ): string => {
    return getResponsiveAnimation({ mobile, tablet, desktop });
  };

  const getResponsiveGrid = (
    mobile: string,
    tablet: string,
    desktop: string
  ): string => {
    return getResponsiveAnimation({ mobile, tablet, desktop });
  };

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";
  const isDesktop = screenSize === "desktop";

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveAnimation,
    getResponsiveSpacing,
    getResponsiveSize,
    getResponsiveGrid,
  };
};
