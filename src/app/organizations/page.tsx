
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PlusCircle, Building, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrganizationsPage() {
    const { organizations, selectOrganization, isLoaded } = useOrganization();
    const router = useRouter();

    const handleSelectOrg = (org: (typeof organizations)[0]) => {
        selectOrganization(org, () => {
            router.push('/');
        });
    }

    if (!isLoaded) {
        return <div>Loading...</div>; // Or a proper loader
    }

    if (organizations.length === 0) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Card className="w-full max-w-lg text-center glass-card">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex items-center justify-center size-16 bg-primary/10 rounded-full border border-primary/20">
                           <Building className="size-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Create an organization</CardTitle>
                        <CardDescription>Create an organization to get started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/organizations/new')} size="lg">
                            <PlusCircle className="mr-2" /> Create Organization
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-headline">Select an Organization</h1>
                    <p className="text-muted-foreground">Choose which organization you want to manage.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map(org => (
                        <Card 
                            key={org.id} 
                            className="glass-card cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1"
                            onClick={() => handleSelectOrg(org)}
                        >
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                     <div className="p-4 rounded-md bg-primary/10 border border-primary/20">
                                        <Building className="size-8 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-center">{org.name}</CardTitle>
                                <CardDescription className="text-center truncate">{org.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                                <Users className="size-4" />
                                <span>{org.subscribers.toLocaleString()} subscribers</span>
                            </CardContent>
                        </Card>
                    ))}
                     <Card 
                        className="glass-card cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 flex items-center justify-center border-dashed"
                        onClick={() => router.push('/organizations/new')}
                    >
                        <div className="text-center text-muted-foreground">
                            <PlusCircle className="size-8 mx-auto mb-2" />
                            <p>Create New</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
