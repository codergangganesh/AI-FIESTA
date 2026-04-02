import type { Metadata } from "next";
import "./globals.css";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PopupProvider } from "@/contexts/PopupContext";
import { LoadingProvider } from '@/contexts/LoadingContext';
import { OptimizedLoadingProvider } from '@/contexts/OptimizedLoadingContext';
import PricingPopup from '@/components/ui/PricingPopup';
import AuthPopup from '@/components/auth/AuthPopup';

export const metadata: Metadata = {
  title: "AI Fiesta - Compare AI Models Side-by-Side",
  description: "Compare responses from multiple AI models simultaneously",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="fiesta-shell min-h-screen overflow-x-hidden text-white antialiased"
      >
        <DarkModeProvider>
          <AuthProvider>
            <NotificationProvider>
              <PopupProvider>
                <LoadingProvider>
                  <OptimizedLoadingProvider>
                    {children}
                    <PricingPopup />
                    <AuthPopup />
                  </OptimizedLoadingProvider>
                </LoadingProvider>
              </PopupProvider>
            </NotificationProvider>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
