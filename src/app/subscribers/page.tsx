
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import SubscribersClientPage from './SubscribersClientPage';
import { redirect } from 'next/navigation';

export default async function SubscribersPage() {
    const { claims } = await getLogtoContext(logtoConfig);

    if (!claims) {
        redirect('/');
    }

    const user = {
        name: claims.name || '',
        sub: claims.sub,
    };

    return <SubscribersClientPage user={user} />;
}