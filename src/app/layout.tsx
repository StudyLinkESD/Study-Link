import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthWrapper from '@/providers/AuthWrapper';
import { Toaster } from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/providers/QueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const inter = Inter({ subsets: ['latin'] });

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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.className}`}
        >
          <SpeedInsights />
          <QueryProvider>
            <Toaster position="top-right" richColors />
            {children}
          </QueryProvider>
        </body>
      </AuthWrapper>
    </html>
  );
}
