import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { AppLayout } from './AppLayout';
import { Suspense } from 'react';
import { PageLoader } from './PageLoader';

export async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { claims } = await getLogtoContext(logtoConfig);
  const user = claims ? { name: claims.name || '', sub: claims.sub } : null;

  return (
    <Suspense fallback={<PageLoader />}>
        <OrganizationProvider user={user}>
            <AppLayout>
                {children}
            </AppLayout>
        </OrganizationProvider>
    </Suspense>
  );
}
