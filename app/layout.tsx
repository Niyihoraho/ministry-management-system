// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import QueryClientProvider from "./providers/QueryClientProvider";
import AppSidebar from "./components/common/AppSidebar";
import AppHeader from "./components/common/AppHeader";
import MainContentWrapper from './components/common/MainContentWrapper';
import AuthProvider from './providers/AuthProvider';
import LayoutWrapper from './components/common/LayoutWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ministry Management System',
  description: 'Complete ministry management solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <QueryClientProvider>
            <ThemeProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </ThemeProvider>
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}