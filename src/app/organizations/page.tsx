import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { OrganizationsList } from './OrganizationsList';
import { redirect } from 'next/navigation';

export default async function OrganizationsPage() {
    const { claims } = await getLogtoContext(logtoConfig);

    if (!claims) {
        redirect('/');
    }

    const user = {
        name: claims.name || '',
        sub: claims.sub,
    };

    return <OrganizationsList user={user} />;
}
