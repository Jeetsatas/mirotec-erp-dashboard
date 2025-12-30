import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ERPProvider } from "@/contexts/ERPContext";
import { OperatorModeProvider } from "@/contexts/OperatorModeContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { CompanyProvider } from "@/contexts/CompanyContext";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ERPProvider>
            <CompanyProvider>
              <BrowserRouter>
                <OperatorModeProvider>
                  <RoleProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      {children}
                    </TooltipProvider>
                  </RoleProvider>
                </OperatorModeProvider>
              </BrowserRouter>
            </CompanyProvider>
          </ERPProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
