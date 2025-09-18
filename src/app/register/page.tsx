
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Waypoints, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { registerUser, RegisterUserData } from '@/lib/api';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isRegistering, setIsRegistering] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
    });

    const handleRegister = async (values: z.infer<typeof formSchema>) => {
        setIsRegistering(true);
        
        try {
            const userData: RegisterUserData = {
                username: values.username,
                password: values.password,
                email: values.email,
            };
            
            const response = await registerUser(userData);
            
            if (response.status === 'SUCCESS') {
                toast({
                    title: "Registration Successful! 🎉",
                    description: "Please check your email for the verification code.",
                    className: "border-green-500/20 bg-green-950/50 text-green-400",
                });
                
                // Store email for verification page
                sessionStorage.setItem('pending_verification_email', values.email);
                router.push('/verify-email');
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                className: "border-red-500/20 bg-red-950/50 text-red-400"
            });
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="flex h-full min-h-screen items-center justify-center bg-background">
            <div className="relative w-full max-w-md">
                <div className="absolute -inset-0.5 animate-pulse rounded-lg bg-primary/50 opacity-75 blur-2xl"></div>
                <Card className="relative glass-card">
                     <CardHeader className="text-center">
                        <div className="flex items-center justify-center pt-2">
                            <img
                                src="/Monyfi-main-logo-for-dark.png"
                                alt="Monyfi main logo"
                                className="w-auto h-25 sm:h-14 object-contain"
                                style={{ maxWidth: '220px' }}
                            />
                        </div>
                        {/*<CardTitle className="font-headline text-3xl">Create Account</CardTitle>*/}
                        <CardDescription>Create Account in Monyfi AAA</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Form {...form}>
                             <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Enter your email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your full name" {...field} />
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
                                                <Input type="password" placeholder="Create a password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" size="lg" disabled={isRegistering}>
                                    {isRegistering ? <Loader2 className="mr-2 animate-spin" /> : <UserPlus className="mr-2"/>}
                                    {isRegistering ? "Creating Account..." : "Register"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                       <p className="text-sm text-muted-foreground">
                            Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
