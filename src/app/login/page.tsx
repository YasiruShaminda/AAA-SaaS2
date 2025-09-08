'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fingerprint, Waypoints } from 'lucide-react';
import { useAsgardeo } from '@asgardeo/nextjs';

export default function LoginPage() {
    const { signIn, signOut, user } = useAsgardeo();

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
                        {user ? (
                            <Button className="w-full" size="lg" onClick={() => signOut()}>
                                Sign Out
                            </Button>
                        ) : (
                            <Button className="w-full" size="lg" onClick={() => signIn()}>
                                <Fingerprint className="mr-2"/>
                                Authenticate
                            </Button>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                       <p className="text-sm text-muted-foreground">
                            Sign in with your Asgardeo account.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
