import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { SiteHeader } from '@/components/site-header';
import { AuthProvider } from '@/context/auth-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Spotilens',
  description: 'Visualise your spotify listening habits',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col overflow-hidden`}
      >
        <AuthProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col min-h-0">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
