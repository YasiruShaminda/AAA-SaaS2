
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';

export type User = {
    id: number;
    name: string;
    email: string;
    emailVerified?: boolean;
};

// Extends the return type of the login function to include the verification status,
// allowing the UI to make smarter decisions without relying on a null value.
export type LoginResult = {
    user: User;
    isVerified: boolean;
};


interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<LoginResult | null>;
    register: (username: string, email: string, pass: string) => Promise<User>;
    logout: () => void;
    sendVerificationEmail: (email: string) => void;
    isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const authenticatedUser = await api.getAuthenticatedUser();
                    setUser(authenticatedUser);
                } catch (error) {
                    console.error("Failed to fetch authenticated user", error);
                    localStorage.removeItem('token');
                }
            }
            setIsLoaded(true);
        };
        loadUser();
    }, []);

    const login = async (email: string, pass: string): Promise<LoginResult | null> => {
        try {
            const response = await api.login({ email, password: pass });
            localStorage.setItem('token', response.accessToken);
            const authenticatedUser = await api.getAuthenticatedUser();
            setUser(authenticatedUser);
            // Assuming the user object from the API has an `emailVerified` property
            return { user: authenticatedUser, isVerified: !!authenticatedUser.emailVerified };
        } catch (error) {
            console.error("Login failed:", error);
            return null;
        }
    };
    
    const register = async (username: string, email: string, pass: string): Promise<User> => {
        try {
            const newUser = await api.register({ username, email, password: pass });
            // After registering, log the user in to get a token (using email instead of username)
            await login(email, pass);
            return newUser;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };
    
    const sendVerificationEmail = (email: string) => {
        // This is a placeholder for a real email sending service
        console.log(`Sending verification email to ${email}`);
    };


    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, sendVerificationEmail, isLoaded }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
