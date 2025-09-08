
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import dynamic from 'next/dynamic';

const AppSidebar = dynamic(() => import('@/components/layout/AppSidebar').then(mod => mod.AppSidebar), {
  ssr: false,
});
import { AppHeader } from './AppHeader';
import { PageLoader } from './PageLoader';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { useAsgardeo } from '@asgardeo/nextjs';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signIn } = useAsgardeo();
  const { selectedOrganization, isLoaded: isOrgLoaded } = useOrganization();

  const unprotectedRoutes = ['/login'];
  const isUnprotected = unprotectedRoutes.includes(pathname);
  const isOrgSetup = pathname.startsWith('/organizations');

  // Onboarding flow: if no organization is selected, redirect to the organization page
  // unless we are already on an unprotected page.
  useEffect(() => {
    if (!isLoading && !user && !isUnprotected) {
      router.push('/login');
    }

    if (!isLoading && user && isOrgLoaded && !selectedOrganization && !isOrgSetup) {
      const userOrgs = JSON.parse(localStorage.getItem(`organizations_${user.username}`) || '[]');
      if (userOrgs.length > 0) {
        router.push('/organizations');
      } else {
        router.push('/organizations/new');
      }
    }
  }, [isLoading, user, isOrgLoaded, selectedOrganization, pathname, router, isUnprotected, isOrgSetup]);


  const renderContent = () => {
    const isPageLoading = isLoading || (user && !isOrgLoaded);
    if (isPageLoading && !isUnprotected) {
      return <PageLoader />;
    }
    
    // This case is handled by the redirect in useEffect
    if (user && !selectedOrganization && !isOrgSetup) {
       return <PageLoader />;
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
  
  // Also treat org setup pages as standalone layouts
  if (isOrgSetup) {
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
