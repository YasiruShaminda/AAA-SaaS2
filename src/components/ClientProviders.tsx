'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AsgardeoProviderWrapper } from "@/components/auth/AsgardeoProviderWrapper";
import { OrganizationProvider } from '@/contexts/OrganizationContext';

export function ClientProviders({ children }: { children: ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <AsgardeoProviderWrapper>
            <OrganizationProvider>
                {children}
            </OrganizationProvider>
        </AsgardeoProviderWrapper>
    );
}
