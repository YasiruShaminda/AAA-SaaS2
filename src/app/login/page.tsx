'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Waypoints } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = () => {
        // In a real app, you'd perform authentication here.
        // On success, redirect to the organization selection page.
        router.push('/organizations');
    }

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
                                <Input id="username" placeholder="Enter your callsign" defaultValue="admin" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="Enter your passcode" defaultValue="admin" />
                            </div>
                        </div>
                         <Button className="w-full" size="lg" onClick={handleLogin}>
                            <Fingerprint className="mr-2"/>
                            Authenticate
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                       <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Button variant="link" className="p-0 h-auto">Create one</Button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
