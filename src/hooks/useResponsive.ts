import { useState, useEffect } from 'react';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

const MOBILE_MAX = 767;
const TABLET_MAX = 1279;

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width <= MOBILE_MAX) {
        setScreenSize('mobile');
        setIsMobile(true);
        setIsTablet(false);
        setIsDesktop(false);
      } else if (width <= TABLET_MAX) {
        setScreenSize('tablet');
        setIsMobile(false);
        setIsTablet(true);
        setIsDesktop(false);
      } else {
        setScreenSize('desktop');
        setIsMobile(false);
        setIsTablet(false);
        setIsDesktop(true);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return { screenSize, isMobile, isTablet, isDesktop };
}
