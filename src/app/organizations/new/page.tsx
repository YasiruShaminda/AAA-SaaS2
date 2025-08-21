

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
    
    useEffect(() => {
        // If an existing user with orgs lands here, send them away.
        if (user && organizations.length > 0) {
            router.push('/organizations');
        }
    }, [user, router, organizations]);


    const handleCreate = () => {
        if (!name.trim()) {
             toast({
                variant: "destructive",
                title: "Organization name required",
                description: "Please enter a name for your organization.",
            });
            return;
        }

        const newOrg: Organization = {
            id: `org-${Date.now()}`,
            name,
            description: 'Your first organization',
            type: 'Client',
            subscribers: 1, // Starts with 1 default user
            status: 'Trial',
        };
        
        // Add the organization but don't auto-select yet. We will do it manually.
        addOrganization(newOrg, false); 
        
        // This logic runs for the very first organization created by a user.
        if (user && organizations.length === 0) {
            addDefaultDataForNewOrg();
            // Set flags to trigger onboarding hints on the subscribers page.
            localStorage.setItem(`onboarding_show_groups_hint_${user.name}`, 'true');
        }

        // Manually select the new org. The callback ensures the redirect
        // happens only after the state has been successfully updated.
        selectOrganization(newOrg, () => {
            router.push('/subscribers');
        });
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
                     <Button onClick={handleCreate} size="lg">
                        Next &gt;
                    </Button>
                </div>
           </div>
        </div>
    );
}
