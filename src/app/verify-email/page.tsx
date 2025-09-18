
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { verifyEmail, resendVerificationCode } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Get email from session storage
        const storedEmail = sessionStorage.getItem('pending_verification_email');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // Redirect to registration if no email found
            router.push('/register');
        }
    }, [router]);

    useEffect(() => {
        // Countdown timer for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            // Focus previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pastedData[i] || '';
        }
        setOtp(newOtp);
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            toast({
                variant: "destructive",
                title: "Invalid Code",
                description: "Please enter the complete 6-digit verification code.",
                className: "border-red-500/20 bg-red-950/50 text-red-400"
            });
            return;
        }

        setIsVerifying(true);
        try {
            const response = await verifyEmail({
                email,
                code: otpCode
            });

            if (response.success) {
                toast({
                    title: "Email Verified Successfully!",
                    description: "Your account has been activated. You can now log in.",
                    className: "border-green-500/20 bg-green-950/50 text-green-400"
                });
                
                // Clear stored email and redirect to login
                sessionStorage.removeItem('pending_verification_email');
                router.push('/login');
            } else {
                throw new Error(response.message || 'Verification failed');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error.message || "The verification code is invalid or has expired. Please try again.",
                className: "border-red-500/20 bg-red-950/50 text-red-400"
            });
            // Clear OTP on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        try {
            const response = await resendVerificationCode(email);
            
            if (response.success) {
                toast({
                    title: "Verification Code Sent",
                    description: "A new verification code has been sent to your email.",
                    className: "border-green-500/20 bg-green-950/50 text-green-400"
                });
                setCountdown(60); // 60 second cooldown
                setOtp(['', '', '', '', '', '']); // Clear current OTP
                inputRefs.current[0]?.focus();
            } else {
                throw new Error(response.message || 'Failed to resend code');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Resend Failed",
                description: error.message || "Failed to resend verification code. Please try again.",
                className: "border-red-500/20 bg-red-950/50 text-red-400"
            });
        } finally {
            setIsResending(false);
        }
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <div className="flex h-full min-h-screen items-center justify-center bg-background">
            <div className="relative w-full max-w-md">
                <div className="absolute -inset-0.5 animate-pulse rounded-lg bg-primary/50 opacity-75 blur-2xl"></div>
                <Card className="relative glass-card">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center size-16 bg-primary/10 rounded-full border border-primary/20">
                            <Mail className="size-8 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Verify Your Email</CardTitle>
                        <CardDescription>
                            We've sent a 6-digit verification code to{' '}
                            <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center space-x-2">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={el => {
                                        inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(index, e.target.value)}
                                    onKeyDown={e => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary transition-colors"
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>
                        
                        <p className="text-sm text-muted-foreground text-center">
                            Enter the 6-digit code from your email
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button 
                            onClick={handleVerify} 
                            className="w-full"
                            size="lg"
                            disabled={!isOtpComplete || isVerifying}
                        >
                            {isVerifying ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Verify Email
                                </>
                            )}
                        </Button>
                        
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the code?{' '}
                                <Button 
                                    variant="link" 
                                    className="p-0 h-auto text-primary hover:text-primary/80" 
                                    onClick={handleResend}
                                    disabled={countdown > 0 || isResending}
                                >
                                    {isResending ? (
                                        'Sending...'
                                    ) : countdown > 0 ? (
                                        `Resend in ${countdown}s`
                                    ) : (
                                        'Resend Code'
                                    )}
                                </Button>
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => router.push('/register')}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ← Back to Registration
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
