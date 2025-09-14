'use client';

import { useState } from 'react';
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
import * as api from "@/lib/api";
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
    const [isLogging, setIsLogging] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (values: z.infer<typeof formSchema>) => {
        if (isLogging) return;
        setIsLogging(true);
        
        try {
            const result = await login(values.email, values.password);

            // Login successful, check if user has organizations
            try {
                const userOrganizations = await api.getOrganizations(result.user.id);
                
                // Ensure we have a valid array and it has organizations
                const orgsArray = Array.isArray(userOrganizations) ? userOrganizations : [];
                
                if (orgsArray.length > 0) {
                    // User has organizations, redirect to organizations page
                    router.push('/organizations');
                } else {
                    // User has no organizations, redirect to create new organization
                    router.push('/organizations/new');
                }
            } catch (error) {
                console.error("Failed to fetch organizations:", error);
                // Fallback to create new organization page if API call fails
                router.push('/organizations/new');
            }
        } catch (error: any) {
            console.error("Login error:", error);
            
            // Determine the appropriate error message based on the error
            let errorMessage = "An error occurred during login. Please try again.";
            
            if (error?.message) {
                // If the error message contains specific authentication failure indicators
                if (error.message.includes('401') || 
                    error.message.includes('Unauthorized') ||
                    error.message.includes('Invalid credentials') ||
                    error.message.includes('authentication failed') ||
                    error.message.includes('incorrect') ||
                    error.message.includes('invalid')) {
                    errorMessage = "Invalid email or password. Please check your credentials and try again.";
                } else if (error.message.includes('Network') || 
                          error.message.includes('fetch') ||
                          error.message.includes('Failed to fetch')) {
                    errorMessage = "Network error. Please check your connection and try again.";
                } else if (error.message.includes('500') || 
                          error.message.includes('Internal Server Error')) {
                    errorMessage = "Server error. Please try again later.";
                } else {
                    // Use the actual error message from the API
                    errorMessage = error.message;
                }
            }
            
            toast({
                variant: "destructive",
                title: "Login Failed", 
                description: errorMessage,
                duration: 5000, // Show toast for 5 seconds instead of default
            });
            
            // Clear password field and focus it for better UX
            form.setValue('password', '');
            setTimeout(() => {
                form.setFocus('password');
            }, 100);
        } finally {
            setIsLogging(false);
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
                        <CardDescription>Monify AAA Authentication</CardDescription>
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
                                 <Button type="submit" className="w-full" size="lg" disabled={isLogging}>
                                    <Fingerprint className="mr-2"/>
                                    {isLogging ? "Authenticating..." : "Authenticate"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            No account? <Link href="/register" className="text-primary hover:underline">Register here</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
