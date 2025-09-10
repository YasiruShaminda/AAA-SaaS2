import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import ProjectsClientPage from './ProjectsClientPage';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
    const { claims } = await getLogtoContext(logtoConfig);

    if (!claims) {
        redirect('/');
    }

    const user = {
        name: claims.name || '',
        sub: claims.sub,
    };

    return <ProjectsClientPage user={user} />;
}
