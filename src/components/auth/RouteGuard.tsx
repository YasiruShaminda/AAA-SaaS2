'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/layout/PageLoader';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  const unprotectedRoutes = ['/login', '/register', '/verify-email'];
  const isUnprotected = unprotectedRoutes.includes(pathname);

  useEffect(() => {
    const checkAuth = () => {
      if (isLoaded) {
        if (!isUnprotected) {
          const token = localStorage.getItem('token');
          
          // If no token or no user, redirect to login
          if (!token || !user) {
            console.log('RouteGuard: Unauthorized access attempt, redirecting to login');
            router.push('/login');
            return;
          }
        }
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isLoaded, user, isUnprotected, pathname, router]);

  // Listen for storage changes (token removal in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue && !isUnprotected) {
        console.log('RouteGuard: Token removed, redirecting to login');
        router.push('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isUnprotected, router]);

  // Show loading while checking authentication
  if (!isLoaded || (isChecking && !isUnprotected)) {
    return <PageLoader />;
  }

  // If this is a protected route and user is not authenticated, show loading
  // (the useEffect will handle the redirect)
  if (!isUnprotected && (!user || !localStorage.getItem('token'))) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
