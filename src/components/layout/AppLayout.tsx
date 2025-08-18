
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from './AppHeader';
import { PageLoader } from './PageLoader';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedOrganization, isLoaded } = useOrganization();

  const unprotectedRoutes = ['/login', '/organizations', '/organizations/new'];
  const isUnprotected = unprotectedRoutes.includes(pathname);

  // Onboarding flow: if no organization is selected, redirect to the organization page
  // unless we are already on an unprotected page.
  useEffect(() => {
    if (isLoaded && !selectedOrganization && !isUnprotected) {
        router.push('/organizations');
    }
  }, [isLoaded, selectedOrganization, pathname, router, isUnprotected]);


  const renderContent = () => {
    if (!isLoaded && !isUnprotected) {
      return <PageLoader />;
    }
    
    if (isLoaded && !selectedOrganization && !isUnprotected) {
      return (
         <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Card className="max-w-lg w-full glass-card">
              <CardHeader>
                <CardTitle>Welcome to Monyfi SaaS</CardTitle>
                <CardDescription>To get started, please select an organization to manage.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => router.push('/organizations')}>
                    Go to Organizations
                </Button>
              </CardContent>
            </Card>
        </main>
      )
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </main>
    );
  }

  if (isUnprotected) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        {renderContent()}
      </SidebarInset>
    </SidebarProvider>
  );
}
