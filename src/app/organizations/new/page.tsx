import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { NewOrganizationForm } from './NewOrganizationForm';
import { redirect } from 'next/navigation';

export default async function NewOrganizationPage() {
    const { claims } = await getLogtoContext(logtoConfig);

    if (!claims) {
        redirect('/');
    }

    const user = {
        name: claims.name || '',
        sub: claims.sub,
    };

    return <NewOrganizationForm user={user} />;
}
