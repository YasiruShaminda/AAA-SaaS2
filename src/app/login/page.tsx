
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Waypoints } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { toast } = useToast();
    const { organizations, isLoaded } = useOrganization();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        const user = login(username, password);

        if (user) {
             // The OrganizationContext will reload data based on the new user.
             // We need to give it a moment to load the user's orgs before checking.
            setTimeout(() => {
                const userOrgs = JSON.parse(localStorage.getItem(`organizations_${user.name}`) || '[]');
                if (userOrgs.length === 0) {
                    router.push('/organizations/new');
                } else {
                    router.push('/organizations');
                }
            }, 100);
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid username or password.",
            });
        }
    };

    return (
        <div className="flex h-full min-h-screen items-center justify-center bg-background">
            <div className="relative w-full max-w-md">
                <div className="absolute -inset-0.5 animate-pulse rounded-lg bg-primary/50 opacity-75 blur-2xl"></div>
                <Card className="relative glass-card">
                     <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center size-16 bg-primary/10 rounded-full border border-primary/20">
                           <Waypoints className="size-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Access Terminal</CardTitle>
                        <CardDescription>Monify SaaS Authentication</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" placeholder="Enter your callsign" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="Enter your passcode" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>
                        </div>
                         <Button className="w-full" size="lg" onClick={handleLogin}>
                            <Fingerprint className="mr-2"/>
                            Authenticate
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                       <p className="text-sm text-muted-foreground">
                            Use `admin`/`admin` for existing user or `user`/`user` for new user flow.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
