import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav, MobileHeader } from './MobileNav';
import { useResponsive } from '@/hooks/useResponsive';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isMobile, isTablet } = useResponsive();

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <MobileHeader />
        <main className="flex-1 overflow-auto p-4 pb-20 custom-scrollbar">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  // Tablet & Desktop layout
  return (
    <div className="flex h-screen overflow-hidden bg-background w-full">
      <Sidebar collapsed={isTablet} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
