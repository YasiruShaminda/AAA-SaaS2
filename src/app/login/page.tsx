
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Waypoints } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/contexts/OrganizationContext";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
    email: z.string().min(1, { message: "Email is required." }).email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { toast } = useToast();
    const { organizations, isLoaded } = useOrganization();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (values: z.infer<typeof formSchema>) => {
        const result = await login(values.email, values.password);

        if (result && result.isVerified) {
            router.push('/organizations');
        } else if (result && !result.isVerified) {
            router.push('/verify-email');
        }
        else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password.",
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Enter your email address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Enter your passcode" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <Button type="submit" className="w-full" size="lg">
                                    <Fingerprint className="mr-2"/>
                                    Authenticate
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                       <p className="text-sm text-muted-foreground">
                            Use `admin`/`admin` for existing user or `user`/`user` for new user flow.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            No account? <Link href="/register" className="text-primary hover:underline">Register here</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
