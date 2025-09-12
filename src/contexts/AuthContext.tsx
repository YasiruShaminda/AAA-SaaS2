
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

// Helper function to normalize user data from API
const normalizeUserData = (apiUser: any): User => {
    console.log('Raw API user data:', apiUser);
    const normalized = {
        id: apiUser.id,
        // API returns 'userName' (with capital N), so check that first
        name: apiUser.userName || apiUser.username || apiUser.name || apiUser.fullName || apiUser.full_name || apiUser.display_name || 'User',
        email: apiUser.email,
        emailVerified: apiUser.emailVerified || apiUser.email_verified || false
    };
    console.log('Normalized user data:', normalized);
    return normalized;
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
                    const normalizedUser = normalizeUserData(authenticatedUser);
                    setUser(normalizedUser);
                } catch (error) {
                    console.error("Failed to fetch authenticated user", error);
                    // Clear invalid token and user state
                    localStorage.removeItem('token');
                    setUser(null);
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
            const normalizedUser = normalizeUserData(authenticatedUser);
            setUser(normalizedUser);
            // For login, we skip email verification check - always consider verified
            return { user: normalizedUser, isVerified: true };
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
        // Clear all authentication-related data
        localStorage.removeItem('token');
        
        // Clear organization-related data to prevent access to stale data
        if (user) {
            localStorage.removeItem(`organizations_${user.name}`);
            localStorage.removeItem(`selectedOrganization_${user.name}`);
        }
        
        // Clear user state
        setUser(null);
        
        // Redirect to login page
        router.push('/login');
    }, [router, user]);

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
