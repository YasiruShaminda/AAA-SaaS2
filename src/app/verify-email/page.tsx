
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck, Waypoints } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function VerifyEmailPage() {
    const router = useRouter();
    const { user, sendVerificationEmail } = useAuth();
    const { toast } = useToast();

    const handleResend = () => {
        if(user) {
            sendVerificationEmail(user.email);
            toast({
                title: "Email Sent",
                description: "A new verification email has been sent to your address.",
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
                           <MailCheck className="size-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Verify Your Email</CardTitle>
                        <CardDescription>We've sent a verification link to your email address.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center text-muted-foreground">
                        <p>
                           Please check your inbox and click the link to complete your registration.
                        </p>
                        <p>
                            (This is a demo. No email was actually sent.)
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
                            Proceed to Login
                        </Button>
                         <p className="text-sm text-muted-foreground">
                            Didn't receive the email? <Button variant="link" className="p-0 h-auto" onClick={handleResend}>Resend</Button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
