'use client';

import { AsgardeoProvider } from '@asgardeo/react';
import { ReactNode } from 'react';

export function AsgardeoProviderWrapper({ children }: { children: ReactNode }) {
    const config = {
        signInRedirectURL: "http://localhost:9002/login",
        signOutRedirectURL: "http://localhost:9002/login",
        clientId: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID || "",
        baseUrl: process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL || "",
        scope: (process.env.NEXT_PUBLIC_ASGARDEO_SCOPES || "openid profile").split(" "),
    };

    return <AsgardeoProvider {...config}>{children}</AsgardeoProvider>;
}
