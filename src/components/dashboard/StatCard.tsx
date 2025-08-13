import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { ReactNode } from 'react';

type StatCardProps = {
    title: string;
    value: string;
    icon: ReactNode;
    description: string;
    href?: string;
};

export function StatCard({ title, value, icon, description, href }: StatCardProps) {
    const CardContentWrapper = (
        <Card className="glass-card transition-all hover:border-accent hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-headline">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{CardContentWrapper}</Link>;
    }
    
    return CardContentWrapper;
}
