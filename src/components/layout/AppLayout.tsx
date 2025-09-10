'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from './AppHeader';
import { PageLoader } from './PageLoader';
import { useOrganization } from '@/contexts/OrganizationContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedOrganization, isLoaded: isOrgLoaded } = useOrganization();

  const isOrgSetup = pathname.startsWith('/organizations');

  const renderContent = () => {
    if (!isOrgLoaded) {
      return <PageLoader />;
    }
    
    if (!selectedOrganization && !isOrgSetup) {
       return <PageLoader />;
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </main>
    );
  }
  
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
