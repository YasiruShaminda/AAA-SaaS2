
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { Organization } from "@/contexts/OrganizationContext";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function NewOrganizationPage() {
    const { addOrganization } = useOrganization();
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = () => {
        if (!name.trim()) return;

        const newOrg: Organization = {
            id: `org-${Date.now()}`,
            name,
            description,
            type: 'Client',
            subscribers: 0,
            status: 'Trial',
        };
        addOrganization(newOrg);
        // addOrganization will select it and AppLayout will redirect to '/'
    };

    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="w-full max-w-lg glass-card">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Create New Organization</CardTitle>
                    <CardDescription>
                        This will be the container for your subscribers and profiles.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input 
                            id="org-name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. FTTX Provider" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="org-desc">Description (Optional)</Label>
                        <Input 
                            id="org-desc" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Main corporate client"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                     <Button variant="outline" onClick={() => router.back()}>
                        <ChevronLeft className="mr-2" />
                        Back
                    </Button>
                    <Button onClick={handleCreate} disabled={!name.trim()}>
                        Create Organization
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
