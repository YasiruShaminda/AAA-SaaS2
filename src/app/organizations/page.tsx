
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PlusCircle, Building, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/contexts/OrganizationContext';


export default function OrganizationsPage() {
    const { organizations, selectOrganization, isLoaded, addOrganization } = useOrganization();
    const { user } = useAuth();
    const router = useRouter();
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgDesc, setNewOrgDesc] = useState('');
    const { toast } = useToast();


    useEffect(() => {
        if (isLoaded && organizations.length === 0) {
            router.push('/organizations/new');
        }
    }, [isLoaded, organizations, router]);
    
     useEffect(() => {
        if (user) {
            const onboardingStatus = localStorage.getItem(`onboarding_complete_${user.name}`);
            if (onboardingStatus === 'false') {
                setIsFirstLogin(true);
            }
        }
    }, [user]);


    const handleSelectOrg = (org: (typeof organizations)[0]) => {
        const destination = isFirstLogin ? '/subscribers' : '/';
        
        if (user && isFirstLogin) {
            localStorage.setItem(`onboarding_complete_${user.name}`, 'true');
            // Set the next hint for the subscribers page
            localStorage.setItem(`onboarding_show_groups_hint_${user.name}`, 'true');
            setIsFirstLogin(false);
        }

        selectOrganization(org, () => {
            router.push(destination);
        });
    }
    
     const handleAddNewOrg = () => {
        if (!newOrgName.trim()) {
            toast({
                variant: "destructive",
                title: "Organization name required",
                description: "Please enter a name for the organization.",
            });
            return;
        }

        if (organizations.some(org => org.name.toLowerCase() === newOrgName.trim().toLowerCase())) {
            toast({
                variant: "destructive",
                title: "Organization name exists",
                description: "An organization with this name already exists. Please choose a different name.",
            });
            return;
        }

        const newOrg: Organization = {
            id: `org-${Date.now()}`,
            name: newOrgName.trim(),
            description: newOrgDesc,
            type: 'Client',
            subscribers: 0,
            status: 'Trial',
        };

        addOrganization(newOrg, false);
        selectOrganization(newOrg, () => {
            router.push('/subscribers');
        });

        setNewOrgName('');
        setNewOrgDesc('');
        setIsAddModalOpen(false);
    }

    const PageContent = () => {
        if (!isLoaded) {
            return (
                <>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                     <div className="p-4 rounded-md bg-primary/10 border border-primary/20">
                                        <Skeleton className="size-8" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-3/4 mx-auto" />
                                <Skeleton className="h-4 w-1/2 mx-auto" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-5 w-2/4 mx-auto" />
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="glass-card flex items-center justify-center border-dashed">
                        <div className="text-center text-muted-foreground">
                            <PlusCircle className="size-8 mx-auto mb-2" />
                            <p>Create New</p>
                        </div>
                    </Card>
                </>
            );
        }

        if (organizations.length === 0) {
            // This will be shown briefly before the useEffect redirects.
            return null;
        }

        return (
            <>
                {organizations.map(org => (
                    <Card
                        key={org.id}
                        className={cn(
                            "glass-card cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1",
                            isFirstLogin && "animate-pulse border-primary ring-2 ring-primary"
                        )}
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
                 <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                         <Card
                            className="glass-card cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 flex items-center justify-center border-dashed"
                        >
                            <div className="text-center text-muted-foreground">
                                <PlusCircle className="size-8 mx-auto mb-2" />
                                <p>Create New</p>
                            </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Organization</DialogTitle>
                            <DialogDescription>Enter the details for your new organization.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="org-name">Organization Name</Label>
                                <Input id="org-name" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="e.g. My Next Company"/>
                            </div>
                                <div className="space-y-2">
                                <Label htmlFor="org-desc">Description (Optional)</Label>
                                <Input id="org-desc" value={newOrgDesc} onChange={(e) => setNewOrgDesc(e.target.value)} placeholder="e.g. A new venture"/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddNewOrg}>Create and Select</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
            </>
        );
    }


    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-headline">Select an Organization</h1>
                    <p className="text-muted-foreground">Choose which organization you want to manage.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <PageContent />
                </div>
            </div>
        </div>
    );
}
