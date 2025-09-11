

'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { Organization } from "@/contexts/OrganizationContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";

export default function NewOrganizationPage() {
    const { addOrganization, addDefaultDataForNewOrg, organizations, selectOrganization } = useOrganization();
    const { user, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    
    useEffect(() => {
        // If an existing user with orgs lands here, send them away.
        if (user && organizations.length > 0) {
            router.push('/organizations');
        }
    }, [user, router, organizations]);


    const handleCreate = async () => {
        if (isCreating) return;
        setIsCreating(true);

        if (!name.trim()) {
             toast({
                variant: "destructive",
                title: "Organization name required",
                description: "Please enter a name for your organization.",
            });
            setIsCreating(false);
            return;
        }

        if (organizations.some(org => org.name.toLowerCase() === name.trim().toLowerCase())) {
            toast({
                variant: "destructive",
                title: "Organization name exists",
                description: "An organization with this name already exists. Please choose a different name.",
            });
            setIsCreating(false);
            return;
        }

        const newOrgData: Partial<Organization> = {
            name: name.trim(),
            description: 'Your first organization',
        };
        
        const newOrg = await addOrganization(newOrgData as Organization, false);
        
        console.log('Organization creation result:', newOrg);
        
        if (newOrg) {
            console.log('New organization created with ID:', newOrg.id, 'Name:', newOrg.name);
            // Manually select the new org
            selectOrganization(newOrg);
            
            // Create default data for new users immediately
            if (user && organizations.length === 0) {
                console.log('This is a new user creating their first organization');
                // Set the onboarding flags
                localStorage.setItem(`onboarding_show_groups_hint_${user.name}`, 'true');
                localStorage.setItem(`onboarding_complete_${user.name}`, 'false');
                
                // Create default data immediately with the new organization
                console.log('Starting default data creation for new organization...');
                
                // Wait for default data creation before redirecting
                try {
                    await addDefaultDataForNewOrg(newOrg);
                    console.log('Default data creation completed successfully');
                } catch (error) {
                    console.error('Default data creation failed:', error);
                }
            } else {
                console.log('Existing user or not their first organization - skipping default data creation');
            }
            
            // Redirect to subscribers page after a brief delay to allow data creation
            setTimeout(() => {
                console.log('Redirecting to subscribers page...');
                router.push('/subscribers');
                setIsCreating(false);
            }, 800);
        } else {
            setIsCreating(false);
            toast({
                variant: "destructive",
                title: "Failed to create organization",
                description: "An unexpected error occurred. Please try again.",
            });
        }
    };
    
    if (!user) {
        return (
             <div className="flex h-screen items-center justify-center text-lg font-semibold">
                Loading user data...
            </div>
        )
    }

    return (
        <div className="relative flex h-screen items-center justify-center bg-background px-4">
            <div className="absolute top-4 right-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer">
                            <AvatarImage src="/profile-pic.png" alt="User Profile Picture" />
                            <AvatarFallback>
                                <UserIcon className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

           <div className="w-full max-w-xl text-left">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
                    Welcome, {user?.name}!
                </h1>
                <div className="mt-12 space-y-4">
                     <Label htmlFor="org-name" className="text-xl text-muted-foreground">
                        Enter your organization name
                    </Label>
                    <Input 
                        id="org-name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. My Company" 
                        className="h-14 text-2xl"
                    />
                </div>

                <div className="mt-16 flex justify-end">
                     <Button onClick={handleCreate} size="lg" disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Next >'}
                    </Button>
                </div>
           </div>
        </div>
    );
}
