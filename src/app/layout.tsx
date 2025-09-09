
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/AppLayout';
import { Suspense } from 'react';
import { PageLoader } from '@/components/layout/PageLoader';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Monyfi SaaS',
  description: 'Intuitive management for FreeRADIUS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={<PageLoader />}>
          <AuthProvider>
            <OrganizationProvider>
                <AppLayout>
                  {children}
                </AppLayout>
            </OrganizationProvider>
          </AuthProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
