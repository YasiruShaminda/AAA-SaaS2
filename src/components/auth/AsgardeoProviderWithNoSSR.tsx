'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const AsgardeoProviderWrapper = dynamic(
  () => import('@/components/auth/AsgardeoProviderWrapper').then(mod => mod.AsgardeoProviderWrapper),
  { ssr: false }
);

export function AsgardeoProviderWithNoSSR({ children }: { children: ReactNode }) {
  return <AsgardeoProviderWrapper>{children}</AsgardeoProviderWrapper>;
}
