import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Navbar } from '@/components/navigation/Navbar';

import AuthWrapper from '@/providers/AuthWrapper';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StudyLink - Connectez étudiants et entreprises',
  description:
    'StudyLink est une plateforme qui met en relation les étudiants et les entreprises pour des stages et alternances',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <AuthWrapper>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SpeedInsights />
          <Toaster position="top-right" richColors />
          <Navbar />
          <main className="pt-16">{children}</main>
        </body>
      </AuthWrapper>
    </html>
  );
}
