
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
import { useAuth } from '@/contexts/AuthContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded: isAuthLoaded } = useAuth();
  const { selectedOrganization, isLoaded: isOrgLoaded } = useOrganization();

  const unprotectedRoutes = ['/login', '/register', '/verify-email'];
  const isUnprotected = unprotectedRoutes.includes(pathname);
  const isOrgSetup = pathname.startsWith('/organizations');

  // Security check: Validate token exists for protected routes
  useEffect(() => {
    if (!isUnprotected) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }
    }
  }, [pathname, isUnprotected, router]);

  // Onboarding flow: if no organization is selected, redirect to the organization page
  // unless we are already on an unprotected page.
  useEffect(() => {
    // Always check authentication first
    if (isAuthLoaded && !user && !isUnprotected) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // Don't redirect if we're already navigating somewhere after org creation
    const isNavigatingAfterOrgCreation = pathname === '/subscribers' || pathname === '/projects';
    
    if (isAuthLoaded && user && isOrgLoaded && !selectedOrganization && !isOrgSetup && !isNavigatingAfterOrgCreation) {
      const userOrgs = JSON.parse(localStorage.getItem(`organizations_${user.name}`) || '[]');
      if (userOrgs.length > 0) {
        router.push('/organizations');
      } else {
        router.push('/organizations/new');
      }
    }
  }, [isAuthLoaded, user, isOrgLoaded, selectedOrganization, pathname, router, isUnprotected, isOrgSetup]);


  const renderContent = () => {
    const isLoading = !isAuthLoaded || (user && !isOrgLoaded);
    if (isLoading && !isUnprotected) {
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
